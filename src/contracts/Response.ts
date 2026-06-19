import type { ResponseContract } from '../types/index.js';

export class Response implements ResponseContract {
  requestId: string;
  success: boolean;
  duration: number;
  result: Record<string, unknown> | null;
  error: { code: string; message: string; details?: Record<string, unknown> } | null;
  timestamp: number;

  constructor({
    requestId,
    success,
    duration = 0,
    result = null,
    error = null,
    timestamp = Date.now(),
  }: ResponseContract) {
    this.requestId = requestId;
    this.success = success;
    this.duration = duration ?? 0;
    this.result = result ?? null;
    this.error = error ?? null;
    this.timestamp = timestamp ?? Date.now();
  }

  toJSON(): ResponseContract {
    return {
      requestId: this.requestId,
      success: this.success,
      duration: this.duration,
      result: this.result,
      error: this.error,
      timestamp: this.timestamp,
    };
  }

  static fromError(requestId: string, code: string, message: string): Response {
    return new Response({
      requestId,
      success: false,
      error: { code, message },
    });
  }
}
