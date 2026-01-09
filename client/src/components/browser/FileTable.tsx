import { useMemo } from 'react';
import type { S3Object } from '@s3-browser/shared';
import { FileRow } from './FileRow';
import { EmptyState } from '../common/EmptyState';
import { FolderDashed } from '@phosphor-icons/react';
import { useBrowserStore, type SortField, type SortDirection } from '../../store/browserStore';

interface FileTableProps {
  folders: S3Object[];
  files: S3Object[];
}

function sortItems(
  items: S3Object[],
  field: SortField,
  direction: SortDirection
): S3Object[] {
  return [...items].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'lastModified':
        const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
        const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
        comparison = dateA - dateB;
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}

export function FileTable({ folders, files }: FileTableProps) {
  const { sortField, sortDirection } = useBrowserStore();

  const sortedItems = useMemo(() => {
    // Folders always come first, then sorted files
    const sortedFolders = sortItems(folders, sortField, sortDirection);
    const sortedFiles = sortItems(files, sortField, sortDirection);
    return [...sortedFolders, ...sortedFiles];
  }, [folders, files, sortField, sortDirection]);

  if (sortedItems.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          icon={FolderDashed}
          title="This folder is empty"
          description="There are no files or folders in this location"
        />
      </div>
    );
  }

  return (
    <div className="min-w-full">
      {/* Table header */}
      <div className="sticky top-0 bg-surface-primary dark:bg-dark-primary border-b border-border-light dark:border-border-dark">
        <div className="grid grid-cols-[1fr_160px_100px_60px] gap-4 px-4 py-2 text-xs font-medium uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
          <div>Name</div>
          <div>Last Modified</div>
          <div>Size</div>
          <div className="text-right">Action</div>
        </div>
      </div>

      {/* Table body */}
      <div className="divide-y divide-border-light dark:divide-border-dark">
        {sortedItems.map((item) => (
          <FileRow key={item.key} item={item} />
        ))}
      </div>
    </div>
  );
}
