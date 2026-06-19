import type { EventData } from '../../types/index.js';

export class RuntimeEventContract {
  type: string;
  name: string;
  payload: Record<string, unknown>;
  timestamp: number;

  constructor({
    type = 'runtime.event',
    name,
    payload = {},
    timestamp = Date.now(),
  }: {
    type?: string;
    name: string;
    payload?: Record<string, unknown>;
    timestamp?: number;
  }) {
    this.type = type;
    this.name = name;
    this.payload = payload;
    this.timestamp = timestamp;
  }

  static validate(event: EventData): boolean {
    if (!event || typeof event !== 'object') return false;
    if (event.type !== 'runtime.event') return false;
    if (typeof event.name !== 'string') return false;
    return true;
  }

  static from(event: EventData): RuntimeEventContract | null {
    if (!event || typeof event !== 'object') return null;

    const source = (event.data as Record<string, unknown>) ?? event;

    return new RuntimeEventContract({
      type: 'runtime.event',
      name: (source.name as string) ?? (event.name as string),
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
      name: this.name,
      payload: this.payload,
      timestamp: this.timestamp,
    };
  }
}
