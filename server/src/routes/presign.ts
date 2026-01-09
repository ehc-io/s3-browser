import { Router } from 'express';
import { z } from 'zod';
import { getPresignedUrl } from '../services/s3.service';
import { isBucketAllowed } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { PresignResponse } from '@s3-browser/shared';

export const presignRouter = Router();

const bodySchema = z.object({
  bucket: z.string().min(1, 'bucket is required'),
  key: z.string().min(1, 'key is required'),
});

presignRouter.post('/', async (req, res, next) => {
  try {
    const parsed = bodySchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0].message, 400);
    }

    const { bucket, key } = parsed.data;

    // Security: Validate bucket is in allowlist (per CLAUDE.md)
    if (!isBucketAllowed(bucket)) {
      throw new AppError('Access to this bucket is not allowed', 403);
    }

    const { url, expiresIn } = await getPresignedUrl(bucket, key);
    const response: PresignResponse = { url, expiresIn };
    res.json(response);
  } catch (error) {
    next(error);
  }
});
