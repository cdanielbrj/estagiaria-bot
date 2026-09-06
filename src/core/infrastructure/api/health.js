import { createServer } from 'node:http';

export async function startHealthServer({ host, port, getHealth }) {
  const server = createServer((request, response) => {
    if (request.method !== 'GET' || request.url !== '/health') {
      response.writeHead(404).end();
      return;
    }
    const health = getHealth();
    response.writeHead(health.status === 'healthy' ? 200 : 503, {
      'content-type': 'application/json', 'cache-control': 'no-store',
    });
    response.end(JSON.stringify(health));
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });
  return server;
}
