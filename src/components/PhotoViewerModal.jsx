import React, { useState, useEffect } from 'react';
import { audioService } from '../services/audioService';

export default function PhotoViewerModal({ isOpen, onClose, photo, title }) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (isOpen) setZoom(1);
  }, [isOpen]);

  if (!isOpen || !photo) return null;

  const zoomIn = () => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)));
  const resetZoom = () => setZoom(1);

  const handleClose = () => {
    try { audioService.playClick(); } catch (e) {}
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={handleClose}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between gap-2 p-4 pt-safe flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col min-w-0">
          <span className="font-label-sm text-[11px] font-black text-white/60 uppercase tracking-wider">
            Recordatorio
          </span>
          {title && (
            <span className="font-title-md text-title-md font-black text-white truncate">
              {title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={zoomOut}
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer"
            title="Alejar"
          >
            <span className="material-symbols-outlined text-[22px]">zoom_out</span>
          </button>

          <button
            type="button"
            onClick={resetZoom}
            className="h-10 px-3 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-label-sm text-[12px] font-black active:scale-95 transition-all cursor-pointer min-w-[60px]"
            title="Reiniciar zoom"
          >
            {Math.round(zoom * 100)}%
          </button>

          <button
            type="button"
            onClick={zoomIn}
            className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer"
            title="Acercar"
          >
            <span className="material-symbols-outlined text-[22px]">zoom_in</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center active:scale-95 transition-all cursor-pointer ml-1"
            title="Cerrar"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
      </div>

      {/* Imagen */}
      <div
        className="flex-1 overflow-auto flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo}
          alt={title || 'Recordatorio'}
          className="rounded-2xl shadow-2xl transition-all duration-200"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            maxWidth: zoom === 1 ? '100%' : 'none',
            maxHeight: zoom === 1 ? '100%' : 'none',
            objectFit: 'contain'
          }}
        />
      </div>

      {/* Hint inferior */}
      <div
        className="p-3 pb-safe text-center flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-label-sm text-[11px] text-white/50 font-bold">
          💡 Usá los botones + / − para acercar. Toca afuera para cerrar.
        </p>
      </div>
    </div>
  );
}