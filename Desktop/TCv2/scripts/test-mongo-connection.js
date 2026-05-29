#!/usr/bin/env node

/**
 * Test MongoDB Connection
 * This will help identify the exact connection issue
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

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

async function testConnection() {
  const mongoUri = process.env.MONGO_URI;

  console.log('\n=== MongoDB Connection Test ===\n');

  // Check if MONGO_URI exists
  if (!mongoUri) {
    log.error('MONGO_URI environment variable is not set!');
    log.info('Set it in your .env file or pass it directly:');
    log.info('MONGO_URI="your-uri" node scripts/test-mongo-connection.js');
    process.exit(1);
  }

  // Validate URI format
  log.info('Checking MONGO_URI format...');
  
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    log.error('MONGO_URI must start with mongodb:// or mongodb+srv://');
    log.info(`Current value starts with: ${mongoUri.substring(0, 20)}...`);
    process.exit(1);
  }
  
  log.success('URI format looks correct');
  
  // Extract info from URI
  try {
    const url = new URL(mongoUri.replace('mongodb+srv://', 'https://').replace('mongodb://', 'https://'));
    log.info(`Host: ${url.hostname}`);
    log.info(`Database: ${url.pathname.split('?')[0].substring(1) || 'not specified'}`);
    log.info(`Username: ${url.username || 'not specified'}`);
    log.info(`Password: ${url.password ? '***' + url.password.slice(-4) : 'not specified'}`);
  } catch (e) {
    log.warn('Could not parse URI details');
  }

  // Test connection
  log.info('\nAttempting to connect to MongoDB...');
  
  const connectionOptions = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  };

  try {
    await mongoose.connect(mongoUri, connectionOptions);
    log.success('✅ Successfully connected to MongoDB!');
    
    log.info(`Database name: ${mongoose.connection.name}`);
    log.info(`Host: ${mongoose.connection.host}`);
    log.info(`Port: ${mongoose.connection.port}`);
    log.info(`Ready state: ${mongoose.connection.readyState} (1 = connected)`);
    
    // Test ping
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const latency = Date.now() - start;
    log.success(`Ping successful: ${latency}ms`);
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    log.info(`\nCollections found: ${collections.length}`);
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    // Check users count
    const usersCollection = mongoose.connection.db.collection('users');
    const userCount = await usersCollection.countDocuments();
    log.info(`\nTotal users: ${userCount}`);
    
    log.success('\n✅ MongoDB connection is working perfectly!');
    log.info('The issue must be with your production environment variables.');
    
  } catch (error) {
    log.error('\n❌ Failed to connect to MongoDB');
    log.error(`Error: ${error.message}`);
    
    console.log('\n=== Troubleshooting ===\n');
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      log.error('DNS Resolution Error - Cannot find the MongoDB server');
      log.info('Possible causes:');
      log.info('1. Wrong hostname in connection string');
      log.info('2. Network/firewall blocking DNS lookups');
      log.info('3. MongoDB cluster is paused or deleted');
    } else if (error.message.includes('Authentication failed')) {
      log.error('Authentication Error - Wrong username or password');
      log.info('Possible causes:');
      log.info('1. Wrong username or password in connection string');
      log.info('2. Database user not created in MongoDB Atlas');
      log.info('3. Password contains special characters not URL-encoded');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('timed out')) {
      log.error('Connection Timeout - Cannot reach MongoDB server');
      log.info('Possible causes:');
      log.info('1. Network Access not configured in MongoDB Atlas');
      log.info('2. Firewall blocking outbound connections');
      log.info('3. Wrong IP address whitelisted');
    } else if (error.message.includes('ECONNREFUSED')) {
      log.error('Connection Refused - MongoDB server rejected connection');
      log.info('Possible causes:');
      log.info('1. Wrong port number');
      log.info('2. MongoDB not running');
      log.info('3. Using localhost in production');
    } else {
      log.error('Unknown error - See details above');
    }
    
    log.info('\n=== Next Steps ===');
    log.info('1. Verify MONGO_URI in your production environment variables');
    log.info('2. Check MongoDB Atlas cluster is running (not paused)');
    log.info('3. Verify Network Access has 0.0.0.0/0 added');
    log.info('4. Check Database Access user has correct permissions');
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();
