/**
 * Migration Script: Setup Real-Time Tracking System
 * 
 * This script:
 * 1. Creates indexes for ProfileView and LinkClick collections
 * 2. Verifies existing data integrity
 * 3. Provides statistics on current tracking data
 * 
 * Run with: npx ts-node migrations/setup-realtime-tracking.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { LinkClick, ProfileView, User, Link } from '../server/models/index.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crumb_db';

async function setupRealtimeTracking() {
  try {
    console.log('🚀 Starting Real-Time Tracking Setup...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Create indexes for LinkClick
    console.log('📊 Creating LinkClick indexes...');
    await LinkClick.collection.createIndex({ user: 1, createdAt: -1 });
    await LinkClick.collection.createIndex({ link: 1, createdAt: -1 });
    await LinkClick.collection.createIndex({ user: 1, link: 1, createdAt: -1 });
    await LinkClick.collection.createIndex({ user: 1, countryCode: 1, createdAt: -1 });
    await LinkClick.collection.createIndex({ user: 1, deviceType: 1, createdAt: -1 });
    await LinkClick.collection.createIndex({ sessionId: 1 });
    console.log('✅ LinkClick indexes created\n');

    // 2. Create indexes for ProfileView
    console.log('📊 Creating ProfileView indexes...');
    await ProfileView.collection.createIndex({ user: 1, createdAt: -1 });
    await ProfileView.collection.createIndex({ username: 1, createdAt: -1 });
    await ProfileView.collection.createIndex({ user: 1, countryCode: 1, createdAt: -1 });
    await ProfileView.collection.createIndex({ user: 1, deviceType: 1, createdAt: -1 });
    await ProfileView.collection.createIndex({ sessionId: 1 });
    console.log('✅ ProfileView indexes created\n');

    // 3. Verify existing data
    console.log('🔍 Analyzing existing data...\n');

    const userCount = await User.countDocuments();
    const linkCount = await Link.countDocuments();
    const clickCount = await LinkClick.countDocuments();
    const profileViewCount = await ProfileView.countDocuments();

    console.log('📈 Current Statistics:');
    console.log(`   Users: ${userCount.toLocaleString()}`);
    console.log(`   Links: ${linkCount.toLocaleString()}`);
    console.log(`   Link Clicks: ${clickCount.toLocaleString()}`);
    console.log(`   Profile Views: ${profileViewCount.toLocaleString()}\n`);

    // 4. Analyze LinkClick data quality
    const clicksWithDevice = await LinkClick.countDocuments({ deviceType: { $exists: true, $ne: null } });
    const clicksWithBrowser = await LinkClick.countDocuments({ browser: { $exists: true, $ne: null } });
    const clicksWithSession = await LinkClick.countDocuments({ sessionId: { $exists: true, $ne: null } });

    console.log('📊 LinkClick Data Quality:');
    console.log(`   With Device Type: ${clicksWithDevice.toLocaleString()} (${((clicksWithDevice / Math.max(clickCount, 1)) * 100).toFixed(1)}%)`);
    console.log(`   With Browser: ${clicksWithBrowser.toLocaleString()} (${((clicksWithBrowser / Math.max(clickCount, 1)) * 100).toFixed(1)}%)`);
    console.log(`   With Session ID: ${clicksWithSession.toLocaleString()} (${((clicksWithSession / Math.max(clickCount, 1)) * 100).toFixed(1)}%)\n`);

    // 5. Recent activity analysis
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const clicks24h = await LinkClick.countDocuments({ createdAt: { $gte: last24Hours } });
    const clicks7d = await LinkClick.countDocuments({ createdAt: { $gte: last7Days } });
    const views24h = await ProfileView.countDocuments({ createdAt: { $gte: last24Hours } });
    const views7d = await ProfileView.countDocuments({ createdAt: { $gte: last7Days } });

    console.log('⏰ Recent Activity:');
    console.log(`   Last 24 Hours:`);
    console.log(`      Clicks: ${clicks24h.toLocaleString()}`);
    console.log(`      Profile Views: ${views24h.toLocaleString()}`);
    console.log(`   Last 7 Days:`);
    console.log(`      Clicks: ${clicks7d.toLocaleString()}`);
    console.log(`      Profile Views: ${views7d.toLocaleString()}\n`);

    // 6. Top performing links
    const topLinks = await Link.find()
      .sort({ clicks: -1 })
      .limit(5)
      .select('title clicks')
      .lean();

    console.log('🏆 Top 5 Links by Clicks:');
    topLinks.forEach((link, index) => {
      console.log(`   ${index + 1}. ${link.title} - ${link.clicks.toLocaleString()} clicks`);
    });
    console.log('');

    // 7. Device distribution (if data exists)
    if (clicksWithDevice > 0) {
      const deviceStats = await LinkClick.aggregate([
        { $match: { deviceType: { $exists: true, $ne: null } } },
        { $group: { _id: '$deviceType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      console.log('📱 Device Distribution:');
      deviceStats.forEach(stat => {
        const percentage = ((stat.count / clicksWithDevice) * 100).toFixed(1);
        console.log(`   ${stat._id}: ${stat.count.toLocaleString()} (${percentage}%)`);
      });
      console.log('');
    }

    // 8. Geographic distribution
    const geoStats = await LinkClick.aggregate([
      { $match: { countryCode: { $exists: true, $ne: null } } },
      { $group: { _id: { code: '$countryCode', name: '$countryName' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    console.log('🌍 Top 10 Countries:');
    geoStats.forEach((stat, index) => {
      console.log(`   ${index + 1}. ${stat._id.name || stat._id.code}: ${stat.count.toLocaleString()} clicks`);
    });
    console.log('');

    // 9. Verify indexes
    console.log('🔍 Verifying Indexes...');
    const linkClickIndexes = await LinkClick.collection.indexes();
    const profileViewIndexes = await ProfileView.collection.indexes();

    console.log(`   LinkClick indexes: ${linkClickIndexes.length}`);
    console.log(`   ProfileView indexes: ${profileViewIndexes.length}\n`);

    console.log('✅ Real-Time Tracking Setup Complete!\n');
    console.log('📝 Next Steps:');
    console.log('   1. Update frontend to call /api/public/track-impression on profile page load');
    console.log('   2. Update frontend to include sessionId in click tracking');
    console.log('   3. Remove caching from Dashboard.tsx');
    console.log('   4. Test the tracking by visiting a public profile and clicking links');
    console.log('   5. Monitor the logs for tracking events\n');

    console.log('📚 Documentation: See BACKEND_TRACKING_IMPLEMENTATION.md for details\n');

  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the setup
setupRealtimeTracking();
