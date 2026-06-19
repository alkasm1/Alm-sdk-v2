import { TimeoutError } from '../errors/TimeoutError.js';
import type { PendingRequestEntry, ResponseContract } from '../types/index.js';

export class PendingRequests {
  private map: Map<string, PendingRequestEntry> = new Map();
  private readonly maxSize: number;
  private readonly cleanupInterval: number;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(maxSize = 1000, cleanupInterval = 60000) {
    this.maxSize = maxSize;
    this.cleanupInterval = cleanupInterval;
    this.startCleanupTimer();
  }

  add(
    requestId: string,
    entry: Omit<PendingRequestEntry, 'startedAt'> & { startedAt?: number }
  ): void {
    if (this.map.size >= this.maxSize) {
      this.cleanup();
    }

    this.map.set(requestId, {
      ...entry,
      startedAt: entry.startedAt ?? Date.now(),
    } as PendingRequestEntry);
  }

  has(requestId: string): boolean {
    return this.map.has(requestId);
  }

  get(requestId: string): PendingRequestEntry | null {
    return this.map.get(requestId) ?? null;
  }

  resolve(requestId: string, response: ResponseContract): boolean {
    const entry = this.map.get(requestId);

    if (!entry) {
      return false;
    }

    if (entry.timeoutId) {
      clearTimeout(entry.timeoutId);
    }

    this.map.delete(requestId);
    entry.resolve(response);

    return true;
  }

  reject(requestId: string, error: Error): boolean {
    const entry = this.map.get(requestId);

    if (!entry) {
      return false;
    }

    if (entry.timeoutId) {
      clearTimeout(entry.timeoutId);
    }

    this.map.delete(requestId);
    entry.reject(error);

    return true;
  }

  cancel(requestId: string, error = new Error('Request cancelled')): boolean {
    return this.reject(requestId, error);
  }

  remove(requestId: string): boolean {
    const entry = this.map.get(requestId);

    if (!entry) {
      return false;
    }

    if (entry.timeoutId) {
      clearTimeout(entry.timeoutId);
    }

    this.map.delete(requestId);

    return true;
  }

  clear(error = new Error('Pending requests cleared')): void {
    for (const [requestId, entry] of [...this.map.entries()]) {
      if (entry.timeoutId) {
        clearTimeout(entry.timeoutId);
      }

      entry.reject(error);
      this.map.delete(requestId);
    }
  }

  entries(): [string, PendingRequestEntry][] {
    return [...this.map.entries()];
  }

  ids(): string[] {
    return [...this.map.keys()];
  }

  stats(): { count: number; requestIds: string[] } {
    return {
      count: this.map.size,
      requestIds: this.ids(),
    };
  }

  oldest(): { requestId: string; age: number } | null {
    const entries = [...this.map.entries()];

    if (!entries.length) {
      return null;
    }

    entries.sort((a, b) => a[1].startedAt - b[1].startedAt);

    const [requestId, entry] = entries[0];

    return {
      requestId,
      age: Date.now() - entry.startedAt,
    };
  }

  get size(): number {
    return this.map.size;
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear(new Error('PendingRequests destroyed'));
  }

  private cleanup(): void {
    const now = Date.now();
    const expired: string[] = [];

    for (const [requestId, entry] of this.map.entries()) {
      if (now - entry.startedAt > 300000) { // 5 minutes
        expired.push(requestId);
      }
    }

    for (const requestId of expired) {
      this.reject(requestId, new TimeoutError('Request expired in pending queue'));
    }
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }
}
