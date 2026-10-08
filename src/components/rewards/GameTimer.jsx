import React from 'react';
import { audioService } from '../../services/audioService';

const C = {
  panel: 'rgba(19, 19, 34, 0.92)',
  panelBorder: 'rgba(6, 182, 212, 0.5)',
  cyan: '#06b6d4',
  cyanBright: '#38bdf8',
  lime: '#22c55e',
  limeBright: '#4ade80',
  amber: '#facc15',
  magenta: '#ff2d87',
  text: '#ffffff',
  textMuted: '#94a3b8'
};

export default function GameTimer({
  formattedTime,
  formattedDaily,
  secondsLeft,
  dailySecondsLeft,
  onExit
}) {
  const totalSeconds = Math.min(secondsLeft, dailySecondsLeft);
  const isCritical = totalSeconds <= 60;
  const isWarning = totalSeconds <= 300 && !isCritical;

  const accent = isCritical ? C.magenta : isWarning ? C.amber : C.cyanBright;

  const handleExit = () => {
    try { audioService.playClick(); } catch (e) {}
    onExit();
  };

  return (
    <>
      {/* Badge flotante arriba del juego */}
      <div
        className="fixed top-3 left-1/2 -translate-x-1/2 z-[250] px-3 py-2 rounded-2xl flex items-center gap-3 backdrop-blur-md"
        style={{
          background: C.panel,
          border: `1.5px solid ${accent}`,
          boxShadow: `0 0 20px ${accent}60`,
          animation: isCritical ? 'pulseCritical 1s ease-in-out infinite' : 'none'
        }}
      >
        <span className="text-lg" style={{ filter: `drop-shadow(0 0 6px ${accent})` }}>
          ⏱
        </span>
        <div className="flex flex-col">
          <span
            className="font-black tabular-nums leading-none"
            style={{ fontSize: '16px', color: accent }}
          >
            {formattedTime}
          </span>
          <span
            className="font-bold leading-none mt-0.5"
            style={{ fontSize: '9px', color: C.textMuted }}
          >
            Hoy: {formattedDaily}
          </span>
        </div>
        <button
          type="button"
          onClick={handleExit}
          className="px-2 py-1 rounded-lg font-black text-[10px] cursor-pointer active:scale-95 transition-all"
          style={{
            background: 'rgba(255, 45, 135, 0.15)',
            color: C.magenta,
            border: `1px solid ${C.magenta}60`
          }}
        >
          SALIR
        </button>
      </div>

      <style>{`
        @keyframes pulseCritical {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.06); }
        }
      `}</style>
    </>
  );
}

/**
 * Modal bloqueante que aparece cuando se agotó el tiempo.
 */
export function GameTimeUpModal({ reason, onClose }) {
  const isNoBalance = reason === 'no-balance';

  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,15,0.9)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 flex flex-col items-center text-center"
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #08081a 100%)',
          border: `2px solid ${C.amber}`,
          boxShadow: `0 0 60px ${C.amber}80`
        }}
      >
        <span className="text-6xl mb-3">⏰</span>
        <h2 className="font-black text-xl mb-2" style={{ color: C.text }}>
          {isNoBalance ? '¡Se te acabaron los minutos!' : '¡Llegaste al tope de hoy!'}
        </h2>
        <p className="text-sm font-bold mb-5" style={{ color: C.textMuted }}>
          {isNoBalance
            ? 'Comprá más tiempo en la tienda o esperá a que Sparky te dé un cofre.'
            : 'Descansá y volvé mañana. Sparky cuida tu energía 🐾'}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl font-black text-sm cursor-pointer active:scale-95 transition-all"
          style={{
            background: `linear-gradient(135deg, ${C.amber} 0%, ${C.limeBright} 100%)`,
            color: '#000',
            boxShadow: `0 4px 0 0 #047857`
          }}
        >
          Volver al arcade
        </button>
      </div>
    </div>
  );
}