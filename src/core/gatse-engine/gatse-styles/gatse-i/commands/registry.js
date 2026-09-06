import { help } from './builtins/help.js';
import { status } from './builtins/status.js';
import { about } from './builtins/about.js';

const commands = new Map();
for (const command of [help, status, about]) {
  for (const name of [command.name, ...command.aliases]) {
    if (commands.has(name)) throw new Error(`Duplicate command name: ${name}`);
    commands.set(name, command);
  }
}

export function resolveCommand(name) {
  return commands.get(name);
}

export function listCommands(permissions = []) {
  return [...new Set(commands.values())]
    .filter(command => command.permissions.every(permission => permissions.includes(permission)))
    .map(({ name, aliases, description }) => ({ name, aliases: [...aliases], description }));
}
