/**
 * Script to approve users for monetization
 * 
 * Usage:
 *   npm run approve-user <username>
 *   npm run approve-user <username> --revoke
 * 
 * Examples:
 *   npm run approve-user john_doe
 *   npm run approve-user jane_smith --revoke
 */

import mongoose from 'mongoose';
import { User } from '../../server/models/index.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function approveUser(username: string, revoke: boolean = false) {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI or MONGO_URI not found in environment variables');
    }

    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database\n');

    // Find and update user
    const user = await User.findOne({ username });

    if (!user) {
      console.error(`❌ User "${username}" not found`);
      process.exit(1);
    }

    // Display user info
    console.log('User Information:');
    console.log('─────────────────────────────────────');
    console.log(`Username: ${user.username}`);
    console.log(`Email: ${user.email}`);
    console.log(`Email Verified: ${user.emailVerified ? '✅' : '❌'}`);
    console.log(`Created: ${user.createdAt.toLocaleDateString()}`);
    console.log(`Current Monetization Status: ${user.monetizationApproved ? '✅ Approved' : '❌ Not Approved'}`);
    console.log('─────────────────────────────────────\n');

    // Update monetization status
    const newStatus = !revoke;
    user.monetizationApproved = newStatus;
    await user.save();

    if (revoke) {
      console.log(`🔴 Monetization access REVOKED for "${username}"`);
      console.log('   - User will no longer see Campaigns and Payouts in sidebar');
      console.log('   - User will be redirected to approval page if accessing those routes');
    } else {
      console.log(`✅ Monetization APPROVED for "${username}"`);
      console.log('   - User will now see Campaigns and Payouts dropdown in sidebar');
      console.log('   - User can access /monetization/campaigns and /monetization/payouts');
    }

    console.log('\n💡 User needs to refresh their browser to see the changes\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const username = args[0];
const revoke = args.includes('--revoke') || args.includes('-r');

if (!username) {
  console.error('❌ Error: Username is required\n');
  console.log('Usage:');
  console.log('  npm run approve-user <username>           # Approve user');
  console.log('  npm run approve-user <username> --revoke  # Revoke approval\n');
  console.log('Examples:');
  console.log('  npm run approve-user john_doe');
  console.log('  npm run approve-user jane_smith --revoke');
  process.exit(1);
}

// Run the script
approveUser(username, revoke);
