import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

interface PhotoCropperProps {
  imageSrc: string;
  onCrop: (croppedImage: string) => void;
  onCancel: () => void;
}

const PhotoCropper = ({ imageSrc, onCrop, onCancel }: PhotoCropperProps) => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageBounds, setImageBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const initializeCrop = useCallback(() => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const containerRect = imageRef.current.parentElement?.getBoundingClientRect();
    if (!containerRect) return;
    
    const imageX = rect.left - containerRect.left;
    const imageY = rect.top - containerRect.top;
    
    setImageBounds({ x: imageX, y: imageY, width: rect.width, height: rect.height });
    
    const size = Math.min(rect.width, rect.height) * 0.6;
    const x = imageX + (rect.width - size) / 2;
    const y = imageY + (rect.height - size) / 2;
    
    setCrop({ x, y, size });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, action: 'drag' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (action === 'drag') {
      setIsDragging(true);
    } else {
      setIsResizing(true);
      setStartSize(crop.size);
    }
    
    setStartPos({ x: e.clientX, y: e.clientY });
  }, [crop.size]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      
      setCrop(prev => ({
        ...prev,
        x: Math.max(imageBounds.x, Math.min(prev.x + deltaX, imageBounds.x + imageBounds.width - prev.size)),
        y: Math.max(imageBounds.y, Math.min(prev.y + deltaY, imageBounds.y + imageBounds.height - prev.size))
      }));
      
      setStartPos({ x: e.clientX, y: e.clientY });
    } else if (isResizing) {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      const delta = Math.max(deltaX, deltaY);
      
      const maxSize = Math.min(imageBounds.width, imageBounds.height);
      const newSize = Math.max(50, Math.min(startSize + delta, maxSize));
      
      const maxX = imageBounds.x + imageBounds.width - newSize;
      const maxY = imageBounds.y + imageBounds.height - newSize;
      
      setCrop(prev => ({
        ...prev,
        size: newSize,
        x: Math.max(imageBounds.x, Math.min(prev.x, maxX)),
        y: Math.max(imageBounds.y, Math.min(prev.y, maxY))
      }));
    }
  }, [isDragging, isResizing, startPos, startSize, imageBounds]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -15 : 15;
    const maxSize = Math.min(imageBounds.width, imageBounds.height);
    const newSize = Math.max(50, Math.min(crop.size + delta, maxSize));
    
    // Adjust position if crop area would go outside image bounds
    const maxX = imageBounds.x + imageBounds.width - newSize;
    const maxY = imageBounds.y + imageBounds.height - newSize;
    
    setCrop(prev => ({
      ...prev,
      size: newSize,
      x: Math.max(imageBounds.x, Math.min(prev.x, maxX)),
      y: Math.max(imageBounds.y, Math.min(prev.y, maxY))
    }));
  }, [crop.size, imageBounds]);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY } as MouseEvent);
    }
  }, [handleMouseMove]);

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 200;
    canvas.height = 200;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const cropX = (crop.x - imageBounds.x) * scaleX;
    const cropY = (crop.y - imageBounds.y) * scaleY;
    const cropSize = crop.size * scaleX;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropSize,
      cropSize,
      0,
      0,
      200,
      200
    );

    const croppedImage = canvas.toDataURL('image/jpeg', 0.8);
    onCrop(croppedImage);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={(e) => e.stopPropagation()}>
      <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-modal p-6 max-w-2xl w-full`} onClick={(e) => e.stopPropagation()}>
        <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-black'} mb-4`}>Crop your photo</h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Drag to reposition, scroll to zoom</p>
        
        <div 
          className="relative w-full h-96 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center"
          onWheel={handleWheel}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Crop preview"
            className="max-w-full max-h-full object-contain select-none"
            onLoad={() => {
              setImageLoaded(true);
              setTimeout(initializeCrop, 100);
            }}
            draggable={false}
          />
          
          {imageLoaded && (
            <div
              className="absolute border-2 border-white shadow-lg cursor-move"
              style={{
                left: crop.x,
                top: crop.y,
                width: crop.size,
                height: crop.size,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
              }}
              onMouseDown={(e) => handleMouseDown(e, 'drag')}
              onTouchStart={(e) => {
                e.preventDefault();
                const touch = e.touches[0];
                handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent, 'drag');
              }}
            >
              {/* Resize handle */}
              <div
                className="absolute bottom-0 right-0 w-6 h-6 bg-white border border-gray-300 cursor-se-resize rounded-full"
                style={{ transform: 'translate(50%, 50%)' }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(e, 'resize');
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const touch = e.touches[0];
                  handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {}, stopPropagation: () => {} } as React.MouseEvent, 'resize');
                }}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleCrop} className="flex-1">
            Save
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default PhotoCropper;