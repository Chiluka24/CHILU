/**
 * Client-side mock data for local development & UI testing.
 *
 * This file does NOT replace the backend — `server/seed.ts` still owns the
 * canonical demo seed. It exists so designers / engineers can preview pages
 * in isolation (Storybook, screenshots, throwaway scratch routes) without
 * needing the API to be reachable. Import what you need:
 *
 *     import { MOCK_USER, MOCK_LINKS, MOCK_ANALYTICS } from '@/lib/mockData';
 *
 * Shapes intentionally mirror what `/api/user`, `/api/links`, `/api/analytics`
 * etc. return so swapping a mock for a real response is a one-line change.
 *
 * If `VITE_USE_MOCK_DATA=true` is set at build / dev time, helper hooks can
 * short-circuit network calls to these objects — but the wiring is opt-in and
 * lives at the component level, not globally.
 */

// ────────────────────────────────────────────────────────────────────────────
// User
// ────────────────────────────────────────────────────────────────────────────
export const MOCK_USER = {
  id: 'mock-user-1',
  username: 'vivekboga',
  email: 'vivek@example.com',
  profile: {
    name: 'Vivek Boga',
    bio: 'Photographer & Filmmaker. Tech, cameras, life.',
    avatar: 'https://picsum.photos/seed/creator/200/200',
    location: 'Bengaluru, IN',
    website: 'https://vivekboga.example',
    phoneNumber: '9876543210',
    phoneCountryCode: '+91',
    dateOfBirth: '1996-08-12',
    gender: 'male',
    careerStatus: 'freelancer',
    industry: 'technology',
    socialProfiles: {
      instagram: 'https://www.instagram.com/vivekboga',
      twitter: 'https://x.com/vivekboga',
      linkedin: 'https://linkedin.com/in/vivekboga',
      youtube: 'https://youtube.com/@vivekboga',
      tiktok: '',
      github: 'https://github.com/vivekboga',
    },
  },
  appearance: {
    theme: 1 as const,
    colors: {
      topBlock: '#2B1A12',
      primaryText: '#FEF9F0',
      secondaryText: '#C4A485',
      cardBackground: '#3A2418',
      linkFooterBackground: '#4A2E1F',
    },
    linkLayout: 'list' as const,
    pageLayout: 'default' as const,
    profileImageLayout: 'classic' as const,
    buttonStyle: 'rounded' as const,
    linkAnimation: 'fade' as const,
    spacingMode: 'comfortable' as const,
    fontFamily: 'inter' as const,
    shadowIntensity: 2,
    wallpaperMode: 'colors' as const,
  },
};

// ────────────────────────────────────────────────────────────────────────────
// Links
// ────────────────────────────────────────────────────────────────────────────
export const MOCK_LINKS = [
  {
    id: 'mock-link-1',
    title: 'My Latest YouTube Video',
    url: 'https://youtube.com/@vivekboga',
    type: 'Link',
    isActive: true,
    order: 0,
    clicks: 1240,
    keyword: 'video, vlog',
    image: '',
  },
  {
    id: 'mock-link-2',
    title: 'Buy my Lightroom Presets',
    url: 'https://store.example.com/presets',
    type: 'Link',
    isActive: true,
    order: 1,
    clicks: 854,
    keyword: 'presets, lightroom',
    image: '',
  },
  {
    id: 'mock-link-3',
    title: 'Join my Newsletter',
    url: 'https://newsletter.example.com',
    type: 'Link',
    isActive: true,
    order: 2,
    clicks: 432,
    keyword: 'newsletter',
    image: '',
  },
  {
    id: 'mock-link-4',
    title: 'Follow me on Twitter',
    url: 'https://twitter.com/vivekboga',
    type: 'Link',
    isActive: false,
    order: 3,
    clicks: 210,
    keyword: 'twitter',
    image: '',
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Dashboard
// ────────────────────────────────────────────────────────────────────────────
export const MOCK_DASHBOARD_STATS = {
  totalClicks: 2736,
  totalViews: 18420,
  ctr: 14.85,
  topLinks: MOCK_LINKS.slice(0, 3).map((l) => ({
    id: l.id,
    title: l.title,
    clicks: l.clicks,
  })),
  chart: Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86_400_000).toISOString().slice(0, 10),
    clicks: Math.round(80 + Math.random() * 220),
    views: Math.round(420 + Math.random() * 580),
  })),
};

// ────────────────────────────────────────────────────────────────────────────
// Analytics
// ────────────────────────────────────────────────────────────────────────────
export const MOCK_ANALYTICS = {
  period: '7 Days',
  countries: [
    { code: 'IN', name: 'India', clicks: 1240 },
    { code: 'US', name: 'United States', clicks: 612 },
    { code: 'GB', name: 'United Kingdom', clicks: 280 },
    { code: 'AU', name: 'Australia', clicks: 156 },
    { code: 'CA', name: 'Canada', clicks: 142 },
  ],
  devices: [
    { name: 'Mobile', value: 71 },
    { name: 'Desktop', value: 22 },
    { name: 'Tablet', value: 7 },
  ],
  referrers: [
    { source: 'Instagram', clicks: 980 },
    { source: 'YouTube', clicks: 510 },
    { source: 'Twitter / X', clicks: 290 },
    { source: 'Direct', clicks: 421 },
  ],
};

// ────────────────────────────────────────────────────────────────────────────
// Monetization
// ────────────────────────────────────────────────────────────────────────────
export const MOCK_CAMPAIGNS = [
  {
    id: 'mock-camp-1',
    brand: 'OSEA',
    campaignName: 'Holiday Promotion',
    category: 'Beauty',
    status: 'active' as const,
    startDate: '2026-03-01',
    endDate: '2026-03-30',
    bannerImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=200&fit=crop',
    impressions: 84_200,
    clicks: 2640,
    revenue: 1240,
  },
  {
    id: 'mock-camp-2',
    brand: 'Blue Bottle Coffee',
    campaignName: 'Spring Roast',
    category: 'Food & Beverage',
    status: 'active' as const,
    startDate: '2026-03-05',
    endDate: '2026-03-28',
    bannerImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=200&fit=crop',
    impressions: 47_600,
    clicks: 1530,
    revenue: 860,
  },
];

export const MOCK_PAYOUTS = [
  { id: 'p1', date: '2026-03-31', amount: 1240, status: 'paid' as const, method: 'Stripe' },
  { id: 'p2', date: '2026-02-28', amount: 860, status: 'paid' as const, method: 'Stripe' },
  { id: 'p3', date: '2026-04-30', amount: 540, status: 'pending' as const, method: 'Stripe' },
];

// ────────────────────────────────────────────────────────────────────────────
// Automations (Auto DM)
// ────────────────────────────────────────────────────────────────────────────
export const MOCK_AUTOMATIONS = [
  {
    id: 'auto-1',
    keyword: 'LINK',
    message: 'Hey! 👋 Thanks for commenting. Here is the link you asked for:',
    linkId: 'mock-link-1',
    isActive: true,
    dmsSent: 342,
  },
  {
    id: 'auto-2',
    keyword: 'PRESETS',
    message: 'Thanks for your interest! Grab the presets here:',
    linkId: 'mock-link-2',
    isActive: false,
    dmsSent: 87,
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Active ad (used in MobilePreview)
// ────────────────────────────────────────────────────────────────────────────
export const MOCK_ACTIVE_AD = {
  id: 'mock-ad-1',
  brand: 'HSBC',
  campaignName: 'Travel Credit Card',
  category: 'fintech',
  bannerImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=200&fit=crop',
  clickUrl: 'https://www.hsbc.com',
};

/**
 * Convenience flag — flip this in `.env` (or in code during a screenshot
 * session) and consumers can route around the network.
 *
 *   VITE_USE_MOCK_DATA=true npm run dev
 */
export const USE_MOCK_DATA =
  (import.meta as any).env?.VITE_USE_MOCK_DATA === 'true';
