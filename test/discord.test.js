import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createDiscordProvider } from '../src/providers/discord/index.js';
import { normalizeMessage, normalizeInteraction, conversationId, slashCommands, registerCommands } from '../src/providers/discord/interface/index.js';
import { createGateway } from '../src/core/gatse-engine/gateway/index.js';
import { setImmediate as tick } from 'node:timers/promises';
import { createRuntime } from '../src/core/gatse-engine/runtime.js';

test('normalization detects explicit mentions and strips SDK data', () => {
  const event = normalizeMessage({ id: '1', channelId: '2', guildId: '3', author: { id: '4', bot: false }, content: '<@!123> status', token: 'secret' }, '123');
  assert.equal(event.input.text, 'status');
  assert.equal(event.invocation, 'explicit');
  assert.equal(event.conversationId, 'discord:123:channel:2');
  assert.equal(event.participantId, 'discord:user:4');
  assert.equal(event.token, undefined);
});

test('Discord maps mentions to conversation and leaves prefix-like chatter ambient', () => {
  const message = { id: '1', channelId: '2', guildId: '3', author: { id: '4', bot: false } };
  const mention = normalizeMessage({ ...message, content: '<@123> status' }, '123');
  assert.equal(mention.input.type, 'conversation');
  assert.equal(mention.invocation, 'explicit');
  assert.equal(normalizeMessage({ ...message, content: '!aira status' }, '123').invocation, 'ambient');
  assert.equal(normalizeMessage({ ...message, content: '!airabc status' }, '123').invocation, 'ambient');
  assert.equal(normalizeMessage({ ...message, content: 'Estagiária' }, '123').invocation, 'ambient');
});

test('Discord and a provider without reply support use the same core command', async () => {
  const discord = normalizeInteraction({ id: '1', channelId: '2', guildId: '3', user: { id: '4', bot: false }, commandName: 'status', options: { data: [] } }, '123');
  const results = [];
  for (const event of [discord, {
    ...discord, providerId: 'test', providerAccountId: 'account', conversationId: 'test:room',
    input: { type: 'command', name: 'status', args: {} },
  }]) {
    const supportsReplies = event.providerId === 'discord';
    const runtime = createRuntime({
      provider: { id: event.providerId, capabilities: () => ({ supportsReplies }), sendMessage: async output => {
        assert.equal(output.conversationId, event.conversationId);
        assert.equal('replyTo' in output, supportsReplies);
        results.push(output.result);
      } },
      executionContext: { identity: { name: 'Aira Gatse', version: '0.1.0', repository: 'https://github.com/cdanielbrj/aira-gatse' }, runtime: { status: 'ready', styles: ['I'] } },
      log() {},
    });
    const gateway = createGateway({ providerId: event.providerId, runtime, log() {} });
    await gateway.handle(event);
  }
  assert.deepEqual(results[0], results[1]);
});

test('adapter delivers with safe mentions in every accessible channel and rejects another account', async () => {
  const sent = [];
  const client = Object.assign(new EventEmitter(), {
    user: { id: '123' }, isReady: () => true,
    channels: { fetch: async () => ({ isTextBased: () => true, send: async body => { sent.push(body); return { id: 'reply' }; } }) },
  });
  const provider = createDiscordProvider({ token: 'secret', log() {}, client });
  const outgoing = { providerAccountId: '123', conversationId: conversationId('123', '456'), replyTo: 'original', result: { status: 'completed', data: {}, text: 'Olá' } };
  await provider.sendMessage(outgoing);
  assert.deepEqual(sent[0].allowedMentions, { parse: [], repliedUser: false });
  assert.equal(sent[0].reply.messageReference, 'original');
  await assert.rejects(provider.sendMessage({ ...outgoing, providerAccountId: 'other' }), /INVALID_DESTINATION/);
  await provider.sendMessage({ ...outgoing, conversationId: conversationId('123', '789') });
  await assert.rejects(provider.sendMessage({ ...outgoing, result: { status: 'completed', data: {}, text: 'x'.repeat(2001) } }), /INVALID_RESPONSE_LENGTH/);
});

test('slash interface normalizes status and keeps interaction credentials outside the core', () => {
  const event = normalizeInteraction({ id: '1', channelId: '2', guildId: '3', user: { id: '4', bot: false }, commandName: 'status', options: { data: [] }, token: 'secret' }, '123');
  assert.deepEqual(event.input, { type: 'command', name: 'status', args: {} });
  assert.equal(event.invocation, 'explicit');
  assert.equal(event.token, undefined);
});

test('slash registration updates only the declared commands', async () => {
  const registered = [];
  await registerCommands({ commands: { create: async command => registered.push(command) } });
  assert.deepEqual(registered.map(command => command.name), ['help', 'status', 'about']);
  assert.deepEqual(registered, slashCommands);
});

function interactionFixture({ channelId = '456', deliveryFails = false } = {}) {
  const calls = [];
  const client = Object.assign(new EventEmitter(), {
    user: { id: '123' }, isReady: () => true, destroy: async () => {},
    channels: { fetch: async () => { throw new Error('Must reply through interaction'); } },
  });
  const interaction = {
    id: 'interaction-1', channelId, guildId: 'guild', user: { id: 'person', bot: false },
    commandName: 'status', options: { data: [] }, isChatInputCommand: () => true,
    async deferReply() { calls.push('defer'); this.deferred = true; },
    async editReply(payload) { calls.push(payload); if (deliveryFails) throw new Error('private-token'); return { id: 'reply' }; },
    async reply(payload) { calls.push(payload); },
  };
  const logs = [];
  const provider = createDiscordProvider({ token: 'secret', log: record => logs.push(record), client });
  const runtime = createRuntime({
    provider, log: record => logs.push(record),
    executionContext: { identity: { name: 'Aira Gatse', version: '0.1.0', repository: 'https://github.com/cdanielbrj/aira-gatse' }, runtime: { status: 'ready', styles: ['I'] } },
  });
  const gateway = createGateway({ providerId: 'discord', runtime, log: record => logs.push(record) });
  provider.onMessage(gateway.handle);
  return { client, provider, interaction, calls, logs };
}

test('native slash interaction is acknowledged then completed through Gatse I', async () => {
  const { client, provider, interaction, calls, logs } = interactionFixture();
  client.emit('interactionCreate', interaction);
  await tick();
  await provider.disconnect();
  assert.equal(calls[0], 'defer');
  assert.match(calls[1].content, /Gatse I/);
  assert.equal(logs.find(event => event.event === 'execution_completed').gatseStyle, 'I');
});

test('another guild channel is accepted when Discord delivers the interaction', async () => {
  const { client, provider, interaction, calls, logs } = interactionFixture({ channelId: 'other' });
  client.emit('interactionCreate', interaction);
  await tick();
  await provider.disconnect();
  assert.equal(calls[0], 'defer');
  assert.match(calls[1].content, /Gatse I/);
  assert.equal(logs.some(event => event.event === 'execution_completed'), true);
});

test('failed interaction delivery is not retried or redirected to channel messages', async () => {
  const { client, provider, interaction, calls, logs } = interactionFixture({ deliveryFails: true });
  client.emit('interactionCreate', interaction);
  await tick();
  await provider.disconnect();
  assert.equal(calls.length, 2);
  assert.equal(logs.find(event => event.event === 'delivery_failed').status, 'unknown');
  assert.doesNotMatch(JSON.stringify(logs), /private-token/);
});
