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
        background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)'
      }}
    >
      {/* Header */}
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
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full font-label-md text-label-md font-bold active:scale-95 transition-all cursor-pointer"
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
              className="font-label-sm text-label-sm font-black uppercase tracking-wider"
              style={{ color: '#334155' }}
            >
              Tips de Sparky
            </span>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 flex flex-col relative w-full pt-20 pb-10 px-4 max-w-md mx-auto">
        <div className="w-full mb-3">
          <h1
            className="font-headline-lg-mobile text-headline-lg-mobile font-black leading-tight"
            style={{ color: '#0f172a' }}
          >
            Tu tip del día
          </h1>
          <p
            className="font-body-sm text-body-sm mt-1"
            style={{ color: '#64748b' }}
          >
            Un descubrimiento por día. Sin apuro 🐾
          </p>
        </div>

        <SparkyCompanion />
      </main>
    </div>
  );
};