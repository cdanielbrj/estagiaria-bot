import { defineCommand, noArguments } from '../helpers/define-command.js';
import { commandResult } from '../helpers/result.js';

export const about = defineCommand({
  name: 'about', aliases: ['sobre'], description: 'Introduce the product.', validateArgs: noArguments,
  execute: ({ context }) => commandResult({
    data: {
      name: context.identity.name,
      version: context.identity.version,
      repository: context.identity.repository,
    },
    text: `Yes, I'm still her, but now I'm better — version ${context.identity.version}.\n${context.identity.repository}`,
  }),
});
