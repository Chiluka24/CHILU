import mongoose, { Schema } from 'mongoose';
import type { IPayout } from './interfaces.js';

const PayoutSchema = new Schema<IPayout>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  method: { type: String, required: true },
  status: { type: String, enum: ['Paid', 'Processing', 'Failed'], default: 'Processing' },
  transactionId: { type: String },
  netAmount: { type: Number, required: true },
});

export const Payout = mongoose.model<IPayout>('Payout', PayoutSchema);
