import React, { useState, useEffect } from 'react';

export default function SheetViewerModal({ isOpen, onClose, guide }) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (isOpen) setZoom(1);
  }, [isOpen, guide]);

  // Bloquear scroll del body mientras está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen || !guide) return null;

  const imgSrc = guide.sheetImage || guide.file;
  const imgAlt = guide.title || 'Lámina';

  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col select-none">
      {/* Botón cerrar — flotante arriba a la derecha */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-30 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
        aria-label="Cerrar"
      >
        <span className="material-symbols-outlined text-[24px]">close</span>
      </button>

      {/* Título — flotante arriba a la izquierda */}
      <div
        className="absolute left-4 right-20 z-30 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-black text-xs truncate"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 22px)' }}
      >
        Semana {guide.weekNumber || ''} · {guide.title || 'Lámina'}
      </div>

      {/* Imagen a pantalla completa */}
      <div className="flex-1 w-full overflow-hidden flex items-center justify-center">
        {zoom === 1 ? (
          <img
            src={imgSrc}
            alt={imgAlt}
            className="w-full h-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="w-full h-full overflow-auto flex items-center justify-center">
            <img
              src={imgSrc}
              alt={imgAlt}
              draggable={false}
              style={{
                width: `${zoom * 100}%`,
                height: 'auto',
                maxWidth: 'none',
                maxHeight: 'none'
              }}
            />
          </div>
        )}
      </div>

      {/* Barra inferior con zoom (flotante, discreta) */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center gap-2 pb-4 pt-3"
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
          background:
            'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 100%)'
        }}
      >
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(2)))}
          disabled={zoom <= 1}
          className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Reducir zoom"
        >
          <span className="material-symbols-outlined text-[22px]">zoom_out</span>
        </button>

        <button
          type="button"
          onClick={() => setZoom(1)}
          className="h-11 px-4 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-black text-sm active:scale-95 transition-all cursor-pointer"
          aria-label="Reiniciar zoom"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(3, +(z + 0.5).toFixed(2)))}
          disabled={zoom >= 3}
          className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Aumentar zoom"
        >
          <span className="material-symbols-outlined text-[22px]">zoom_in</span>
        </button>
      </div>
    </div>
  );
}