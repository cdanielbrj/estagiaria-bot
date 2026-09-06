import { ApplicationCommandType, InteractionContextType } from 'discord.js';

// Native UI declarations only; handlers and results live in Gatse I.
export const slashCommands = [
  { name: 'help', description: 'List available commands.' },
  { name: 'status', description: 'Show runtime status.' },
  { name: 'about', description: 'Introduce Aira Gatse.' },
].map(command => ({ ...command, type: ApplicationCommandType.ChatInput, contexts: [InteractionContextType.Guild], options: [] }));

export async function registerCommands(application) {
  // Upsert owned names individually; do not replace unrelated application commands.
  for (const command of slashCommands) await application.commands.create(command);
}
