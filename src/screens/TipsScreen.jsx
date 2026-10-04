import React from 'react';
import { useApp } from '../context/AppContext';
import { SparkyCompanion } from '../components/SparkyCompanion';
import { audioService } from '../services/audioService';
import { useSparkyTips, formatLongDate } from '../hooks/useSparkyTips';
import sparkyVideo from '../assets/sparky.mp4';

export const TipsScreen = () => {
  const { setActiveScreen } = useApp();
  const { isBeforeStart, daysUntilStart, startMondayDate } = useSparkyTips();

  const goBack = () => {
    try { audioService.playClick(); } catch (e) {}
    setActiveScreen('none');   // ⬅️ FIX: vuelve al inicio, no al Kit
  };

  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)'
      }}
    >
      <header
        className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)'
        }}
      >
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full font-bold active:scale-95 transition-all cursor-pointer"
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              color: '#334155'
            }}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Volver</span>
          </button>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: '#f1f5f9',
              border: '1px solid #e2e8f0'
            }}
          >
            <span className="text-lg">💡</span>
            <span
              className="font-black uppercase tracking-wider"
              style={{ color: '#334155', fontSize: '11px' }}
            >
              Tips de Sparky
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 pb-10 px-4 max-w-md mx-auto">
        {isBeforeStart ? (
          <ComingSoon daysUntilStart={daysUntilStart} startDate={startMondayDate} />
        ) : (
          <SparkyCompanion />
        )}
      </main>
    </div>
  );
};

function ComingSoon({ daysUntilStart, startDate }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-10">
      <div className="relative flex-shrink-0 mb-6" style={{ width: '140px', height: '140px' }}>
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255, 107, 0, 0.25) 0%, transparent 70%)',
            transform: 'scale(1.4)'
          }}
        />
        <div
          className="relative w-full h-full rounded-full overflow-hidden bg-amber-50"
          style={{
            border: '4px solid #ff6b00',
            boxShadow: '0 8px 0 0 #ff6b00, 0 12px 24px rgba(255, 107, 0, 0.25)'
          }}
        >
          <video
            className="w-full h-full object-cover bg-amber-50"
            autoPlay
            loop
            muted
            playsInline
            src={sparkyVideo}
          />
        </div>
      </div>

      <h1
        className="font-black leading-tight mb-3"
        style={{ color: '#1e293b', fontSize: '22px', maxWidth: '280px' }}
      >
        Sparky está preparando tus misiones ✨
      </h1>

      <p
        className="mb-6"
        style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5, maxWidth: '300px' }}
      >
        Cada semana vas a recibir un tip nuevo para conocerte mejor y hacer las cosas a tu ritmo.
      </p>

      <div
        className="w-full max-w-xs p-4 rounded-3xl mb-4"
        style={{
          background: '#ffffff',
          border: '2px solid #e2e8f0',
          boxShadow: '0 4px 0 0 #e2e8f0'
        }}
      >
        <p
          className="font-black uppercase tracking-wider mb-1"
          style={{ color: '#94a3b8', fontSize: '10px' }}
        >
          Arrancamos el
        </p>
        <p
          className="font-black"
          style={{ color: '#334155', fontSize: '18px' }}
        >
          {formatLongDate(startDate)}
        </p>
      </div>

      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          border: '1.5px solid #60a5fa'
        }}
      >
        <span className="material-symbols-outlined text-[18px]" style={{ color: '#1e40af' }}>
          schedule
        </span>
        <span
          className="font-black"
          style={{ color: '#1e40af', fontSize: '13px' }}
        >
          {daysUntilStart === 1
            ? 'Falta 1 día'
            : `Faltan ${daysUntilStart} días`}
        </span>
      </div>

      <p
        className="mt-10"
        style={{ color: '#94a3b8', fontSize: '12px', maxWidth: '280px' }}
      >
        🐾 Mientras tanto, podés usar el diario, las alarmas y tus rutinas.
      </p>
    </div>
  );
}