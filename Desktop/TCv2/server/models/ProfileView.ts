import mongoose, { Schema } from 'mongoose';
import type { IProfileView } from './interfaces.js';

const ProfileViewSchema = new Schema<IProfileView>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    username: { type: String, required: true, index: true },
    countryCode: { type: String, default: 'US', index: true },
    countryName: { type: String, default: 'United States' },
    deviceType: { type: String, enum: ['mobile', 'tablet', 'desktop', 'unknown'], default: 'unknown' },
    browser: { type: String },
    os: { type: String },
    referrer: { type: String },
    ipAddress: { type: String },
    sessionId: { type: String, index: true },
    timeSpent: { type: Number, default: 0 },
    linksViewed: { type: Number, default: 0 },
    linksClicked: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProfileViewSchema.index({ user: 1, createdAt: -1 });
ProfileViewSchema.index({ username: 1, createdAt: -1 });
ProfileViewSchema.index({ user: 1, countryCode: 1, createdAt: -1 });
ProfileViewSchema.index({ user: 1, deviceType: 1, createdAt: -1 });

export const ProfileView = mongoose.model<IProfileView>('ProfileView', ProfileViewSchema);
