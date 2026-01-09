import { create } from 'zustand';
import type { S3Object } from '@s3-browser/shared';

type Theme = 'light' | 'dark' | 'system';
export type SortField = 'name' | 'lastModified' | 'size';
export type SortDirection = 'asc' | 'desc';

interface BrowserState {
  // Navigation state
  currentBucket: string | null;
  currentPrefix: string;
  selectedFile: S3Object | null;

  // UI state
  theme: Theme;

  // Sort state
  sortField: SortField;
  sortDirection: SortDirection;

  // Inspector panel state
  inspectorWidth: number;

  // Pagination
  continuationToken: string | undefined;
  previousTokens: string[];
  pageSize: number;

  // Actions
  setBucket: (bucket: string | null) => void;
  setPrefix: (prefix: string) => void;
  navigateToFolder: (folderKey: string) => void;
  navigateUp: () => void;
  selectFile: (file: S3Object | null) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setContinuationToken: (token: string | undefined) => void;
  goToNextPage: (nextToken: string) => void;
  goToPreviousPage: () => void;
  resetPagination: () => void;
  setSortField: (field: SortField) => void;
  toggleSortDirection: () => void;
  setInspectorWidth: (width: number) => void;
  setPageSize: (size: number) => void;
}

export const useBrowserStore = create<BrowserState>()((set, get) => ({
  // Initial state
  currentBucket: null,
  currentPrefix: '',
  selectedFile: null,
  theme: 'light',
  sortField: 'lastModified',
  sortDirection: 'desc',
  inspectorWidth: parseInt(localStorage.getItem('s3browser-inspector-width') || '320', 10),
  continuationToken: undefined,
  previousTokens: [],
  pageSize: parseInt(localStorage.getItem('s3browser-page-size') || '10', 10),

  // Actions
  setBucket: (bucket) =>
    set({
      currentBucket: bucket,
      currentPrefix: '',
      selectedFile: null,
      continuationToken: undefined,
      previousTokens: [],
    }),

  setPrefix: (prefix) =>
    set({
      currentPrefix: prefix,
      selectedFile: null,
      continuationToken: undefined,
      previousTokens: [],
    }),

  navigateToFolder: (folderKey) =>
    set({
      currentPrefix: folderKey,
      selectedFile: null,
      continuationToken: undefined,
      previousTokens: [],
    }),

  navigateUp: () => {
    const { currentPrefix } = get();
    if (!currentPrefix) return;

    // Remove trailing slash and get parent path
    const trimmed = currentPrefix.replace(/\/$/, '');
    const lastSlash = trimmed.lastIndexOf('/');
    const newPrefix = lastSlash >= 0 ? trimmed.slice(0, lastSlash + 1) : '';

    set({
      currentPrefix: newPrefix,
      selectedFile: null,
      continuationToken: undefined,
      previousTokens: [],
    });
  },

  selectFile: (file) => set({ selectedFile: file }),

  setTheme: (theme) => set({ theme }),

  toggleTheme: () => {
    const { theme } = get();
    const newTheme: Theme =
      theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    set({ theme: newTheme });
  },

  setContinuationToken: (token) => set({ continuationToken: token }),

  goToNextPage: (nextToken) => {
    const { continuationToken, previousTokens } = get();
    set({
      previousTokens: continuationToken
        ? [...previousTokens, continuationToken]
        : previousTokens,
      continuationToken: nextToken,
    });
  },

  goToPreviousPage: () => {
    const { previousTokens } = get();
    if (previousTokens.length === 0) {
      set({ continuationToken: undefined });
      return;
    }

    const newPreviousTokens = [...previousTokens];
    const previousToken = newPreviousTokens.pop();
    set({
      previousTokens: newPreviousTokens,
      continuationToken: previousToken,
    });
  },

  resetPagination: () =>
    set({
      continuationToken: undefined,
      previousTokens: [],
    }),

  setSortField: (field) => set({ sortField: field }),

  toggleSortDirection: () =>
    set((state) => ({
      sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc',
    })),

  setInspectorWidth: (width) => {
    localStorage.setItem('s3browser-inspector-width', width.toString());
    set({ inspectorWidth: width });
  },

  setPageSize: (size) => {
    localStorage.setItem('s3browser-page-size', size.toString());
    set({
      pageSize: size,
      continuationToken: undefined,
      previousTokens: [],
    });
  },
}));

// Derived selectors
export const useBreadcrumbs = () => {
  const { currentBucket, currentPrefix } = useBrowserStore();

  if (!currentBucket) return [];

  const segments = currentPrefix
    .split('/')
    .filter(Boolean)
    .map((segment, index, array) => ({
      name: segment,
      prefix: array.slice(0, index + 1).join('/') + '/',
    }));

  return [{ name: currentBucket, prefix: '' }, ...segments];
};
