import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import { respostaEstagiaria } from './lib/persona.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
  console.log(`✅ Estagiária online como ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;

  const comando = message.content
  .replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '')
  .trim()
  .toLowerCase();

  // Identificação direta por palavra-chave
  let tipo = 'status';
  if (['status'].includes(comando)) tipo = 'status';
  else if (['beliza', 'belizario'].includes(comando)) tipo = 'beliza';
  else if (['gabe', 'maconha'].includes(comando)) tipo = 'gabe';
  else if (['negao', 'annons'].includes(comando)) tipo = 'negao';
  else if (['vitin', 'exclusive'].includes(comando)) tipo = 'vitin';
  else if (['tiktok', 'ttk'].includes(comando)) tipo = 'tiktok';

  const resposta = respostaEstagiaria(tipo);
  await message.reply(resposta);
});

client.login(process.env.DISCORD_TOKEN);
