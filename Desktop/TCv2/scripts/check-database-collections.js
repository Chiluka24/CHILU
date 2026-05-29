/**
 * Database Collection Checker
 * Verifies all collections needed for Dashboard and Analytics exist and have data
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env file');
  process.exit(1);
}

async function checkDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('📊 DATABASE COLLECTIONS CHECK\n');
    console.log('=' .repeat(60));
    
    // Collections needed for Dashboard and Analytics
    const requiredCollections = [
      { name: 'users', description: 'User accounts' },
      { name: 'links', description: 'User links/buttons' },
      { name: 'linkclicks', description: 'Link click tracking' },
      { name: 'profileviews', description: 'Profile visit tracking (NEW)' },
      { name: 'leads', description: 'Lead form submissions' },
      { name: 'ads', description: 'Monetization ads' }
    ];
    
    for (const required of requiredCollections) {
      const exists = collectionNames.includes(required.name);
      
      if (exists) {
        const count = await db.collection(required.name).countDocuments();
        const hasIndexes = await db.collection(required.name).indexes();
        
        console.log(`✅ ${required.name.toUpperCase()}`);
        console.log(`   Description: ${required.description}`);
        console.log(`   Documents: ${count.toLocaleString()}`);
        console.log(`   Indexes: ${hasIndexes.length}`);
        
        // Show sample document structure (first doc)
        if (count > 0) {
          const sample = await db.collection(required.name).findOne();
          console.log(`   Sample fields: ${Object.keys(sample).join(', ')}`);
        }
        console.log('');
      } else {
        console.log(`❌ ${required.name.toUpperCase()} - MISSING`);
        console.log(`   Description: ${required.description}`);
        console.log(`   Status: Collection does not exist`);
        console.log('');
      }
    }
    
    console.log('=' .repeat(60));
    
    // Check ProfileView collection specifically
    if (collectionNames.includes('profileviews')) {
      console.log('\n🔍 PROFILEVIEW COLLECTION DETAILS\n');
      
      const profileViews = db.collection('profileviews');
      const totalViews = await profileViews.countDocuments();
      
      console.log(`Total Profile Views: ${totalViews}`);
      
      if (totalViews > 0) {
        // Get recent views
        const recentViews = await profileViews
          .find()
          .sort({ createdAt: -1 })
          .limit(5)
          .toArray();
        
        console.log('\nRecent 5 Profile Views:');
        recentViews.forEach((view, idx) => {
          console.log(`  ${idx + 1}. User: ${view.username || view.user}`);
          console.log(`     Session: ${view.sessionId || 'N/A'}`);
          console.log(`     Device: ${view.deviceType || 'unknown'}`);
          console.log(`     Browser: ${view.browser || 'unknown'}`);
          console.log(`     Country: ${view.countryName || 'unknown'}`);
          console.log(`     Time: ${view.createdAt}`);
          console.log('');
        });
        
        // Check indexes
        const indexes = await profileViews.indexes();
        console.log('ProfileView Indexes:');
        indexes.forEach(idx => {
          console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });
      } else {
        console.log('⚠️  No ProfileView documents found yet');
        console.log('   This is normal if no one has visited profiles yet');
      }
    } else {
      console.log('\n❌ PROFILEVIEW COLLECTION MISSING');
      console.log('   Run migration: npm run db:migrate:tracking');
    }
    
    // Check LinkClick collection
    if (collectionNames.includes('linkclicks')) {
      console.log('\n🔍 LINKCLICK COLLECTION DETAILS\n');
      
      const linkClicks = db.collection('linkclicks');
      const totalClicks = await linkClicks.countDocuments();
      
      console.log(`Total Link Clicks: ${totalClicks}`);
      
      if (totalClicks > 0) {
        const recentClicks = await linkClicks
          .find()
          .sort({ createdAt: -1 })
          .limit(3)
          .toArray();
        
        console.log('\nRecent 3 Link Clicks:');
        recentClicks.forEach((click, idx) => {
          console.log(`  ${idx + 1}. Link: ${click.link}`);
          console.log(`     Session: ${click.sessionId || 'N/A'}`);
          console.log(`     Device: ${click.deviceType || 'unknown'}`);
          console.log(`     Country: ${click.countryName || 'unknown'}`);
          console.log(`     Time: ${click.createdAt}`);
          console.log('');
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Database check complete!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkDatabase();
