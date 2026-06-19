import type { RequestContract } from '../types/index.js';

export class Request implements RequestContract {
  requestId: string;
  opcode: string;
  deviceId: string | null;
  payload: Record<string, unknown> | null;
  timeout: number;
  metadata: Record<string, unknown>;
  timestamp: number;

  constructor({
    requestId,
    opcode,
    deviceId = null,
    payload = null,
    timeout = 30000,
    metadata = { sdkVersion: '2.0.0' },
    timestamp = Date.now(),
  }: RequestContract) {
    this.requestId = requestId;
    this.opcode = opcode;
    this.deviceId = deviceId ?? null;
    this.payload = payload ?? null;
    this.timeout = timeout ?? 30000;
    this.metadata = metadata ?? { sdkVersion: '2.0.0' };
    this.timestamp = timestamp ?? Date.now();
  }

  toJSON(): RequestContract {
    return {
      requestId: this.requestId,
      opcode: this.opcode,
      deviceId: this.deviceId,
      payload: this.payload,
      timeout: this.timeout,
      metadata: this.metadata,
      timestamp: this.timestamp,
    };
  }
}
