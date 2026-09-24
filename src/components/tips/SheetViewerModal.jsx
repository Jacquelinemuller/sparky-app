import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';

export default function SheetViewerModal({ isOpen, onClose, guide }) {
  const [zoom, setZoom] = useState(1);

  // Reiniciar el zoom cada vez que se abre con una nueva lámina
  useEffect(() => {
    if (isOpen) setZoom(1);
  }, [isOpen, guide]);

  if (!guide) return null;

  const zoomOut = () => setZoom((prev) => Math.max(0.7, +(prev - 0.2).toFixed(2)));
  const zoomIn = () => setZoom((prev) => Math.min(2.0, +(prev + 0.2).toFixed(2)));
  const resetZoom = () => setZoom(1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Semana ${guide.weekNumber || ''}: ${guide.title || 'Lámina'}`}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-3">
        {/* Barra superior: autor + controles de zoom */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="font-label-sm text-label-sm font-bold text-on-surface-variant">
            Infografía original: {guide.author || 'Universo TDAH'}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={zoomOut}
              className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white border-2 border-[#fed7aa] text-[#ea580c] shadow-[0_2px_0_0_#fed7aa] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Reducir zoom"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_out</span>
            </button>

            <button
              type="button"
              onClick={resetZoom}
              className="h-9 px-3 flex items-center justify-center rounded-2xl bg-white border-2 border-[#fed7aa] text-[#ea580c] font-label-sm text-label-sm font-black shadow-[0_2px_0_0_#fed7aa] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Reiniciar zoom"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              type="button"
              onClick={zoomIn}
              className="w-9 h-9 flex items-center justify-center rounded-2xl bg-white border-2 border-[#fed7aa] text-[#ea580c] shadow-[0_2px_0_0_#fed7aa] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="Aumentar zoom"
            >
              <span className="material-symbols-outlined text-[18px]">zoom_in</span>
            </button>
          </div>
        </div>

        {/* Contenedor con scroll + zoom */}
        <div
          className="max-h-[70vh] overflow-auto rounded-2xl border-2 border-[#fed7aa] bg-[#1e293b] flex justify-center p-2"
        >
          <img
            src={guide.sheetImage || guide.file}
            alt={guide.title || 'Lámina'}
            className="rounded-lg transition-[width] duration-200 h-auto"
            style={{
              width: `${zoom * 100}%`,
              maxWidth: zoom === 1 ? '100%' : 'none',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              const parent = e.target.parentElement;
              if (parent && !parent.querySelector('.img-error')) {
                const msg = document.createElement('div');
                msg.className = 'img-error text-white text-center py-8 font-bold';
                msg.innerText = '🖼️ Lámina no encontrada';
                parent.appendChild(msg);
              }
            }}
          />
        </div>

        {/* Nota de ayuda */}
        <p className="font-label-sm text-label-sm text-on-surface-variant text-center">
          💡 Usá los botones + / − para acercar y alejar. Arrastrá para desplazarte.
        </p>
      </div>
    </Modal>
  );
}