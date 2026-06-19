import type { EventData } from '../types/index.js';

export interface EventStore {
  append(event: EventData): void;
  getEvents(type?: string): EventData[];
  getEventsSince(timestamp: number): EventData[];
  clear(): void;
}
