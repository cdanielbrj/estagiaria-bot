import { performance } from 'node:perf_hooks';
import { sourceKey } from './contracts/incoming.js';
import { executeDeterministic } from './gatse-styles/gatse-i/execute.js';
import { validateContext } from './contracts/context.js';

// Milestone A: bounded process-local admission/deduplication, not durable memory.
export function createRuntime({ provider, executionContext, log, now = Date.now, maxInFlight = 16, maxSeen = 1000, dedupMs = 300_000 }) {
  const seen = new Map();
  const active = new Set();
  let accepting = true;

  async function execute(message, route) {
    if (!accepting) return { status: 'ignored', reason: 'shutting_down' };
    const key = sourceKey(message);
    const timestamp = now();
    for (const [oldKey, expiresAt] of seen) if (expiresAt <= timestamp) seen.delete(oldKey);
    if (seen.has(key) || active.has(key)) return { status: 'ignored', reason: 'duplicate' };
    if (active.size >= maxInFlight) {
      log({ event: 'input_rejected', requestId: message.eventId, errorCode: 'CAPACITY_REACHED' });
      return { status: 'ignored', reason: 'capacity' };
    }
    if (seen.size >= maxSeen) seen.delete(seen.keys().next().value);
    seen.set(key, timestamp + dedupMs);
    active.add(key);
    const start = performance.now();
    const fields = { requestId: message.eventId, provider: message.providerId, conversationId: message.conversationId, gatseStyle: route.style };
    try {
      const context = { ...executionContext, participantId: message.participantId, permissions: [...message.permissions] };
      validateContext(context);
      const { result, intent } = route.style === 'I'
        ? await executeDeterministic(route, context)
        : {
          intent: route.intent,
          result: { status: 'unsupported', data: { reason: route.reason }, text: 'Conversa com IA ainda não está disponível.' },
        };
      log({ ...fields, event: 'execution_completed', intent, status: result.status, durationMs: Math.round(performance.now() - start) });
      try {
        await provider.sendMessage({
          providerAccountId: message.providerAccountId,
          conversationId: message.conversationId,
          ...(provider.capabilities().supportsReplies ? { replyTo: message.sourceMessageId } : {}),
          result,
        });
        log({ ...fields, event: 'delivery_completed', status: 'delivered' });
        return { status: result.status, delivery: 'delivered' };
      } catch {
        // A transport failure can have an unknown send outcome. Never auto-resend.
        log({ ...fields, event: 'delivery_failed', status: 'unknown', errorCode: 'DELIVERY_FAILED' });
        return { status: result.status, delivery: 'unknown' };
      }
    } finally {
      active.delete(key);
    }
  }

  return { execute, stop: () => { accepting = false; } };
}
