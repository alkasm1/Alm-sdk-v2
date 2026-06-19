import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import type { EventStore } from './EventStore.js';
import type { EventData } from '../types/index.js';

export class FileEventStore implements EventStore {
  private filePath: string;
  private cache: EventData[] = [];
  private flushInterval: number;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(filePath: string, flushInterval = 5000) {
    this.filePath = filePath;
    this.flushInterval = flushInterval;
    this.ensureDirectory();
    this.load();
    this.startFlushTimer();
  }

  append(event: EventData): void {
    this.cache.push(event);
  }

  getEvents(type?: string): EventData[] {
    if (!type) return [...this.cache];
    return this.cache.filter((e) => e.type === type);
  }

  getEventsSince(timestamp: number): EventData[] {
    return this.cache.filter((e) => (e.timestamp as number) >= timestamp);
  }

  clear(): void {
    this.cache = [];
    this.flush();
  }

  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush();
  }

  private ensureDirectory(): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  private load(): void {
    if (!existsSync(this.filePath)) return;
    try {
      const data = readFileSync(this.filePath, 'utf-8');
      this.cache = JSON.parse(data);
    } catch {
      this.cache = [];
    }
  }

  private flush(): void {
    try {
      writeFileSync(this.filePath, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error('Failed to flush events to file:', error);
    }
  }

  private startFlushTimer(): void {
    this.timer = setInterval(() => this.flush(), this.flushInterval);
  }
}
