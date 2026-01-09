// Bucket types
export interface Bucket {
  name: string;
  creationDate: string;
  region?: string;
}

export interface BucketsResponse {
  buckets: Bucket[];
}

// S3 Object types
export interface S3Object {
  key: string;
  name: string;
  lastModified: string;
  size: number;
  isFolder: boolean;
  etag?: string;
}

export interface FileListResponse {
  folders: S3Object[];
  files: S3Object[];
  nextContinuationToken?: string;
  isTruncated: boolean;
  prefix: string;
  bucket: string;
}

// Search types
export interface SearchResult {
  results: S3Object[];
  totalIndexed: number;
  query: string;
  bucket: string;
}

// Presign types
export interface PresignRequest {
  bucket: string;
  key: string;
}

export interface PresignResponse {
  url: string;
  expiresIn: number;
}

// API Error type
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// File type helpers
export type FileType = 'folder' | 'image' | 'video' | 'audio' | 'document' | 'archive' | 'code' | 'other';

export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
export const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
export const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];
export const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf', '.xls', '.xlsx', '.ppt', '.pptx'];
export const ARCHIVE_EXTENSIONS = ['.zip', '.tar', '.gz', '.rar', '.7z', '.bz2'];
export const CODE_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.go', '.rs', '.json', '.yaml', '.yml', '.html', '.css'];

export function getFileType(filename: string): FileType {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));

  if (IMAGE_EXTENSIONS.includes(ext)) return 'image';
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
  if (AUDIO_EXTENSIONS.includes(ext)) return 'audio';
  if (DOCUMENT_EXTENSIONS.includes(ext)) return 'document';
  if (ARCHIVE_EXTENSIONS.includes(ext)) return 'archive';
  if (CODE_EXTENSIONS.includes(ext)) return 'code';
  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
