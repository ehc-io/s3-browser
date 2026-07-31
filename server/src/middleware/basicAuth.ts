import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';

const REALM = 'S3 Browser';

// Constant-time comparison that does not leak length via early return
function safeEqual(a: string, b: string): boolean {
  const aHash = crypto.createHash('sha256').update(a).digest();
  const bHash = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(aHash, bHash);
}

function unauthorized(res: Response): void {
  res.set('WWW-Authenticate', `Basic realm="${REALM}", charset="UTF-8"`);
  res.status(401).json({
    error: 'Unauthorized',
    message: 'Valid credentials are required.',
    statusCode: 401,
  });
}

export const authEnabled = Boolean(env.S3BROWSER_AUTH_USER && env.S3BROWSER_AUTH_PASSWORD);

export function basicAuth(req: Request, res: Response, next: NextFunction): void {
  // Auth is opt-in: with no credentials configured the app behaves as before.
  if (!authEnabled) return next();

  // Keep the health endpoint open so the container healthcheck works.
  if (req.path === '/api/health') return next();

  const header = req.headers.authorization;
  if (!header?.startsWith('Basic ')) return unauthorized(res);

  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const separator = decoded.indexOf(':');
  if (separator === -1) return unauthorized(res);

  const user = decoded.slice(0, separator);
  const password = decoded.slice(separator + 1);

  // Both comparisons always run so a wrong username costs the same as a wrong password.
  const userOk = safeEqual(user, env.S3BROWSER_AUTH_USER!);
  const passwordOk = safeEqual(password, env.S3BROWSER_AUTH_PASSWORD!);

  if (!userOk || !passwordOk) return unauthorized(res);

  next();
}
