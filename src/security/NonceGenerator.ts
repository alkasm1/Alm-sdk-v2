import { randomBytes } from 'crypto';

export class NonceGenerator {
  private usedNonces: Set<string> = new Set();
  private readonly maxSize: number;
  private readonly ttl: number; // Time to live in ms
  private nonceTimestamps: Map<string, number> = new Map();

  constructor(maxSize = 10000, ttl = 300000) { // 5 minutes default TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Generate a new unique nonce
   */
  generate(): string {
    const nonce = randomBytes(16).toString('hex');

    if (this.usedNonces.has(nonce)) {
      return this.generate(); // Retry with collision protection
    }

    this.usedNonces.add(nonce);
    this.nonceTimestamps.set(nonce, Date.now());
    this.cleanup();

    return nonce;
  }

  /**
   * Validate a nonce (returns false if replay attack detected)
   */
  validate(nonce: string): boolean {
    this.cleanup();

    if (this.usedNonces.has(nonce)) {
      return false; // Replay attack detected
    }

    this.usedNonces.add(nonce);
    this.nonceTimestamps.set(nonce, Date.now());

    return true;
  }

  /**
   * Check if a nonce has been used
   */
  hasBeenUsed(nonce: string): boolean {
    this.cleanup();
    return this.usedNonces.has(nonce);
  }

  /**
   * Get current nonce count
   */
  get size(): number {
    return this.usedNonces.size;
  }

  /**
   * Clear all nonces
   */
  clear(): void {
    this.usedNonces.clear();
    this.nonceTimestamps.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const expired: string[] = [];

    for (const [nonce, timestamp] of this.nonceTimestamps.entries()) {
      if (now - timestamp > this.ttl) {
        expired.push(nonce);
      }
    }

    for (const nonce of expired) {
      this.usedNonces.delete(nonce);
      this.nonceTimestamps.delete(nonce);
    }

    // If still too large, remove oldest
    if (this.usedNonces.size > this.maxSize) {
      const entries = [...this.nonceTimestamps.entries()];
      entries.sort((a, b) => a[1] - b[1]);
      const toDelete = entries.slice(0, entries.length - this.maxSize);
      for (const [nonce] of toDelete) {
        this.usedNonces.delete(nonce);
        this.nonceTimestamps.delete(nonce);
      }
    }
  }
}
