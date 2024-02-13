import 'dotenv/config';
import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  InteractionType,
  InteractionResponseType
} from 'discord-interactions';
import { VerifyDiscordRequest } from './utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 25709;
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

const commands = new Map();

async function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const commandModule = await import(`file://${path.join(commandsPath, file)}`);
    const command = commandModule.default;
    commands.set(command.name, command);
  }
}

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
  
  loadCommands().then(() => {
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  }).catch(console.error);
});

app.post('/interactions', async function (req, res) {
  const { type, data } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const command = commands.get(data.name);

    if (!command) {
        console.log('Comando não encontrado');
        return res.status(400).send({ error: 'Comando não encontrado' });
    }

    const response = await command.execute();
    return res.send(response);
  }
});
