import mongoose, { Schema } from 'mongoose';
import type { ILead } from './interfaces.js';

const LeadSchema = new Schema<ILead>(
  {
    linkId: { type: Schema.Types.ObjectId, ref: 'Link', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String },
    email: { type: String, required: true },
  },
  { timestamps: true }
);

// PERF: Compound index for duplicate-lead detection in POST /api/public/leads
LeadSchema.index({ linkId: 1, email: 1 });

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);
