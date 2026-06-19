import { EventEmitter } from 'events';
import type { EventData } from '../types/index.js';

export class EventRouter {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100);
  }

  handle(event: EventData): void {
    if (!event || typeof event !== 'object') return;

    const type = event.type || 'runtime.event';

    this.emitter.emit('raw', event);
    this.emitter.emit(type, event);

    switch (type) {
      case 'device.event':
        this.emitter.emit('device.event', event);
        break;
      case 'task.event':
        this.emitter.emit('task.event', event);
        break;
      default:
        this.emitter.emit('runtime.event', event);
    }
  }

  on(eventName: string, handler: (event: EventData) => void): void {
    this.emitter.on(eventName, handler);
  }

  off(eventName: string, handler: (event: EventData) => void): void {
    this.emitter.off(eventName, handler);
  }

  once(eventName: string, handler: (event: EventData) => void): void {
    this.emitter.once(eventName, handler);
  }

  removeAllListeners(eventName?: string): void {
    this.emitter.removeAllListeners(eventName);
  }
}
