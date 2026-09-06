import { validateResult } from '../../../../contracts/result.js';

export function commandResult({ text, data = {}, status = 'completed' }) {
  const result = { status, data, text };
  validateResult(result);
  return result;
}
