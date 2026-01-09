import { Database } from '@phosphor-icons/react';
import { useBuckets } from '../../hooks/useBuckets';
import { useBrowserStore } from '../../store/browserStore';
import { Skeleton } from '../common/Skeleton';

export function BucketSidebar() {
  const { data, isLoading, error } = useBuckets();
  const { currentBucket, setBucket } = useBrowserStore();

  return (
    <div className="p-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3 px-2">
        Buckets
      </h2>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-9 rounded-lg" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
          {error.message}
        </div>
      )}

      {data && (
        <nav className="space-y-1">
          {data.buckets.length === 0 ? (
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark p-2">
              No buckets available
            </p>
          ) : (
            data.buckets.map((bucket) => (
              <button
                key={bucket.name}
                onClick={() => setBucket(bucket.name)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                  currentBucket === bucket.name
                    ? 'bg-accent-light dark:bg-accent-dark text-white'
                    : 'hover:bg-accent-hover-light dark:hover:bg-accent-hover-dark'
                }`}
              >
                <Database
                  size={18}
                  weight={currentBucket === bucket.name ? 'fill' : 'duotone'}
                  className={currentBucket === bucket.name ? '' : 'text-accent-light dark:text-accent-dark'}
                />
                <span className="truncate">{bucket.name}</span>
              </button>
            ))
          )}
        </nav>
      )}
    </div>
  );
}
