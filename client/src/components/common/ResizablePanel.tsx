import { useRef, useCallback, useEffect, useState, type ReactNode } from 'react';

interface ResizablePanelProps {
  children: ReactNode;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  onResize: (width: number) => void;
  className?: string;
  resizeFrom?: 'left' | 'right';
}

export function ResizablePanel({
  children,
  width,
  minWidth = 280,
  maxWidth = 600,
  onResize,
  className = '',
  resizeFrom = 'left',
}: ResizablePanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;
    },
    [width]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const delta =
        resizeFrom === 'left'
          ? startXRef.current - e.clientX
          : e.clientX - startXRef.current;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + delta));
      onResize(newWidth);
    },
    [isDragging, minWidth, maxWidth, onResize, resizeFrom]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={panelRef}
      className={`relative flex-shrink-0 ${className}`}
      style={{ width }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute top-0 ${resizeFrom === 'left' ? 'left-0' : 'right-0'} w-1 h-full cursor-col-resize hover:bg-accent-light dark:hover:bg-accent-dark transition-colors z-10 ${
          isDragging ? 'bg-accent-light dark:bg-accent-dark' : ''
        }`}
      />
      {children}
    </div>
  );
}
