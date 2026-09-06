export function participation(message) {
  if (message.actorKind === 'automation') return 'bot';
  if (message.conversationKind === 'direct') return 'direct_messages_disabled';
  if (message.invocation !== 'explicit') return 'not_invoked';
  return 'accepted';
}
