import 'dotenv/config';
import fetch from 'node-fetch';

const assistantId = process.env.ASSISTANT_ID;
const openaiKey = process.env.OPENAI_API_KEY;

const HEADERS = {
  'Authorization': `Bearer ${openaiKey}`,
  'OpenAI-Beta': 'assistants=v2',
  'Content-Type': 'application/json'
};

async function verificarEstagiaria() {
  try {
    const res = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
      method: 'GET',
      headers: HEADERS
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ Erro ao buscar dados do Assistant:', data);
      return;
    }

    console.log('🧾 Informações do Assistant:');
    console.log(`🔤 Nome: ${data.name}`);
    console.log(`🧠 Modelo: ${data.model}`);
    console.log(`📎 Ferramentas: ${data.tools.map(t => t.type).join(', ') || 'Nenhuma'}`);
    console.log(`📃 Instruções: ${data.instructions || 'Nenhuma instrução definida'}`);
  } catch (err) {
    console.error('💥 Erro inesperado ao consultar o Assistant:', err);
  }
}

verificarEstagiaria();
