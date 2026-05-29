import mongoose, { Schema } from 'mongoose';
import type { ICampaign } from './interfaces.js';

const CampaignSchema = new Schema<ICampaign>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  brand: { type: String, required: true },
  category: { type: String },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  metrics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  },
});

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
