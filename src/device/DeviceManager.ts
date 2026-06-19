import { Device } from './Device.js';
import type { ALMClient } from '../client/ALMClient.js';
import type { EventData } from '../types/index.js';

export class DeviceManager {
  private client: ALMClient;
  private cache: Map<string, Device> = new Map();

  constructor(client: ALMClient) {
    this.client = client;
  }

  async discover(): Promise<Device[]> {
    const response = await this.client.device.discover();
    const devices = (response.result as Array<Record<string, unknown>>) ?? [];

    return devices.map((info) => {
      const device = this.get(info.id as string);
      Object.assign(device, info, { lastSeen: Date.now() });
      return device;
    });
  }

  get(deviceId: string): Device {
    if (!this.cache.has(deviceId)) {
      this.cache.set(deviceId, new Device(this.client, deviceId));
    }
    return this.cache.get(deviceId)!;
  }

  has(deviceId: string): boolean {
    return this.cache.has(deviceId);
  }

  update(event: EventData): Device | null {
    const deviceId = event?.deviceId as string;
    if (!deviceId) return null;

    const device = this.get(deviceId);
    Object.assign(device, {
      status: event.status,
      timestamp: event.timestamp,
      lastSeen: Date.now(),
    });

    return device;
  }

  remove(deviceId: string): boolean {
    return this.cache.delete(deviceId);
  }

  clear(): void {
    this.cache.clear();
  }

  list(): Device[] {
    return [...this.cache.values()];
  }

  ids(): string[] {
    return [...this.cache.keys()];
  }

  get size(): number {
    return this.cache.size;
  }
}
