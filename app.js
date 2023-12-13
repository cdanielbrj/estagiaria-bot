import 'dotenv/config';
import express from 'express';
import { exec } from 'child_process';
import {
  InteractionType,
  InteractionResponseType
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji } from './utils.js';

// Executa o commands.js primeiro
exec('node commands.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao atualizar comandos: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Erro na atualização de comandos! ${stderr}`);
    return;
  }
  console.log(`Comandos atualizados com sucesso! ${stdout}`);

  const app = express();
  const PORT = process.env.PORT || 25709;
  app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

  app.post('/interactions', async function (req, res) {
    const { type, id, data } = req.body;

    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;

      // "teste" command
      if (name === 'teste') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Bom dia, tô viva, relaxou ' + getRandomEmoji(),
          },
        });
      }

      // "tiktok" command
      if (name === 'tiktok') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Toda essa canalhice fica lá no TikTok -> https://www.tiktok.com/@seehden',
          },
        });
      }

      // "gabe" command
      if (name === 'gabe') {
        const messages = [
          'Vai tomar no cu, Gabe',
          '"Ti fode ai menor" é o que o Gabe certamente diria agora',
          'Winx! Quando damos nossas mãos, nos tornamos poderosas! Porque juntas somos invencíveis!',
          'Fofoquinha?',
          'Você só tem que tentar ser um pouco mais perigoso, sabe?',
        ];

        const randomIndex = Math.floor(Math.random() * messages.length);
        const randomMessage = messages[randomIndex];

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: randomMessage,
          },
        });
      }

      // "beliza" command
      if (name === 'beliza') {
        const messages = [
          'O modo "Globeliza" só está disponível durante o carnaval, tenta de novo em fevereiro',
          'https://media.giphy.com/media/W0E8iMqMDemxI0q24K/giphy.gif',
          'Se o Belizário nunca apostou 100zão em algum jogo do bicho eu sou um microondas',
        ];

        const randomIndex = Math.floor(Math.random() * messages.length);
        const randomMessage = messages[randomIndex];

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: randomMessage,
          },
        });
      }

      // "negao" command
      if (name === 'negao') {
        const messages = [
          '"Aqui acabou" é o que o negão certamente diria agora',
          'Isabeeeeeeeeeeeeeeeel',
          'Requisita!',
          'Pô agora ele tá no sogro, tenta de novo semana que vem fazendo o favor',
          'Aposto 10zão com você agora que ele tá fazendo outra build no fifa',
          'Quebra tudo negão, se foda kkkk',
        ];

        const randomIndex = Math.floor(Math.random() * messages.length);
        const randomMessage = messages[randomIndex];

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: randomMessage,
          },
        });
      }

      // "vitin" command
      if (name === 'vitin') {
        const messages = [
          'CHUTA PRO GOL MEU EGOÍSTA, MEU ATACANTE NATO!',
          'Fato curioso: Já carregou mais animal em ranked que Noé na Arca',
          'Cassino? Hoje? Oi? Você disse "Abrir caixa no CS"?',
          'Mas que crl de build é essa que não corre, não chuta e não passa, Negão?',
        ];

        const randomIndex = Math.floor(Math.random() * messages.length);
        const randomMessage = messages[randomIndex];

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: randomMessage,
          },
        });
      }
    }
  });

  app.listen(PORT, () => {
    console.log('Listening on port', PORT);
  });
});
