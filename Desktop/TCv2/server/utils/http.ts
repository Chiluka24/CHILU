// Standardized JSON response envelopes used by every route.
// Keeps API responses uniform: { success, data, meta } or { success, error }.

import express from 'express';

export const sendSuccess = (
  res: express.Response,
  data: any,
  meta: Record<string, any> = {}
) => res.json({ success: true, data, meta });

export const sendError = (
  res: express.Response,
  status: number,
  message: string,
  code = 'REQUEST_FAILED',
  details?: any
) =>
  res.status(status).json({
    success: false,
    error: { message, code, ...(details ? { details } : {}) },
  });
