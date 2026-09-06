import { validateResult } from './result.js';

/**
 * Output adapter port: id, capabilities(), sendMessage(OutgoingMessage).
 * capabilities(): { supportsReplies: boolean }.
 * OutgoingMessage: { providerAccountId, conversationId, replyTo?, result }.
 * sendMessage returns { messageId }; delivery errors must not trigger blind retries.
 */
export function validateOutput(output) {
  for (const field of ['providerAccountId', 'conversationId']) {
    if (typeof output?.[field] !== 'string' || !output[field]) throw new Error('INVALID_OUTPUT');
  }
  if (output.replyTo !== undefined && typeof output.replyTo !== 'string') throw new Error('INVALID_OUTPUT');
  validateResult(output.result);
}
