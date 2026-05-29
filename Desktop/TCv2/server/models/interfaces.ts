// Shared TypeScript interfaces matching frontend data structures.
// Each Mongoose model file imports the interface it needs from here.

import mongoose, { Document } from 'mongoose';

export interface IProfile {
  name: string;
  bio: string;
  avatar: string;
  socialIcons?: { platform: string; url: string }[];
  instagramConnected?: boolean;
  instagramHandle?: string;
  instagramAccountId?: string;
  instagramAccessToken?: string;
  phoneNumber?: string;
  phoneCountryCode?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  careerStatus?: string;
  industry?: string;
  website?: string;
  socialProfiles?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
    youtube?: string;
    tiktok?: string;
  };
}

export interface IAppearance {
  theme: number | 'custom' | 'customMedia';
  customBackground?: string;
  backgroundStyle?: {
    type: 'fill' | 'gradient' | 'blur';
    color: string;
    direction: 'up' | 'down' | 'radial';
    effect: 'none' | 'mono' | 'blur' | 'halftone';
    tint: number;
    noise: boolean;
    blurStyle?: 'soft' | 'vibrant' | 'aurora' | 'mesh';
  };
  linkLayout?: 'list' | 'grid';
  pageLayout?: 'default' | 'mostRecent' | 'custom';
  customLayoutLinks?: string[];
  profileImageLayout?: 'classic' | 'square';
  buttonStyle?: 'rounded' | 'sharp' | 'pill';
  linkAnimation?: 'none' | 'fade' | 'slide' | 'scale' | 'bounce';
  spacingMode?: 'compact' | 'comfortable' | 'spacious';
  fontFamily?: 'inter' | 'playfair' | 'poppins' | 'roboto' | 'montserrat' | 'lora' | 'raleway' | 'opensans' | 'merriweather' | 'nunito' | 'sourcesans' | 'worksans' | 'dmserif' | 'crimson' | 'cormorant' | 'spectral' | 'karla' | 'rubik' | 'spacegrotesk' | 'manrope';
  shadowIntensity?: number;
  wallpaperMode?: 'colors' | 'fill' | 'gradient';
  colors: {
    topBlock: string;
    primaryText: string;
    secondaryText: string;
    cardBackground: string;
    linkFooterBackground: string;
  };
}

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash?: string;
  profile: IProfile;
  appearance: IAppearance;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  failedLoginAttempts: number;
  accountLockedUntil?: Date;
  lastLoginAt?: Date;
  monetizationApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILink extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  url: string;
  type:
    | 'Link' | 'Header' | 'Collection' | 'Button' | 'Video' | 'Text' | 'Lead' | 'Email' | 'LinkButton'
    | 'link' | 'header' | 'collection' | 'button' | 'video' | 'text' | 'lead' | 'email' | 'linkbutton';
  isActive: boolean;
  order: number;
  clicks: number;
  image?: string;
  keyword?: string;
  metadata?: {
    content?: string;
    videoUrl?: string;
    layout?: string;
    [key: string]: any;
  };
  parentId?: mongoose.Types.ObjectId;
  isExpanded?: boolean;
}

export interface IBrandDeal extends Document {
  user: mongoose.Types.ObjectId;
  brand: string;
  campaign: string;
  value: string;
  status: 'Active' | 'Completed' | 'In Discussion' | 'Pitched';
  date: string;
  tags: string[];
  logo: string;
  color: string;
}

export interface ICampaign extends Document {
  user: mongoose.Types.ObjectId;
  brand: string;
  category: string;
  status: 'active' | 'completed';
  startDate: Date;
  endDate: Date;
  metrics: {
    impressions: number;
    clicks: number;
    revenue: number;
  };
}

export interface IPayout extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  date: Date;
  method: string;
  status: 'Paid' | 'Processing' | 'Failed';
  transactionId: string;
  netAmount: number;
}

export interface IAutomation extends Document {
  user: mongoose.Types.ObjectId;
  keyword: string;
  message: string;
  linkId: mongoose.Types.ObjectId;
  postId?: string;
  isActive: boolean;
  dmsSent: number;
}

export interface ILinkClick extends Document {
  link: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  countryCode?: string;
  countryName?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  browser?: string;
  os?: string;
  referrer?: string;
  ipAddress?: string;
  sessionId?: string;
  createdAt: Date;
}

export interface IProfileView extends Document {
  user: mongoose.Types.ObjectId;
  username: string;
  countryCode?: string;
  countryName?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  browser?: string;
  os?: string;
  referrer?: string;
  ipAddress?: string;
  sessionId?: string;
  timeSpent?: number;
  linksViewed?: number;
  linksClicked?: number;
  createdAt: Date;
}

export interface ILead extends Document {
  linkId: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  name?: string;
  email: string;
  createdAt: Date;
}

export interface IAd extends Document {
  user: mongoose.Types.ObjectId;
  brand: string;
  campaignName: string;
  category: string;
  bannerImage: string;
  clickUrl: string;
  status: 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate: Date;
  impressions: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
}
