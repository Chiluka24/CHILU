import mongoose, { Schema } from 'mongoose';
import type { IUser } from './interfaces.js';

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },

    // Email verification
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, index: true },
    emailVerificationExpires: { type: Date },

    // Password reset
    passwordResetToken: { type: String, index: true },
    passwordResetExpires: { type: Date },

    // Security
    failedLoginAttempts: { type: Number, default: 0 },
    accountLockedUntil: { type: Date },
    lastLoginAt: { type: Date },

    // Monetization
    monetizationApproved: { type: Boolean, default: false },

    profile: {
      name: { type: String, default: '' },
      bio: { type: String, default: '' },
      avatar: { type: String, default: '' },
      socialIcons: [{ platform: { type: String }, url: { type: String } }],
      instagramConnected: { type: Boolean, default: false },
      instagramHandle: { type: String },
      instagramAccountId: { type: String },
      instagramAccessToken: { type: String },
      phoneNumber: { type: String },
      phoneCountryCode: { type: String, default: '+1' },
      dateOfBirth: { type: String },
      gender: { type: String },
      location: { type: String },
      careerStatus: { type: String },
      industry: { type: String },
      website: { type: String },
      socialProfiles: {
        instagram: { type: String },
        twitter: { type: String },
        linkedin: { type: String },
        github: { type: String },
        youtube: { type: String },
        tiktok: { type: String },
      },
    },

    appearance: {
      theme: { type: Schema.Types.Mixed, default: 1 }, // Can be number, 'custom', 'customMedia'
      customBackground: { type: String },
      backgroundStyle: {
        type: { type: String, enum: ['fill', 'gradient', 'blur'], default: 'fill' },
        color: { type: String, default: '#2665D6' },
        direction: { type: String, enum: ['up', 'down', 'radial'], default: 'up' },
        effect: { type: String, enum: ['none', 'mono', 'blur', 'halftone'], default: 'none' },
        tint: { type: Number, default: 0 },
        noise: { type: Boolean, default: false },
        blurStyle: { type: String, enum: ['soft', 'vibrant', 'aurora', 'mesh'], default: 'soft' },
      },
      linkLayout: { type: String, default: 'list' },
      pageLayout: { type: String, default: 'default' },
      customLayoutLinks: [{ type: String }],
      profileImageLayout: { type: String, default: 'classic' },
      buttonStyle: { type: String, enum: ['rounded', 'sharp', 'pill'], default: 'rounded' },
      linkAnimation: { type: String, enum: ['none', 'fade', 'slide', 'scale', 'bounce'], default: 'fade' },
      spacingMode: { type: String, enum: ['compact', 'comfortable', 'spacious'], default: 'comfortable' },
      fontFamily: {
        type: String,
        enum: [
          'inter', 'playfair', 'poppins', 'roboto', 'montserrat', 'lora', 'raleway',
          'opensans', 'merriweather', 'nunito', 'sourcesans', 'worksans', 'dmserif',
          'crimson', 'cormorant', 'spectral', 'karla', 'rubik', 'spacegrotesk', 'manrope',
        ],
        default: 'inter',
      },
      shadowIntensity: { type: Number, default: 2, min: 0, max: 5 },
      wallpaperMode: { type: String, enum: ['colors', 'fill', 'gradient'], default: 'colors' },
      colors: {
        topBlock: { type: String, default: '#6B4E3D' },
        primaryText: { type: String, default: '#6B4E3D' },
        secondaryText: { type: String, default: '#8B7355' },
        cardBackground: { type: String, default: '#FFFFFF' },
        linkFooterBackground: { type: String, default: '#F5EFE7' },
      },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
