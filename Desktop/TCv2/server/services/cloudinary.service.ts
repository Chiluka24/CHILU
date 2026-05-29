// Cloudinary signed-upload helper used by both appearance-media endpoints.
// Lifts the duplicated upload logic out of server.ts so it lives in exactly one place.

import crypto from 'crypto';
import { env, useCloudStorage } from '../config/env.js';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

/**
 * Build the signed payload required by Cloudinary's REST API.
 * Cloudinary signature spec: sha1 of the parameters in alphabetical order joined by &,
 * followed by the API secret.
 */
const sign = (params: Record<string, string>): string => {
  const toSign = Object.keys(params)
    .filter((k) => k !== 'file' && k !== 'api_key' && k !== 'signature')
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return crypto.createHash('sha1').update(toSign + env.CLOUDINARY_API_SECRET).digest('hex');
};

/**
 * Upload a base64 dataURL or remote URL to Cloudinary.
 * Returns null if Cloudinary isn't configured.
 */
export const uploadToCloudinary = async (
  data: string,
  resourceType: 'image' | 'video' = 'image',
  folder = 'thecrumb/appearance'
): Promise<CloudinaryUploadResult | null> => {
  if (!useCloudStorage) return null;

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params: Record<string, string> = {
    timestamp,
    folder,
  };
  const signature = sign(params);

  const form = new FormData();
  form.append('file', data);
  form.append('api_key', env.CLOUDINARY_API_KEY!);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('signature', signature);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  const res = await fetch(uploadUrl, { method: 'POST', body: form as any });
  if (!res.ok) {
    const errText = await res.text();
    console.error('Cloudinary upload failed:', errText);
    throw new Error('Cloudinary upload failed');
  }

  const json = (await res.json()) as any;
  return { url: json.secure_url, publicId: json.public_id };
};
