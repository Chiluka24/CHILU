// Database-readiness gate: returns 503 if MongoDB isn't connected for any /api/* request.
// The /api/health route is excluded so health checks still pass while the DB is down.

import express from 'express';
import mongoose from 'mongoose';
import { connectToDatabase } from '../config/database.js';

export const checkDatabaseConnection = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  if (req.path === '/api/health') return next();
  if (!req.path.startsWith('/api/')) return next();

  if (mongoose.connection.readyState !== 1) {
    try {
      await connectToDatabase();
    } catch (err) {
      res.status(503).json({
        success: false,
        error: { message: 'Database is unavailable. Please try again.', code: 'DB_UNAVAILABLE' },
      });
      return;
    }
  }
  next();
};
