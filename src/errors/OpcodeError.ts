import { ALMError } from './ALMError.js';
import type { ALMErrorDetails } from '../types/index.js';

export class OpcodeError extends ALMError {
  constructor(
    code = 'ALM_OPCODE_ERROR',
    message = 'Opcode error',
    details: ALMErrorDetails | null = null
  ) {
    super(code, message, details);
  }
}
