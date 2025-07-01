import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import { respostaEstagiaria } from './lib/persona.js';
import OpenAI from 'openai';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

  // Integração com ChatGPT
  if (comando.startsWith('gpt')) {
    const pergunta = comando.replace('gpt', '').trim();

    if (!pergunta) {
      return message.reply('Chefe... você esqueceu de me perguntar algo 😅');
    }

    try {
      const respostaIA = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Você é uma estagiária carismática, sarcástica e informal chamada Estagiária. Responda com bom humor e gírias leves.' },
          { role: 'user', content: pergunta }
        ],
        max_tokens: 300,
        temperature: 0.8
      });

      const resposta = respostaIA?.choices?.[0]?.message?.content;

        if (!resposta) {
        return message.reply('Chefe... recebi vento da API, vê se pergunta de novo aí 😵‍💫');
        }

      return message.reply(resposta);
    } catch (err) {
      console.error('[ERRO GPT]', err);
      return message.reply('Buguei feio tentando responder, chefe 😵‍💫');
    }
  }

  // Comandos personalizados
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
