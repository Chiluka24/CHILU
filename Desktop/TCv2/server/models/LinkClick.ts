import mongoose, { Schema } from 'mongoose';
import type { ILinkClick } from './interfaces.js';

const LinkClickSchema = new Schema<ILinkClick>(
  {
    link: { type: Schema.Types.ObjectId, ref: 'Link', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    countryCode: { type: String, default: 'US', index: true },
    countryName: { type: String, default: 'United States' },
    deviceType: { type: String, enum: ['mobile', 'tablet', 'desktop', 'unknown'], default: 'unknown' },
    browser: { type: String },
    os: { type: String },
    referrer: { type: String },
    ipAddress: { type: String },
    sessionId: { type: String, index: true },
  },
  { timestamps: true }
);

// PERF: Compound indexes for analytics queries
LinkClickSchema.index({ user: 1, createdAt: -1 });
LinkClickSchema.index({ link: 1, createdAt: -1 });
LinkClickSchema.index({ user: 1, link: 1, createdAt: -1 });
LinkClickSchema.index({ user: 1, countryCode: 1, createdAt: -1 });
LinkClickSchema.index({ user: 1, deviceType: 1, createdAt: -1 });

export const LinkClick = mongoose.model<ILinkClick>('LinkClick', LinkClickSchema);
