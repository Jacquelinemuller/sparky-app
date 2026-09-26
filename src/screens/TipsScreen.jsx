import React from 'react';
import { useApp } from '../context/AppContext';
import { SparkyCompanion } from '../components/SparkyCompanion';
import { audioService } from '../services/audioService';

export const TipsScreen = () => {
  const { setActiveScreen } = useApp();

  const goBack = () => {
    try { audioService.playClick(); } catch (e) {}
    setActiveScreen('none');
  };

  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)'
      }}
    >
      {/* Header */}
      <header
        className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          borderBottom: '2px solid rgba(254, 215, 170, 0.8)',
          boxShadow: 'rgba(255, 107, 0, 0.08) 0px 4px 16px'
        }}
      >
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full bg-[#fff7ed] border border-[#fed7aa] text-[#ea580c] font-label-md text-label-md font-bold active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Volver</span>
          </button>

          <div className="inline-flex items-center gap-2 bg-[#ffedd5] px-3 py-1.5 rounded-full shadow-[0_2px_0_0_#fed7aa]">
            <span className="text-lg">💡</span>
            <span className="font-label-sm text-label-sm font-black text-[#ea580c] uppercase tracking-wider">
              Tips de Sparky
            </span>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 flex flex-col relative w-full pt-20 pb-10 px-4 max-w-md mx-auto">
        <div className="w-full mb-3">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-black text-on-surface leading-tight">
            Tu tip del día
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Un descubrimiento por día. Sin apuro 🐾
          </p>
        </div>

        <SparkyCompanion />
      </main>
    </div>
  );
};