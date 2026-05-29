#!/usr/bin/env node

/**
 * Secret Generation Utility
 * 
 * Generates cryptographically secure secrets for production deployment.
 * Run this script to generate new secrets before deploying to production.
 * 
 * Usage: node scripts/generate-secrets.js
 */

import crypto from 'crypto';

console.log('\n🔐 Generating Secure Secrets for Production\n');
console.log('=' .repeat(60));

// Generate JWT Secret (32 bytes = 256 bits)
const jwtSecret = crypto.randomBytes(32).toString('base64');
console.log('\n📝 JWT_SECRET (copy to .env):');
console.log(`JWT_SECRET="${jwtSecret}"`);

// Generate JWT Refresh Secret (32 bytes = 256 bits)
const jwtRefreshSecret = crypto.randomBytes(32).toString('base64');
console.log('\n📝 JWT_REFRESH_SECRET (copy to .env):');
console.log(`JWT_REFRESH_SECRET="${jwtRefreshSecret}"`);

// Generate Encryption Key (32 bytes = 256 bits for AES-256)
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('\n📝 ENCRYPTION_KEY (copy to .env):');
console.log(`ENCRYPTION_KEY="${encryptionKey}"`);

// Generate Meta Verify Token
const metaVerifyToken = crypto.randomBytes(32).toString('hex');
console.log('\n📝 META_VERIFY_TOKEN (copy to .env):');
console.log(`META_VERIFY_TOKEN="${metaVerifyToken}"`);

console.log('\n' + '='.repeat(60));
console.log('\n⚠️  IMPORTANT SECURITY NOTES:\n');
console.log('1. NEVER commit these secrets to version control');
console.log('2. Store these in your production environment variables');
console.log('3. Keep a secure backup of these secrets');
console.log('4. Rotate secrets periodically (every 90 days recommended)');
console.log('5. Use different secrets for development and production');
console.log('\n📋 For Vercel deployment:');
console.log('   - Go to Project Settings > Environment Variables');
console.log('   - Add each secret as a separate variable');
console.log('   - Select "Production" environment');
console.log('\n✅ Done! Copy the secrets above to your .env file or hosting platform.\n');
