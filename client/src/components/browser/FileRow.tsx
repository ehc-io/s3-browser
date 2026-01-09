import { useState } from 'react';
import type { S3Object } from '@s3-browser/shared';
import { formatFileSize, formatDate, getFileType } from '@s3-browser/shared';
import { useBrowserStore } from '../../store/browserStore';
import { FileIcon } from '../icons/FileIcon';
import { Trash } from '@phosphor-icons/react';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { deleteFile } from '../../api/s3Api';
import { useToast } from '../../store/toastStore';
import { useQueryClient } from '@tanstack/react-query';

interface FileRowProps {
  item: S3Object;
}

export function FileRow({ item }: FileRowProps) {
  const { navigateToFolder, selectFile, selectedFile, currentBucket, currentPrefix, continuationToken } =
    useBrowserStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();
  const queryClient = useQueryClient();

  const fileType = item.isFolder ? 'folder' : getFileType(item.name);
  const isSelected = selectedFile?.key === item.key;

  const handleClick = () => {
    if (item.isFolder) {
      navigateToFolder(item.key);
    } else {
      selectFile(item);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentBucket) return;

    setIsDeleting(true);
    try {
      await deleteFile(currentBucket, item.key);
      toast.success(`"${item.name}" deleted successfully`);

      // Clear selection if deleted file was selected
      if (selectedFile?.key === item.key) {
        selectFile(null);
      }

      // Refresh file list
      queryClient.invalidateQueries({
        queryKey: ['files', currentBucket, currentPrefix, continuationToken],
      });
    } catch (error) {
      toast.error(`Failed to delete "${item.name}"`);
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`grid grid-cols-[1fr_160px_100px_60px] gap-4 px-4 py-3 cursor-pointer transition-colors ${
          isSelected
            ? 'bg-accent-hover-light dark:bg-accent-hover-dark'
            : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
        }`}
      >
        {/* Name with icon */}
        <div className="flex items-center gap-3 min-w-0">
          <FileIcon type={fileType} size={20} />
          <span className="truncate">{item.name}</span>
        </div>

        {/* Last Modified */}
        <div className="flex items-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {item.lastModified ? formatDate(item.lastModified) : '-'}
        </div>

        {/* Size */}
        <div className="flex items-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {item.isFolder ? '-' : formatFileSize(item.size)}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end">
          {item.isFolder ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateToFolder(item.key);
              }}
              className="text-sm text-accent-light dark:text-accent-dark hover:underline"
            >
              Open
            </button>
          ) : (
            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="p-1.5 rounded text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
              title="Delete"
            >
              <Trash size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete File"
        message={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}
