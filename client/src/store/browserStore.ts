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
  previousTokens: (string | undefined)[];
  pageSize: number;

  // Search state
  searchQuery: string;
  searchResults: S3Object[] | null;

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
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: S3Object[] | null) => void;
  clearSearch: () => void;
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
  searchQuery: '',
  searchResults: null,

  // Actions
  setBucket: (bucket) =>
    set({
      currentBucket: bucket,
      currentPrefix: '',
      selectedFile: null,
      continuationToken: undefined,
      previousTokens: [],
      searchQuery: '',
      searchResults: null,
    }),

  setPrefix: (prefix) =>
    set({
      currentPrefix: prefix,
      selectedFile: null,
      continuationToken: undefined,
      previousTokens: [],
      searchQuery: '',
      searchResults: null,
    }),

  navigateToFolder: (folderKey) =>
    set({
      currentPrefix: folderKey,
      selectedFile: null,
      continuationToken: undefined,
      previousTokens: [],
      searchQuery: '',
      searchResults: null,
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
      // Always push current token (even undefined for page 1) to enable going back
      previousTokens: [...previousTokens, continuationToken],
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

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSearchResults: (results) => set({ searchResults: results }),

  clearSearch: () =>
    set({
      searchQuery: '',
      searchResults: null,
    }),
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
