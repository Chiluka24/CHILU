// Helpers for handling base64 image uploads and cleaning up old files on disk.
// Used by appearance updates that ship the image inline (dataURL).

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { MIME_TO_EXT } from '../config/constants.js';
import { UPLOADS_DIR } from '../middleware/upload.js';

/**
 * Decode a base64 dataURL and write it to /uploads with a random name.
 * Returns the public URL (`/uploads/<file>`) or null if the input wasn't a dataURL.
 */
export const processBase64Image = (
  dataUrl: string,
  ownerId: string
): { url: string; absPath: string } | null => {
  if (!dataUrl?.startsWith('data:')) return null;

  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;

  const mime = match[1];
  const buffer = Buffer.from(match[2], 'base64');
  const ext = MIME_TO_EXT[mime] || '.png';
  const filename = `${ownerId}_${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;
  const absPath = path.join(UPLOADS_DIR, filename);

  fs.writeFileSync(absPath, buffer);
  return { url: `/uploads/${filename}`, absPath };
};

/**
 * Delete a previously stored upload (only if the URL points at our /uploads dir).
 * Best-effort — never throws.
 */
export const deleteOldFile = (publicUrl?: string): void => {
  if (!publicUrl) return;
  if (!publicUrl.startsWith('/uploads/')) return;

  try {
    const filename = path.basename(publicUrl);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.warn('Could not delete old file:', (err as Error).message);
  }
};
