import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getClientForBucket } from './s3.service';
import type { S3Object } from '@s3-browser/shared';

// In-memory index cache
interface IndexEntry {
  objects: S3Object[];
  lastUpdated: Date;
}

const indexCache = new Map<string, IndexEntry>();

// TTL for cache (5 minutes)
const INDEX_TTL_MS = 5 * 60 * 1000;

/**
 * Check if index exists and is still fresh
 */
function isIndexStale(bucket: string): boolean {
  const entry = indexCache.get(bucket);
  if (!entry) return true;

  const age = Date.now() - entry.lastUpdated.getTime();
  return age > INDEX_TTL_MS;
}

/**
 * Build index by recursively listing all objects in bucket
 */
async function buildIndex(bucket: string): Promise<S3Object[]> {
  const objects: S3Object[] = [];
  let continuationToken: string | undefined;

  console.log(`[Search] Building index for bucket: ${bucket}`);
  const startTime = Date.now();

  // Get the appropriate S3 client for this bucket's region
  const client = await getClientForBucket(bucket);

  do {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      ContinuationToken: continuationToken,
      MaxKeys: 1000, // Max allowed by S3
      // No Delimiter - get all objects recursively
    });

    const response = await client.send(command);

    if (response.Contents) {
      for (const item of response.Contents) {
        if (item.Key && !item.Key.endsWith('/')) {
          // Extract filename from full key path
          const name = item.Key.split('/').pop() || item.Key;

          objects.push({
            key: item.Key,
            name,
            size: item.Size || 0,
            lastModified: item.LastModified?.toISOString() || '',
            isFolder: false,
          });
        }
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  const elapsed = Date.now() - startTime;
  console.log(`[Search] Index built for ${bucket}: ${objects.length} objects in ${elapsed}ms`);

  // Cache the index
  indexCache.set(bucket, {
    objects,
    lastUpdated: new Date(),
  });

  return objects;
}

/**
 * Search index with case-insensitive substring match
 */
function searchIndex(bucket: string, query: string, limit: number): S3Object[] {
  const entry = indexCache.get(bucket);
  if (!entry) return [];

  const lowerQuery = query.toLowerCase();

  // Filter and score results
  const matches = entry.objects
    .map((obj) => {
      const lowerName = obj.name.toLowerCase();
      const index = lowerName.indexOf(lowerQuery);

      if (index === -1) return null;

      // Score: exact match = 0, starts with = 1, contains = position + 2
      let score: number;
      if (lowerName === lowerQuery) {
        score = 0; // Exact match
      } else if (index === 0) {
        score = 1; // Starts with
      } else {
        score = index + 2; // Position in string
      }

      return { obj, score };
    })
    .filter((item): item is { obj: S3Object; score: number } => item !== null)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((item) => item.obj);

  return matches;
}

/**
 * Public search function - builds index if needed, then searches
 */
export async function search(
  bucket: string,
  query: string,
  limit: number = 50
): Promise<{
  results: S3Object[];
  totalIndexed: number;
  query: string;
  bucket: string;
}> {
  // Build or refresh index if stale
  if (isIndexStale(bucket)) {
    await buildIndex(bucket);
  }

  const results = searchIndex(bucket, query, limit);
  const entry = indexCache.get(bucket);

  return {
    results,
    totalIndexed: entry?.objects.length || 0,
    query,
    bucket,
  };
}

/**
 * Clear index for a specific bucket (useful after mutations)
 */
export function clearIndex(bucket: string): void {
  indexCache.delete(bucket);
}

/**
 * Clear all indexes
 */
export function clearAllIndexes(): void {
  indexCache.clear();
}
