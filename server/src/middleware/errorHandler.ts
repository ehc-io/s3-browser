import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@s3-browser/shared';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  // Handle known AppErrors
  if (err instanceof AppError) {
    const response: ApiError = {
      error: err.name,
      message: err.message,
      statusCode: err.statusCode,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle AWS SDK errors
  if (err.name === 'AccessDenied' || err.name === 'AccessDeniedException') {
    const response: ApiError = {
      error: 'AccessDenied',
      message: 'Access denied. Check your AWS credentials and permissions.',
      statusCode: 403,
    };
    res.status(403).json(response);
    return;
  }

  if (err.name === 'NoSuchBucket') {
    const response: ApiError = {
      error: 'NotFound',
      message: 'The specified bucket does not exist.',
      statusCode: 404,
    };
    res.status(404).json(response);
    return;
  }

  if (err.name === 'NoSuchKey') {
    const response: ApiError = {
      error: 'NotFound',
      message: 'The specified object does not exist.',
      statusCode: 404,
    };
    res.status(404).json(response);
    return;
  }

  // Default error response
  const response: ApiError = {
    error: 'InternalError',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message,
    statusCode: 500,
  };
  res.status(500).json(response);
}
