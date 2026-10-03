import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';
import BarcaExercise from '../components/calma/BarcaExercise';
import ArbolExercise from '../components/calma/ArbolExercise';

const TECHNIQUES = [
  {
    id: 'barca',
    emoji: '🚣',
    label: 'La barca',
    description: 'Una barca de papel navega en tu panza',
    active: true,
    sound: '/sounds/barco.mp3'
  },
  {
    id: 'arbol',
    emoji: '🌳',
    label: 'El árbol',
    description: 'Creces como un árbol con cada respiración',
    active: true,
    sound: '/sounds/arbol.mp3'
  },
  {
    id: 'buho',
    emoji: '🦉',
    label: 'El búho',
    description: 'Girás la cabeza despacio, como el búho',
    active: false
  },
  {
    id: 'gato',
    emoji: '🐱',
    label: 'El gato',
    description: 'Te estirás con pereza y respirás profundo',
    active: false
  }
];

const AMBIENT_VOLUME = 0.35;
const SOUND_PREF_KEY = 'sparky_calma_sound';

export const CalmaScreen = () => {
  const { setActiveScreen } = useApp();
  const [activeExercise, setActiveExercise] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(SOUND_PREF_KEY);
    return saved === null ? true : saved === 'true';
  });

  // Guardar preferencia
  useEffect(() => {
    localStorage.setItem(SOUND_PREF_KEY, String(soundEnabled));
  }, [soundEnabled]);

  // Arrancar / parar sonido según el ejercicio activo
  useEffect(() => {
    if (!soundEnabled) {
      audioService.stopAmbientFile();
      return;
    }

    if (activeExercise === 'barca') {
      audioService.playAmbientFile('/sounds/barco.mp3', AMBIENT_VOLUME);
    } else if (activeExercise === 'arbol') {
      audioService.playAmbientFile('/sounds/arbol.mp3', AMBIENT_VOLUME);
    } else {
      audioService.stopAmbientFile();
    }

    return () => {
      audioService.stopAmbientFile();
    };
  }, [activeExercise, soundEnabled]);

  const goBack = () => {
    try { audioService.playClick(); } catch (e) {}
    setActiveScreen('apoyos');
  };

  const handleOpen = (tech) => {
    if (!tech.active) {
      try { audioService.playError(); } catch (e) {}
      return;
    }
    try { audioService.playPop(); } catch (e) {}
    setActiveExercise(tech.id);
  };

  const toggleSound = () => {
    try { audioService.playClick(); } catch (e) {}
    setSoundEnabled((v) => !v);
  };

  // ---------- Ejercicios activos ----------
  if (activeExercise === 'barca') {
    return (
      <>
        <SoundToggleButton enabled={soundEnabled} onToggle={toggleSound} />
        <BarcaExercise onExit={() => setActiveExercise(null)} />
      </>
    );
  }

  if (activeExercise === 'arbol') {
    return (
      <>
        <SoundToggleButton enabled={soundEnabled} onToggle={toggleSound} />
        <ArbolExercise onExit={() => setActiveExercise(null)} />
      </>
    );
  }

  // ---------- Pantalla de lista ----------
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
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full font-bold active:scale-95 transition-all cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(168, 230, 207, 0.6)',
              color: '#065f46'
            }}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Volver</span>
          </button>

          <div className="flex items-center gap-2">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(212, 244, 231, 0.6)',
                border: '1px solid rgba(168, 230, 207, 0.6)'
              }}
            >
              <span className="text-lg">🧘</span>
              <span
                className="font-black uppercase tracking-wider"
                style={{ color: '#065f46', fontSize: '11px' }}
              >
                Calma
              </span>
            </div>

            {/* 🔊 Toggle de sonido */}
            <button
              type="button"
              onClick={toggleSound}
              className="w-11 h-11 flex items-center justify-center rounded-full active:scale-95 transition-all cursor-pointer"
              style={{
                background: soundEnabled ? '#d4f4e7' : '#ffffff',
                border: '1px solid rgba(168, 230, 207, 0.6)',
                color: '#065f46'
              }}
              title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            >
              <span className="material-symbols-outlined text-[20px]">
                {soundEnabled ? 'volume_up' : 'volume_off'}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 pb-12 px-4 max-w-md mx-auto">

        <div className="w-full mb-5 text-center">
          <h1
            className="font-black leading-tight"
            style={{ color: '#064e3b', fontSize: '22px' }}
          >
            Vamos a respirar 🌿
          </h1>
          <p
            className="mt-1"
            style={{ color: '#4b7a68', fontSize: '13px' }}
          >
            Elegí una técnica. No hay prisa.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {TECHNIQUES.map((tech) => (
            <button
              key={tech.id}
              type="button"
              onClick={() => handleOpen(tech)}
              disabled={!tech.active}
              className="w-full p-4 rounded-3xl flex items-center gap-3 text-left transition-all active:scale-[0.98] cursor-pointer relative overflow-hidden"
              style={{
                background: tech.active
                  ? 'linear-gradient(135deg, #ffffff 0%, #e8faf1 100%)'
                  : 'rgba(255, 255, 255, 0.55)',
                border: `2px solid ${tech.active ? '#7dd3c0' : '#cbd5e1'}`,
                boxShadow: tech.active
                  ? '0 4px 0 0 #7dd3c0'
                  : '0 2px 0 0 #e2e8f0',
                opacity: tech.active ? 1 : 0.7
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{
                  background: tech.active ? '#d4f4e7' : '#f1f5f9',
                  border: `1.5px solid ${tech.active ? '#7dd3c0' : '#e2e8f0'}`
                }}
              >
                {tech.emoji}
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <span
                  className="font-black leading-tight"
                  style={{
                    color: tech.active ? '#064e3b' : '#64748b',
                    fontSize: '15px'
                  }}
                >
                  {tech.label}
                </span>
                <span
                  className="leading-snug mt-0.5"
                  style={{
                    color: tech.active ? '#0f766e' : '#94a3b8',
                    fontSize: '12px'
                  }}
                >
                  {tech.description}
                </span>
              </div>

              {tech.active ? (
                <span
                  className="material-symbols-outlined flex-shrink-0"
                  style={{ color: '#065f46', fontSize: '24px' }}
                >
                  play_circle
                </span>
              ) : (
                <span
                  className="px-2 py-0.5 rounded-full font-black uppercase tracking-wider flex-shrink-0"
                  style={{
                    background: '#f1f5f9',
                    color: '#94a3b8',
                    fontSize: '9px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  Pronto
                </span>
              )}
            </button>
          ))}
        </div>

        <div
          className="w-full mt-6 p-3 rounded-2xl text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }}
        >
          <p
            style={{ color: '#4b7a68', fontSize: '12px' }}
          >
            🌱 Respirar no es una tarea. Es un regalo para tu cuerpo.
          </p>
        </div>

      </main>
    </div>
  );
};

// 🔊 Botón flotante de mute que aparece DURANTE un ejercicio
function SoundToggleButton({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="fixed active:scale-95 transition-all cursor-pointer z-[100]"
      style={{
        top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        right: '16px',
        width: '44px',
        height: '44px',
        borderRadius: '999px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: enabled ? 'rgba(212, 244, 231, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        border: '1.5px solid rgba(168, 230, 207, 0.8)',
        color: '#065f46',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}
      title={enabled ? 'Silenciar sonidos' : 'Activar sonidos'}
    >
      <span className="material-symbols-outlined text-[22px]">
        {enabled ? 'volume_up' : 'volume_off'}
      </span>
    </button>
  );
}