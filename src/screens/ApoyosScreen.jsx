import React from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';

const BUTTONS = [
  {
    id: 'alarms',
    label: 'Alarmas',
    icon: 'notifications_active',
    emoji: '🔔',
    image: '/kit/alarmas.png',
    gradient: 'linear-gradient(135deg, #ffd6db 0%, #ffb3ba 100%)',
    border: '#ff9aa2',
    text: '#7f1d1d',
    screen: 'alarms'
  },
  {
    id: 'calma',
    label: 'Calma',
    icon: 'self_improvement',
    emoji: '🧘',
    image: '/kit/calma.png',
    gradient: 'linear-gradient(135deg, #d4f4e7 0%, #a8e6cf 100%)',
    border: '#7dd3c0',
    text: '#064e3b',
    screen: 'calma'
  },
  {
    id: 'checklists',
    label: 'Rutina',
    icon: 'checklist',
    emoji: '✅',
    image: '/kit/rutina.png',
    gradient: 'linear-gradient(135deg, #e0d5f5 0%, #c7b8ea 100%)',
    border: '#a78bfa',
    text: '#3b0764',
    screen: 'checklists'
  },
  {
    id: 'diario',
    label: 'Diario de tips',
    icon: 'menu_book',
    emoji: '📖',
    image: '/kit/diario.png',
    gradient: 'linear-gradient(135deg, #fff0c9 0%, #ffe0a3 100%)',
    border: '#fbbf24',
    text: '#78350f',
    screen: 'diario'
  }
];

export const ApoyosScreen = () => {
  const { setActiveScreen } = useApp();

  const goBack = () => {
    try { audioService.playClick(); } catch (e) {}
    setActiveScreen('none');
  };

  const handleOpen = (screenId) => {
    try { audioService.playPop(); } catch (e) {}
    setActiveScreen(screenId);
  };

  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{
        background: 'linear-gradient(180deg, #fef6ff 0%, #f0f7ff 50%, #f0fff4 100%)'
      }}
    >
      <header
        className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 4px 16px rgba(139, 92, 246, 0.06)'
        }}
      >
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full font-label-md text-label-md font-bold active:scale-95 transition-all cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(196, 181, 253, 0.5)',
              color: '#7c3aed'
            }}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Volver</span>
          </button>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(196, 181, 253, 0.5)'
            }}
          >
            <span className="text-lg">✨</span>
            <span
              className="font-label-sm text-label-sm font-black uppercase tracking-wider"
              style={{ color: '#7c3aed' }}
            >
              Mi kit
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 pb-12 px-4 max-w-md mx-auto">

        {/* Subtítulo (sin el H1 redundante) */}
        <div className="w-full mb-5 text-center">
          <p
            className="font-body-sm"
            style={{ color: '#7c6f9e' }}
          >
            Tus herramientas, todas juntas 🌱
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          {BUTTONS.map((btn) => {
            const hasImage = Boolean(btn.image);

            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => handleOpen(btn.screen)}
                className="aspect-square flex flex-col items-center justify-center gap-2 active:scale-[0.96] transition-all cursor-pointer relative"
                style={
                  hasImage
                    ? {
                        background: 'transparent',
                        border: 'none',
                        boxShadow: 'none',
                        padding: 0,
                        borderRadius: 0,
                        overflow: 'visible'
                      }
                    : {
                        background: btn.gradient,
                        border: `2px solid ${btn.border}`,
                        boxShadow: `0 6px 0 0 ${btn.border}, 0 10px 20px rgba(0, 0, 0, 0.05)`,
                        borderRadius: '1.5rem',
                        overflow: 'hidden'
                      }
                }
              >
                {hasImage ? (
                  <img
                    src={btn.image}
                    alt={btn.label}
                    draggable={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                      pointerEvents: 'none'
                    }}
                  />
                ) : (
                  <>
                    <span
                      className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-40 pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 70%)'
                      }}
                    />

                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: '52px',
                        color: btn.text,
                        fontVariationSettings: '"FILL" 1',
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))',
                        position: 'relative',
                        zIndex: 1
                      }}
                    >
                      {btn.icon}
                    </span>

                    <span
                      className="font-black uppercase tracking-wider"
                      style={{
                        color: btn.text,
                        fontSize: '13px',
                        position: 'relative',
                        zIndex: 1,
                        textShadow: '0 1px 0 rgba(255,255,255,0.5)'
                      }}
                    >
                      {btn.label}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>

        <div
          className="w-full mt-6 p-3 rounded-2xl text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }}
        >
          <p
            className="font-body-sm"
            style={{ color: '#7c6f9e', fontSize: '12px' }}
          >
            🐾 Sparky dice: las herramientas están acá cuando las necesites.
          </p>
        </div>

      </main>
    </div>
  );
};