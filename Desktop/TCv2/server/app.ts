// Express application setup.
// Composes the middleware chain and mounts every router from routes/index.ts.
// This file *creates* the app but does NOT start the listener — that's index.ts.

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import { env } from './config/env.js';
import { UPLOADS_DIR } from './middleware/upload.js';
import {
  enforceHTTPS,
  securityHeaders,
  suspiciousActivityDetector,
  requestLogger,
} from './middleware/security.js';
import { checkDatabaseConnection } from './middleware/db-check.js';
import { globalLimiter } from './config/rate-limits.js';
import { registerRoutes } from './routes/index.js';
import { multerErrorHandler, jsonErrorHandler } from './middleware/error-handler.js';

export const createApp = (): express.Express => {
  const app = express();

  // ── 1. Security gate ───────────────────────────────────────────────────
  app.use(enforceHTTPS);
  app.use(
    cors({
      origin: true,
      credentials: true,
      exposedHeaders: ['Content-Length', 'Content-Type'],
    })
  );
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    })
  );
  app.use(securityHeaders);
  app.use(globalLimiter);

  // ── 2. Observability ───────────────────────────────────────────────────
  app.use(requestLogger);
  app.use(suspiciousActivityDetector);

  // Lightweight request-timing log for /api/* requests
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (req.path.startsWith('/api/')) {
        const emoji = duration > 1000 ? '🐌' : duration > 300 ? '⚠️' : '⚡';
        console.log(`${emoji} ${req.method} ${req.path} — ${duration}ms`);
      }
    });
    next();
  });

  // ── 3. Body parsing + compression ──────────────────────────────────────
  app.use(
    compression({
      filter: (req, res) => (req.headers['x-no-compression'] ? false : compression.filter(req, res)),
      level: 6,
    })
  );
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // ── 4. Static uploads (with CORS headers) ──────────────────────────────
  app.use(
    '/uploads',
    (_req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
    express.static(UPLOADS_DIR)
  );

  // ── 5. DB readiness gate (skips /api/health) ───────────────────────────
  app.use(checkDatabaseConnection);

  // ── 6. Mount every router ──────────────────────────────────────────────
  registerRoutes(app);

  // ── 7. Error handlers — last in the chain ──────────────────────────────
  app.use(multerErrorHandler);
  app.use(jsonErrorHandler);

  return app;
};

// Default export for Vercel + scripts that import the app directly.
const app = createApp();
export default app;
