import type { EventData } from '../../types/index.js';

export class TaskEventContract {
  type: string;
  taskId: string;
  status: string;
  payload: Record<string, unknown>;
  timestamp: number;

  constructor({
    type = 'task.event',
    taskId,
    status,
    payload = {},
    timestamp = Date.now(),
  }: {
    type?: string;
    taskId: string;
    status: string;
    payload?: Record<string, unknown>;
    timestamp?: number;
  }) {
    this.type = type;
    this.taskId = taskId;
    this.status = status;
    this.payload = payload;
    this.timestamp = timestamp;
  }

  static validate(event: EventData): boolean {
    if (!event || typeof event !== 'object') return false;
    if (event.type !== 'task.event') return false;
    if (typeof event.taskId !== 'string') return false;
    if (typeof event.status !== 'string') return false;
    return true;
  }

  static from(event: EventData): TaskEventContract | null {
    if (!event || typeof event !== 'object') return null;

    const source = (event.data as Record<string, unknown>) ?? event;

    return new TaskEventContract({
      type: 'task.event',
      taskId: (source.taskId as string) ?? (event.taskId as string),
      status: (source.status as string) ?? (event.status as string),
      payload: (source.payload as Record<string, unknown>) ??
        (source.data as Record<string, unknown>) ??
        (event.payload as Record<string, unknown>) ??
        {},
      timestamp: (event.meta as Record<string, number>)?.timestamp ??
        (event.timestamp as number) ??
        Date.now(),
    });
  }

  toJSON(): Record<string, unknown> {
    return {
      type: this.type,
      taskId: this.taskId,
      status: this.status,
      payload: this.payload,
      timestamp: this.timestamp,
    };
  }
}
