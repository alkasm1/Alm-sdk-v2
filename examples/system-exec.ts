import { ALMClient } from '../src/index.js';

async function main(): Promise<void> {
  const alm = new ALMClient({
    endpoint: 'ws://localhost:8080',
    secret: 'my-super-secret-key-that-is-32-chars-long!',
  });

  await alm.connect();

  const result = await alm.system.exec('router-1', 'uname -a');
  console.log(result);

  await alm.disconnect();
}

main();
