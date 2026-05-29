// Centralized authentication and security configuration.
// (Was at root in the monolith: ./auth-config.ts)

import crypto from 'crypto';

export const AUTH_CONFIG = {
  // Password hashing
  BCRYPT_ROUNDS: 12,

  // JWT
  JWT_ACCESS_TOKEN_EXPIRY: '6h' as const,
  JWT_REFRESH_TOKEN_EXPIRY: '7d' as const,
  JWT_PASSWORD_RESET_EXPIRY: '1h' as const,
  JWT_EMAIL_VERIFICATION_EXPIRY: '24h' as const,

  // Rate Limiting (declarative — actual limiters live in rate-limits.ts)
  LOGIN_RATE_LIMIT: {
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  REGISTER_RATE_LIMIT: {
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many registration attempts. Please try again later.',
  },
  PASSWORD_RESET_RATE_LIMIT: {
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many password reset requests. Please try again later.',
  },
  GENERAL_API_RATE_LIMIT: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },

  // Session
  MAX_ACTIVE_SESSIONS: 5,

  // Password rules
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBER: true,
  PASSWORD_REQUIRE_SPECIAL: false,

  // Email
  EMAIL_VERIFICATION_REQUIRED: false,

  // Token encryption (for sensitive tokens stored in DB)
  ENCRYPTION_ALGORITHM: 'aes-256-gcm' as const,
};

// ── Token utilities ────────────────────────────────────────────────────────

export const generateSecureToken = (length = 32): string =>
  crypto.randomBytes(length).toString('hex');

export const encryptToken = (token: string, encryptionKey: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    AUTH_CONFIG.ENCRYPTION_ALGORITHM,
    Buffer.from(encryptionKey, 'hex'),
    iv
  );

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

export const decryptToken = (encryptedData: string, encryptionKey: string): string => {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted data format');

  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(
    AUTH_CONFIG.ENCRYPTION_ALGORITHM,
    Buffer.from(encryptionKey, 'hex'),
    iv
  );
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export const validateJWTSecret = (secret: string): boolean => {
  const weakSecrets = [
    'dev_secret_key_123',
    'secret',
    'jwt_secret',
    'your_secret_here',
    'replace_me',
  ];

  if (secret.length < 32) {
    console.error('SECURITY WARNING: JWT_SECRET is too short (minimum 32 characters)');
    return false;
  }
  if (weakSecrets.some((w) => secret.toLowerCase().includes(w))) {
    console.error('SECURITY WARNING: JWT_SECRET appears to be a default/weak value');
    return false;
  }
  return true;
};

export const generateEncryptionKey = (): string =>
  crypto.randomBytes(32).toString('hex');
