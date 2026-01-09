export interface ParsedS3Uri {
  bucket: string;
  prefix: string; // Parent folder path (empty string if root)
  filename: string; // Just the filename (empty string if folder URI)
  fullKey: string; // Full object key (prefix + filename)
}

/**
 * Parse an S3 URI into its components
 * Examples:
 *   s3://bucket/folder/file.jpg -> { bucket: "bucket", prefix: "folder/", filename: "file.jpg", fullKey: "folder/file.jpg" }
 *   s3://bucket/folder/         -> { bucket: "bucket", prefix: "folder/", filename: "", fullKey: "folder/" }
 *   s3://bucket/file.jpg        -> { bucket: "bucket", prefix: "", filename: "file.jpg", fullKey: "file.jpg" }
 *   s3://bucket                  -> { bucket: "bucket", prefix: "", filename: "", fullKey: "" }
 */
export function parseS3Uri(uri: string): ParsedS3Uri | null {
  // Match s3:// protocol
  const match = uri.match(/^s3:\/\/([^/]+)(\/.*)?$/);
  if (!match) return null;

  const bucket = match[1];
  const path = match[2]?.slice(1) || ''; // Remove leading slash

  // If path ends with / or is empty, it's a folder
  if (path === '' || path.endsWith('/')) {
    return { bucket, prefix: path, filename: '', fullKey: path };
  }

  // Extract prefix (parent folder) and filename
  const lastSlash = path.lastIndexOf('/');
  if (lastSlash === -1) {
    // File in root
    return { bucket, prefix: '', filename: path, fullKey: path };
  }

  const prefix = path.slice(0, lastSlash + 1); // Include trailing slash
  const filename = path.slice(lastSlash + 1);
  return { bucket, prefix, filename, fullKey: path };
}
