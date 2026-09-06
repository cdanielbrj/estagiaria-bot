import test from 'node:test';
import assert from 'node:assert/strict';
import { startHealthServer } from '../src/core/infrastructure/api/health.js';

test('health reports runtime readiness independently of provider connectivity', async () => {
  let status = 'healthy';
  const server = await startHealthServer({ host: '127.0.0.1', port: 0, getHealth: () => ({ status, providers: { discord: { status: 'disconnected' } } }) });
  try {
    const url = `http://127.0.0.1:${server.address().port}`;
    const response = await fetch(url + '/health');
    assert.equal(response.status, 200);
    assert.equal((await response.json()).providers.discord.status, 'disconnected');
    status = 'starting';
    assert.equal((await fetch(url + '/health')).status, 503);
    assert.equal((await fetch(url + '/anything')).status, 404);
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
});
