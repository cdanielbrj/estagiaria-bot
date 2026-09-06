const fields = ['event', 'requestId', 'provider', 'conversationId', 'gatseStyle', 'intent', 'status', 'durationMs', 'errorCode'];

export function createLogger(write = line => process.stdout.write(line)) {
  return record => {
    const safe = { timestamp: new Date().toISOString() };
    for (const field of fields) if (record[field] !== undefined) safe[field] = record[field];
    write(JSON.stringify(safe) + '\n');
  };
}
