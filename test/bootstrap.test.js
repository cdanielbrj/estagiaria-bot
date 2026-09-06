import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';

test('real entrypoint starts without credentials, exposes version, and shuts down cleanly', { timeout: 10_000 }, async t => {
  const child = spawn(process.execPath, ['src/main.js'], {
    env: { ...process.env, DISCORD_ENABLED: 'false', DISCORD_TOKEN: '', HEALTH_HOST: '127.0.0.1', HEALTH_PORT: '43021' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(() => { if (child.exitCode === null) child.kill('SIGKILL'); });
  let output = '';
  child.stdout.on('data', data => { output += data; });
  child.stderr.on('data', data => { output += data; });
  let health;
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      health = await (await fetch('http://127.0.0.1:43021/health', { signal: AbortSignal.timeout(200) })).json();
      break;
    } catch { await delay(50); }
  }
  assert.equal(health?.status, 'healthy', output);
  assert.equal(health.version, '0.2.0');
  assert.equal(health.providers.discord.status, 'disabled');
  const exited = once(child, 'exit');
  child.kill('SIGTERM');
  assert.deepEqual(await exited, [0, null]);
  assert.match(output, /runtime_stopped/);
});

test('invalid enabled-provider configuration fails before attempting a connection', { timeout: 5000 }, async () => {
  const child = spawn(process.execPath, ['src/main.js'], {
    env: { ...process.env, DISCORD_ENABLED: 'true', DISCORD_TOKEN: '' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let errors = '';
  child.stderr.on('data', data => { errors += data; });
  const [code] = await once(child, 'exit');
  assert.equal(code, 1);
  assert.match(errors, /DISCORD_TOKEN/);
});
