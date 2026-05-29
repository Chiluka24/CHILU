const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config();

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

async function migrate() {
  console.log('🚀 Starting performance migration...');
  await mongoose.connect(process.env.MONGO_URI);
  
  const db = mongoose.connection.db;

  // 1. Migrate Links: Base64 to Files
  const links = await db.collection('links').find({ image: { $regex: /^data:image/ } }).toArray();
  console.log(`🖼️ Found ${links.length} links with base64 images. Converting...`);
  
  for (const link of links) {
    try {
      const dataUrl = link.image;
      const [header, base64Data] = dataUrl.split(',');
      const extension = header.split('/')[1]?.split(';')[0] || 'png';
      const buffer = Buffer.from(base64Data, 'base64');
      const fileName = `migrated-${link._id}-${Date.now()}.${extension}`;
      const filePath = path.join(UPLOADS_DIR, fileName);
      
      fs.writeFileSync(filePath, buffer);
      const fileUrl = `/uploads/${fileName}`;
      
      await db.collection('links').updateOne({ _id: link._id }, { $set: { image: fileUrl } });
      console.log(`✅ Migrated link ${link._id} (${buffer.length} bytes -> URL)`);
    } catch (e) {
      console.error(`❌ Failed to migrate link ${link._id}:`, e.message);
    }
  }

  // 2. Migrate Users: Lowercase Usernames (eliminates COLLSCAN)
  const users = await db.collection('users').find({}).toArray();
  console.log(`👤 Found ${users.length} users. Lowercasing usernames...`);
  
  for (const user of users) {
    const lowerName = user.username.toLowerCase();
    if (user.username !== lowerName) {
      await db.collection('users').updateOne({ _id: user._id }, { $set: { username: lowerName } });
      console.log(`✅ Lowercased: ${user.username} -> ${lowerName}`);
    }
  }

  console.log('✨ Migration complete! The app should be significantly faster now.');
  process.exit(0);
}

migrate();
