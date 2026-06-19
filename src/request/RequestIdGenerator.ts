import { randomBytes } from 'crypto';

export class RequestIdGenerator {
  static generate(): string {
    const timestamp = Date.now();
    const random = randomBytes(8).toString('hex');
    return `req_${timestamp}_${random}`;
  }
}
