import { describe, it, expect } from 'vitest';
import { HMACSigner } from '../../src/security/HMACSigner';

describe('HMACSigner', () => {
  const secret = 'my-super-secret-key-that-is-32-chars-long!';

  it('should sign and verify payload', () => {
    const signer = new HMACSigner(secret);
    const payload = { opcode: 'test', data: 'hello' };

    const result = signer.sign(payload);

    expect(result.signature).toMatch(/^alm:hmac-sha256:[a-f0-9]{64}$/);
    expect(result.timestamp).toBeGreaterThan(0);
    expect(result.nonce).toHaveLength(32);

    expect(signer.verify(payload, result.signature)).toBe(true);
  });

  it('should reject invalid signature', () => {
    const signer = new HMACSigner(secret);
    const payload = { opcode: 'test' };

    expect(signer.verify(payload, 'invalid')).toBe(false);
    expect(signer.verify(payload, 'alm:hmac-sha256:wrong')).toBe(false);
  });

  it('should reject short secret', () => {
    expect(() => new HMACSigner('short')).toThrow('Secret must be at least 32 characters');
  });

  it('should generate different signatures for same payload', () => {
    const signer = new HMACSigner(secret);
    const payload = { opcode: 'test' };

    const result1 = signer.sign(payload);
    const result2 = signer.sign(payload);

    expect(result1.signature).not.toBe(result2.signature);
    expect(result1.nonce).not.toBe(result2.nonce);
  });
});
