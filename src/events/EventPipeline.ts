import type { EventData } from '../types/index.js';

export type EventPipelineHandler = (event: EventData) => Promise<EventData | null>;

export class EventPipeline {
  private steps: EventPipelineHandler[] = [];

  use(handler: EventPipelineHandler): void {
    this.steps.push(handler);
  }

  async process(event: EventData): Promise<EventData | null> {
    if (!event || typeof event !== 'object') {
      return null;
    }

    let current = event;

    for (const step of this.steps) {
      try {
        current = await step(current);
        if (!current) {
          return null;
        }
      } catch (error) {
        console.error('[EventPipeline] step error:', error);
        return null;
      }
    }

    return current;
  }

  clear(): void {
    this.steps = [];
  }
}
