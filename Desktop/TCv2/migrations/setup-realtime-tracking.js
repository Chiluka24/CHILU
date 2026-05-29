/**
 * Migration Script: Setup Real-Time Tracking System
 * Run with: node migrations/setup-realtime-tracking.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crumb_db';

async function setupRealtimeTracking() {
  try {
    console.log('🚀 Starting Real-Time Tracking Setup...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // 1. Create indexes for LinkClick
    console.log('📊 Creating LinkClick indexes...');
    const linkClicksCollection = db.collection('linkclicks');
    await linkClicksCollection.createIndex({ user: 1, createdAt: -1 });
    await linkClicksCollection.createIndex({ link: 1, createdAt: -1 });
    await linkClicksCollection.createIndex({ user: 1, link: 1, createdAt: -1 });
    await linkClicksCollection.createIndex({ user: 1, countryCode: 1, createdAt: -1 });
    await linkClicksCollection.createIndex({ user: 1, deviceType: 1, createdAt: -1 });
    await linkClicksCollection.createIndex({ sessionId: 1 });
    console.log('✅ LinkClick indexes created\n');

    // 2. Create indexes for ProfileView
    console.log('📊 Creating ProfileView indexes...');
    const profileViewsCollection = db.collection('profileviews');
    await profileViewsCollection.createIndex({ user: 1, createdAt: -1 });
    await profileViewsCollection.createIndex({ username: 1, createdAt: -1 });
    await profileViewsCollection.createIndex({ user: 1, countryCode: 1, createdAt: -1 });
    await profileViewsCollection.createIndex({ user: 1, deviceType: 1, createdAt: -1 });
    await profileViewsCollection.createIndex({ sessionId: 1 });
    console.log('✅ ProfileView indexes created\n');

    // 3. Verify existing data
    console.log('🔍 Analyzing existing data...\n');

    const userCount = await db.collection('users').countDocuments();
    const linkCount = await db.collection('links').countDocuments();
    const clickCount = await linkClicksCollection.countDocuments();
    const profileViewCount = await profileViewsCollection.countDocuments();

    console.log('📈 Current Statistics:');
    console.log(`   Users: ${userCount.toLocaleString()}`);
    console.log(`   Links: ${linkCount.toLocaleString()}`);
    console.log(`   Link Clicks: ${clickCount.toLocaleString()}`);
    console.log(`   Profile Views: ${profileViewCount.toLocaleString()}\n`);

    // 4. Recent activity analysis
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const clicks24h = await linkClicksCollection.countDocuments({ createdAt: { $gte: last24Hours } });
    const clicks7d = await linkClicksCollection.countDocuments({ createdAt: { $gte: last7Days } });
    const views24h = await profileViewsCollection.countDocuments({ createdAt: { $gte: last24Hours } });
    const views7d = await profileViewsCollection.countDocuments({ createdAt: { $gte: last7Days } });

    console.log('⏰ Recent Activity:');
    console.log(`   Last 24 Hours:`);
    console.log(`      Clicks: ${clicks24h.toLocaleString()}`);
    console.log(`      Profile Views: ${views24h.toLocaleString()}`);
    console.log(`   Last 7 Days:`);
    console.log(`      Clicks: ${clicks7d.toLocaleString()}`);
    console.log(`      Profile Views: ${views7d.toLocaleString()}\n`);

    // 5. Verify indexes
    console.log('🔍 Verifying Indexes...');
    const linkClickIndexes = await linkClicksCollection.indexes();
    const profileViewIndexes = await profileViewsCollection.indexes();

    console.log(`   LinkClick indexes: ${linkClickIndexes.length}`);
    console.log(`   ProfileView indexes: ${profileViewIndexes.length}\n`);

    console.log('✅ Real-Time Tracking Setup Complete!\n');
    console.log('📝 Next Steps:');
    console.log('   1. Frontend tracking is already added to PublicProfile.tsx');
    console.log('   2. Dashboard caching has been removed for real-time updates');
    console.log('   3. Test by visiting a public profile');
    console.log('   4. Check dashboard to see profile views update\n');

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
