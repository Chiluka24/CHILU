// Multer configuration for the appearance-media upload endpoint.
// On Vercel writes go to /tmp; locally they go to ./uploads.

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { isVercel } from '../config/env.js';

export const UPLOADS_DIR = isVercel ? '/tmp/uploads' : path.join(process.cwd(), 'uploads');

try {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (err) {
  console.warn('Could not create uploads directory:', (err as Error).message);
}

export const appearanceMediaUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const user = (req as any).user;
      const extFromOriginal = path.extname(file.originalname || '').toLowerCase();
      const safeExt = extFromOriginal || (file.mimetype.startsWith('video/') ? '.mp4' : '.png');
      cb(null, `${user?._id?.toString?.() || 'user'}_${Date.now()}${safeExt}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
      return;
    }
    cb(new Error('Only image/video files are allowed'));
  },
});
