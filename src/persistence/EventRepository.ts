import type { EventStore } from './EventStore.js';
import type { EventData } from '../types/index.js';

export class EventRepository implements EventStore {
  private events: EventData[] = [];
  private maxSize: number;

  constructor(maxSize = 10000) {
    this.maxSize = maxSize;
  }

  append(event: EventData): void {
    this.events.push(event);
    this.cleanup();
  }

  getEvents(type?: string): EventData[] {
    if (!type) return [...this.events];
    return this.events.filter((e) => e.type === type);
  }

  getEventsSince(timestamp: number): EventData[] {
    return this.events.filter((e) => (e.timestamp as number) >= timestamp);
  }

  clear(): void {
    this.events = [];
  }

  get size(): number {
    return this.events.length;
  }

  private cleanup(): void {
    if (this.events.length > this.maxSize) {
      this.events = this.events.slice(-this.maxSize);
    }
  }
}
