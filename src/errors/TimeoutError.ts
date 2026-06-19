import { ALMError } from './ALMError.js';
import type { ALMErrorDetails } from '../types/index.js';

export class TimeoutError extends ALMError {
  constructor(
    message = 'Request timeout',
    details: ALMErrorDetails | null = null
  ) {
    super('ALM_TIMEOUT', message, details);
  }
}
