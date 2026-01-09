import { useEffect, useState } from 'react';
import { X, MagnifyingGlassPlus, MagnifyingGlassMinus } from '@phosphor-icons/react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'image' | 'video';
  url: string;
  alt?: string;
}

export function Lightbox({ isOpen, onClose, type, url, alt }: LightboxProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  // Reset zoom when lightbox opens/closes or URL changes
  useEffect(() => {
    setIsZoomed(false);
  }, [isOpen, url]);

  // Close on Escape key and manage body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, isZoomed, onClose]);

  if (!isOpen) return null;

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomed(!isZoomed);
  };

  const handleBackdropClick = () => {
    if (isZoomed) {
      setIsZoomed(false);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
        aria-label="Close lightbox"
      >
        <X size={32} weight="bold" />
      </button>

      {/* Zoom indicator for images */}
      {type === 'image' && (
        <div className="absolute top-4 left-4 flex items-center gap-2 text-white/60 text-sm z-10">
          {isZoomed ? (
            <>
              <MagnifyingGlassMinus size={20} />
              <span>Click to fit</span>
            </>
          ) : (
            <>
              <MagnifyingGlassPlus size={20} />
              <span>Click to zoom</span>
            </>
          )}
        </div>
      )}

      {/* Content */}
      {type === 'image' ? (
        <div
          className={`${isZoomed ? 'overflow-auto w-full h-full' : 'flex items-center justify-center'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={url}
            alt={alt}
            onClick={handleImageClick}
            className={`
              ${isZoomed
                ? 'max-w-none cursor-zoom-out m-auto block'
                : 'max-w-[95vw] max-h-[95vh] object-contain cursor-zoom-in'
              }
            `}
            style={isZoomed ? { margin: '20px auto', display: 'block' } : undefined}
          />
        </div>
      ) : (
        <div
          className="max-w-[95vw] max-h-[95vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <video
            src={url}
            controls
            autoPlay
            className="max-w-full max-h-[95vh]"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}
