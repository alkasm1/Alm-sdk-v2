import { TaskEventContract } from './contracts/TaskEventContract.js';
import { DeviceEventContract } from './contracts/DeviceEventContract.js';
import { RuntimeEventContract } from './contracts/RuntimeEventContract.js';
import type { EventData } from '../types/index.js';

export class EventNormalizer {
  static normalize(event: EventData): EventData | null {
    if (!event || typeof event !== 'object') {
      return null;
    }

    const type = event.type || 'unknown';

    switch (type) {
      case 'task.event':
        if (!TaskEventContract.validate(event)) return null;
        break;
      case 'device.event':
        if (!DeviceEventContract.validate(event)) return null;
        break;
      case 'runtime.event':
        if (!RuntimeEventContract.validate(event)) return null;
        break;
    }

    const [name, action] = type.split('.');

    return {
      type,
      name: name || 'unknown',
      action: action || 'unknown',
      data: EventNormalizer.extractData(event),
      meta: {
        timestamp: (event.timestamp as number) ?? Date.now(),
        version: 1,
        source: 'server',
      },
    } as EventData;
  }

  private static extractData(event: EventData): Record<string, unknown> {
    const { type, timestamp, ...rest } = event;
    return rest as Record<string, unknown>;
  }
}
