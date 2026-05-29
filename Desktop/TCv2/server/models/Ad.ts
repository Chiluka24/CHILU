import mongoose, { Schema } from 'mongoose';
import type { IAd } from './interfaces.js';

const AdSchema = new Schema<IAd>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    brand: { type: String, required: true },
    campaignName: { type: String, required: true },
    category: { type: String, required: true },
    bannerImage: { type: String, required: true },
    clickUrl: { type: String, required: true },
    status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active', index: true },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound index for "active ad now" queries
AdSchema.index({ user: 1, status: 1, startDate: 1, endDate: 1 });

export const Ad = mongoose.model<IAd>('Ad', AdSchema);
