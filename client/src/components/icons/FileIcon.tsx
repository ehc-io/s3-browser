import {
  Folder,
  Image,
  VideoCamera,
  MusicNote,
  FileText,
  FileArchive,
  Code,
  File,
} from '@phosphor-icons/react';
import type { FileType } from '@s3-browser/shared';

interface FileIconProps {
  type: FileType;
  size?: number;
  className?: string;
}

const iconMap: Record<FileType, typeof File> = {
  folder: Folder,
  image: Image,
  video: VideoCamera,
  audio: MusicNote,
  document: FileText,
  archive: FileArchive,
  code: Code,
  other: File,
};

const colorMap: Record<FileType, string> = {
  folder: 'text-file-folder',
  image: 'text-file-image',
  video: 'text-file-video',
  audio: 'text-file-audio',
  document: 'text-file-document',
  archive: 'text-file-archive',
  code: 'text-file-code',
  other: 'text-text-secondary-light dark:text-text-secondary-dark',
};

export function FileIcon({ type, size = 24, className = '' }: FileIconProps) {
  const IconComponent = iconMap[type];
  const colorClass = colorMap[type];

  return (
    <IconComponent
      size={size}
      weight="duotone"
      className={`${colorClass} ${className}`}
    />
  );
}
