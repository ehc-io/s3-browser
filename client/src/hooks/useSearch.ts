import { useQuery } from '@tanstack/react-query';
import { searchFiles } from '../api/s3Api';

export function useSearch(bucket: string | null, query: string, limit: number = 50) {
  return useQuery({
    queryKey: ['search', bucket, query, limit],
    queryFn: () => searchFiles(bucket!, query, limit),
    enabled: !!bucket && query.length >= 2, // Min 2 chars to trigger search
    staleTime: 1000 * 60, // 1 minute cache
  });
}
