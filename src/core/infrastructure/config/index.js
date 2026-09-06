export class ConfigurationError extends Error {}

export function loadConfig(env = process.env) {
  const enabled = env.DISCORD_ENABLED ?? 'false';
  if (!['true', 'false'].includes(enabled)) {
    throw new ConfigurationError('DISCORD_ENABLED deve ser true ou false.');
  }
  const token = env.DISCORD_TOKEN?.trim() ?? '';
  if (enabled === 'true') {
    if (!token) throw new ConfigurationError('DISCORD_TOKEN é obrigatório com Discord habilitado.');
  }
  const port = env.HEALTH_PORT ?? '3000';
  if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) {
    throw new ConfigurationError('HEALTH_PORT deve estar entre 1 e 65535.');
  }
  return {
    discord: { enabled: enabled === 'true', token },
    health: { host: env.HEALTH_HOST?.trim() || '127.0.0.1', port: Number(port) },
  };
}
