import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperModalProps {
  imageUrl: string;
  onCrop: (file: File) => void;
  onCancel: () => void;
}

export default function ImageCropperModal({ imageUrl, onCrop, onCancel }: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // Dispatch modal state change event when component mounts
    window.dispatchEvent(new CustomEvent('modalStateChange', { detail: { isOpen: true } }));
    
    return () => {
      // Cleanup modal state when component unmounts
      window.dispatchEvent(new CustomEvent('modalStateChange', { detail: { isOpen: false } }));
    };
  }, []);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      draw();
    };
  }, [imageUrl]);

  useEffect(() => {
    draw();
  }, [zoom, offset]);

  const draw = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const size = Math.min(img.width, img.height);
    const scale = (canvas.width / size) * zoom;

    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;

    const x = (canvas.width - scaledWidth) / 2 + offset.x;
    const y = (canvas.height - scaledHeight) / 2 + offset.y;

    ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        onCrop(file);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button onClick={onCancel} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10">
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Adjust Profile Photo</h3>
        <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-move mb-6" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchStart={handleMouseDown} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}>
          <canvas ref={canvasRef} width={400} height={400} className="w-full h-full object-contain pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
            <div className="w-full h-full rounded-full shadow-[0_0_0_9999px_rgba(255,255,255,0.6)]"></div>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-6 px-2">
          <ZoomOut className="w-5 h-5 text-gray-400" />
          <input type="range" min="1" max="3" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="flex-1 accent-[var(--button-primary)]" />
          <ZoomIn className="w-5 h-5 text-gray-400" />
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 font-medium rounded-lg app-button-secondary transition-colors">Cancel</button>
          <button onClick={handleSave} className="flex-1 py-2.5 font-medium rounded-lg app-button-primary transition-colors">Apply & Save</button>
        </div>
      </div>
    </div>
  );
}