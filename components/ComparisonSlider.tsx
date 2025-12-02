import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface ComparisonSliderProps {
  originalImage: string;
  generatedImage: string;
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  originalImage,
  generatedImage,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(percentage);
  }, [isResizing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(percentage);
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[500px] rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-2xl border-4 border-white"
    >
      {/* Background Image (Original) */}
      <img
        src={originalImage}
        alt="Original"
        className="absolute top-0 left-0 w-full h-full object-contain bg-charcoal-100"
      />
      
      {/* Foreground Image (Sketch) - Clipped */}
      <div 
        className="absolute top-0 left-0 h-full overflow-hidden bg-white"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={generatedImage}
          alt="Sketch"
          className="absolute top-0 left-0 max-w-none h-full object-contain"
          // We need to set the width of the inner image to match the container width 
          // so it aligns perfectly with the background image
          style={{ width: containerRef.current?.offsetWidth || '100%' }}
        />
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-charcoal-800">
          <ChevronsLeftRight size={16} />
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">Sketch</div>
      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">Original</div>
    </div>
  );
};