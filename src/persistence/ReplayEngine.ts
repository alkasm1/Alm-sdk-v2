import type { EventStore } from './EventStore.js';
import type { EventData } from '../types/index.js';

export type ReplayHandler = (event: EventData) => void;

export class ReplayEngine {
  private store: EventStore;

  constructor(store: EventStore) {
    this.store = store;
  }

  replay(fromTimestamp?: number, handler?: ReplayHandler): EventData[] {
    const events = fromTimestamp
      ? this.store.getEventsSince(fromTimestamp)
      : this.store.getEvents();

    if (handler) {
      events.forEach((event) => handler(event));
    }

    return events;
  }

  replayType(type: string, fromTimestamp?: number): EventData[] {
    const events = this.store.getEvents(type);
    if (!fromTimestamp) return events;
    return events.filter((e) => (e.timestamp as number) >= fromTimestamp);
  }
}
