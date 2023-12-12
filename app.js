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

      // "test" command
      if (name === 'test') {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: 'Bom dia ' + getRandomEmoji(),
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
          'Vai abrir live quando, Gabe?',
          'Fofoquinha?',
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
