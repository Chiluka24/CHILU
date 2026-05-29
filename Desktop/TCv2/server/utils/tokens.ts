// JWT token signing helpers. Used by register, login, refresh, and password reset.

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AUTH_CONFIG } from '../config/auth-config.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const signAccessToken = (userId: string): string =>
  jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: AUTH_CONFIG.JWT_ACCESS_TOKEN_EXPIRY,
  });

export const signRefreshToken = (userId: string): string =>
  jwt.sign({ id: userId, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: AUTH_CONFIG.JWT_REFRESH_TOKEN_EXPIRY,
  });

export const signTokenPair = (userId: string): TokenPair => ({
  accessToken: signAccessToken(userId),
  refreshToken: signRefreshToken(userId),
});

export const verifyRefreshToken = (token: string): { id: string } | null => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
  } catch {
    return null;
  }
};
