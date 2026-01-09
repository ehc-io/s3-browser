interface VideoPreviewProps {
  url: string;
}

export function VideoPreview({ url }: VideoPreviewProps) {
  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <video
        src={url}
        controls
        className="w-full max-h-64"
        preload="metadata"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
