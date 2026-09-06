/**
 * CommandResult: { status, data, text }.
 * data is structured command output; text is a transport-neutral fallback.
 * A result must not contain native messages, embeds, buttons, or send callbacks.
 */
export function validateResult(result) {
  if (!result || !['completed', 'unsupported', 'denied', 'invalid_arguments', 'failed'].includes(result.status)
    || typeof result.text !== 'string' || !result.text.trim()
    || !result.data || typeof result.data !== 'object' || Array.isArray(result.data)) {
    throw new Error('INVALID_RESULT');
  }
}
