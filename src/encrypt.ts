import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY_LEN = 32;
const IV_LEN = 16;
const SALT = 'envlayer-salt-v1';

function deriveKey(passphrase: string): Buffer {
  return scryptSync(passphrase, SALT, KEY_LEN);
}

/**
 * Encrypts a plaintext string using AES-256-CBC.
 * Returns a base64-encoded string of the form: <iv_hex>:<ciphertext_base64>
 */
export function encryptValue(value: string, passphrase: string): string {
  const key = deriveKey(passphrase);
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('base64')}`;
}

/**
 * Decrypts a value previously encrypted with encryptValue.
 * Expects the format: <iv_hex>:<ciphertext_base64>
 */
export function decryptValue(encrypted: string, passphrase: string): string {
  const [ivHex, cipherBase64] = encrypted.split(':');
  if (!ivHex || !cipherBase64) {
    throw new Error('Invalid encrypted value format');
  }
  const key = deriveKey(passphrase);
  const iv = Buffer.from(ivHex, 'hex');
  const ciphertext = Buffer.from(cipherBase64, 'base64');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

/**
 * Encrypts all values in a record, returning a new record with encrypted values.
 */
export function encryptEnv(
  env: Record<string, string>,
  passphrase: string,
  keys?: string[]
): Record<string, string> {
  const result: Record<string, string> = { ...env };
  const targets = keys ?? Object.keys(env);
  for (const key of targets) {
    if (key in result) {
      result[key] = encryptValue(result[key], passphrase);
    }
  }
  return result;
}

/**
 * Decrypts all (or specified) values in a record.
 */
export function decryptEnv(
  env: Record<string, string>,
  passphrase: string,
  keys?: string[]
): Record<string, string> {
  const result: Record<string, string> = { ...env };
  const targets = keys ?? Object.keys(env);
  for (const key of targets) {
    if (key in result) {
      result[key] = decryptValue(result[key], passphrase);
    }
  }
  return result;
}
