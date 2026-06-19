import type { ALMClient } from '../client/ALMClient.js';

export class Task {
  client: ALMClient;
  taskId: string;
  status: string;
  createdAt: number;
  updatedAt: number | null;
  completedAt: number | null;
  error: string | null;
  [key: string]: unknown;

  constructor(client: ALMClient, taskId: string) {
    this.client = client;
    this.taskId = taskId;
    this.status = 'unknown';
    this.createdAt = Date.now();
    this.updatedAt = null;
    this.completedAt = null;
    this.error = null;
  }

  isRunning(): boolean {
    return this.status === 'running';
  }

  isCompleted(): boolean {
    return this.status === 'completed';
  }

  isFailed(): boolean {
    return this.status === 'failed';
  }

  toJSON(): Record<string, unknown> {
    return {
      taskId: this.taskId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt,
      error: this.error,
    };
  }
}
