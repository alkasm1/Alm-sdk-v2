import { ALMClient } from '../src/index.js';

async function main(): Promise<void> {
  const alm = new ALMClient({
    endpoint: 'ws://localhost:8080',
    secret: 'my-super-secret-key-that-is-32-chars-long!',
    maxReconnectAttempts: 5,
    heartbeatInterval: 15000,
  });

  // Logging middleware with timing
  alm.use(async (ctx, next) => {
    const start = Date.now();
    console.log(`[Request] ${ctx.request.opcode} -> ${ctx.request.deviceId}`);
    await next();
    console.log(`[Response] ${ctx.request.opcode} (${Date.now() - start}ms)`);
  });

  // Event replay
  alm.on('event.normalized', (event) => {
    console.log('[Normalized]', event);
  });

  await alm.connect();

  // Discover devices
  const devices = await alm.device.discover();
  console.log('Discovered devices:', devices);

  // Run multiple tasks
  const tasks = await Promise.all([
    alm.tasks.run('router-1', 'backup-config'),
    alm.tasks.run('router-1', 'update-firmware'),
  ]);
  console.log('Tasks started:', tasks);

  // Replay events from last hour
  const events = alm.replay(Date.now() - 3600000);
  console.log('Replayed events:', events.length);

  await alm.disconnect();
}

main();
