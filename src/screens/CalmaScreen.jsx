import React from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';

export const CalmaScreen = () => {
  const { setActiveScreen } = useApp();

  const goBack = () => {
    try { audioService.playClick(); } catch (e) {}
    setActiveScreen('apoyos');
  };

  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{
        background: 'linear-gradient(180deg, #f0fff4 0%, #e0f7ed 50%, #d4f4e7 100%)'
      }}
    >
      <header
        className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderBottom: '1px solid rgba(168, 230, 207, 0.5)'
        }}
      >
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full font-label-md text-label-md font-bold active:scale-95 transition-all cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(168, 230, 207, 0.6)',
              color: '#065f46'
            }}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Volver</span>
          </button>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(212, 244, 231, 0.6)',
              border: '1px solid rgba(168, 230, 207, 0.6)'
            }}
          >
            <span className="text-lg">🧘</span>
            <span
              className="font-label-sm text-label-sm font-black uppercase tracking-wider"
              style={{ color: '#065f46' }}
            >
              Zona de calma
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 max-w-md mx-auto text-center gap-4">
        <span className="text-7xl">🌿</span>
        <h1
          className="font-black leading-tight"
          style={{ color: '#065f46', fontSize: '22px' }}
        >
          Próximamente
        </h1>
        <p
          style={{ color: '#4b7a68', fontSize: '14px' }}
        >
          Estamos preparando un espacio para respirar y calmarnos juntos.
        </p>
        <button
          type="button"
          onClick={goBack}
          className="mt-2 px-6 py-3 rounded-2xl font-black text-sm cursor-pointer active:scale-95 transition-all"
          style={{
            background: 'linear-gradient(135deg, #a8e6cf 0%, #7dd3c0 100%)',
            color: '#064e3b',
            boxShadow: '0 4px 0 0 #5cb8a8'
          }}
        >
          Volver
        </button>
      </main>
    </div>
  );
};