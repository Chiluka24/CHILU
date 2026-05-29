// Centralized environment-variable access.
// Every other backend module reads env via this file — no `process.env` lookups elsewhere.

import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const stripTrailingSlash = (v: string) => v.replace(/\/+$/, '');

const requireInProd = (name: string, devFallback: string): string => {
  const value = process.env[name];
  if (value) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${name} must be set in production`);
  }
  return devFallback;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),

  // Secrets
  JWT_SECRET: requireInProd('JWT_SECRET', 'dev_secret_key_123'),
  JWT_REFRESH_SECRET: requireInProd('JWT_REFRESH_SECRET', 'dev_refresh_secret_456'),
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'),

  // Database
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/crumb_db',

  // URLs
  APP_URL: stripTrailingSlash(process.env.APP_URL || 'http://127.0.0.1:9090'),
  API_URL: stripTrailingSlash(process.env.API_URL || `http://127.0.0.1:${Number(process.env.PORT || 5000)}`),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  // Email (SMTP)
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@thecrumb.co',
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // Instagram / Meta
  META_APP_ID: process.env.META_APP_ID,
  META_APP_SECRET: process.env.META_APP_SECRET,
  META_VERIFY_TOKEN: process.env.META_VERIFY_TOKEN,
  META_REDIRECT_URI: process.env.META_REDIRECT_URI,
} as const;

// Vercel / cloud-storage flags
export const isVercel = !!(process.env.VERCEL || process.env.NODE_ENV === 'production');
export const useCloudStorage = !!(
  isVercel &&
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET
);
