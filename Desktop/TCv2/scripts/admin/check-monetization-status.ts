/**
 * Script to check monetization status of users
 * 
 * Usage:
 *   npm run check-status <username>     # Check specific user
 *   npm run check-status --all          # List all approved users
 *   npm run check-status --pending      # List all pending users
 * 
 * Examples:
 *   npm run check-status vivekboga
 *   npm run check-status --all
 */

import mongoose from 'mongoose';
import { User } from '../../server/models/index.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkStatus(username?: string, showAll: boolean = false, showPending: boolean = false) {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI or MONGO_URI not found in environment variables');
    }

    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to database\n');

    if (username) {
      // Check specific user
      const user = await User.findOne({ username });

      if (!user) {
        console.error(`❌ User "${username}" not found`);
        process.exit(1);
      }

      console.log('User Information:');
      console.log('═════════════════════════════════════');
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Email Verified: ${user.emailVerified ? '✅ Yes' : '❌ No'}`);
      console.log(`Created: ${user.createdAt.toLocaleDateString()}`);
      console.log(`Last Login: ${user.lastLoginAt ? user.lastLoginAt.toLocaleDateString() : 'Never'}`);
      console.log('─────────────────────────────────────');
      console.log(`Monetization Status: ${user.monetizationApproved ? '✅ APPROVED' : '❌ NOT APPROVED'}`);
      console.log('═════════════════════════════════════\n');

      if (user.monetizationApproved) {
        console.log('✅ This user can access:');
        console.log('   • /monetization/campaigns');
        console.log('   • /monetization/payouts');
        console.log('   • Sidebar shows Campaigns and Payouts dropdown\n');
      } else {
        console.log('❌ This user cannot access campaigns/payouts');
        console.log('   • Sidebar shows single Monetization item');
        console.log('   • Only sees approval requirements page\n');
        console.log('💡 To approve: npm run approve-user ' + username + '\n');
      }

    } else if (showAll) {
      // Show all approved users
      const approvedUsers = await User.find({ monetizationApproved: true })
        .select('username email emailVerified createdAt lastLoginAt')
        .sort({ createdAt: -1 });

      console.log('✅ APPROVED USERS FOR MONETIZATION');
      console.log('═════════════════════════════════════════════════════════════\n');

      if (approvedUsers.length === 0) {
        console.log('No users are currently approved for monetization.\n');
      } else {
        approvedUsers.forEach((user, index) => {
          console.log(`${index + 1}. ${user.username}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Verified: ${user.emailVerified ? '✅' : '❌'}`);
          console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
          console.log(`   Last Login: ${user.lastLoginAt ? user.lastLoginAt.toLocaleDateString() : 'Never'}`);
          console.log('');
        });

        console.log(`Total: ${approvedUsers.length} approved user(s)\n`);
      }

    } else if (showPending) {
      // Show all pending users
      const pendingUsers = await User.find({ monetizationApproved: { $ne: true } })
        .select('username email emailVerified createdAt lastLoginAt')
        .sort({ createdAt: -1 });

      console.log('⏳ PENDING APPROVAL FOR MONETIZATION');
      console.log('═════════════════════════════════════════════════════════════\n');

      if (pendingUsers.length === 0) {
        console.log('All users are approved for monetization.\n');
      } else {
        pendingUsers.forEach((user, index) => {
          console.log(`${index + 1}. ${user.username}`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Verified: ${user.emailVerified ? '✅' : '❌'}`);
          console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
          console.log(`   Last Login: ${user.lastLoginAt ? user.lastLoginAt.toLocaleDateString() : 'Never'}`);
          console.log(`   💡 To approve: npm run approve-user ${user.username}`);
          console.log('');
        });

        console.log(`Total: ${pendingUsers.length} pending user(s)\n`);
      }

    } else {
      // Show summary
      const totalUsers = await User.countDocuments();
      const approvedCount = await User.countDocuments({ monetizationApproved: true });
      const pendingCount = totalUsers - approvedCount;

      console.log('📊 MONETIZATION STATUS SUMMARY');
      console.log('═════════════════════════════════════');
      console.log(`Total Users: ${totalUsers}`);
      console.log(`✅ Approved: ${approvedCount}`);
      console.log(`⏳ Pending: ${pendingCount}`);
      console.log('═════════════════════════════════════\n');

      console.log('Usage:');
      console.log('  npm run check-status <username>  # Check specific user');
      console.log('  npm run check-status --all       # List all approved users');
      console.log('  npm run check-status --pending   # List all pending users\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const showAll = args.includes('--all') || args.includes('-a');
const showPending = args.includes('--pending') || args.includes('-p');
const username = args.find(arg => !arg.startsWith('--') && !arg.startsWith('-'));

// Run the script
checkStatus(username, showAll, showPending);
