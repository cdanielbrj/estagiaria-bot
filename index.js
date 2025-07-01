import { Client, GatewayIntentBits, Events } from 'discord.js';
import 'dotenv/config';
import statusCommand from './commands/status.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const commands = new Map();
commands.set(statusCommand.name, statusCommand);

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot online como ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error('Erro ao executar comando:', error);
    await interaction.reply({
      content: '❌ Ocorreu um erro ao executar o comando.',
      ephemeral: true,
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
