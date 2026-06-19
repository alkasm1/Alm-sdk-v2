import type { OpcodeDefinitionContract } from '../types/index.js';

export class OpcodeDefinition implements OpcodeDefinitionContract {
  name: string;
  version: number;
  transports: string[];
  signature: string | null;
  permissions: string[];

  constructor({
    name,
    version = 1,
    transports = ['ws'],
    signature = null,
    permissions = [],
  }: Partial<OpcodeDefinitionContract> & { name: string }) {
    this.name = name;
    this.version = version ?? 1;
    this.transports = transports ?? ['ws'];
    this.signature = signature ?? null;
    this.permissions = permissions ?? [];
  }

  toJSON(): OpcodeDefinitionContract {
    return {
      name: this.name,
      version: this.version,
      transports: this.transports,
      signature: this.signature,
      permissions: this.permissions,
    };
  }
}
