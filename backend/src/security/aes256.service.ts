import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class Aes256Service {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;

  constructor() {
    const secret = process.env.AES_SECRET_KEY;
    if (!secret || secret.length < 32) {
      throw new Error(
        'AES_SECRET_KEY must be set in .env and be at least 32 characters.',
      );
    }
    // Use first 32 bytes of the secret as the key
    this.key = Buffer.from(secret.slice(0, 32), 'utf-8');
  }

  encrypt(plainText: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(plainText, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    // Prepend iv so we can decrypt later
    return iv.toString('hex') + ':' + encrypted;
  }

  decrypt(cipherText: string): string {
    const [ivHex, encrypted] = cipherText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
  }

  /** Returns masked version like XXXX-XXXX-1234 */
  maskAadhaar(aadhaar: string): string {
    const cleaned = aadhaar.replace(/\D/g, '');
    if (cleaned.length < 4) return 'XXXX-XXXX-XXXX';
    const last4 = cleaned.slice(-4);
    return `XXXX-XXXX-${last4}`;
  }
}
