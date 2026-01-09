import { useEffect } from 'react';
import { X } from '@phosphor-icons/react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'image' | 'video';
  url: string;
  alt?: string;
}

export function Lightbox({ isOpen, onClose, type, url, alt }: LightboxProps) {
  // Close on Escape key and manage body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
        aria-label="Close lightbox"
      >
        <X size={32} weight="bold" />
      </button>

      {/* Content - stop propagation to prevent closing when clicking media */}
      <div
        className="max-w-[95vw] max-h-[95vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {type === 'image' ? (
          <img
            src={url}
            alt={alt}
            className="max-w-full max-h-[95vh] object-contain"
          />
        ) : (
          <video
            src={url}
            controls
            autoPlay
            className="max-w-full max-h-[95vh]"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
}
