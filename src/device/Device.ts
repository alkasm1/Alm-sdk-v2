import type { ALMClient } from '../client/ALMClient.js';

export class Device {
  client: ALMClient;
  deviceId: string;
  [key: string]: unknown;

  constructor(client: ALMClient, deviceId: string) {
    this.client = client;
    this.deviceId = deviceId;
  }

  async info(): Promise<Record<string, unknown>> {
    return this.client.system.info(this.deviceId);
  }

  async exec(command: string): Promise<Record<string, unknown>> {
    return this.client.system.exec(this.deviceId, command);
  }

  async runTask(task: string): Promise<Record<string, unknown>> {
    return this.client.tasks.run(this.deviceId, task);
  }

  toJSON(): Record<string, unknown> {
    return {
      deviceId: this.deviceId,
      ...Object.fromEntries(
        Object.entries(this).filter(([key]) => key !== 'client' && key !== 'deviceId')
      ),
    };
  }
}
