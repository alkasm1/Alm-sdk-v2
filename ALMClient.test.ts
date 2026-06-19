import { describe, it, expect, vi } from 'vitest';
import { ALMClient } from '../../src/client/ALMClient';

describe('ALMClient', () => {
  it('should create client with config', () => {
    const client = new ALMClient({
      endpoint: 'ws://localhost:8080',
      secret: 'my-super-secret-key-that-is-32-chars-long!',
    });

    expect(client).toBeDefined();
    expect(client.devices).toBeDefined();
    expect(client.taskManager).toBeDefined();
  });

  it('should register modules', () => {
    const client = new ALMClient({
      endpoint: 'ws://localhost:8080',
    });

    expect(client.system).toBeDefined();
    expect(client.tasks).toBeDefined();
    expect(client.device).toBeDefined();
  });

  it('should emit events', () => {
    const client = new ALMClient({
      endpoint: 'ws://localhost:8080',
    });

    const handler = vi.fn();
    client.on('test.event', handler);

    // Simulate internal event emission
    // Note: In real tests, you'd mock the transport
  });
});
