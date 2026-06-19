import type { ALMClient } from '../client/ALMClient.js';
import type { OpcodeRegistry } from '../request/OpcodeRegistry.js';

export abstract class BaseModule {
  protected client: ALMClient;

  constructor(client: ALMClient) {
    this.client = client;
  }

  static get moduleName(): string {
    throw new Error('moduleName must be defined in subclass');
  }

  static registerOpcodes(registry: OpcodeRegistry): void {
    // Optional override
  }
}
