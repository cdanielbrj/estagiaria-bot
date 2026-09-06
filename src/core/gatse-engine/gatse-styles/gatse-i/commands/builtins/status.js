import { defineCommand, noArguments } from '../helpers/define-command.js';
import { commandResult } from '../helpers/result.js';
import { formatList } from '../helpers/formatters.js';

export const status = defineCommand({
  name: 'status', description: 'Show runtime status.', validateArgs: noArguments,
  execute: ({ context }) => commandResult({
    data: { runtime: context.runtime.status, styles: [...context.runtime.styles] },
    text: `Status: ${context.runtime.status}. Current Styles: ${formatList(context.runtime.styles.map(style => `Gatse ${style}`))}.`,
  }),
});
