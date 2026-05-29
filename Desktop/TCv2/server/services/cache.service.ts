// In-memory cache shared across routes for short-lived response caching.
// Two stores:
//   • authCache       — single user lookup, 60s TTL (used by /api/user, /api/auth)
//   • responseCache   — per-user response cache, 15s TTL (used by /api/links, /api/ads/active, etc.)
//
// A sweeper runs once a minute to evict expired entries.
// Reach for Redis if/when the app scales horizontally.

import { CACHE_TTL } from '../config/constants.js';

interface Entry<T = any> {
  value: T;
  timestamp: number;
  ttl: number;
}

const store = new Map<string, Entry>();

export const getCached = <T = any>(key: string): T | null => {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
};

export const setCache = <T = any>(key: string, value: T, ttl = CACHE_TTL.RESPONSE) => {
  store.set(key, { value, timestamp: Date.now(), ttl });
};

export const invalidate = (key: string) => store.delete(key);

export const invalidateUserCache = (userId: string) => {
  for (const key of store.keys()) {
    if (key.includes(`:user:${userId}`)) store.delete(key);
  }
};

// Periodic sweep
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.timestamp > entry.ttl) store.delete(key);
  }
}, CACHE_TTL.CACHE_SWEEP_INTERVAL);

export const cacheStats = () => ({
  size: store.size,
  keys: Array.from(store.keys()).slice(0, 20),
});
