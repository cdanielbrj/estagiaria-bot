import { resolveCommand, listCommands } from './commands/registry.js';
import { commandResult } from './commands/helpers/result.js';

export async function executeDeterministic(route, context) {
  const command = resolveCommand(route.command);
  const commandContext = { ...context, commands: listCommands(context.permissions) };
  let result;
  try {
    result = command
      ? await command.execute({ args: route.args, context: commandContext })
      : commandResult({ status: 'unsupported', text: 'Ainda não consigo atender esse pedido. Consulte o comando help.' });
  } catch {
    result = commandResult({ status: 'failed', text: 'Não foi possível concluir esse comando.' });
  }
  return { result, intent: command?.name ?? 'unsupported' };
}
