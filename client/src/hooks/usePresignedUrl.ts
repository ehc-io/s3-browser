import { useQuery } from '@tanstack/react-query';
import { fetchPresignedUrl } from '../api/s3Api';

export function usePresignedUrl(bucket: string | null, key: string | null) {
  return useQuery({
    queryKey: ['presign', bucket, key],
    queryFn: () => fetchPresignedUrl(bucket!, key!),
    enabled: !!bucket && !!key,
    staleTime: 1000 * 60 * 10, // 10 minutes (shorter than TTL)
  });
}
