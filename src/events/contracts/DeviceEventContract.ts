import type { EventData } from '../../types/index.js';

export class DeviceEventContract {
  type: string;
  deviceId: string;
  payload: Record<string, unknown>;
  timestamp: number;

  constructor({
    type = 'device.event',
    deviceId,
    payload = {},
    timestamp = Date.now(),
  }: {
    type?: string;
    deviceId: string;
    payload?: Record<string, unknown>;
    timestamp?: number;
  }) {
    this.type = type;
    this.deviceId = deviceId;
    this.payload = payload;
    this.timestamp = timestamp;
  }

  static validate(event: EventData): boolean {
    if (!event || typeof event !== 'object') return false;
    if (event.type !== 'device.event') return false;
    if (typeof event.deviceId !== 'string') return false;
    return true;
  }

  static from(event: EventData): DeviceEventContract | null {
    if (!event || typeof event !== 'object') return null;

    const source = (event.data as Record<string, unknown>) ?? event;

    return new DeviceEventContract({
      type: 'device.event',
      deviceId: (source.deviceId as string) ?? (event.deviceId as string),
      payload: (source.payload as Record<string, unknown>) ??
        (source.data as Record<string, unknown>) ??
        (event.payload as Record<string, unknown>) ??
        {},
      timestamp: (event.meta as Record<string, number>)?.timestamp ??
        (event.timestamp as number) ??
        Date.now(),
    });
  }

  toJSON(): Record<string, unknown> {
    return {
      type: this.type,
      deviceId: this.deviceId,
      payload: this.payload,
      timestamp: this.timestamp,
    };
  }
}
