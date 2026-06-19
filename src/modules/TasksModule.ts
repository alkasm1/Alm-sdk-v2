import { BaseModule } from './BaseModule.js';
import { OpcodeDefinition } from '../contracts/OpcodeDefinition.js';
import type { OpcodeRegistry } from '../request/OpcodeRegistry.js';
import type { ALMClient } from '../client/ALMClient.js';

export class TasksModule extends BaseModule {
  static moduleName = 'tasks';

  static registerOpcodes(registry: OpcodeRegistry): void {
    registry.register(new OpcodeDefinition({ name: 'task.run' }));
  }

  constructor(client: ALMClient) {
    super(client);
  }

  async run(deviceId: string, task: string): Promise<Record<string, unknown>> {
    return this.client.requestManager.send({
      opcode: 'task.run',
      deviceId,
      payload: { task },
    });
  }
}
