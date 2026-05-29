// Backend-wide constants extracted from the monolith.
// Centralizing these makes it easy to update tables, defaults, and toggles without grepping route handlers.

// ── Disposable / throwaway email domains blocked at lead-capture ────────────
export const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'throwaway.email',
  'fakeinbox.com',
  'trashmail.com',
  'maildrop.cc',
  'getairmail.com',
  'dispostable.com',
  'temp-mail.org',
  'mintemail.com',
  'spamgourmet.com',
  'yopmail.com',
]);

// ── MIME type → file extension (used by appearance-media upload) ────────────
export const MIME_TO_EXT: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
};

// ── Default appearance for newly registered users ───────────────────────────
export const DEFAULT_APPEARANCE = {
  theme: 1,
  buttonStyle: 'rounded',
  linkAnimation: 'fade',
  spacingMode: 'comfortable',
  fontFamily: 'inter',
  shadowIntensity: 2,
  wallpaperMode: 'colors',
  linkLayout: 'list',
  pageLayout: 'default',
  profileImageLayout: 'classic',
  colors: {
    topBlock: '#6B4E3D',
    primaryText: '#6B4E3D',
    secondaryText: '#8B7355',
    cardBackground: '#FFFFFF',
    linkFooterBackground: '#F5EFE7',
  },
} as const;

// Fallback colors used in public-profile responses when a user has none set.
export const PUBLIC_PROFILE_DEFAULT_COLORS = {
  topBlock: '#6B4E3D',
  primaryText: '#6B4E3D',
  secondaryText: '#8B7355',
  cardBackground: '#FFFFFF',
  linkFooterBackground: '#F5EFE7',
} as const;

// ── Monetization ─────────────────────────────────────────────────────────────
// Estimated revenue multiplier used by /api/dashboard.
// (Each click is worth this much to a creator on average — placeholder for real CPM.)
export const REVENUE_PER_CLICK = 0.04;

// ── Cache TTLs (milliseconds) ────────────────────────────────────────────────
export const CACHE_TTL = {
  AUTH_USER: 60_000,        // 1 minute — for the /api/user endpoint
  RESPONSE: 15_000,         // 15 seconds — for per-user public response caching
  CACHE_SWEEP_INTERVAL: 60_000, // how often the in-memory cache reaper runs
} as const;
