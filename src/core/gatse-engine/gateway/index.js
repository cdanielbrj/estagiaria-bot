import { validateMessage } from '../contracts/incoming.js';
import { participation } from '../routing/participation.js';
import { selectRoute } from '../routing/router.js';

export function createGateway({ providerId, runtime, log }) {
  return {
    async handle(message) {
      try { validateMessage(message); } catch {
        log({ event: 'input_rejected', errorCode: 'INVALID_MESSAGE' });
        return { status: 'ignored', reason: 'invalid_message' };
      }
      if (message.providerId !== providerId) return { status: 'ignored', reason: 'provider_mismatch' };
      const reason = participation(message);
      if (reason !== 'accepted') return { status: 'ignored', reason };
      return runtime.execute(message, selectRoute(message.input));
    },
  };
}
