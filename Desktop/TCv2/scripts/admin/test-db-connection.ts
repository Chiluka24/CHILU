/**
 * Test MongoDB connection
 * Usage: npm run test-db
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGODB_URI or MONGO_URI not found in .env file');
    process.exit(1);
  }

  console.log('🔍 Testing MongoDB connection...');
  console.log('📍 Connection string:', mongoUri.replace(/:[^:@]+@/, ':****@')); // Hide password
  console.log('');

  try {
    console.log('⏳ Attempting to connect...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    console.log('');
    
    // Test a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections found:', collections.length);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    console.log('');
    console.log('✅ Database connection is working perfectly!');
    
  } catch (error: any) {
    console.error('❌ Failed to connect to MongoDB');
    console.error('');
    console.error('Error details:', error.message);
    console.error('');
    
    if (error.message.includes('ETIMEDOUT')) {
      console.log('💡 Possible solutions:');
      console.log('   1. Check your internet connection');
      console.log('   2. Whitelist your IP in MongoDB Atlas:');
      console.log('      - Go to https://cloud.mongodb.com/');
      console.log('      - Navigate to Network Access');
      console.log('      - Add your current IP or 0.0.0.0/0 (for development)');
      console.log('   3. Check if your firewall is blocking port 27017');
      console.log('   4. Verify your MONGO_URI in .env file');
    } else if (error.message.includes('authentication failed')) {
      console.log('💡 Authentication issue:');
      console.log('   - Check your username and password in MONGO_URI');
      console.log('   - Make sure the database user has proper permissions');
    } else {
      console.log('💡 Check your MONGO_URI in .env file');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('');
    console.log('Disconnected from database');
  }
}

testConnection();
