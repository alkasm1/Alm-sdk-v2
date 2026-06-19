import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import type { SignatureResult } from '../types/index.js';

export class HMACSigner {
  private readonly secret: string;

  constructor(secret: string) {
    if (!secret || secret.length < 32) {
      throw new Error('Secret must be at least 32 characters for HMAC-SHA256');
    }
    this.secret = secret;
  }

  /**
   * Sign a payload with HMAC-SHA256
   */
  sign(payload: Record<string, unknown>): SignatureResult {
    const timestamp = Date.now();
    const nonce = this.generateNonce();

    const data = {
      ...payload,
      timestamp,
      nonce,
    };

    const signature = createHmac('sha256', this.secret)
      .update(JSON.stringify(data))
      .digest('hex');

    return {
      signature: `alm:hmac-sha256:${signature}`,
      timestamp,
      nonce,
    };
  }

  /**
   * Verify a signature
   */
  verify(payload: Record<string, unknown>, signature: string): boolean {
    if (!signature.startsWith('alm:hmac-sha256:')) {
      return false;
    }

    const expected = this.sign(payload);
    const expectedSig = Buffer.from(expected.signature);
    const actualSig = Buffer.from(signature);

    if (expectedSig.length !== actualSig.length) {
      return false;
    }

    return timingSafeEqual(expectedSig, actualSig);
  }

  /**
   * Generate a cryptographically secure nonce
   */
  private generateNonce(): string {
    return randomBytes(16).toString('hex');
  }
}
