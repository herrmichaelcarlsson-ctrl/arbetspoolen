'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ImageCropperModalProps {
  imageSrc: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
}

export default function ImageCropperModal({
  imageSrc,
  isOpen,
  onClose,
  onCropComplete
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ fitWidth: 0, fitHeight: 0, startX: 0, startY: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const VIEWPORT_SIZE = 250;
  const TARGET_SIZE = 400; // High-quality export size

  // Reset state when new image is loaded
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setImageLoaded(false);
    }
  }, [imageSrc, isOpen]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('Image loaded successfully');
    const img = e.currentTarget;
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;

    if (naturalW === 0 || naturalH === 0) {
      console.error('Image has zero dimensions');
      return;
    }

    let fitWidth = VIEWPORT_SIZE;
    let fitHeight = VIEWPORT_SIZE;

    // Scale so the entire image fits within the crop circle (object-fit: contain)
    if (naturalW / naturalH > 1) {
      // Landscape: fit width to viewport, let height scale down
      fitWidth = VIEWPORT_SIZE;
      fitHeight = VIEWPORT_SIZE * (naturalH / naturalW);
    } else {
      // Portrait or square: fit height to viewport, let width scale down
      fitHeight = VIEWPORT_SIZE;
      fitWidth = VIEWPORT_SIZE * (naturalW / naturalH);
    }

    const startX = (VIEWPORT_SIZE - fitWidth) / 2;
    const startY = (VIEWPORT_SIZE - fitHeight) / 2;

    setDimensions({ fitWidth, fitHeight, startX, startY });
    setImageLoaded(true);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Image failed to load:', imageSrc);
  };

  // Helper to limit offset so image always covers the circle/square viewport
  const limitOffset = (x: number, y: number, currentZoom: number) => {
    const renderedW = dimensions.fitWidth * currentZoom;
    const renderedH = dimensions.fitHeight * currentZoom;

    const maxOfsX = Math.max(0, (renderedW - VIEWPORT_SIZE) / 2);
    const minOfsX = -maxOfsX;
    const maxOfsY = Math.max(0, (renderedH - VIEWPORT_SIZE) / 2);
    const minOfsY = -maxOfsY;

    return {
      x: Math.min(maxOfsX, Math.max(minOfsX, x)),
      y: Math.min(maxOfsY, Math.max(minOfsY, y))
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!imageLoaded) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageLoaded) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setOffset(limitOffset(newX, newY, zoom));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageLoaded || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - offset.x,
      y: e.touches[0].clientY - offset.y
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !imageLoaded || e.touches.length !== 1) return;
    const newX = e.touches[0].clientX - dragStart.x;
    const newY = e.touches[0].clientY - dragStart.y;
    setOffset(limitOffset(newX, newY, zoom));
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);
    // Real-time adjust offset to stay within bounds
    setOffset(limitOffset(offset.x, offset.y, newZoom));
  };

  const handleSave = () => {
    console.log('handleSave called, imageLoaded:', imageLoaded);
    
    // Wait a bit for image to fully load if it just triggered onLoad
    if (!imgRef.current || !imageLoaded) {
      // Try one more time with a small delay
      setTimeout(() => {
        if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
          performCrop();
        } else {
          alert("Bilden har inte laddats klart än. Vänligen vänta tills bilden syns i cirkeln.");
        }
      }, 100);
      return;
    }
    
    performCrop();
  };
  
  const performCrop = () => {
    try {
      const img = imgRef.current;
      if (!img) {
        alert("Bilden kunde inte hittas. Försök ladda upp bilden igen.");
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        alert("Kunde inte starta bildbeskärningen (2D context saknas).");
        return;
      }

      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

      const scaleRatio = TARGET_SIZE / VIEWPORT_SIZE;
      const renderedW = dimensions.fitWidth * zoom;
      const renderedH = dimensions.fitHeight * zoom;

      const drawX = (dimensions.startX + offset.x) * scaleRatio;
      const drawY = (dimensions.startY + offset.y) * scaleRatio;
      const drawW = renderedW * scaleRatio;
      const drawH = renderedH * scaleRatio;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Blob created, size:', blob.size);
            onCropComplete(blob);
            onClose();
          } else {
            alert("Kunde inte skapa den beskurna bildfilen.");
          }
        },
        'image/jpeg',
        0.92
      );
    } catch (err: any) {
      console.error('Crop error:', err);
      alert(`Ett fel uppstod vid beskärningen: ${err.message}`);
    }
  };

  if (!isOpen || !imageSrc) return null;

  const isDataUrl = imageSrc.startsWith('data:');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-100 rounded-[24px] shadow-2xl max-w-sm w-full p-6 space-y-6 transform transition-all animate-scale-up">
        
        {/* Header */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-slate-900">Anpassa profilbild</h3>
          <p className="text-xs text-slate-500 mt-1">
            Dra i bilden för att placera den rätt, och zooma med reglaget.
          </p>
        </div>

        {/* Viewport Box */}
        <div className="flex justify-center">
          <div
            ref={viewportRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="relative overflow-hidden cursor-move border-4 border-slate-100 shadow-inner bg-white flex items-center justify-center select-none touch-none"
            style={{
              width: VIEWPORT_SIZE,
              height: VIEWPORT_SIZE,
              borderRadius: '50%', // Circle crop for beautiful avatars
            }}
          >
            {/* Guide circle indicator */}
            <div className="absolute inset-0 border border-indigo-600/35 rounded-full pointer-events-none z-10" />

            {/* Rendered image */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop Source"
              crossOrigin={isDataUrl ? undefined : "anonymous"}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className="max-w-none origin-center pointer-events-none select-none"
              style={{
                width: dimensions.fitWidth,
                height: dimensions.fitHeight,
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
            />
            
            {/* Loading indicator */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Zoom Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-500 font-medium">
            <span>Zooma ut</span>
            <span>Zooma in</span>
          </div>
          <input
            type="range"
            min="1"
            max="4"
            step="0.01"
            value={zoom}
            onChange={handleZoomChange}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-sm transition-colors"
          >
            Spara bild
          </button>
        </div>
      </div>
    </div>
  );
}
