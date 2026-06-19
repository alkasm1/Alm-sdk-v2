import { ALMError } from './ALMError.js';
import type { ALMErrorDetails } from '../types/index.js';

export class ValidationError extends ALMError {
  constructor(
    message = 'Validation error',
    details: ALMErrorDetails | null = null
  ) {
    super('ALM_VALIDATION_ERROR', message, details);
  }
}
