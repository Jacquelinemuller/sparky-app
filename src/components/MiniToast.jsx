import React, { useEffect, useState } from 'react';

export default function MiniToast({ celebration, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (celebration) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300); // esperar la animación de salida
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [celebration, onClose]);

  if (!celebration) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-[150] pointer-events-none transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
      style={{ maxWidth: '90vw' }}
    >
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white border-2 border-[#10b981] shadow-[0_6px_20px_rgba(16,185,129,0.25)]"
      >
        <span className="text-xl">✅</span>
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm font-black text-[#065f46] leading-tight">
            {celebration.title || '¡Lo lograste!'}
          </span>
          {celebration.stars > 0 && (
            <span className="font-label-sm text-label-sm text-[#10b981] font-bold">
              +{celebration.stars} XP ⭐
            </span>
          )}
        </div>
      </div>
    </div>
  );
}