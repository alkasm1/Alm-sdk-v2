import { ALMClient } from '../src/index.js';

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main(): Promise<void> {
  try {
    const alm = new ALMClient({
      endpoint: 'ws://localhost:8080',
      secret: 'my-super-secret-key-that-is-32-chars-long!',
    });

    // Middleware test
    alm.use(async (ctx, next) => {
      console.log(`\n[Middleware] => ${ctx.request.opcode}`);
      await next();
      console.log(`[Middleware Done] => ${ctx.request.opcode}`);
    });

    // Event subscriptions
    alm.on('device.event', (event) => {
      console.log('\n[DEVICE EVENT]');
      console.dir(event, { depth: null });
    });

    alm.on('task.event', (event) => {
      console.log('\n[TASK EVENT]');
      console.dir(event, { depth: null });
    });

    alm.on('transport.connected', () => {
      console.log('\n[TRANSPORT CONNECTED]');
    });

    alm.on('transport.disconnected', () => {
      console.log('\n[TRANSPORT DISCONNECTED]');
    });

    // Connect
    await alm.connect();
    console.log('\nConnected');

    // Device operations
    const router = alm.devices.get('router-1');
    console.log('\nDevice:', router.deviceId);

    // System info
    console.log('\n=== device.info ===');
    const info = await router.info();
    console.dir(info, { depth: null });

    // System exec
    console.log('\n=== device.exec ===');
    const execResult = await router.exec('uname -a');
    console.dir(execResult, { depth: null });

    // Task run
    console.log('\n=== task.run ===');
    const taskResult = await alm.tasks.run('router-1', 'backup-config');
    console.dir(taskResult, { depth: null });

    await sleep(100);

    // Task cache
    console.log('\n=== Task Cache ===');
    console.log('Has task:', alm.taskManager.has(taskResult.result?.taskId as string));
    console.log('Known tasks:', alm.taskManager.ids());
    console.dir(alm.taskManager.list().map((t) => t.toJSON()), { depth: null });

    // Device cache
    console.log('\n=== Device Cache ===');
    console.log('Has router:', alm.devices.has('router-1'));
    console.log('Known devices:', alm.devices.ids());

    // Wait for events
    console.log('\nWaiting for events (10s)...');
    await sleep(10000);

    // Disconnect
    await alm.disconnect();
    console.log('\nDisconnected');
  } catch (error) {
    console.error('Example failed:', error);
  }
}

main();
