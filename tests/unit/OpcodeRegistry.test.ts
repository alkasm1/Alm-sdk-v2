import { describe, it, expect } from 'vitest';
import { OpcodeRegistry } from '../../src/request/OpcodeRegistry';
import { OpcodeDefinition } from '../../src/contracts/OpcodeDefinition';
import { OpcodeError } from '../../src/errors/OpcodeError';

describe('OpcodeRegistry', () => {
  it('should register and resolve opcodes', () => {
    const registry = new OpcodeRegistry();
    const def = new OpcodeDefinition({ name: 'test.op' });

    registry.register(def);

    expect(registry.resolve('test.op')).toEqual(def);
    expect(registry.exists('test.op')).toBe(true);
  });

  it('should throw on duplicate registration', () => {
    const registry = new OpcodeRegistry();
    const def = new OpcodeDefinition({ name: 'test.op' });

    registry.register(def);

    expect(() => registry.register(def)).toThrow(OpcodeError);
  });

  it('should throw on missing opcode', () => {
    const registry = new OpcodeRegistry();

    expect(() => registry.resolveOrThrow('missing')).toThrow(OpcodeError);
  });

  it('should list all opcodes', () => {
    const registry = new OpcodeRegistry();
    registry.register(new OpcodeDefinition({ name: 'op1' }));
    registry.register(new OpcodeDefinition({ name: 'op2' }));

    expect(registry.list()).toHaveLength(2);
    expect(registry.count).toBe(2);
  });
});
