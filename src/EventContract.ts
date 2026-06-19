import type { EventContractData } from '../types/index.js';

export class EventContract implements EventContractData {
  eventId: string;
  type: string;
  source: string | null;
  payload: Record<string, unknown> | null;
  version: number;
  timestamp: number;

  constructor({
    eventId,
    type,
    source = null,
    payload = null,
    version = 1,
    timestamp = Date.now(),
  }: EventContractData) {
    this.eventId = eventId;
    this.type = type;
    this.source = source ?? null;
    this.payload = payload ?? null;
    this.version = version ?? 1;
    this.timestamp = timestamp ?? Date.now();
  }

  toJSON(): EventContractData {
    return {
      eventId: this.eventId,
      type: this.type,
      source: this.source,
      payload: this.payload,
      version: this.version,
      timestamp: this.timestamp,
    };
  }
}
