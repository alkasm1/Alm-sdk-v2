import { OpcodeDefinition } from '../contracts/OpcodeDefinition.js';
import type { OpcodeRegistry } from '../request/OpcodeRegistry.js';
import type { ALMClient } from '../client/ALMClient.js';

export class DeviceModule {
  static moduleName = 'device';

  static registerOpcodes(registry: OpcodeRegistry): void {
    registry.register(new OpcodeDefinition({ name: 'device.discover' }));
  }

  private client: ALMClient;

  constructor(client: ALMClient) {
    this.client = client;
  }

  async discover(): Promise<Record<string, unknown>> {
    return this.client.requestManager.send({
      opcode: 'device.discover',
    });
  }
}
