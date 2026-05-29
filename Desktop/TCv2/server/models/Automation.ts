import mongoose, { Schema } from 'mongoose';
import type { IAutomation } from './interfaces.js';

const AutomationSchema = new Schema<IAutomation>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  keyword: { type: String, required: true },
  message: { type: String, required: true },
  linkId: { type: Schema.Types.ObjectId, ref: 'Link', required: true },
  postId: { type: String, default: null },
  isActive: { type: Boolean, default: true, index: true },
  dmsSent: { type: Number, default: 0 },
});

// Compound index for webhook lookups
AutomationSchema.index({ user: 1, isActive: 1 });

export const Automation = mongoose.model<IAutomation>('Automation', AutomationSchema);
