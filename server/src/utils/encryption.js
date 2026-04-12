import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

export function encryptSensitive(text, encryptionKey) {
  const key = Buffer.from(encryptionKey, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptSensitive(encryptedText, encryptionKey) {
  const key = Buffer.from(encryptionKey, 'hex');
  const [iv, encrypted] = encryptedText.split(':');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
