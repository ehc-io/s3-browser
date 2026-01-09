import type {
  BucketsResponse,
  FileListResponse,
  PresignResponse,
  ApiError,
} from '@s3-browser/shared';

const API_BASE = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: 'NetworkError',
      message: 'Failed to connect to server',
      statusCode: response.status,
    }));
    throw new Error(error.message);
  }
  return response.json();
}

export async function fetchBuckets(): Promise<BucketsResponse> {
  const response = await fetch(`${API_BASE}/buckets`);
  return handleResponse<BucketsResponse>(response);
}

export async function fetchFiles(
  bucket: string,
  prefix: string = '',
  continuationToken?: string,
  maxKeys: number = 10
): Promise<FileListResponse> {
  const params = new URLSearchParams({ bucket, prefix, maxKeys: maxKeys.toString() });
  if (continuationToken) {
    params.append('continuationToken', continuationToken);
  }

  const response = await fetch(`${API_BASE}/files?${params}`);
  return handleResponse<FileListResponse>(response);
}

export async function fetchPresignedUrl(
  bucket: string,
  key: string
): Promise<PresignResponse> {
  const response = await fetch(`${API_BASE}/presign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket, key }),
  });
  return handleResponse<PresignResponse>(response);
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export async function deleteFile(
  bucket: string,
  key: string
): Promise<DeleteResponse> {
  const response = await fetch(`${API_BASE}/files`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bucket, key }),
  });
  return handleResponse<DeleteResponse>(response);
}
