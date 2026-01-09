import { Router } from 'express';
import { z } from 'zod';
import { search } from '../services/search.service';
import { isBucketAllowed } from '../config/env';
import { AppError } from '../middleware/errorHandler';

export const searchRouter = Router();

const querySchema = z.object({
  bucket: z.string().min(1, 'bucket is required'),
  query: z.string().min(1, 'query is required'),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
});

searchRouter.get('/', async (req, res, next) => {
  try {
    const parsed = querySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0].message, 400);
    }

    const { bucket, query, limit } = parsed.data;

    // Security: Validate bucket is in allowlist
    if (!isBucketAllowed(bucket)) {
      throw new AppError('Access to this bucket is not allowed', 403);
    }

    const results = await search(bucket, query, limit);
    res.json(results);
  } catch (error) {
    next(error);
  }
});
