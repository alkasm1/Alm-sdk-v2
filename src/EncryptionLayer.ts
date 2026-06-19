import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

export interface EncryptedData {
  iv: string;
  authTag: string;
  encrypted: string;
  salt: string;
}

export class EncryptionLayer {
  private key: Buffer;

  constructor(secret: string) {
    // Derive a 32-byte key from the secret using scrypt
    this.key = scryptSync(secret, 'alm-sdk-salt', 32);
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  encrypt(data: string): EncryptedData {
    const iv = randomBytes(16);
    const salt = randomBytes(16);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      iv: iv.toString('hex'),
      authTag: cipher.getAuthTag().toString('hex'),
      encrypted,
      salt: salt.toString('hex'),
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  decrypt(data: EncryptedData): string {
    const iv = Buffer.from(data.iv, 'hex');
    const authTag = Buffer.from(data.authTag, 'hex');
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
