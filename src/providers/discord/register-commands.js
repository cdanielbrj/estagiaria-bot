import { loadConfig, ConfigurationError } from '../../core/infrastructure/config/index.js';
import { createLogger } from '../../core/infrastructure/log/index.js';
import { createDiscordProvider } from './index.js';

const log = createLogger();
let provider;
const deadline = setTimeout(() => process.exit(1), 30_000);
try {
  const config = loadConfig();
  if (!config.discord.enabled) throw new ConfigurationError('DISCORD_ENABLED deve ser true para registrar comandos.');
  provider = createDiscordProvider({ ...config.discord, log });
  await provider.connect();
  await provider.registerCommands();
  log({ event: 'discord_commands_registered', status: 'completed' });
} catch (error) {
  if (error instanceof ConfigurationError) process.stderr.write(error.message + '\n');
  log({ event: 'discord_command_registration_failed', errorCode: 'COMMAND_REGISTRATION_FAILED' });
  process.exitCode = 1;
} finally {
  await provider?.disconnect();
  clearTimeout(deadline);
}
