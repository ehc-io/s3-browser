import { useEffect, useRef } from 'react';
import { useBrowserStore } from '../store/browserStore';
import { searchFiles } from '../api/s3Api';
import type { S3Object } from '@s3-browser/shared';

/**
 * Hook that handles deep-link file selection with cross-page lookup.
 *
 * When a deep-link targets a file (e.g., /?uri=s3://bucket/folder/file.jpg),
 * this hook:
 * 1. First tries to find the file on the current page
 * 2. If not found, uses the search API to find it across all pages
 * 3. Selects the file for preview in the inspector panel
 */
export function useDeepLinkFileSearch(
  currentPageFiles: S3Object[] | undefined,
  isLoading: boolean
) {
  const hasAttemptedSearch = useRef(false);
  const { currentBucket, currentPrefix, selectFile } = useBrowserStore();

  useEffect(() => {
    const target = window.__deepLinkTarget;

    // Skip if no target, still loading, or already searched
    if (!target || isLoading || hasAttemptedSearch.current) return;

    // Skip if wrong bucket/prefix
    if (currentBucket !== target.bucket || currentPrefix !== target.prefix) return;

    // Skip if no filename (folder navigation only)
    if (!target.filename) {
      delete window.__deepLinkTarget;
      return;
    }

    // Check if file is on current page
    const fileOnPage = currentPageFiles?.find((f) => f.name === target.filename);
    if (fileOnPage) {
      selectFile(fileOnPage);
      delete window.__deepLinkTarget;
      console.log('[DeepLink] File found on current page:', fileOnPage.key);
      return;
    }

    // File not on current page - search for it
    hasAttemptedSearch.current = true;
    console.log('[DeepLink] File not on current page, searching...', target.fullKey);

    searchFiles(currentBucket, target.filename, 50)
      .then((response) => {
        // Find exact match by full key
        const exactMatch = response.results.find((f) => f.key === target.fullKey);

        if (exactMatch) {
          selectFile(exactMatch);
          console.log('[DeepLink] File found via search:', exactMatch.key);
        } else {
          console.warn('[DeepLink] File not found:', target.fullKey);
        }

        delete window.__deepLinkTarget;
      })
      .catch((err) => {
        console.error('[DeepLink] Search failed:', err);
        delete window.__deepLinkTarget;
      });
  }, [currentPageFiles, isLoading, currentBucket, currentPrefix, selectFile]);
}
