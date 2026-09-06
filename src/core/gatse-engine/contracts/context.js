/**
 * ExecutionContext contains participantId, permissions, identity, and runtime.
 * It contains no transport or delivery destination. Permissions come from a
 * trusted adapter/application policy, never from command arguments or text.
 */
export function validateContext(context) {
  if (!context || typeof context.participantId !== 'string' || !context.participantId
    || !Array.isArray(context.permissions) || context.permissions.some(p => typeof p !== 'string')
    || typeof context.identity?.name !== 'string' || !context.identity.name
    || typeof context.identity?.version !== 'string' || !context.identity.version
    || typeof context.identity?.repository !== 'string' || !context.identity.repository
    || typeof context.runtime?.status !== 'string' || !context.runtime.status
    || !Array.isArray(context.runtime?.styles) || context.runtime.styles.some(s => typeof s !== 'string')) {
    throw new Error('INVALID_CONTEXT');
  }
}
