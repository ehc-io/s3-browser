import { useBrowserStore } from '../../store/browserStore';
import { useFiles } from '../../hooks/useFiles';
import { Breadcrumbs } from './Breadcrumbs';
import { Toolbar } from './Toolbar';
import { FileTable } from './FileTable';
import { Pagination } from './Pagination';
import { EmptyState } from '../common/EmptyState';
import { Skeleton } from '../common/Skeleton';
import { FolderOpen } from '@phosphor-icons/react';

export function FileBrowser() {
  const { currentBucket, currentPrefix, continuationToken, goToNextPage, goToPreviousPage, previousTokens, pageSize, setPageSize } =
    useBrowserStore();

  const { data, isLoading, error } = useFiles(
    currentBucket,
    currentPrefix,
    continuationToken,
    pageSize
  );

  // No bucket selected
  if (!currentBucket) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          icon={FolderOpen}
          title="Select a bucket"
          description="Choose a bucket from the sidebar to browse its contents"
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with breadcrumbs and toolbar */}
      <div className="flex-shrink-0 border-b border-border-light dark:border-border-dark">
        <Breadcrumbs />
        <Toolbar />
      </div>

      {/* File list */}
      <div className="flex-1 overflow-auto">
        {isLoading && (
          <div className="p-4 space-y-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        )}

        {error && (
          <div className="p-4">
            <div className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error.message}
            </div>
          </div>
        )}

        {data && <FileTable folders={data.folders} files={data.files} />}
      </div>

      {/* Pagination */}
      {data && (data.isTruncated || previousTokens.length > 0) && (
        <div className="flex-shrink-0 border-t border-border-light dark:border-border-dark">
          <Pagination
            hasNext={data.isTruncated}
            hasPrevious={previousTokens.length > 0}
            onNext={() => data.nextContinuationToken && goToNextPage(data.nextContinuationToken)}
            onPrevious={goToPreviousPage}
            pageNumber={previousTokens.length + 1}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}
    </div>
  );
}
