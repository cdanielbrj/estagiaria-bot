import { validateContext } from '../../../../contracts/context.js';
import { validateResult } from '../../../../contracts/result.js';
import { commandResult } from './result.js';

export function defineCommand({ name, aliases = [], description, permissions = [], validateArgs, execute }) {
  const validName = value => typeof value === 'string' && /^[a-z][a-z0-9-]*$/.test(value);
  if (!validName(name) || !Array.isArray(aliases) || aliases.some(alias => !validName(alias))
    || new Set([name, ...aliases]).size !== aliases.length + 1
    || typeof description !== 'string' || !description.trim()
    || !Array.isArray(permissions) || permissions.some(p => typeof p !== 'string' || !p)
    || typeof validateArgs !== 'function' || typeof execute !== 'function') throw new Error('INVALID_COMMAND_DEFINITION');
  return Object.freeze({
    name, aliases: Object.freeze([...aliases]), description, permissions: Object.freeze([...permissions]),
    async execute({ args = {}, context }) {
      validateContext(context);
      if (permissions.some(permission => !context.permissions.includes(permission))) {
        return commandResult({ status: 'denied', text: 'Você não tem permissão para esse comando.' });
      }
      if (!args || Object.getPrototypeOf(args) !== Object.prototype || !validateArgs(args)) {
        return commandResult({ status: 'invalid_arguments', text: 'Argumentos inválidos para esse comando.' });
      }
      const result = await execute({ args, context });
      validateResult(result);
      return result;
    },
  });
}

export const noArguments = args => Object.keys(args).length === 0;
