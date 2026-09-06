import { defineCommand, noArguments } from '../helpers/define-command.js';
import { commandResult } from '../helpers/result.js';
import { formatList } from '../helpers/formatters.js';

export const help = defineCommand({
  name: 'help', aliases: ['ajuda'], description: 'List available commands.',
  validateArgs: noArguments,
  execute: ({ context }) => commandResult({
    data: { commands: context.commands },
    text: `What can I do for now: ${formatList(context.commands.map(command => command.name))}.`,
  }),
});
