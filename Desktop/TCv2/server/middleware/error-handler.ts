// Final error handlers — register LAST in the middleware chain.
// 1. multerErrorHandler — converts Multer 413/file-type errors into clean JSON
// 2. jsonErrorHandler   — last-resort wrap; ensures we never leak HTML

import express from 'express';
import multer from 'multer';

export const multerErrorHandler = (
  err: any,
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        success: false,
        error: { message: 'File too large (max 20 MB).', code: 'FILE_TOO_LARGE' },
      });
      return;
    }
    res.status(400).json({
      success: false,
      error: { message: err.message, code: err.code || 'UPLOAD_ERROR' },
    });
    return;
  }
  next(err);
};

export const jsonErrorHandler = (
  err: any,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
): void => {
  if (res.headersSent) return;
  const isDev = process.env.NODE_ENV !== 'production';
  const status = err?.status || err?.statusCode || 500;
  console.error('Unhandled error:', err);

  res.status(status).json({
    success: false,
    error: {
      message: isDev ? err?.message || 'Server error' : 'An unexpected error occurred',
      code: err?.code || 'INTERNAL_ERROR',
      ...(isDev && err?.stack ? { stack: err.stack } : {}),
    },
  });
};
