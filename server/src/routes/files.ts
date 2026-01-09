import { Router } from 'express';
import { z } from 'zod';
import { listObjects, deleteObject } from '../services/s3.service';
import { isBucketAllowed } from '../config/env';
import { AppError } from '../middleware/errorHandler';

export const filesRouter = Router();

const querySchema = z.object({
  bucket: z.string().min(1, 'bucket is required'),
  prefix: z.string().optional().default(''),
  continuationToken: z.string().optional(),
  maxKeys: z.coerce.number().min(1).max(1000).optional().default(100),
});

filesRouter.get('/', async (req, res, next) => {
  try {
    const parsed = querySchema.safeParse(req.query);

    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0].message, 400);
    }

    const { bucket, prefix, continuationToken, maxKeys } = parsed.data;

    // Security: Validate bucket is in allowlist
    if (!isBucketAllowed(bucket)) {
      throw new AppError('Access to this bucket is not allowed', 403);
    }

    const result = await listObjects(bucket, prefix, continuationToken, maxKeys);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// DELETE endpoint for deleting files
const deleteBodySchema = z.object({
  bucket: z.string().min(1, 'bucket is required'),
  key: z.string().min(1, 'key is required'),
});

filesRouter.delete('/', async (req, res, next) => {
  try {
    const parsed = deleteBodySchema.safeParse(req.body);

    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0].message, 400);
    }

    const { bucket, key } = parsed.data;

    // Security: Validate bucket is in allowlist
    if (!isBucketAllowed(bucket)) {
      throw new AppError('Access to this bucket is not allowed', 403);
    }

    await deleteObject(bucket, key);
    res.json({ success: true, message: 'Object deleted successfully' });
  } catch (error) {
    next(error);
  }
});
