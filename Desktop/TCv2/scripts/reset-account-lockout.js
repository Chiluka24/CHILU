#!/usr/bin/env node

/**
 * Reset Account Lockout Script
 * Use this to unlock accounts that have been locked due to failed login attempts
 * 
 * Usage:
 *   # Reset specific user
 *   node scripts/reset-account-lockout.js user@example.com
 *   
 *   # Reset all locked accounts
 *   node scripts/reset-account-lockout.js --all
 *   
 *   # With production MongoDB URI
 *   MONGO_URI="your-prod-uri" node scripts/reset-account-lockout.js user@example.com
 */

require('dotenv').config();
const mongoose = require('mongoose');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

// User schema
const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  passwordHash: String,
  failedLoginAttempts: Number,
  accountLockedUntil: Date,
});

const User = mongoose.model('User', UserSchema);

async function resetLockout(email) {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      log.error('MONGO_URI environment variable not set');
      log.info('Usage: MONGO_URI="your-uri" node scripts/reset-account-lockout.js user@example.com');
      process.exit(1);
    }

    log.info('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    log.success('Connected to MongoDB');

    if (email === '--all') {
      // Reset all locked accounts
      log.info('Finding all locked accounts...');
      
      const lockedUsers = await User.find({
        $or: [
          { accountLockedUntil: { $gt: new Date() } },
          { failedLoginAttempts: { $gt: 0 } }
        ]
      }).select('email username failedLoginAttempts accountLockedUntil');

      if (lockedUsers.length === 0) {
        log.info('No locked accounts found');
        process.exit(0);
      }

      log.info(`Found ${lockedUsers.length} accounts with lockout or failed attempts:`);
      lockedUsers.forEach(user => {
        const locked = user.accountLockedUntil && user.accountLockedUntil > new Date();
        const status = locked ? '🔒 LOCKED' : `⚠ ${user.failedLoginAttempts} failed attempts`;
        console.log(`  - ${user.email} (${user.username}) - ${status}`);
      });

      log.warn('\nResetting all accounts...');
      const result = await User.updateMany(
        {},
        {
          $set: { failedLoginAttempts: 0 },
          $unset: { accountLockedUntil: '' }
        }
      );

      log.success(`Reset ${result.modifiedCount} accounts`);
      
    } else {
      // Reset specific user
      const userEmail = email.toLowerCase();
      log.info(`Looking for user: ${userEmail}`);

      const user = await User.findOne({ email: userEmail });
      
      if (!user) {
        log.error(`User not found: ${userEmail}`);
        log.info('Available users:');
        const users = await User.find().select('email username').limit(10);
        users.forEach(u => console.log(`  - ${u.email} (${u.username})`));
        process.exit(1);
      }

      log.success(`Found user: ${user.username} (${user.email})`);

      // Check current status
      const isLocked = user.accountLockedUntil && user.accountLockedUntil > new Date();
      const failedAttempts = user.failedLoginAttempts || 0;

      console.log('\nCurrent status:');
      console.log(`  Failed login attempts: ${failedAttempts}`);
      console.log(`  Account locked: ${isLocked ? 'YES' : 'NO'}`);
      if (isLocked) {
        const minutesLeft = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / 60000);
        console.log(`  Locked until: ${user.accountLockedUntil.toISOString()} (${minutesLeft} minutes)`);
      }

      if (!isLocked && failedAttempts === 0) {
        log.info('\nAccount is not locked and has no failed attempts');
        process.exit(0);
      }

      // Reset
      log.warn('\nResetting account lockout...');
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = undefined;
      await user.save();

      log.success('Account lockout reset successfully!');
      console.log('\nNew status:');
      console.log(`  Failed login attempts: 0`);
      console.log(`  Account locked: NO`);
      log.info('\nUser can now login again');
    }

  } catch (error) {
    log.error(`Error: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Reset Account Lockout Script\n');
  console.log('Usage:');
  console.log('  node scripts/reset-account-lockout.js user@example.com');
  console.log('  node scripts/reset-account-lockout.js --all');
  console.log('\nWith production MongoDB:');
  console.log('  MONGO_URI="your-uri" node scripts/reset-account-lockout.js user@example.com');
  process.exit(1);
}

const email = args[0];
resetLockout(email);
