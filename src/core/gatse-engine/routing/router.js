// Providers identify command vs conversation. The router selects execution,
// never reinterpreting conversation text as a command or native channel syntax.
export function selectRoute(input) {
  if (input.type === 'command') {
    return { style: 'I', command: input.name, args: input.args };
  }
  return { style: null, intent: 'conversation', reason: 'COGNITIVE_EXECUTOR_UNAVAILABLE' };
}
