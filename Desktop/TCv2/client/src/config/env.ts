const trimTrailingSlash = (value: string | undefined, fallback: string) => {
  const resolved = value?.trim() || fallback;
  return resolved.replace(/\/+$/, '');
};

export const API_BASE = trimTrailingSlash(
  import.meta.env.VITE_API_URL,
  '', // empty string means same origin
);

export const APP_BASE = trimTrailingSlash(
  import.meta.env.VITE_APP_URL,
  typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:9090',
);
