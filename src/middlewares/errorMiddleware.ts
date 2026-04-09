import { AppError } from '../utils/appError.js';
import type { Request, Response, NextFunction } from 'express';

/**
 * Global error handling middleware.
 * Must be registered last in Express (after all routes).
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : (err.statusCode || 500);
  const message = err.message || 'An unexpected error occurred';
  const status = err.status || 'Internal Server Error';

  console.error(`[API Error] ${statusCode}: ${message}`);

  res.status(statusCode).json({
    status,
    message,
    ...(err.details && { details: err.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
