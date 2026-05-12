'use client';

import React, { useState, useRef, useEffect } from 'react';

type PhotoFilter = 'none' | 'vivid' | 'bw' | 'warm' | 'cool' | 'cinematic' | 'retro' | 'dramatic' | 'mono' | 'bloom';

const FILTERS: { id: PhotoFilter; label: string; filter: string }[] = [
  { id: 'none', label: 'Original', filter: 'none' },
  { id: 'vivid', label: 'Vivid', filter: 'saturate(1.5) contrast(1.1)' },
  { id: 'bw', label: 'B&W', filter: 'grayscale(1)' },
  { id: 'warm', label: 'Warm', filter: 'sepia(0.3) saturate(1.3) brightness(1.05)' },
  { id: 'cool', label: 'Cool', filter: 'hue-rotate(180deg) brightness(1.1) saturate(1.1)' },
  { id: 'cinematic', label: 'Cinematic', filter: 'sepia(0.2) contrast(1.2) brightness(0.9) hue-rotate(-10deg)' },
  { id: 'retro', label: 'Retro', filter: 'sepia(0.5) contrast(0.9) brightness(1.1) saturate(1.2)' },
  { id: 'dramatic', label: 'Dramatic', filter: 'contrast(1.5) brightness(0.8) saturate(0.8)' },
  { id: 'mono', label: 'Mono', filter: 'grayscale(1) contrast(1.3)' },
  { id: 'bloom', label: 'Bloom', filter: 'brightness(1.1) saturate(1.2) contrast(0.9)' },
];

interface CropState {
  image: string;
  zoom: number;
  offset: { x: number; y: number };
}

interface ImageAdjustModalProps {
  imageUrl: string;
  onSave: (file: File, previewUrl: string) => void;
  onClose: () => void;
}

export default function ImageAdjustModal({ imageUrl, onSave, onClose }: ImageAdjustModalProps) {
  const [cropState, setCropState] = useState<CropState>({
    image: imageUrl,
    zoom: 1,
    offset: { x: 0, y: 0 }
  });
  const [activeFilter, setActiveFilter] = useState<PhotoFilter>('none');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialTouchDistance, setInitialTouchDistance] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handleConfirmCrop = async () => {
    if (!containerRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = cropState.image;
    img.crossOrigin = 'anonymous'; // Support cross-origin images if any
    
    await new Promise((resolve) => { img.onload = resolve; });

    // Target size for profile pic
    const targetSize = 400;
    canvas.width = targetSize;
    canvas.height = targetSize;

    // Get the container size
    const container = containerRef.current;
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    // Calculate how the image is scaled in the UI (object-fit: contain simulation)
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const aspect = nw / nh;
    
    let baseWidth, baseHeight;
    if (aspect > 1) {
      // Landscape: height matches container
      baseHeight = ch;
      baseWidth = ch * aspect;
    } else {
      // Portrait or square: width matches container
      baseWidth = cw;
      baseHeight = cw / aspect;
    }

    // Now reproduce exactly what we see in the UI
    const zoom = cropState.zoom;
    const drawWidth = baseWidth * zoom * (targetSize / cw);
    const drawHeight = baseHeight * zoom * (targetSize / cw);
    
    const x = (targetSize - drawWidth) / 2 + (cropState.offset.x * (targetSize / cw));
    const y = (targetSize - drawHeight) / 2 + (cropState.offset.y * (targetSize / cw));

    // Fill background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, targetSize, targetSize);
    
    // Apply filter
    const filterObj = FILTERS.find(f => f.id === activeFilter);
    if (filterObj) {
      ctx.filter = filterObj.filter;
    }
    
    ctx.drawImage(img, x, y, drawWidth, drawHeight);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        onSave(file, previewUrl);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleCropDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches.length === 2) {
      e.preventDefault();
      // Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      
      if (initialTouchDistance === null) {
        setInitialTouchDistance(distance);
        setInitialZoom(cropState.zoom);
      } else {
        const scale = distance / initialTouchDistance;
        const newZoom = Math.max(0.5, Math.min(5, initialZoom * scale));
        setCropState(prev => ({ ...prev, zoom: newZoom }));
      }
      return;
    }

    if (!isDragging) return;
    if ('touches' in e) e.preventDefault();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;
    
    setCropState(prev => ({
      ...prev,
      offset: {
        x: prev.offset.x + dx,
        y: prev.offset.y + dy
      }
    }));
    
    setDragStart({ x: clientX, y: clientY });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setIsDragging(false); 
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      setInitialTouchDistance(distance);
      setInitialZoom(cropState.zoom);
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setInitialTouchDistance(null);
  };

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal">
        <h3 className="crop-modal-title">Adjust Photo</h3>
        
        <div 
          className="crop-container"
          ref={containerRef}
          onMouseDown={(e) => { setIsDragging(true); setDragStart({ x: e.clientX, y: e.clientY }); }}
          onMouseMove={handleCropDrag}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleCropDrag}
          onTouchEnd={handleTouchEnd}
        >
          <div className="crop-mask">
            <div className="crop-circle" />
          </div>
          <img 
            src={cropState.image} 
            alt="To crop" 
            style={{
              transform: `translate(calc(-50% + ${cropState.offset.x}px), calc(-50% + ${cropState.offset.y}px)) scale(${cropState.zoom})`,
              filter: FILTERS.find(f => f.id === activeFilter)?.filter,
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
            draggable={false}
          />
        </div>


        <div className="filter-selection">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`filter-btn ${activeFilter === f.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.id)}
            >
              <div className="filter-preview" style={{ filter: f.filter, backgroundImage: `url(${cropState.image})` }} />
              <span className="filter-label">{f.label}</span>
            </button>
          ))}
        </div>

        <div className="crop-footer">
          <button className="crop-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="crop-btn-save" onClick={handleConfirmCrop}>Apply</button>
        </div>
      </div>
    </div>
  );
}
