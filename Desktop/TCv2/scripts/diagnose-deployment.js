#!/usr/bin/env node

/**
 * Deployment Diagnostic Script
 * Run this to check your deployment configuration
 * 
 * Usage:
 *   node scripts/diagnose-deployment.js
 *   
 * Or with production env:
 *   MONGO_URI="your-prod-uri" node scripts/diagnose-deployment.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
};

async function diagnose() {
  log.section('=== Deployment Diagnostic Tool ===\n');

  // 1. Check Environment Variables
  log.section('1. Checking Environment Variables');
  
  const requiredVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const optionalVars = [
    'NODE_ENV',
    'APP_URL',
    'API_URL',
    'ENCRYPTION_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  let missingRequired = false;

  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      const preview = varName.includes('SECRET') || varName.includes('KEY')
        ? '***' + process.env[varName].slice(-4)
        : process.env[varName].substring(0, 30) + '...';
      log.success(`${varName}: ${preview}`);
    } else {
      log.error(`${varName}: NOT SET (REQUIRED)`);
      missingRequired = true;
    }
  });

  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      const preview = varName.includes('SECRET') || varName.includes('KEY')
        ? '***' + process.env[varName].slice(-4)
        : process.env[varName];
      log.success(`${varName}: ${preview}`);
    } else {
      log.warn(`${varName}: not set (optional)`);
    }
  });

  if (missingRequired) {
    log.error('\n❌ Missing required environment variables!');
    log.info('Set them in your deployment platform (Vercel/Heroku/Railway)');
    process.exit(1);
  }

  // 2. Check JWT Secret Strength
  log.section('\n2. Checking JWT Secret Strength');
  
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret.length < 32) {
    log.error(`JWT_SECRET is too short (${jwtSecret.length} chars, minimum 32)`);
    log.info('Generate a strong secret: openssl rand -base64 32');
  } else {
    log.success(`JWT_SECRET length: ${jwtSecret.length} characters`);
  }

  const weakSecrets = ['dev_secret', 'secret', 'jwt_secret', 'replace_me'];
  if (weakSecrets.some(weak => jwtSecret.toLowerCase().includes(weak))) {
    log.error('JWT_SECRET appears to be a default/weak value');
  } else {
    log.success('JWT_SECRET appears to be strong');
  }

  // 3. Test MongoDB Connection
  log.section('\n3. Testing MongoDB Connection');
  
  const mongoUri = process.env.MONGO_URI;
  
  if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
    log.warn('Using localhost MongoDB (not suitable for production)');
  }

  try {
    log.info('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    log.success('MongoDB connected successfully');
    log.info(`Database: ${mongoose.connection.name}`);
    log.info(`Host: ${mongoose.connection.host}`);
    
    // Test ping
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const latency = Date.now() - start;
    log.success(`Ping latency: ${latency}ms`);

    // 4. Check Users Collection
    log.section('\n4. Checking Users Collection');
    
    const User = mongoose.model('User', new mongoose.Schema({
      username: String,
      email: String,
      passwordHash: String,
      failedLoginAttempts: Number,
      accountLockedUntil: Date,
    }));

    const userCount = await User.countDocuments();
    log.info(`Total users: ${userCount}`);

    if (userCount === 0) {
      log.warn('No users found in database');
      log.info('Register a new account to test login');
    } else {
      log.success(`Found ${userCount} users`);
      
      // Check for locked accounts
      const lockedCount = await User.countDocuments({
        accountLockedUntil: { $gt: new Date() }
      });
      
      if (lockedCount > 0) {
        log.warn(`${lockedCount} accounts are currently locked`);
      }

      // Check for users with failed login attempts
      const failedAttemptsCount = await User.countDocuments({
        failedLoginAttempts: { $gt: 0 }
      });
      
      if (failedAttemptsCount > 0) {
        log.warn(`${failedAttemptsCount} users have failed login attempts`);
      }

      // Sample a user to check password hash
      const sampleUser = await User.findOne().select('email passwordHash');
      if (sampleUser) {
        log.info(`Sample user: ${sampleUser.email}`);
        if (sampleUser.passwordHash) {
          log.success('Password hash exists');
          log.info(`Hash length: ${sampleUser.passwordHash.length} chars`);
          
          // Check if it's a bcrypt hash
          if (sampleUser.passwordHash.startsWith('$2a$') || 
              sampleUser.passwordHash.startsWith('$2b$')) {
            log.success('Password hash format: bcrypt');
          } else {
            log.error('Password hash format: UNKNOWN (should be bcrypt)');
          }
        } else {
          log.error('Sample user has no password hash!');
        }
      }
    }

    // 5. Test Password Hashing
    log.section('\n5. Testing Password Hashing');
    
    const testPassword = 'TestPassword123';
    log.info('Hashing test password...');
    
    const hashStart = Date.now();
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(testPassword, salt);
    const hashTime = Date.now() - hashStart;
    
    log.success(`Hash generated in ${hashTime}ms`);
    log.info(`Hash: ${hash.substring(0, 30)}...`);
    
    // Test comparison
    const compareStart = Date.now();
    const isMatch = await bcrypt.compare(testPassword, hash);
    const compareTime = Date.now() - compareStart;
    
    if (isMatch) {
      log.success(`Password comparison works (${compareTime}ms)`);
    } else {
      log.error('Password comparison failed!');
    }

    // 6. Summary
    log.section('\n=== Diagnostic Summary ===');
    log.success('✓ Environment variables configured');
    log.success('✓ MongoDB connection working');
    log.success('✓ Password hashing functional');
    
    if (userCount === 0) {
      log.warn('⚠ No users in database - register a new account');
    } else {
      log.success(`✓ ${userCount} users in database`);
    }

    log.section('\n=== Next Steps ===');
    log.info('1. Visit your API health endpoint: /api/health');
    log.info('2. Try logging in with an existing account');
    log.info('3. Check server logs for detailed error messages');
    log.info('4. If login fails, check DEPLOYMENT_TROUBLESHOOTING.md');

  } catch (error) {
    log.error(`MongoDB connection failed: ${error.message}`);
    log.info('\nPossible causes:');
    log.info('1. Wrong MONGO_URI');
    log.info('2. Network access not configured in MongoDB Atlas');
    log.info('3. Database credentials incorrect');
    log.info('4. Firewall blocking connection');
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run diagnostic
diagnose().catch(err => {
  log.error(`Diagnostic failed: ${err.message}`);
  process.exit(1);
});
