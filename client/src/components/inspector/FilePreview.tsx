import type { FileType } from '@s3-browser/shared';
import { ImagePreview } from './ImagePreview';
import { VideoPreview } from './VideoPreview';
import { FileIcon } from '../icons/FileIcon';

interface FilePreviewProps {
  type: FileType;
  url: string;
  filename: string;
  onMediaClick?: () => void;
}

export function FilePreview({ type, url, filename, onMediaClick }: FilePreviewProps) {
  switch (type) {
    case 'image':
      return <ImagePreview url={url} alt={filename} onClick={onMediaClick} />;
    case 'video':
      return <VideoPreview url={url} onClick={onMediaClick} />;
    default:
      return (
        <div className="flex flex-col items-center justify-center h-48 bg-gray-100 dark:bg-slate-800 rounded-lg">
          <FileIcon type={type} size={64} />
          <p className="mt-3 text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Preview not available
          </p>
        </div>
      );
  }
}
