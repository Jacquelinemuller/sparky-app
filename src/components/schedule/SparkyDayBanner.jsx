import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';

export default function SparkyDayBanner({ freeSlots = [] }) {
  const { userName } = useApp();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);

  // Genera frases dinámicas según los slots libres disponibles
  const quotes = useMemo(() => {
    const name = userName || 'amiguito';
    const slotCount = freeSlots.length;
    const totalTime = freeSlots
      .map((s) => s.duration || '')
      .filter(Boolean)
      .join(' y ');

    if (slotCount === 0) {
      return [
        `¡${name}, hoy no hay espacios libres! Disfrutá de las actividades planeadas 🐾`,
        `Sparky ve que hoy estás a full. ¡Recordá descansar entre bloques! 💚`,
        `¡Guau! Un día ocupado. Tomá agua y respirá hondo, ${name} 🌿`
      ];
    }

    if (slotCount === 1) {
      return [
        `¡${name}! Tenés 1 superespacio libre${totalTime ? ` (${totalTime})` : ''}. ¡Ideal para una misión! 🚀`,
        `¡Guau! 1 ventana libre hoy. ¿Qué misión querés asignar, ${name}? 🐾`,
        `Sparky te recomienda aprovechar ese espacio para algo importante ⚡`
      ];
    }

    return [
      `¡${name}, tenés ${slotCount} superespacios libres${totalTime ? ` (${totalTime})` : ''}! Perfectos para tus misiones sin prisas 🐾`,
      `¡Guau! ${slotCount} ventanas libres hoy. ¡Podés hacer magia, ${name}! ✨`,
      `Sparky cree en vos: ${slotCount} espacios para elegir qué hacer 💚`,
      `¡Yip! Con ${slotCount} slots libres, hoy podés con todo, ${name} 🚀`
    ];
  }, [userName, freeSlots]);

  const currentQuote = quotes[quoteIndex % quotes.length];

  const handleTap = () => {
    try { audioService.playPop(); } catch (e) {}
    setIsBouncing(true);
    setQuoteIndex((prev) => (prev + 1) % quotes.length);
    setTimeout(() => setIsBouncing(false), 500);
  };

  return (
    <button
      type="button"
      onClick={handleTap}
      className="relative w-full overflow-hidden rounded-3xl p-4 shadow-[0_3px_0_0_#d9f99d] border-2 border-[#d9f99d] bg-gradient-to-br from-[#ecfccb] via-[#f7fee7] to-[#ecfccb] text-left transition-all active:scale-[0.98] cursor-pointer"
      title="Toca a Sparky para otro consejo"
    >
      <div className="flex items-center gap-3 relative z-10">
        {/* Avatar de Sparky */}
        <div className="relative flex-shrink-0 w-16 h-16 rounded-full bg-[#bef264] p-1 shadow-[0_3px_0_0_#a3e635]">
          <div
            className={`w-full h-full rounded-full overflow-hidden bg-white ${
              isBouncing ? 'animate-bounce' : ''
            }`}
          >
            <img
              src="/sparky.png"
              alt="Sparky"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback si no existe la imagen
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML =
                  '<div class="w-full h-full flex items-center justify-center text-3xl">🐶</div>';
              }}
            />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 rounded-full text-[12px] p-0.5 shadow-md font-black border-2 border-white animate-bounce">
            ⚡
          </span>
        </div>

        {/* Contenido */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-headline text-sm font-black text-[#365314] tracking-tight">
              ¡Mapeo del Día!
            </span>
            <span className="text-[#65a30d] text-sm font-bold">✨</span>
          </div>
          <p className="font-body-sm text-xs text-[#424936] mt-0.5 leading-snug">
            {currentQuote}
          </p>
        </div>
      </div>

      {/* Halo decorativo */}
      <div className="absolute -right-4 -bottom-6 w-24 h-24 rounded-full bg-[#bef264]/30 pointer-events-none" />
    </button>
  );
}