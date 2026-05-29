#!/usr/bin/env node

/**
 * Secret Security Checker
 * 
 * Validates that secrets meet security requirements and are not weak/default values.
 * Run this before deploying to production.
 * 
 * Usage: node scripts/check-secrets.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 Checking Secret Security...\n');

// Load .env file
const envPath = path.join(path.dirname(__dirname), '.env');
console.log(`📁 Looking for .env at: ${envPath}\n`);
if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: .env file not found!');
  console.log('💡 Create a .env file based on .env.example');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

// Parse .env file
envContent.split('\n').forEach(line => {
  // Skip comments and empty lines
  if (line.trim().startsWith('#') || !line.trim()) return;
  
  // Match KEY="value" or KEY=value
  const match = line.match(/^([A-Z_]+)=["']?(.+?)["']?\s*$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

// Weak/default values to check against
const weakSecrets = [
  'dev_secret_key_123',
  'dev_refresh_secret_456',
  'secret',
  'password',
  'test',
  '123',
  'default',
  'replace_me',
  'your_',
  'YOUR_',
];

let hasIssues = false;
const issues = [];
const warnings = [];

// Check JWT_SECRET
console.log('🔐 Checking JWT_SECRET...');
if (!envVars.JWT_SECRET) {
  issues.push('JWT_SECRET is missing');
  hasIssues = true;
} else if (envVars.JWT_SECRET.length < 32) {
  issues.push('JWT_SECRET is too short (minimum 32 characters)');
  hasIssues = true;
} else if (weakSecrets.some(weak => envVars.JWT_SECRET.toLowerCase().includes(weak))) {
  issues.push('JWT_SECRET appears to be a weak/default value');
  hasIssues = true;
} else {
  console.log('   ✅ JWT_SECRET looks secure');
}

// Check JWT_REFRESH_SECRET
console.log('🔐 Checking JWT_REFRESH_SECRET...');
if (!envVars.JWT_REFRESH_SECRET) {
  issues.push('JWT_REFRESH_SECRET is missing');
  hasIssues = true;
} else if (envVars.JWT_REFRESH_SECRET.length < 32) {
  issues.push('JWT_REFRESH_SECRET is too short (minimum 32 characters)');
  hasIssues = true;
} else if (weakSecrets.some(weak => envVars.JWT_REFRESH_SECRET.toLowerCase().includes(weak))) {
  issues.push('JWT_REFRESH_SECRET appears to be a weak/default value');
  hasIssues = true;
} else if (envVars.JWT_REFRESH_SECRET === envVars.JWT_SECRET) {
  issues.push('JWT_REFRESH_SECRET should be different from JWT_SECRET');
  hasIssues = true;
} else {
  console.log('   ✅ JWT_REFRESH_SECRET looks secure');
}

// Check ENCRYPTION_KEY
console.log('🔐 Checking ENCRYPTION_KEY...');
if (!envVars.ENCRYPTION_KEY) {
  issues.push('ENCRYPTION_KEY is missing');
  hasIssues = true;
} else if (envVars.ENCRYPTION_KEY.length !== 64) {
  issues.push('ENCRYPTION_KEY should be exactly 64 hex characters (32 bytes)');
  hasIssues = true;
} else if (!/^[0-9a-fA-F]{64}$/.test(envVars.ENCRYPTION_KEY)) {
  issues.push('ENCRYPTION_KEY should be a valid hex string');
  hasIssues = true;
} else {
  console.log('   ✅ ENCRYPTION_KEY looks secure');
}

// Check MONGO_URI
console.log('🗄️  Checking MONGO_URI...');
if (!envVars.MONGO_URI) {
  issues.push('MONGO_URI is missing');
  hasIssues = true;
} else if (envVars.MONGO_URI.includes('localhost') || envVars.MONGO_URI.includes('127.0.0.1')) {
  if (process.env.NODE_ENV === 'production') {
    issues.push('MONGO_URI uses localhost in production environment');
    hasIssues = true;
  } else {
    warnings.push('MONGO_URI uses localhost (OK for development)');
  }
} else {
  console.log('   ✅ MONGO_URI configured');
}

// Check email configuration
console.log('📧 Checking email configuration...');
if (!envVars.SMTP_HOST || !envVars.SMTP_USER || !envVars.SMTP_PASS) {
  warnings.push('Email service not fully configured (emails will be logged to console)');
} else {
  console.log('   ✅ Email service configured');
}

// Check Cloudinary (required for production)
console.log('☁️  Checking Cloudinary configuration...');
if (!envVars.CLOUDINARY_CLOUD_NAME || !envVars.CLOUDINARY_API_KEY || !envVars.CLOUDINARY_API_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    issues.push('Cloudinary not configured (REQUIRED for production/Vercel deployment)');
    hasIssues = true;
  } else {
    warnings.push('Cloudinary not configured (recommended for production)');
  }
} else {
  console.log('   ✅ Cloudinary configured');
}

// Check Meta/Instagram configuration
console.log('📱 Checking Meta/Instagram configuration...');
if (envVars.META_APP_ID && envVars.META_APP_ID.includes('YOUR_')) {
  warnings.push('META_APP_ID appears to be a placeholder value');
}
if (envVars.META_APP_SECRET && envVars.META_APP_SECRET.includes('YOUR_')) {
  warnings.push('META_APP_SECRET appears to be a placeholder value');
}

// Print results
console.log('\n' + '='.repeat(60));
if (hasIssues) {
  console.log('\n❌ SECURITY ISSUES FOUND:\n');
  issues.forEach(issue => console.log(`   ❌ ${issue}`));
  console.log('\n💡 Run: node scripts/generate-secrets.js');
  console.log('   Then copy the generated secrets to your .env file\n');
} else {
  console.log('\n✅ All critical security checks passed!\n');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n');
  warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
  console.log('');
}

console.log('='.repeat(60) + '\n');

// Exit with error code if issues found
if (hasIssues) {
  process.exit(1);
}
