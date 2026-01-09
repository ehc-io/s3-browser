import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  // Required AWS credentials
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
  AWS_REGION: z.string().default('us-east-1'),

  // Optional AWS
  AWS_SESSION_TOKEN: z.string().optional(),

  // App configuration
  S3BROWSER_BUCKET_ALLOWLIST: z.string().optional(),
  S3BROWSER_PRESIGN_TTL_SECONDS: z.coerce.number().default(900),
  PORT: z.coerce.number().default(3001),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

// Parse bucket allowlist into array
export const bucketAllowlist: string[] = env.S3BROWSER_BUCKET_ALLOWLIST
  ? env.S3BROWSER_BUCKET_ALLOWLIST.split(',').map((b) => b.trim()).filter(Boolean)
  : [];

export function isBucketAllowed(bucketName: string): boolean {
  // If no allowlist is configured, all buckets are allowed
  if (bucketAllowlist.length === 0) return true;
  return bucketAllowlist.includes(bucketName);
}
