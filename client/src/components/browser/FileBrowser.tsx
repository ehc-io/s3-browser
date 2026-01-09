import { useEffect } from 'react';
import { useBrowserStore } from '../../store/browserStore';
import { useFiles } from '../../hooks/useFiles';
import { Breadcrumbs } from './Breadcrumbs';
import { Toolbar } from './Toolbar';
import { FileTable } from './FileTable';
import { Pagination } from './Pagination';
import { EmptyState } from '../common/EmptyState';
import { Skeleton } from '../common/Skeleton';
import { FolderOpen, MagnifyingGlass } from '@phosphor-icons/react';

export function FileBrowser() {
  const {
    currentBucket,
    currentPrefix,
    continuationToken,
    goToNextPage,
    goToPreviousPage,
    previousTokens,
    pageSize,
    setPageSize,
    searchQuery,
    searchResults,
    selectFile,
  } = useBrowserStore();

  const { data, isLoading, error } = useFiles(
    currentBucket,
    currentPrefix,
    continuationToken,
    pageSize
  );

  // Handle deep-link file auto-selection
  useEffect(() => {
    const target = window.__deepLinkTarget;
    if (!target || !data) return;

    // Check if we're in the right bucket and prefix
    if (currentBucket !== target.bucket || currentPrefix !== target.prefix) return;

    // Find and select the target file
    if (target.filename) {
      const file = data.files.find((f) => f.name === target.filename);
      if (file) {
        selectFile(file);
        // Clear the target after selection
        delete window.__deepLinkTarget;
      }
    } else {
      // Just navigating to a folder, clear target
      delete window.__deepLinkTarget;
    }
  }, [data, currentBucket, currentPrefix, selectFile]);

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

  // Determine what to display based on search state
  const isSearchActive = searchQuery.length >= 2 && searchResults !== null;
  const displayFiles = isSearchActive ? searchResults : data?.files || [];
  const displayFolders = isSearchActive ? [] : data?.folders || [];

  return (
    <div className="h-full flex flex-col">
      {/* Header with breadcrumbs and toolbar */}
      <div className="flex-shrink-0 border-b border-border-light dark:border-border-dark">
        <Breadcrumbs />
        <Toolbar />
      </div>

      {/* Search results info */}
      {isSearchActive && (
        <div className="flex-shrink-0 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <MagnifyingGlass size={16} />
            <span>
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
            </span>
          </div>
        </div>
      )}

      {/* File list */}
      <div className="flex-1 overflow-auto">
        {isLoading && !isSearchActive && (
          <div className="p-4 space-y-2">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        )}

        {error && !isSearchActive && (
          <div className="p-4">
            <div className="p-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error.message}
            </div>
          </div>
        )}

        {(data || isSearchActive) && (
          <FileTable folders={displayFolders} files={displayFiles} />
        )}

        {/* No search results */}
        {isSearchActive && searchResults.length === 0 && (
          <div className="p-8 text-center">
            <EmptyState
              icon={MagnifyingGlass}
              title="No results found"
              description={`No files matching "${searchQuery}" were found in this bucket`}
            />
          </div>
        )}
      </div>

      {/* Pagination - only show when not searching */}
      {!isSearchActive && data && (data.isTruncated || previousTokens.length > 0) && (
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
