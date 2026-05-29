import mongoose, { Schema } from 'mongoose';
import type { IBrandDeal } from './interfaces.js';

const BrandDealSchema = new Schema<IBrandDeal>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  brand: { type: String, required: true },
  campaign: { type: String, required: true },
  value: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Completed', 'In Discussion', 'Pitched'], default: 'Pitched' },
  date: { type: String },
  tags: [{ type: String }],
  logo: { type: String },
  color: { type: String },
});

export const BrandDeal = mongoose.model<IBrandDeal>('BrandDeal', BrandDealSchema);
