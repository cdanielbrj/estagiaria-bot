import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import fetch from 'node-fetch';

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const openaiKey = process.env.OPENAI_API_KEY;
const serperKey = process.env.SERPER_API_KEY;
const assistantId = process.env.ASSISTANT_ID;

const threadsPorCanal = new Map(); // Memória por canal

const HEADERS = {
  'Authorization': `Bearer ${openaiKey}`,
  'OpenAI-Beta': 'assistants=v2',
  'Content-Type': 'application/json'
};

async function buscarNaWeb(query) {
  console.log(`🌐 Buscando: "${query}"`);
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': serperKey
    },
    body: JSON.stringify({ q: query })
  });

  const data = await res.json();
  const snippets = data.organic?.slice(0, 3).map(r => `• ${r.title}: ${r.snippet}`).join('\n');
  return snippets || 'Nenhum resultado relevante encontrado.';
}

async function criarThread() {
  const res = await fetch('https://api.openai.com/v1/threads', {
    method: 'POST',
    headers: HEADERS
  });
  const data = await res.json();
  return data.id;
}

async function enviarMensagem(threadId, content) {
  await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ role: 'user', content })
  });
}

async function iniciarRun(threadId) {
  const res = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ assistant_id: assistantId })
  });
  return await res.json();
}

async function enviarToolOutput(threadId, runId, toolCallId, output) {
  await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}/submit_tool_outputs`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      tool_outputs: [{ tool_call_id: toolCallId, output }]
    })
  });
}

async function aguardarResultado(threadId, runId) {
  let tentativas = 0;
  while (tentativas++ < 30) {
    const res = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      headers: HEADERS
    });
    const data = await res.json();

    if (data.required_action?.type === 'submit_tool_outputs') {
      return { tipo: 'tool', chamada: data.required_action.submit_tool_outputs.tool_calls[0], run: data };
    }

    if (data.status === 'completed') return { tipo: 'resposta', run: data };

    if (data.status === 'failed') throw new Error('❌ Run falhou!');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  throw new Error('⏰ Timeout aguardando run');
}

async function aguardarConclusao(threadId, runId) {
  let tentativas = 0;
  while (tentativas++ < 20) {
    const res = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, { headers: HEADERS });
    const data = await res.json();
    if (data.status === 'completed') return true;
    if (data.status !== 'queued' && data.status !== 'in_progress') return false;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

async function obterResposta(threadId) {
  const res = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    headers: HEADERS
  });
  const data = await res.json();
  const mensagem = data.data.find(m => m.role === 'assistant');
  return mensagem?.content?.[0]?.text?.value?.trim();
}

client.once('ready', () => {
  console.log(`✅ Estagiária online como ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // ✅ Só responde se for mencionada
  if (!message.mentions.has(client.user)) return;

  const pergunta = message.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim();
  if (!pergunta) return message.reply('❗ Esqueceu de perguntar algo, chefe.');

  const loading = await message.reply('⏳ Deixa eu pensar...');

  try {
    // ✅ Verifica se já existe uma thread para o canal
    let threadId = threadsPorCanal.get(message.channel.id);
    if (!threadId) {
      threadId = await criarThread();
      threadsPorCanal.set(message.channel.id, threadId);
      console.log(`🧵 Criando nova thread para canal ${message.channel.id}`);
    } else {
      console.log(`📌 Usando thread existente para canal ${message.channel.id}`);
    }

    await enviarMensagem(threadId, pergunta);

    let run = await iniciarRun(threadId);
    const resultado = await aguardarResultado(threadId, run.id);

    if (resultado.tipo === 'tool') {
      const { chamada, run } = resultado;
      const query = JSON.parse(chamada.function.arguments).query;
      const resultadoBusca = await buscarNaWeb(query);
      await enviarToolOutput(threadId, run.id, chamada.id, resultadoBusca);
      await aguardarConclusao(threadId, run.id);
    }

    const resposta = await obterResposta(threadId);
    if (!resposta) return loading.edit('❌ Buguei aqui, chefe.');
    return loading.edit(resposta);

  } catch (err) {
    console.error('🔥 Erro completo:', err);
    return loading.edit('❌ Trás um café, deu ruim por aqui...');
  }
});

client.login(process.env.DISCORD_TOKEN);
