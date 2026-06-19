import { Task } from './Task.js';
import type { ALMClient } from '../client/ALMClient.js';
import type { EventData } from '../types/index.js';

export class TaskManager {
  private client: ALMClient;
  private cache: Map<string, Task> = new Map();

  constructor(client: ALMClient) {
    this.client = client;
  }

  get(taskId: string): Task {
    if (!this.cache.has(taskId)) {
      this.cache.set(taskId, new Task(this.client, taskId));
    }
    return this.cache.get(taskId)!;
  }

  has(taskId: string): boolean {
    return this.cache.has(taskId);
  }

  update(event: EventData): Task | null {
    if (!event) return null;

    const taskId = (event.taskId as string) ?? ((event.data as Record<string, unknown>)?.taskId as string);
    const status = (event.status as string) ?? ((event.data as Record<string, unknown>)?.status as string);

    if (!taskId) return null;

    const task = this.get(taskId);
    task.status = status ?? task.status;
    task.updatedAt = (event.timestamp as number) ?? Date.now();

    if (status === 'completed') {
      task.completedAt = (event.timestamp as number) ?? Date.now();
    }

    if (event.error || (event.data as Record<string, unknown>)?.error) {
      task.error = (event.error as string) ?? ((event.data as Record<string, unknown>)?.error as string);
    }

    return task;
  }

  remove(taskId: string): boolean {
    return this.cache.delete(taskId);
  }

  clear(): void {
    this.cache.clear();
  }

  list(): Task[] {
    return [...this.cache.values()];
  }

  ids(): string[] {
    return [...this.cache.keys()];
  }

  get size(): number {
    return this.cache.size;
  }
}
