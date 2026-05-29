import mongoose, { Schema } from 'mongoose';
import type { ILink } from './interfaces.js';

const LinkSchema = new Schema<ILink>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  url: { type: String, default: '' },
  type: {
    type: String,
    enum: [
      'Link', 'Header', 'Collection', 'Button', 'Video', 'Text', 'Lead', 'Email', 'LinkButton',
      'link', 'header', 'collection', 'button', 'video', 'text', 'lead', 'email', 'linkbutton',
    ],
    default: 'Link',
  },
  isActive: { type: Boolean, default: true, index: true },
  order: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  image: { type: String },
  keyword: { type: String },
  metadata: { type: Schema.Types.Mixed, default: {} },
  parentId: { type: Schema.Types.ObjectId, ref: 'Link', default: null, index: true },
  isExpanded: { type: Boolean, default: true },
});

// Normalize type to lowercase before saving
LinkSchema.pre('save', function () {
  if (this.type) {
    this.type = this.type.toLowerCase() as any;
  }
});

// Normalize type to lowercase before updating
LinkSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate() as any;
  if (update && update.type) {
    update.type = update.type.toLowerCase();
  }
  if (update && update.$set && update.$set.type) {
    update.$set.type = update.$set.type.toLowerCase();
  }
});

// Compound indexes for efficient queries
LinkSchema.index({ user: 1, order: 1 });
LinkSchema.index({ user: 1, isActive: 1 });

export const Link = mongoose.model<ILink>('Link', LinkSchema);
