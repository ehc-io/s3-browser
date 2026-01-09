import { X, DownloadSimple, Copy } from '@phosphor-icons/react';
import { useBrowserStore } from '../../store/browserStore';
import { usePresignedUrl } from '../../hooks/usePresignedUrl';
import { formatFileSize, formatDate, getFileType } from '@s3-browser/shared';
import { FilePreview } from './FilePreview';
import { FileIcon } from '../icons/FileIcon';
import { Skeleton } from '../common/Skeleton';
import { useToast } from '../../store/toastStore';

export function InspectorPanel() {
  const { selectedFile, selectFile, currentBucket } = useBrowserStore();
  const { data: presignData, isLoading: presignLoading } = usePresignedUrl(
    currentBucket,
    selectedFile?.key ?? null
  );
  const toast = useToast();

  if (!selectedFile) return null;

  const fileType = getFileType(selectedFile.name);

  const handleDownload = () => {
    if (presignData?.url) {
      window.open(presignData.url, '_blank');
    }
  };

  const handleCopyUri = async () => {
    const uri = `s3://${currentBucket}/${selectedFile.key}`;
    try {
      // Try modern clipboard API first (requires HTTPS or localhost)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(uri);
      } else {
        // Fallback for HTTP: use textarea + execCommand
        const textArea = document.createElement('textarea');
        textArea.value = uri;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      toast.success('S3 URI copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
      console.error('Clipboard error:', err);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-light dark:border-border-dark">
        <h3 className="font-medium truncate pr-2">{selectedFile.name}</h3>
        <button
          onClick={() => selectFile(null)}
          className="p-1 rounded hover:bg-accent-hover-light dark:hover:bg-accent-hover-dark transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1 p-4 overflow-hidden">
        {presignLoading ? (
          <Skeleton className="w-full h-48 rounded-lg" />
        ) : presignData?.url ? (
          <FilePreview
            type={fileType}
            url={presignData.url}
            filename={selectedFile.name}
          />
        ) : (
          <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-slate-800 rounded-lg">
            <FileIcon type={fileType} size={64} />
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="p-4 border-t border-border-light dark:border-border-dark space-y-3">
        <div className="flex items-center gap-3">
          <FileIcon type={fileType} size={24} />
          <span className="text-sm font-medium truncate">{selectedFile.name}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-text-secondary-light dark:text-text-secondary-dark">
            Modified
          </div>
          <div>{selectedFile.lastModified ? formatDate(selectedFile.lastModified) : '-'}</div>

          <div className="text-text-secondary-light dark:text-text-secondary-dark">
            Size
          </div>
          <div>{formatFileSize(selectedFile.size)}</div>

          <div className="text-text-secondary-light dark:text-text-secondary-dark">
            Type
          </div>
          <div className="capitalize">{fileType}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-border-light dark:border-border-dark flex gap-2">
        <button
          onClick={handleDownload}
          disabled={!presignData?.url}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent-light dark:bg-accent-dark text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <DownloadSimple size={18} weight="bold" />
          <span>Download</span>
        </button>

        <button
          onClick={handleCopyUri}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-border-light dark:border-border-dark rounded-lg hover:bg-accent-hover-light dark:hover:bg-accent-hover-dark transition-colors"
          title="Copy S3 URI"
        >
          <Copy size={18} />
          <span className="hidden sm:inline">Copy S3 URI</span>
        </button>
      </div>
    </div>
  );
}
