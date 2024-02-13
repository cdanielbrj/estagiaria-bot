import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

const TEST_COMMAND = {
  name: 'teste',
  description: 'Testando, 1, 2...',
  type: 1,
};

/* const GABE_COMMAND = {
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

const NUKE_COMMAND = {
  name: 'nuke',
  description: 'Vai tudo embora :)',
  type: 1,
}; */

const ALL_COMMANDS = [TEST_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);