import { useQuery } from '@tanstack/react-query';
import { fetchBuckets } from '../api/s3Api';

export function useBuckets() {
  return useQuery({
    queryKey: ['buckets'],
    queryFn: fetchBuckets,
  });
}
