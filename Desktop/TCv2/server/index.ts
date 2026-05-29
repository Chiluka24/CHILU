// Server entry point.
// Validates security configuration, connects to MongoDB, then starts the listener
// (skipped on Vercel since Vercel invokes the exported `app` per request).

import app from './app.js';
import { env, isVercel } from './config/env.js';
import { connectToDatabase } from './config/database.js';
import {
  validateDatabaseSecurity,
  validateEnvironmentSecurity,
} from './middleware/security.js';
import { validateJWTSecret, AUTH_CONFIG } from './config/auth-config.js';

// ── 1. Security validations on boot ────────────────────────────────────────
console.log('🔒 Validating security configuration…');
try {
  validateEnvironmentSecurity();
  validateDatabaseSecurity(env.MONGO_URI);
} catch (err) {
  console.error('❌ Security validation error:', err);
  if (env.NODE_ENV === 'production') {
    console.error('❌ CRITICAL: Security validation failed in production');
  } else {
    console.warn('⚠️  Security validation failed (development mode)');
  }
}

if (!validateJWTSecret(env.JWT_SECRET)) {
  console.warn('⚠️  Weak JWT_SECRET detected. Generate one with: openssl rand -base64 32');
}
if (!validateJWTSecret(env.JWT_REFRESH_SECRET)) {
  console.warn('⚠️  Weak JWT_REFRESH_SECRET detected.');
}

// ── 2. Connect to MongoDB ──────────────────────────────────────────────────
connectToDatabase()
  .then(() => console.log('✅ Mongo connection ready'))
  .catch((err) => console.error('❌ Initial Mongo connection failed:', err));

// ── 3. Start HTTP listener (skipped on Vercel) ─────────────────────────────
if (!isVercel) {
  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${env.PORT}`);
    console.log('   • HTTPS enforcement: production-only');
    console.log('   • Helmet security headers: on');
    console.log('   • Global rate limit: on');
    console.log('   • JWT access expiry: ' + AUTH_CONFIG.JWT_ACCESS_TOKEN_EXPIRY);
  });
}

export default app;
