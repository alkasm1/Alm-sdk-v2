import type { EventData } from '../types/index.js';
import { ValidationError } from '../errors/ValidationError.js';

export class EventValidator {
  static validate(event: unknown): asserts event is EventData {
    if (!event || typeof event !== 'object') {
      throw new ValidationError('Event must be an object');
    }

    const e = event as Record<string, unknown>;

    if (!e.type || typeof e.type !== 'string') {
      throw new ValidationError('Event.type is required and must be a string');
    }

    if (!e.timestamp || typeof e.timestamp !== 'number') {
      throw new ValidationError('Event.timestamp is required and must be a number');
    }
  }
}
