// GET /api/health — DB readiness + env preview. No auth, skips DB-check middleware.

import { Router } from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectToDatabase } from '../config/database.js';

const router = Router();

router.get('/health', async (_req, res) => {
  let dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  if (dbStatus === 'disconnected') {
    try {
      await connectToDatabase();
      dbStatus = 'connected';
    } catch (e) {
      console.error('Health check connection attempt failed:', e);
    }
  }

  res.json({
    status: 'ok',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    mongoUri: env.MONGO_URI ? 'configured' : 'missing',
    mongoUriPreview: env.MONGO_URI ? env.MONGO_URI.substring(0, 50) + '...' : 'not set',
    mongoUriHasDbName: env.MONGO_URI ? env.MONGO_URI.includes('/crumb_db') : false,
    jwtSecret: env.JWT_SECRET ? 'configured' : 'missing',
    dbName: mongoose.connection.name || 'not connected',
  });
});

export default router;
