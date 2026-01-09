interface VideoPreviewProps {
  url: string;
  onClick?: () => void;
}

export function VideoPreview({ url, onClick }: VideoPreviewProps) {
  return (
    <div
      className={`bg-black rounded-lg overflow-hidden relative group ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <video
        src={url}
        className="w-full max-h-64 pointer-events-none"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
      {/* Expand overlay */}
      {onClick && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-sm font-medium">Click to expand</span>
        </div>
      )}
    </div>
  );
}
