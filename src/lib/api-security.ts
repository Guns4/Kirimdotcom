import crypto from 'crypto';

const KEY_PREFIX = 'ck_live_';

/**
 * Generates a new secure API Key.
 * Format: ck_live_[32_char_hex]
 */
export function generateSecret() {
  const randomBytes = crypto.randomBytes(16).toString('hex'); // 32 chars
  const secretKey = `${KEY_PREFIX}${randomBytes}`;
  return secretKey;
}

/**
 * Hashes the API Key for storage.
 * Uses SHA-256.
 */
export function hashKey(secretKey: string): string {
  return crypto.createHash('sha256').update(secretKey).digest('hex');
}

/**
 * Securely compares a provided key with a stored hash.
 */
export function compareKey(secretKey: string, storedHash: string): boolean {
  const hash = hashKey(secretKey);
  // Timing-safe comparison usually recommended, but simple string compare of hashes is often acceptable for API keys
  // crypto.timingSafeEqual requires Buffers. Here provided for basic implementation.
  return hash === storedHash;
}

export function getPrefix(secretKey: string): string {
  return secretKey.substring(0, 12) + '...'; // e.g. ck_live_1234...
}
