// JWT authentication middleware. Verifies the bearer token, loads the user,
// caches them for 60s to avoid hammering Mongo, and attaches `req.user`.

import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { env } from '../config/env.js';
import { CACHE_TTL } from '../config/constants.js';
import { logSecurityEvent, SecurityEventType, getClientIP } from './security.js';

interface AuthCacheEntry {
  user: any;
  timestamp: number;
}

const authCache = new Map<string, AuthCacheEntry>();

export const invalidateAuthCache = (userId: string) => {
  // Drop every cached entry that resolves to this user.
  for (const [token, entry] of authCache.entries()) {
    if (entry.user?._id?.toString?.() === userId) authCache.delete(token);
  }
};

export const authenticateToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ error: 'Authorization token missing' });
    return;
  }

  // Cached?
  const cached = authCache.get(token);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL.AUTH_USER) {
    (req as any).user = cached.user;
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id).lean();

    if (!user) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: SecurityEventType.UNAUTHORIZED_ACCESS,
        ip: getClientIP(req),
        userAgent: req.get('user-agent') || 'unknown',
        endpoint: req.path,
        method: req.method,
        message: 'Token valid but user not found',
      });
      res.status(401).json({ error: 'User not found' });
      return;
    }

    authCache.set(token, { user, timestamp: Date.now() });
    (req as any).user = user;
    next();
  } catch (err) {
    const isExpired = (err as any)?.name === 'TokenExpiredError';
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: isExpired ? SecurityEventType.TOKEN_EXPIRED : SecurityEventType.INVALID_TOKEN,
      ip: getClientIP(req),
      userAgent: req.get('user-agent') || 'unknown',
      endpoint: req.path,
      method: req.method,
      message: (err as Error).message,
    });
    res.status(isExpired ? 401 : 403).json({ error: isExpired ? 'Token expired' : 'Invalid token' });
  }
};
