// /api/user/appearance-media*  — file & base64 upload endpoints.
// Routes to Cloudinary on Vercel; falls back to ./uploads locally.

import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { authenticateToken } from '../middleware/auth.js';
import { uploadLimiter } from '../config/rate-limits.js';
import { appearanceMediaUpload, UPLOADS_DIR } from '../middleware/upload.js';
import { env, useCloudStorage } from '../config/env.js';

const router = Router();
router.use(authenticateToken);

// ── POST /api/user/appearance-media-file (multipart) ───────────────────────
router.post('/appearance-media-file', uploadLimiter, appearanceMediaUpload.single('media'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No media file uploaded' });

    const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    if (useCloudStorage) {
      if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
        return res.status(503).json({
          error: 'Cloud storage not configured. Please contact administrator.',
          code: 'CLOUDINARY_NOT_CONFIGURED',
        });
      }
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const base64File = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
        const timestamp = Math.round(Date.now() / 1000);
        const paramsToSign = `folder=thecrumb/uploads&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
        const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${mediaType}/upload`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: base64File,
              api_key: env.CLOUDINARY_API_KEY,
              timestamp,
              folder: 'thecrumb/uploads',
              signature,
            }),
          }
        );

        const cloudinaryData: any = await cloudinaryResponse.json();
        if (!cloudinaryResponse.ok) {
          throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed');
        }

        try {
          fs.unlinkSync(req.file.path);
        } catch {
          /* non-fatal */
        }

        return res.json({ url: cloudinaryData.secure_url, mediaType });
      } catch (cloudErr) {
        console.error('Cloudinary upload error:', cloudErr);
        return res.status(500).json({
          error: 'Failed to upload to cloud storage',
          details: (cloudErr as Error).message,
        });
      }
    }

    // Local-dev fallback
    res.json({ url: `${env.API_URL}/uploads/${req.file.filename}`, mediaType });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

// ── POST /api/user/appearance-media (base64 dataURL) ───────────────────────
router.post('/appearance-media', uploadLimiter, async (req, res) => {
  try {
    const user = (req as any).user;
    const { dataUrl } = req.body as { dataUrl?: string };
    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({ error: 'Missing media payload' });
    }

    const match = dataUrl.match(/^data:(image|video)\/([a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return res.status(400).json({ error: 'Invalid media format' });

    const mediaCategory = match[1];
    const mediaSubtype = match[2].toLowerCase();
    const base64Body = match[3];
    const fileBuffer = Buffer.from(base64Body, 'base64');

    if (fileBuffer.length > 20 * 1024 * 1024) {
      return res.status(413).json({ error: 'File size exceeds 20MB limit' });
    }

    const extensionMap: Record<string, string> = {
      jpeg: 'jpg', jpg: 'jpg', png: 'png', gif: 'gif', webp: 'webp',
      mp4: 'mp4', webm: 'webm', quicktime: 'mov', 'x-msvideo': 'avi',
      'x-matroska': 'mkv', ogg: 'ogg',
    };

    const ext = extensionMap[mediaSubtype] || (mediaCategory === 'video' ? 'mp4' : 'png');
    const fileName = `${user._id.toString()}_${Date.now()}.${ext}`;

    if (useCloudStorage) {
      try {
        const timestamp = Math.round(Date.now() / 1000);
        const paramsToSign = `folder=thecrumb/uploads&timestamp=${timestamp}${env.CLOUDINARY_API_SECRET}`;
        const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${mediaCategory}/upload`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              file: dataUrl,
              api_key: env.CLOUDINARY_API_KEY,
              timestamp,
              folder: 'thecrumb/uploads',
              signature,
            }),
          }
        );

        const cloudinaryData: any = await cloudinaryResponse.json();
        if (!cloudinaryResponse.ok) {
          throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed');
        }
        return res.json({ url: cloudinaryData.secure_url, mediaType: mediaCategory });
      } catch (cloudErr) {
        // Fall back to local
        const filePath = path.join(UPLOADS_DIR, fileName);
        await fs.promises.writeFile(filePath, fileBuffer);
        return res.json({ url: `${env.API_URL}/uploads/${fileName}`, mediaType: mediaCategory });
      }
    }

    // Local-dev path
    const filePath = path.join(UPLOADS_DIR, fileName);
    await fs.promises.writeFile(filePath, fileBuffer);
    res.json({ url: `${env.API_URL}/uploads/${fileName}`, mediaType: mediaCategory });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
