import { validateOutput } from '../../../core/gatse-engine/contracts/output.js';

export function renderOutput(output) {
  validateOutput(output);
  if (output.result.text.length > 2000) throw new Error('INVALID_RESPONSE_LENGTH');
  return { content: output.result.text, allowedMentions: { parse: [], repliedUser: false } };
}
