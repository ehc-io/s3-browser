import { Router } from 'express';
import { listBuckets } from '../services/s3.service';
import { BucketsResponse } from '@s3-browser/shared';

export const bucketsRouter = Router();

bucketsRouter.get('/', async (req, res, next) => {
  try {
    const buckets = await listBuckets();
    const response: BucketsResponse = { buckets };
    res.json(response);
  } catch (error) {
    next(error);
  }
});
