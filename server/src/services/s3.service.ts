import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  GetBucketLocationCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env, bucketAllowlist } from '../config/env';
import { Bucket, S3Object, FileListResponse } from '@s3-browser/shared';

// Credentials for all clients
const credentials = {
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  ...(env.AWS_SESSION_TOKEN && { sessionToken: env.AWS_SESSION_TOKEN }),
};

// Default S3 client (for listing buckets)
const defaultClient = new S3Client({
  region: env.AWS_REGION,
  credentials,
});

// Cache for bucket regions and clients
const bucketRegionCache: Map<string, string> = new Map();
const regionClientCache: Map<string, S3Client> = new Map();

// Get or create an S3 client for a specific region
function getClientForRegion(region: string): S3Client {
  if (!regionClientCache.has(region)) {
    regionClientCache.set(region, new S3Client({ region, credentials }));
  }
  return regionClientCache.get(region)!;
}

// Get bucket region (cached)
async function getBucketRegion(bucket: string): Promise<string> {
  if (bucketRegionCache.has(bucket)) {
    return bucketRegionCache.get(bucket)!;
  }

  try {
    const command = new GetBucketLocationCommand({ Bucket: bucket });
    const response = await defaultClient.send(command);
    // LocationConstraint is null for us-east-1
    const region = response.LocationConstraint || 'us-east-1';
    bucketRegionCache.set(bucket, region);
    return region;
  } catch (error) {
    console.error(`Failed to get region for bucket ${bucket}:`, error);
    return env.AWS_REGION;
  }
}

// Get the appropriate S3 client for a bucket
export async function getClientForBucket(bucket: string): Promise<S3Client> {
  const region = await getBucketRegion(bucket);
  return getClientForRegion(region);
}

export async function listBuckets(): Promise<Bucket[]> {
  const command = new ListBucketsCommand({});
  const response = await defaultClient.send(command);

  const buckets: Bucket[] = (response.Buckets || []).map((bucket) => ({
    name: bucket.Name || '',
    creationDate: bucket.CreationDate?.toISOString() || '',
  }));

  // Filter by allowlist if configured
  if (bucketAllowlist.length > 0) {
    return buckets.filter((b) => bucketAllowlist.includes(b.name));
  }

  return buckets;
}

export async function listObjects(
  bucket: string,
  prefix: string = '',
  continuationToken?: string,
  maxKeys: number = 100
): Promise<FileListResponse> {
  const client = await getClientForBucket(bucket);
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    Delimiter: '/',
    ContinuationToken: continuationToken,
    MaxKeys: maxKeys,
  });

  const response = await client.send(command);

  // Process folders (CommonPrefixes)
  const folders: S3Object[] = (response.CommonPrefixes || []).map((cp) => {
    const fullPath = cp.Prefix || '';
    const name = fullPath.slice(prefix.length).replace(/\/$/, '');
    return {
      key: fullPath,
      name,
      lastModified: '',
      size: 0,
      isFolder: true,
    };
  });

  // Process files (Contents) - exclude the prefix itself
  const files: S3Object[] = (response.Contents || [])
    .filter((obj) => obj.Key !== prefix && obj.Key !== prefix + '/')
    .map((obj) => {
      const fullPath = obj.Key || '';
      const name = fullPath.slice(prefix.length);
      return {
        key: fullPath,
        name,
        lastModified: obj.LastModified?.toISOString() || '',
        size: obj.Size || 0,
        isFolder: false,
        etag: obj.ETag,
      };
    });

  return {
    folders,
    files,
    nextContinuationToken: response.NextContinuationToken,
    isTruncated: response.IsTruncated || false,
    prefix,
    bucket,
  };
}

export async function getPresignedUrl(
  bucket: string,
  key: string
): Promise<{ url: string; expiresIn: number }> {
  const client = await getClientForBucket(bucket);
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const expiresIn = env.S3BROWSER_PRESIGN_TTL_SECONDS;
  const url = await getSignedUrl(client, command, { expiresIn });

  return { url, expiresIn };
}

export async function deleteObject(bucket: string, key: string): Promise<void> {
  const client = await getClientForBucket(bucket);
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await client.send(command);
}
