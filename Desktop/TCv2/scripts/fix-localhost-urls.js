#!/usr/bin/env node

/**
 * Fix Localhost URLs in Database
 * Updates all localhost image URLs to production URLs
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const PRODUCTION_API_URL = process.env.API_URL || 'https://the-crumb.vercel.app';

async function fixUrls() {
  try {
    console.log('🔧 Fixing localhost URLs in database...\n');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.model('User', new mongoose.Schema({
      profile: {
        avatar: String,
      }
    }));

    const Link = mongoose.model('Link', new mongoose.Schema({
      image: String,
    }));

    // Fix user avatars
    console.log('Checking user avatars...');
    const usersWithLocalhost = await User.find({
      'profile.avatar': { $regex: /^http:\/\/(127\.0\.0\.1|localhost):/ }
    });

    console.log(`Found ${usersWithLocalhost.length} users with localhost avatars`);

    for (const user of usersWithLocalhost) {
      const oldUrl = user.profile.avatar;
      const newUrl = oldUrl.replace(/http:\/\/(127\.0\.0\.1|localhost):\d+/, PRODUCTION_API_URL);
      user.profile.avatar = newUrl;
      await user.save();
      console.log(`  ✓ Updated: ${user.email}`);
      console.log(`    Old: ${oldUrl}`);
      console.log(`    New: ${newUrl}`);
    }

    // Fix link images
    console.log('\nChecking link images...');
    const linksWithLocalhost = await Link.find({
      image: { $regex: /^http:\/\/(127\.0\.0\.1|localhost):/ }
    });

    console.log(`Found ${linksWithLocalhost.length} links with localhost images`);

    for (const link of linksWithLocalhost) {
      const oldUrl = link.image;
      const newUrl = oldUrl.replace(/http:\/\/(127\.0\.0\.1|localhost):\d+/, PRODUCTION_API_URL);
      link.image = newUrl;
      await link.save();
      console.log(`  ✓ Updated link: ${link.title}`);
    }

    console.log('\n✅ All URLs updated successfully!');
    console.log(`\nProduction API URL: ${PRODUCTION_API_URL}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

fixUrls();
