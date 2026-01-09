import { useState } from 'react';
import { Skeleton } from '../common/Skeleton';

interface ImagePreviewProps {
  url: string;
  alt: string;
}

export function ImagePreview({ url, alt }: ImagePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-slate-800 rounded-lg">
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          Failed to load image
        </p>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden">
      {loading && <Skeleton className="absolute inset-0" />}
      <img
        src={url}
        alt={alt}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        className={`w-full h-auto max-h-64 object-contain ${loading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
}
