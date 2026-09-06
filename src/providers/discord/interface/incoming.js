import { randomUUID } from 'node:crypto';

export function conversationId(accountId, channelId) {
  return `discord:${accountId}:channel:${channelId}`;
}

function envelope({ id, channelId, guildId, user }, accountId) {
  return {
    eventId: randomUUID(), sourceMessageId: id, providerId: 'discord', providerAccountId: accountId,
    conversationId: conversationId(accountId, channelId), participantId: `discord:user:${user.id}`,
    actorKind: user.bot || user.id === accountId ? 'automation' : 'human',
    conversationKind: guildId ? 'group' : 'direct', permissions: [], receivedAt: new Date().toISOString(),
  };
}

export function normalizeMessage(message, accountId) {
  const mentioned = new RegExp(`<@!?${accountId}>`).test(message.content);
  const text = message.content.replace(new RegExp(`<@!?${accountId}>`, 'g'), '').trim();
  const event = envelope({ id: message.id, channelId: message.channelId, guildId: message.guildId, user: message.author }, accountId);
  if (message.webhookId) event.actorKind = 'automation';
  return {
    ...event,
    invocation: mentioned ? 'explicit' : 'ambient',
    input: { type: 'conversation', text },
  };
}

export function normalizeInteraction(interaction, accountId) {
  // Current published commands have no options; unexpected options are passed
  // as arguments so command validation can reject them rather than ignore them.
  const args = Object.fromEntries((interaction.options?.data ?? []).map(option => [option.name, option.value]));
  return {
    ...envelope(interaction, accountId), invocation: 'explicit',
    input: { type: 'command', name: interaction.commandName, args },
  };
}
