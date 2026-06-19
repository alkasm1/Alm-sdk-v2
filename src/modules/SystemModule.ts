import { BaseModule } from './BaseModule.js';
import { OpcodeDefinition } from '../contracts/OpcodeDefinition.js';
import type { OpcodeRegistry } from '../request/OpcodeRegistry.js';
import type { ALMClient } from '../client/ALMClient.js';

export class SystemModule extends BaseModule {
  static moduleName = 'system';

  static registerOpcodes(registry: OpcodeRegistry): void {
    registry.register(new OpcodeDefinition({ name: 'system.info' }));
    registry.register(new OpcodeDefinition({ name: 'system.exec' }));
  }

  constructor(client: ALMClient) {
    super(client);
  }

  async info(deviceId: string): Promise<Record<string, unknown>> {
    return this.client.requestManager.send({
      opcode: 'system.info',
      deviceId,
    });
  }

  async exec(deviceId: string, command: string): Promise<Record<string, unknown>> {
    return this.client.requestManager.send({
      opcode: 'system.exec',
      deviceId,
      payload: { command },
    });
  }
}
