import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCommand, listCommands } from '../src/core/gatse-engine/gatse-styles/gatse-i/commands/registry.js';
import { defineCommand, noArguments } from '../src/core/gatse-engine/gatse-styles/gatse-i/commands/helpers/define-command.js';
import { commandResult } from '../src/core/gatse-engine/gatse-styles/gatse-i/commands/helpers/result.js';
import { selectRoute } from '../src/core/gatse-engine/routing/router.js';
import { executeDeterministic } from '../src/core/gatse-engine/gatse-styles/gatse-i/execute.js';

const context = {
  participantId: 'person', permissions: [],
  identity: { name: 'Aira Gatse', version: '0.1.0', repository: 'https://github.com/cdanielbrj/aira-gatse' },
  runtime: { status: 'ready', styles: ['I'] }, commands: listCommands(),
};

test('every builtin executes directly with no provider, SDK, or runtime bootstrap', async () => {
  for (const { name } of listCommands()) {
    const result = await resolveCommand(name).execute({ args: {}, context });
    assert.equal(result.status, 'completed');
    assert.ok(result.text.length);
    assert.equal(typeof result.data, 'object');
    assert.doesNotMatch(result.text, /!aira|@Aira|Discord/);
  }
});

test('status reports its supplied context instead of a hardcoded healthy state', async () => {
  const result = await resolveCommand('status').execute({ context: { ...context, runtime: { status: 'degraded', styles: ['I', 'III'] } } });
  assert.deepEqual(result.data, { runtime: 'degraded', styles: ['I', 'III'] });
  assert.match(result.text, /degraded/);
});

test('about reports application version and repository from its supplied context', async () => {
  const result = await resolveCommand('about').execute({ context });
  assert.deepEqual(result.data, {
    name: 'Aira Gatse', version: '0.1.0', repository: 'https://github.com/cdanielbrj/aira-gatse',
  });
  assert.match(result.text, /0\.1\.0/);
  assert.match(result.text, /github\.com\/cdanielbrj\/aira-gatse/);
  assert.doesNotMatch(result.text, /Estagi[aá]ria/);
});

test('builtins reject unexpected arguments instead of silently ignoring them', async () => {
  assert.equal((await resolveCommand('status').execute({ args: { admin: true }, context })).status, 'invalid_arguments');
});

test('command authorization happens before its execution and cannot come from arguments', async () => {
  let calls = 0;
  const command = defineCommand({
    name: 'restricted', description: 'Test authorization.', permissions: ['admin'], validateArgs: noArguments,
    execute: () => { calls++; return commandResult({ text: 'Done' }); },
  });
  assert.equal((await command.execute({ args: { permissions: ['admin'] }, context })).status, 'denied');
  assert.equal(calls, 0);
  assert.equal((await command.execute({ context: { ...context, permissions: ['admin'] } })).status, 'completed');
  assert.equal(calls, 1);
});

test('command routes to Gatse I while identical conversation text does not', async () => {
  const command = selectRoute({ type: 'command', name: 'status', args: {} });
  assert.equal(command.style, 'I');
  assert.equal((await executeDeterministic(command, context)).result.status, 'completed');
  for (const text of ['status', '!aira status', '/status']) {
    const route = selectRoute({ type: 'conversation', text });
    assert.equal(route.style, null);
    assert.equal(route.reason, 'COGNITIVE_EXECUTOR_UNAVAILABLE');
  }
});
