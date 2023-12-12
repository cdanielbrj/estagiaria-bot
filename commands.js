import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

const TEST_COMMAND = {
  name: 'test',
  description: 'Só pra saber se eu tô funcionando',
  type: 1,
};

const GABE_COMMAND = {
  name: 'gabe',
  description: 'Como falar com um drogado',
  type: 1,
};

const BELIZA_COMMAND = {
  name: 'beliza',
  description: 'Trás a gelada!',
  type: 1,
};

const ALL_COMMANDS = [TEST_COMMAND, GABE_COMMAND, BELIZA_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);