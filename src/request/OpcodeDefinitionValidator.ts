import { OpcodeDefinition } from '../contracts/OpcodeDefinition.js';
import { ValidationError } from '../errors/ValidationError.js';

export class OpcodeDefinitionValidator {
  static validate(definition: OpcodeDefinition): void {
    if (!definition?.name || typeof definition.name !== 'string') {
      throw new ValidationError('Opcode name is required and must be a string');
    }

    if (!Array.isArray(definition.transports)) {
      throw new ValidationError('transports must be an array');
    }

    if (definition.transports.length === 0) {
      throw new ValidationError('transports must not be empty');
    }

    if (typeof definition.version !== 'number' || definition.version < 1) {
      throw new ValidationError('version must be a positive number');
    }
  }
}
