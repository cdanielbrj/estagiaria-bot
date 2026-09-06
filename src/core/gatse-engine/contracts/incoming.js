/**
 * Incoming event contains scoped source/destination references, participantId,
 * actorKind (human/automation), conversationKind (group/direct), invocation
 * (explicit/ambient), trusted permissions, receivedAt and input.
 * Input is { type: 'conversation', text } or { type: 'command', name, args }.
 * Native invocation mechanisms, mentions and SDK objects are translated by the adapter.
 */
export function validateMessage(message) {
  if (!message || typeof message !== 'object') throw new Error('INVALID_MESSAGE');
  for (const key of ['eventId', 'sourceMessageId', 'providerId', 'providerAccountId', 'conversationId', 'participantId', 'receivedAt']) {
    if (typeof message[key] !== 'string' || !message[key]) throw new Error('INVALID_MESSAGE');
  }
  if (!Number.isFinite(Date.parse(message.receivedAt))
    || !['human', 'automation'].includes(message.actorKind)
    || !['group', 'direct'].includes(message.conversationKind)
    || !['explicit', 'ambient'].includes(message.invocation)
    || !Array.isArray(message.permissions) || message.permissions.some(p => typeof p !== 'string')) throw new Error('INVALID_MESSAGE');
  const input = message.input;
  if (input?.type === 'conversation' && typeof input.text === 'string') return;
  if (input?.type === 'command' && typeof input.name === 'string' && /^[a-z][a-z0-9-]*$/.test(input.name)
    && input.args && Object.getPrototypeOf(input.args) === Object.prototype) return;
  throw new Error('INVALID_MESSAGE');
}

export function sourceKey(message) {
  return JSON.stringify([message.providerId, message.providerAccountId, message.conversationId, message.sourceMessageId]);
}
