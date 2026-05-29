// Security middleware: HTTPS enforcement, headers, suspicious-activity detection,
// rate-limit + global error handlers, and file-based security/error logging.
//
// (Was at root in the monolith: ./security-middleware.ts)

import express from 'express';
import fs from 'fs';
import path from 'path';
import { isVercel } from '../config/env.js';

// ── Event types ─────────────────────────────────────────────────────────────
export enum SecurityEventType {
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_FAILURE = 'AUTH_FAILURE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_CHANGE_FAILED = 'PASSWORD_CHANGE_FAILED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  API_ERROR = 'API_ERROR',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
}

interface SecurityLogEntry {
  timestamp: string;
  eventType: SecurityEventType;
  userId?: string;
  username?: string;
  email?: string;
  ip: string;
  userAgent: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  message?: string;
  metadata?: Record<string, any>;
}

// ── Log file setup (Vercel uses /tmp — only writable dir) ───────────────────
const LOG_DIR = isVercel ? '/tmp/logs' : (process.env.LOG_DIR || path.join(process.cwd(), 'logs'));
const SECURITY_LOG_FILE = path.join(LOG_DIR, 'security.log');
const API_ERROR_LOG_FILE = path.join(LOG_DIR, 'api-errors.log');
const MAX_LOG_SIZE = 5 * 1024 * 1024;

try {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
} catch (err) {
  console.warn('⚠️  Could not create log directory:', (err as Error).message);
}

const checkAndRotateLog = (logFile: string): void => {
  try {
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size > MAX_LOG_SIZE) {
        const oldLog = logFile + '.old';
        if (fs.existsSync(oldLog)) fs.unlinkSync(oldLog);
        fs.renameSync(logFile, oldLog);
      }
    }
  } catch (err) {
    console.warn('Log rotation failed:', (err as Error).message);
  }
};

// ── Logging ─────────────────────────────────────────────────────────────────
const eventEmoji = (e: SecurityEventType): string =>
  ({
    [SecurityEventType.AUTH_SUCCESS]: '✅',
    [SecurityEventType.AUTH_FAILURE]: '❌',
    [SecurityEventType.ACCOUNT_LOCKED]: '🔒',
    [SecurityEventType.PASSWORD_RESET_REQUEST]: '🔑',
    [SecurityEventType.PASSWORD_CHANGED]: '🔐',
    [SecurityEventType.PASSWORD_CHANGE_FAILED]: '🔴',
    [SecurityEventType.EMAIL_VERIFIED]: '📧',
    [SecurityEventType.SUSPICIOUS_ACTIVITY]: '⚠️',
    [SecurityEventType.RATE_LIMIT_EXCEEDED]: '🚫',
    [SecurityEventType.API_ERROR]: '💥',
    [SecurityEventType.UNAUTHORIZED_ACCESS]: '🚨',
    [SecurityEventType.TOKEN_EXPIRED]: '⏰',
    [SecurityEventType.INVALID_TOKEN]: '🔓',
  })[e] || '📝';

export const logSecurityEvent = (entry: SecurityLogEntry): void => {
  const line = JSON.stringify(entry) + '\n';
  console.log(`${eventEmoji(entry.eventType)} [SECURITY] ${entry.eventType} - ${entry.message || ''} (IP: ${entry.ip})`);

  if (!isVercel) {
    checkAndRotateLog(SECURITY_LOG_FILE);
    fs.appendFile(SECURITY_LOG_FILE, line, (err) => {
      if (err) console.error('Failed to write security log:', err);
    });
  }
};

export const logAPIError = (req: express.Request, error: Error, statusCode = 500): void => {
  const entry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    endpoint: req.path,
    statusCode,
    error: error.message,
    stack: error.stack,
    ip: getClientIP(req),
    userAgent: req.get('user-agent') || 'unknown',
    userId: (req as any).user?._id?.toString(),
  };

  console.error(`❌ [API ERROR] ${req.method} ${req.path} - ${error.message}`);

  if (!isVercel) {
    checkAndRotateLog(API_ERROR_LOG_FILE);
    fs.appendFile(API_ERROR_LOG_FILE, JSON.stringify(entry) + '\n', (err) => {
      if (err) console.error('Failed to write API error log:', err);
    });
  }
};

// ── Helpers ─────────────────────────────────────────────────────────────────
export const getClientIP = (req: express.Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return (forwarded as string).split(',')[0].trim();
  return (req.headers['x-real-ip'] as string) || req.socket.remoteAddress || 'unknown';
};

// ── Middleware ──────────────────────────────────────────────────────────────

export const authLogger = (eventType: SecurityEventType) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType,
        ip: getClientIP(req),
        userAgent: req.get('user-agent') || 'unknown',
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        email: req.body?.email,
        username: req.body?.username,
        message: body?.error || body?.message,
      });
      return originalJson(body);
    };
    next();
  };

export const suspiciousActivityDetector = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  const ip = getClientIP(req);
  const userAgent = req.get('user-agent') || '';

  const suspiciousPatterns = [
    /(\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b).*(\bFROM\b|\bWHERE\b)/i,
    /<script[^>]*>.*?<\/script>/i,
    /\.\.[\/\\]/,
    /[;&|`$()]/,
  ];

  const requestData = JSON.stringify({ body: req.body, query: req.query, params: req.params });
  const isSuspicious = suspiciousPatterns.some((p) => p.test(requestData));
  const hasNoUserAgent = !userAgent || userAgent === 'unknown';

  if (isSuspicious || (hasNoUserAgent && req.method !== 'GET')) {
    logSecurityEvent({
      timestamp: new Date().toISOString(),
      eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
      ip,
      userAgent,
      endpoint: req.path,
      method: req.method,
      message: isSuspicious ? 'Malicious pattern detected' : 'Missing user agent',
      metadata: { body: req.body, query: req.query },
    });
  }
  next();
};

export const enforceHTTPS = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  if (process.env.NODE_ENV !== 'production') return next();

  const isSecure =
    req.secure ||
    req.headers['x-forwarded-proto'] === 'https' ||
    req.headers['x-forwarded-ssl'] === 'on';

  if (!isSecure) {
    const httpsUrl = `https://${req.hostname}${req.url}`;
    console.warn(`Redirecting insecure request to HTTPS: ${req.url}`);
    return res.redirect(301, httpsUrl);
  }
  next();
};

export const securityHeaders = (
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
};

export const rateLimitHandler = (req: express.Request, res: express.Response): void => {
  logSecurityEvent({
    timestamp: new Date().toISOString(),
    eventType: SecurityEventType.RATE_LIMIT_EXCEEDED,
    ip: getClientIP(req),
    userAgent: req.get('user-agent') || 'unknown',
    endpoint: req.path,
    method: req.method,
    message: 'Rate limit exceeded',
  });
  res.status(429).json({ error: 'Too many requests. Please try again later.', retryAfter: 900 });
};

export const requestLogger = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const ip = getClientIP(req);

    if (duration > 5000) {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: SecurityEventType.SUSPICIOUS_ACTIVITY,
        ip,
        userAgent: req.get('user-agent') || 'unknown',
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        message: `Slow request detected: ${duration}ms`,
      });
    }

    if (res.statusCode >= 400) {
      const eventType =
        res.statusCode === 401 || res.statusCode === 403
          ? SecurityEventType.UNAUTHORIZED_ACCESS
          : SecurityEventType.API_ERROR;
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType,
        ip,
        userAgent: req.get('user-agent') || 'unknown',
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        userId: (req as any).user?._id?.toString(),
      });
    }
  });

  next();
};

// ── Startup validators ──────────────────────────────────────────────────────
export const validateDatabaseSecurity = (mongoUri: string): void => {
  const isAtlas = mongoUri.includes('mongodb+srv://') || mongoUri.includes('mongodb.net');
  const isLocal = mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1');

  if (process.env.NODE_ENV === 'production') {
    if (isLocal) {
      console.error('❌ SECURITY ERROR: Using localhost MongoDB in production!');
      throw new Error('Insecure database configuration for production');
    }
    if (!isAtlas) {
      console.warn('⚠️  Not using MongoDB Atlas. Ensure the DB is not publicly accessible.');
    }
    if (!mongoUri.includes('@')) {
      console.error('❌ SECURITY ERROR: MongoDB connection string missing authentication!');
      throw new Error('Database connection must use authentication');
    }
    console.log('✅ Database security validation passed');
  }
};

export const validateEnvironmentSecurity = (): void => {
  const requiredSecrets = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'ENCRYPTION_KEY', 'MONGO_URI'];
  const missing = requiredSecrets.filter((k) => !process.env[k]);

  if (missing.length > 0) {
    console.error('❌ SECURITY ERROR: Missing required environment variables:');
    missing.forEach((k) => console.error(`   - ${k}`));
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing required security configuration');
    } else {
      console.warn('⚠️  Continuing with default values (development only)');
      return;
    }
  }

  const weakSecrets = ['secret', 'password', 'test', '123', 'dev', 'default'];
  const secrets = {
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
  };

  for (const [name, value] of Object.entries(secrets)) {
    if (value.length < 32) {
      console.warn(`⚠️  ${name} is too short (minimum 32 characters recommended)`);
    }
    if (weakSecrets.some((w) => value.toLowerCase().includes(w))) {
      console.warn(`⚠️  ${name} may contain a weak/default value`);
    }
  }
  console.log('✅ Environment security validation passed');
};

// ── Error handler ───────────────────────────────────────────────────────────
export const errorHandler = (
  err: any,
  req: express.Request,
  res: express.Response,
  _next: express.NextFunction
): void => {
  logAPIError(req, err, err.status || 500);

  const isDevelopment = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    error: isDevelopment ? err.message : 'An unexpected error occurred',
    ...(isDevelopment && err.stack ? { stack: err.stack } : {}),
  });
};
