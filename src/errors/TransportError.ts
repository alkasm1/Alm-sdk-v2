import { ALMError } from './ALMError.js';
import type { ALMErrorDetails } from '../types/index.js';

export class TransportError extends ALMError {
  constructor(
    message = 'Transport error',
    details: ALMErrorDetails | null = null
  ) {
    super('ALM_TRANSPORT_ERROR', message, details);
  }
}
