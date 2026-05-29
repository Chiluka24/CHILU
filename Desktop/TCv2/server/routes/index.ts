// Central router registry.
// app.ts calls registerRoutes(app) once — every domain router is mounted here
// at its base path. Adding a new domain = 2 lines in this file.

import type { Express } from 'express';

import health from './health.routes.js';
import auth from './auth.routes.js';
import publicRouter from './public.routes.js';
import webhooks from './webhooks.routes.js';
import honeypot from './honeypot.routes.js';
import instagram from './instagram.routes.js';
import uploads from './uploads.routes.js';
import users from './users.routes.js';
import leads from './leads.routes.js';
import links from './links.routes.js';
import analytics from './analytics.routes.js';
import ads from './ads.routes.js';
import automations from './automations.routes.js';

export const registerRoutes = (app: Express): void => {
  // Health (no auth, no DB-check)
  app.use('/api', health);

  // Public, unauthenticated
  app.use('/api/auth', auth);
  app.use('/api/public', publicRouter);
  app.use('/api/webhooks', webhooks);
  app.use('/api', honeypot);

  // Authenticated (each router applies its own `authenticateToken`)
  app.use('/api/instagram', instagram);
  app.use('/api/user', uploads);   // upload endpoints live under /api/user/*
  app.use('/api/user', users);
  app.use('/api/leads', leads);
  app.use('/api/links', links);
  app.use('/api', analytics);      // /api/dashboard + /api/analytics
  app.use('/api/ads', ads);
  app.use('/api/automations', automations);
};
