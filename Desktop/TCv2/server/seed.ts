import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User, Link, BrandDeal, Campaign, Payout, Automation, LinkClick, Ad } from './models/index.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crumb_db';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Link.deleteMany({});
    await BrandDeal.deleteMany({});
    await Campaign.deleteMany({});
    await Payout.deleteMany({});
    await Automation.deleteMany({});
    await LinkClick.deleteMany({});
    await Ad.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create Demo User
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const demoUser = await User.create({
      username: 'vivekboga',
      email: 'vivek@example.com',
      passwordHash,
      profile: {
        name: 'Vivek Boga',
        bio: 'Photographer & Filmmaker. Creating content about tech, cameras, and life.',
        avatar: 'https://picsum.photos/seed/creator/100/100'
      },
      appearance: {
        theme: 1,
        colors: {
          topBlock: '#000',
          primaryText: '#fff',
          secondaryText: '#888',
          cardBackground: '#111',
          linkFooterBackground: '#222'
        }
      }
    });
    console.log(`👤 Created user: ${demoUser.username} (Password: password123)`);

    // Create Links
    const links = await Link.insertMany([
      {
        user: demoUser._id,
        title: 'My Latest YouTube Video',
        url: 'https://youtube.com',
        type: 'Link',
        isActive: true,
        order: 0,
        clicks: 1240,
        keyword: 'video, vlog',
        image: ''
      },
      {
        user: demoUser._id,
        title: 'Buy my Lightroom Presets',
        url: 'https://store.example.com',
        type: 'Link',
        isActive: true,
        order: 1,
        clicks: 854,
        keyword: 'presets, lightroom, photo',
        image: ''
      },
      {
        user: demoUser._id,
        title: 'Join my Newsletter',
        url: 'https://newsletter.example.com',
        type: 'Link',
        isActive: true,
        order: 2,
        clicks: 432,
        keyword: 'newsletter, update',
        image: ''
      },
      {
        user: demoUser._id,
        title: 'Follow me on Twitter',
        url: 'https://twitter.com',
        type: 'Link',
        isActive: false,
        order: 3,
        clicks: 210,
        keyword: 'twitter, social',
        image: ''
      }
    ]);
    console.log(`🔗 Created ${links.length} links`);

    // Create Brand Deals
    const deals = await BrandDeal.insertMany([
      {
        user: demoUser._id,
        brand: 'OSEA',
        campaign: 'Holiday Promotion Campaign',
        value: '$1,200',
        status: 'Active',
        date: 'Mar 10',
        tags: ['Paid', 'Affiliate'],
        logo: 'O',
        color: 'app-icon-tile'
      },
      {
        user: demoUser._id,
        brand: 'Fenty Beauty',
        campaign: 'Spring Glow-Up Campaign',
        value: 'Gifted + $500',
        status: 'In Discussion',
        date: 'Mar 8',
        tags: ['Gifted', 'Paid'],
        logo: 'F',
        color: 'app-icon-tile'
      }
    ]);
    console.log(`💼 Created ${deals.length} brand deals`);

    // Create Campaigns (Monetization)
    const campaigns = await Campaign.insertMany([
      {
        user: demoUser._id,
        brand: 'OSEA',
        category: 'Beauty',
        status: 'active',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-03-30'),
        metrics: { impressions: 84200, clicks: 2640, revenue: 1240 }
      },
      {
        user: demoUser._id,
        brand: 'Blue Bottle',
        category: 'Food & Beverage',
        status: 'active',
        startDate: new Date('2026-03-05'),
        endDate: new Date('2026-03-28'),
        metrics: { impressions: 47600, clicks: 1530, revenue: 860 }
      }
    ]);
    console.log(`📈 Created ${campaigns.length} campaigns`);

    // Create Automations
    const automations = await Automation.insertMany([
      {
        user: demoUser._id,
        keyword: 'LINK',
        message: 'Hey! 👋 Thanks for commenting. Here is the link you asked for:',
        linkId: links[0]._id,
        isActive: true,
        dmsSent: 342
      }
    ]);
    console.log(`🤖 Created ${automations.length} automations`);

    // Create Demo Ad (Active)
    const demoAd = await Ad.create({
      user: demoUser._id,
      brand: 'HSBC',
      campaignName: 'Travel Credit Card Campaign',
      category: 'fintech',
      bannerImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=200&fit=crop',
      clickUrl: 'https://www.hsbc.com',
      status: 'active',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-04-30'),
      impressions: 12450,
      clicks: 387
    });
    console.log(`📢 Created demo ad: ${demoAd.brand} - ${demoAd.campaignName}`);

    console.log('✨ Seeding completed successfully');
    console.log('\n📝 Login credentials:');
    console.log('   Email: vivek@example.com');
    console.log('   Password: password123');
    console.log('\n🔗 Visit: http://localhost:9090/vivekboga to see the ad on public profile');
    console.log('🔗 Visit: http://localhost:9090/links to see the ad in preview');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();