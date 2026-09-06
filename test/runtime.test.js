import test from 'node:test';
import assert from 'node:assert/strict';
import { createGateway } from '../src/core/gatse-engine/gateway/index.js';
import { createRuntime } from '../src/core/gatse-engine/runtime.js';
import { loadConfig } from '../src/core/infrastructure/config/index.js';
import { createLogger } from '../src/core/infrastructure/log/index.js';

const input = overrides => ({ eventId: 'request-1', sourceMessageId: 'message-1', providerId: 'test', providerAccountId: 'account', conversationId: 'room', participantId: 'person', input: { type: 'command', name: 'status', args: {} }, invocation: 'explicit', actorKind: 'human', conversationKind: 'group', permissions: [], receivedAt: new Date().toISOString(), ...overrides });
function fixture(send) {
  const sent = [], logs = [];
  const runtime = createRuntime({ executionContext: { identity: { name: 'Aira Gatse', version: '0.1.0', repository: 'https://github.com/cdanielbrj/aira-gatse' }, runtime: { status: 'ready', styles: ['I'] } }, provider: { id: 'test', capabilities: () => ({ supportsReplies: true }), sendMessage: send ?? (async message => { sent.push(message); }) }, log: record => logs.push(record) });
  const gateway = createGateway({ providerId: 'test', runtime, log: record => logs.push(record) });
  return { runtime: { handle: gateway.handle, stop: runtime.stop }, sent, logs };
}

test('Gatse I answers in the originating conversation without AI credentials', async () => {
  const { runtime, sent, logs } = fixture();
  assert.deepEqual(await runtime.handle(input()), { status: 'completed', delivery: 'delivered' });
  assert.equal(sent[0].conversationId, 'room');
  assert.equal(sent[0].replyTo, 'message-1');
  assert.match(sent[0].result.text, /Gatse I/);
  assert.equal(logs[0].gatseStyle, 'I');
});

test('participation rejects chatter, bots, DMs and invalid contracts', async () => {
  const { runtime, sent } = fixture();
  for (const changes of [
    { invocation: 'ambient', input: { type: 'conversation', text: 'Estagiária' } }, { actorKind: 'automation' },
    { conversationKind: 'direct' }, { participantId: null },
    { input: { type: 'command', name: 'status', args: [] } },
  ]) assert.equal((await runtime.handle(input(changes))).status, 'ignored');
  assert.equal(sent.length, 0);
});

test('unsupported natural language is explicit instead of pretending to use AI', async () => {
  const { runtime, sent } = fixture();
  assert.equal((await runtime.handle(input({ input: { type: 'conversation', text: 'busque as notícias' } }))).status, 'unsupported');
  assert.match(sent[0].result.text, /ainda não está disponível/);
  assert.equal(sent[0].result.data.reason, 'COGNITIVE_EXECUTOR_UNAVAILABLE');
});

test('builtin aliases resolve to the same command results after routing', async () => {
  for (const [name, alias] of [['help', 'ajuda'], ['about', 'sobre']]) {
    const { runtime, sent, logs } = fixture();
    await runtime.handle(input({ input: { type: 'command', name, args: {} } }));
    await runtime.handle(input({ sourceMessageId: 'message-2', input: { type: 'command', name: alias, args: {} } }));
    assert.equal(sent.length, 2);
    assert.equal(sent[0].result.text, sent[1].result.text);
    assert.equal(logs[0].intent, name);
    assert.equal(logs[2].intent, name);
    assert.equal(logs[2].gatseStyle, 'I');
  }
});

test('duplicates are suppressed while sending and after completion', async () => {
  let finish, started;
  const sending = new Promise(resolve => { started = resolve; });
  const { runtime } = fixture(() => new Promise(resolve => { finish = resolve; started(); }));
  const first = runtime.handle(input());
  await sending;
  assert.equal((await runtime.handle(input({ eventId: 'different' }))).reason, 'duplicate');
  finish();
  await first;
  assert.equal((await runtime.handle(input())).reason, 'duplicate');
});

test('delivery failure preserves execution status, suppresses retries, and logs no raw error', async () => {
  const { runtime, logs } = fixture(async () => { throw new Error('secret-token'); });
  assert.deepEqual(await runtime.handle(input()), { status: 'completed', delivery: 'unknown' });
  assert.equal(logs[0].event, 'execution_completed');
  assert.equal(logs[1].event, 'delivery_failed');
  assert.equal((await runtime.handle(input())).reason, 'duplicate');
  assert.doesNotMatch(JSON.stringify(logs), /secret-token/);
});

test('shutdown stops accepting work', async () => {
  const { runtime } = fixture();
  runtime.stop();
  assert.equal((await runtime.handle(input())).reason, 'shutting_down');
});

test('configuration validates enabled providers but needs no disabled credentials', () => {
  assert.equal(loadConfig({}).discord.enabled, false);
  assert.throws(() => loadConfig({ DISCORD_ENABLED: 'yes' }), /true ou false/);
  assert.throws(() => loadConfig({ DISCORD_ENABLED: 'true' }), /DISCORD_TOKEN/);
  assert.throws(() => loadConfig({ HEALTH_PORT: '65536' }), /HEALTH_PORT/);
  assert.deepEqual(loadConfig({ DISCORD_ENABLED: 'true', DISCORD_TOKEN: 'secret' }).discord, { enabled: true, token: 'secret' });
});

test('logger excludes message content and credentials', () => {
  let line;
  createLogger(value => { line = value; })({ event: 'test', token: 'secret', text: 'private' });
  assert.doesNotMatch(line, /secret|private/);
});
