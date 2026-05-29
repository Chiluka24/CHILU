// Input validators reused by multiple routes (register, password reset,
// password change, username update). Centralizing them keeps validation rules in one place.

import { AUTH_CONFIG } from '../config/auth-config.js';

export const validateEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validateUsername = (username: string): string | null => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 30) return 'Username must be 30 characters or fewer';
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    return 'Username can only contain letters, numbers, dots, dashes and underscores';
  }
  return null;
};

export const validatePassword = (pwd: string): string | null => {
  if (!pwd) return 'Password is required';
  if (pwd.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} characters`;
  }
  if (pwd.length > AUTH_CONFIG.PASSWORD_MAX_LENGTH) {
    return `Password must be ${AUTH_CONFIG.PASSWORD_MAX_LENGTH} characters or fewer`;
  }
  if (AUTH_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(pwd)) {
    return 'Password must contain an uppercase letter';
  }
  if (AUTH_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(pwd)) {
    return 'Password must contain a lowercase letter';
  }
  if (AUTH_CONFIG.PASSWORD_REQUIRE_NUMBER && !/\d/.test(pwd)) {
    return 'Password must contain a number';
  }
  if (AUTH_CONFIG.PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
    return 'Password must contain a special character';
  }
  return null;
};

// Escape a string for safe use in a RegExp.
export const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Parse from/to query params into a date range. Returns null bounds when missing.
export const parseDateRange = (
  from?: string,
  to?: string
): { fromDate: Date | null; toDate: Date | null } => {
  const parse = (v?: string): Date | null => {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };
  return { fromDate: parse(from), toDate: parse(to) };
};
