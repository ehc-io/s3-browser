import { useQuery } from '@tanstack/react-query';
import { fetchFiles } from '../api/s3Api';

export function useFiles(
  bucket: string | null,
  prefix: string,
  continuationToken?: string,
  pageSize: number = 10
) {
  return useQuery({
    queryKey: ['files', bucket, prefix, continuationToken, pageSize],
    queryFn: () => fetchFiles(bucket!, prefix, continuationToken, pageSize),
    enabled: !!bucket,
  });
}
