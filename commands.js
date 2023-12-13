import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

const TEST_COMMAND = {
  name: 'teste',
  description: 'Só pra saber se eu tô funcionando',
  type: 1,
};

const GABE_COMMAND = {
  name: 'gabe',
  description: 'Meu drogado favorito <3',
  type: 1,
};

const BELIZA_COMMAND = {
  name: 'beliza',
  description: 'Desce uma gelada aí!',
  type: 1,
};

const NEGAO_COMMAND = {
  name: 'negao',
  description: '*Sons de agressão doméstica*',
  type: 1,
};

const VITIN_COMMAND = {
  name: 'vitin',
  description: 'Joga muito Vitin, passa a config?',
  type: 1,
};

const TTK_COMMAND = {
  name: 'tiktok',
  description: 'Quer o link dessa canalhada toda, meu nobre?',
  type: 1,
};

const ALL_COMMANDS = [TEST_COMMAND, GABE_COMMAND, BELIZA_COMMAND, NEGAO_COMMAND, VITIN_COMMAND, TTK_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);