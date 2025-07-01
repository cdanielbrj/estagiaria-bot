import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import statusCommand from './commands/status.js';

const commands = [statusCommand];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
  console.log('🔁 Registrando comandos...');
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log('✅ Comandos registrados com sucesso!');
} catch (error) {
  console.error('❌ Erro ao registrar comandos:', error);
}
