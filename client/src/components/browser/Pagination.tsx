import { CaretLeft, CaretRight } from '@phosphor-icons/react';

interface PaginationProps {
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  pageNumber: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

export function Pagination({
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  pageNumber,
  pageSize,
  onPageSizeChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-4 px-4 py-3">
      {/* Page size selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          Show:
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-2 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark bg-surface-primary dark:bg-dark-primary focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark cursor-pointer"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="w-px h-5 bg-border-light dark:bg-border-dark" />

      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark hover:bg-accent-hover-light dark:hover:bg-accent-hover-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <CaretLeft size={16} />
        <span>Previous</span>
      </button>

      <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
        Page {pageNumber}
      </span>

      <button
        onClick={onNext}
        disabled={!hasNext}
        className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-border-light dark:border-border-dark hover:bg-accent-hover-light dark:hover:bg-accent-hover-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span>Next</span>
        <CaretRight size={16} />
      </button>
    </div>
  );
}
