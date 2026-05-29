// Single import point for every Mongoose model.
// Replaces the old monolithic `models.ts`.
//
// Usage:  import { User, Link, LinkClick } from '../models/index.js';

export * from './interfaces.js';
export { User } from './User.js';
export { Link } from './Link.js';
export { LinkClick } from './LinkClick.js';
export { ProfileView } from './ProfileView.js';
export { Lead } from './Lead.js';
export { Automation } from './Automation.js';
export { Ad } from './Ad.js';
export { BrandDeal } from './BrandDeal.js';
export { Campaign } from './Campaign.js';
export { Payout } from './Payout.js';
