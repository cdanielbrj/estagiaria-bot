import { loadConfig, ConfigurationError } from './core/infrastructure/config/index.js';
import { readFile } from 'node:fs/promises';
import { createGateway } from './core/gatse-engine/gateway/index.js';
import { createRuntime } from './core/gatse-engine/runtime.js';
import { identity } from './core/infrastructure/config/identity.js';
import { createLogger } from './core/infrastructure/log/index.js';
import { startHealthServer } from './core/infrastructure/api/health.js';

const log = createLogger();
let provider;
let runtime;
let server;
let stopping = false;

async function shutdown() {
  if (stopping) return;
  stopping = true;
  runtime?.stop();
  const deadline = setTimeout(() => process.exit(1), 15_000);
  deadline.unref();
  try {
    if (server) await new Promise(resolve => server.close(resolve));
    await provider?.disconnect();
    log({ event: 'runtime_stopped', status: 'stopped' });
  } finally { clearTimeout(deadline); }
}

try {
  const config = loadConfig();
  const packageMetadata = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const version = packageMetadata.version;
  const runtimeIdentity = {
    ...identity,
    version,
    repository: packageMetadata.repository.url.replace(/^git\+/, '').replace(/\.git$/, ''),
  };
  let ready = false;
  server = await startHealthServer({ ...config.health, getHealth: () => ({
    name: identity.name,
    version,
    revision: process.env.APP_REVISION || 'development',
    status: ready && !stopping ? 'healthy' : 'starting',
    execution: { styleI: 'available' },
    providers: { discord: provider?.health() ?? { status: config.discord.enabled ? 'connecting' : 'disabled' } },
  }) });
  if (config.discord.enabled) {
    const { createDiscordProvider } = await import('./providers/discord/index.js');
    provider = createDiscordProvider({ ...config.discord, log });
    const { accountId } = await provider.connect();
    runtime = createRuntime({
      provider, log,
      executionContext: { identity: runtimeIdentity, runtime: { status: 'ready', styles: ['I'] } },
    });
    const gateway = createGateway({
      providerId: provider.id, runtime, log,
    });
    provider.onMessage(gateway.handle);
  }
  ready = true;
  log({ event: 'runtime_started', status: 'ready' });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
    shutdown().catch(() => { log({ event: 'shutdown_failed', errorCode: 'SHUTDOWN_FAILED' }); process.exitCode = 1; });
  });
} catch (error) {
  // Only configuration errors are safe to print; upstream errors may include secrets.
  if (error instanceof ConfigurationError) process.stderr.write(`Configuração: ${error.message}\n`);
  log({ event: 'startup_failed', errorCode: 'STARTUP_FAILED' });
  process.exitCode = 1;
  await shutdown();
}
