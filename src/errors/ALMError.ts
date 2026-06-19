import type { ALMErrorDetails } from '../types/index.js';

export interface ALMErrorDetails {
  [key: string]: unknown;
}

export class ALMError extends Error {
  public readonly code: string;
  public readonly details: ALMErrorDetails | null;

  constructor(
    code = 'ALM_ERROR',
    message = 'ALM Error',
    details: ALMErrorDetails | null = null
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;

    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}
