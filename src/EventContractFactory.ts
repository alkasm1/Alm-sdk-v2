import { TaskEventContract } from './contracts/TaskEventContract.js';
import { DeviceEventContract } from './contracts/DeviceEventContract.js';
import { RuntimeEventContract } from './contracts/RuntimeEventContract.js';
import type { EventData } from '../types/index.js';

export class EventContractFactory {
  private static registry = new Map<string, typeof TaskEventContract | typeof DeviceEventContract | typeof RuntimeEventContract>([
    ['device.event', DeviceEventContract],
    ['task.event', TaskEventContract],
    ['runtime.event', RuntimeEventContract],
  ]);

  static create(event: EventData): EventData | null {
    if (!event || typeof event !== 'object') {
      return null;
    }

    const Contract = this.registry.get(event.type);
    if (!Contract) {
      return {
        type: event.type,
        name: 'unknown',
        action: 'unknown',
        data: event,
        meta: {
          timestamp: event.timestamp ?? Date.now(),
          version: 1,
          source: 'factory-fallback',
        },
      } as EventData;
    }

    return Contract.from(event) as EventData;
  }

  static register(type: string, ContractClass: typeof TaskEventContract): void {
    this.registry.set(type, ContractClass);
  }
}
