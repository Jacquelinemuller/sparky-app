import React, { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Bloquear el scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} bg-white rounded-3xl border-4 border-[#fed7aa] shadow-[0_10px_0_0_#fed7aa] p-5 sm:p-6 max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[#fed7aa]/50">
          <h2 className="font-headline-md text-headline-md font-black text-[#ea580c]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#ffedd5] active:scale-95 transition-all cursor-pointer"
            title="Cerrar"
          >
            <span className="material-symbols-outlined text-[#ea580c]">close</span>
          </button>
        </div>

        {/* Contenido */}
        {children}
      </div>
    </div>
  );
}