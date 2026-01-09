import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlass, SortAscending, SortDescending, CaretDown, X, CircleNotch } from '@phosphor-icons/react';
import { useBrowserStore, type SortField } from '../../store/browserStore';
import { useSearch } from '../../hooks/useSearch';
import { useDebounce } from '../../hooks/useDebounce';

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'lastModified', label: 'Last Modified' },
  { value: 'size', label: 'Size' },
];

export function Toolbar() {
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const {
    sortField,
    sortDirection,
    setSortField,
    toggleSortDirection,
    currentBucket,
    searchQuery,
    setSearchQuery,
    setSearchResults,
    clearSearch,
  } = useBrowserStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search query (300ms)
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Search hook
  const { data: searchData, isLoading: isSearching } = useSearch(currentBucket, debouncedQuery);

  // Update search results when data changes
  useEffect(() => {
    if (searchData) {
      setSearchResults(searchData.results);
    } else if (!debouncedQuery) {
      setSearchResults(null);
    }
  }, [searchData, debouncedQuery, setSearchResults]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSortLabel = sortOptions.find((opt) => opt.value === sortField)?.label || 'Sort';
  const SortIcon = sortDirection === 'asc' ? SortAscending : SortDescending;

  return (
    <div className="flex items-center justify-between px-4 py-2 gap-4">
      <div className="flex items-center gap-2">
        {/* Sort dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark hover:bg-accent-hover-light dark:hover:bg-accent-hover-dark transition-colors"
          >
            <SortIcon size={16} />
            <span>Sort: {currentSortLabel}</span>
            <CaretDown size={12} className={`transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {sortDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-surface-primary dark:bg-dark-secondary border border-border-light dark:border-border-dark rounded-lg shadow-lg z-50">
              {/* Sort field options */}
              <div className="p-1 border-b border-border-light dark:border-border-dark">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortField(option.value);
                      setSortDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-accent-hover-light dark:hover:bg-accent-hover-dark ${
                      sortField === option.value ? 'bg-accent-hover-light dark:bg-accent-hover-dark font-medium' : ''
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {/* Sort direction toggle */}
              <div className="p-1">
                <button
                  onClick={() => {
                    toggleSortDirection();
                    setSortDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent-hover-light dark:hover:bg-accent-hover-dark flex items-center gap-2"
                >
                  {sortDirection === 'asc' ? <SortAscending size={16} /> : <SortDescending size={16} />}
                  {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative flex-shrink-0 w-64">
        <MagnifyingGlass
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark"
        />
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-8 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark bg-surface-primary dark:bg-dark-primary focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark"
        />
        {/* Loading indicator or clear button */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <CircleNotch size={16} className="animate-spin text-accent-light dark:text-accent-dark" />
          ) : searchQuery ? (
            <button
              onClick={clearSearch}
              className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Clear search"
            >
              <X size={14} className="text-text-secondary-light dark:text-text-secondary-dark" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
