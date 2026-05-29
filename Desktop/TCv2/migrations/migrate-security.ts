// Migration script to add security fields to existing users
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { User } from '../server/models/index.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crumb_db';

async function migrateSecurityFields() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔄 Migrating user security fields...');
    
    // Update all users to add new security fields if they don't exist
    const result = await User.updateMany(
      {},
      {
        $set: {
          emailVerified: true, // Existing users are auto-verified
          failedLoginAttempts: 0,
        },
        $unset: {
          emailVerificationToken: '',
          emailVerificationExpires: '',
          passwordResetToken: '',
          passwordResetExpires: '',
          accountLockedUntil: '',
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users`);
    console.log('\n📊 Migration Summary:');
    console.log(`   - Set emailVerified: true for existing users`);
    console.log(`   - Reset failedLoginAttempts to 0`);
    console.log(`   - Cleared any existing tokens`);

    // Display user count
    const totalUsers = await User.countDocuments();
    console.log(`\n👥 Total users in database: ${totalUsers}`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('   1. All existing users have been auto-verified');
    console.log('   2. New registrations will require email verification');
    console.log('   3. Update your .env file with new security variables:');
    console.log('      - JWT_REFRESH_SECRET');
    console.log('      - ENCRYPTION_KEY');
    console.log('      - SMTP configuration for emails');
    console.log('\n   Generate secrets with:');
    console.log('      openssl rand -base64 32  (for JWT secrets)');
    console.log('      openssl rand -hex 32     (for encryption key)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run migration
migrateSecurityFields();
