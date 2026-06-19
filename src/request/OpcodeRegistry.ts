import { OpcodeDefinition } from '../contracts/OpcodeDefinition.js';
import { OpcodeError } from '../errors/OpcodeError.js';
import { OpcodeDefinitionValidator } from './OpcodeDefinitionValidator.js';

export class OpcodeRegistry {
  private definitions: Map<string, OpcodeDefinition> = new Map();

  register(definition: OpcodeDefinition): OpcodeDefinition {
    OpcodeDefinitionValidator.validate(definition);

    const name = definition.name;

    if (this.definitions.has(name)) {
      throw new OpcodeError('ALM_OPCODE_DUPLICATE', `Opcode already registered: ${name}`);
    }

    this.definitions.set(name, definition);
    return definition;
  }

  resolve(name: string): OpcodeDefinition | null {
    return this.definitions.get(name) ?? null;
  }

  resolveOrThrow(name: string): OpcodeDefinition {
    const def = this.resolve(name);
    if (!def) {
      throw new OpcodeError('ALM_OPCODE_NOT_FOUND', `Opcode not found: ${name}`);
    }
    return def;
  }

  exists(name: string): boolean {
    return this.definitions.has(name);
  }

  remove(name: string): boolean {
    return this.definitions.delete(name);
  }

  list(): OpcodeDefinition[] {
    return [...this.definitions.values()];
  }

  supportsTransport(name: string, transport: string): boolean {
    const def = this.resolve(name);
    if (!def) return false;
    return def.transports.includes(transport);
  }

  clear(): void {
    this.definitions.clear();
  }

  get count(): number {
    return this.definitions.size;
  }
}
