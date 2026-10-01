import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../../services/audioService';

const INHALE_MS = 4000;
const EXHALE_MS = 4000;
const TOTAL_BREATHS = 3;

export default function BarcaExercise({ onExit }) {
  const [phase, setPhase] = useState('inhale'); // 'inhale' | 'exhale' | 'done'
  const [breathCount, setBreathCount] = useState(1);
  const [isRunning, setIsRunning] = useState(true);
  const timeoutRef = useRef(null);

  // Ciclo de respiración
  useEffect(() => {
    if (!isRunning) return;
    if (phase === 'done') return;

    const duration = phase === 'inhale' ? INHALE_MS : EXHALE_MS;

    timeoutRef.current = setTimeout(() => {
      if (phase === 'inhale') {
        setPhase('exhale');
      } else {
        // Terminó una respiración completa
        if (breathCount >= TOTAL_BREATHS) {
          setPhase('done');
          try { audioService.playSuccess(); } catch (e) {}
        } else {
          setBreathCount((c) => c + 1);
          setPhase('inhale');
        }
      }
    }, duration);

    return () => clearTimeout(timeoutRef.current);
  }, [phase, breathCount, isRunning]);

  // Sonidos suaves en cada transición
  useEffect(() => {
    if (phase === 'inhale' && isRunning) {
      try { audioService.playTone(523.25, 0.15); } catch (e) {}
    }
    if (phase === 'exhale' && isRunning) {
      try { audioService.playTone(392.00, 0.15); } catch (e) {}
    }
  }, [phase, isRunning]);

  const handleRestart = () => {
    try { audioService.playPop(); } catch (e) {}
    setPhase('inhale');
    setBreathCount(1);
    setIsRunning(true);
  };

  const handlePause = () => {
    try { audioService.playClick(); } catch (e) {}
    setIsRunning((v) => !v);
  };

  // Posición del barco: sube en inhale, baja en exhale
  const boatOffset = phase === 'inhale' ? -22 : 0;
  const isDone = phase === 'done';
  const isInhale = phase === 'inhale';
  const isExhale = phase === 'exhale';

  return (
    <div
      className="fixed inset-0 flex flex-col z-[250]"
      style={{
        background: 'linear-gradient(180deg, #a8e6cf 0%, #7dd3c0 100%)'
      }}
    >
      {/* Header */}
      <div
        className="w-full pt-safe backdrop-blur-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.5)'
        }}
      >
        <div className="h-14 px-4 flex items-center justify-between gap-2 max-w-md mx-auto">
          <button
            type="button"
            onClick={onExit}
            className="inline-flex items-center gap-1.5 h-10 px-3 rounded-full font-bold text-sm active:scale-95 transition-all cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(6, 95, 70, 0.2)',
              color: '#065f46'
            }}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            <span>Salir</span>
          </button>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(6, 95, 70, 0.2)'
            }}
          >
            <span className="text-base">🚣</span>
            <span
              className="font-black uppercase tracking-wider"
              style={{ color: '#065f46', fontSize: '10px' }}
            >
              La barca
            </span>
          </div>

          <button
            type="button"
            onClick={isDone ? handleRestart : handlePause}
            className="w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition-all cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(6, 95, 70, 0.2)',
              color: '#065f46'
            }}
            title={isDone ? 'Volver a empezar' : isRunning ? 'Pausar' : 'Continuar'}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isDone ? 'refresh' : isRunning ? 'pause' : 'play_arrow'}
            </span>
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col items-center justify-between px-4 py-4 w-full max-w-md mx-auto">

        {/* Contador */}
        <div className="w-full text-center mt-1">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full"
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              color: '#065f46',
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            {isDone
              ? '✨ ¡Muy bien!'
              : `Respiración ${breathCount} de ${TOTAL_BREATHS}`}
          </span>
        </div>

        {/* Imagen con barco animado */}
        <div className="w-full relative flex items-center justify-center my-2">
          <div className="w-full relative" style={{ aspectRatio: '16/10' }}>

            {/* Fondo: niño + agua */}
            <img
              src="/respiro/barcofondo.png"
              alt=""
              className="w-full h-full object-contain block rounded-3xl"
              draggable={false}
            />

            {/* Barco animado encima */}
                          <img
              src="/respiro/barco.png"
              alt=""
              draggable={false}
              className="absolute inset-0 w-full h-full object-contain transition-transform ease-in-out pointer-events-none"
              style={{
                transform: `translateY(${boatOffset}px)`,
                transitionDuration: isInhale ? `${INHALE_MS}ms` : `${EXHALE_MS}ms`,
                transitionTimingFunction: 'ease-in-out'
              }}
            />
          </div>
        </div>

        {/* Indicación grande */}
        <div className="w-full flex flex-col items-center gap-2 mt-1">
          {!isDone ? (
            <>
              <span
                className="font-black tracking-widest uppercase transition-all duration-500"
                style={{
                  color: '#065f46',
                  fontSize: isInhale ? '28px' : '26px',
                  opacity: 1,
                  letterSpacing: '0.15em'
                }}
              >
                {isInhale ? 'Inspirás' : 'Espirás'}
              </span>
              <p
                className="text-center leading-snug max-w-xs transition-opacity duration-300"
                style={{
                  color: '#0f766e',
                  fontSize: '13px',
                  fontWeight: 600,
                  opacity: 0.9
                }}
              >
                {isInhale
                  ? 'Sentí cómo sube la barca sobre las olas. Sin prisa.'
                  : 'Soltá el aire despacio. La barca baja suave.'}
              </p>
            </>
          ) : (
            <>
              <span
                className="font-black tracking-widest uppercase"
                style={{ color: '#065f46', fontSize: '26px', letterSpacing: '0.1em' }}
              >
                🌊 ¡Terminaste!
              </span>
              <p
                className="text-center leading-snug max-w-xs mt-1"
                style={{ color: '#0f766e', fontSize: '14px', fontWeight: 600 }}
              >
                Sentí cómo está tu cuerpo ahora. ¿Más tranquilo?
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-5 py-3 rounded-2xl font-black text-sm active:scale-95 transition-all cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #a8e6cf 0%, #7dd3c0 100%)',
                    color: '#064e3b',
                    boxShadow: '0 3px 0 0 #5cb8a8'
                  }}
                >
                  🔁 Otra vez
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="px-5 py-3 rounded-2xl font-black text-sm active:scale-95 transition-all cursor-pointer"
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    color: '#065f46',
                    border: '1.5px solid rgba(6, 95, 70, 0.25)'
                  }}
                >
                  Listo
                </button>
              </div>
            </>
          )}
        </div>

        {/* Pie */}
        <div
          className="w-full py-2 mt-1 rounded-2xl text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.7)'
          }}
        >
          <span style={{ color: '#0f766e', fontSize: '11px', fontWeight: 700 }}>
            🐾 Sparky respira contigo
          </span>
        </div>

      </div>
    </div>
  );
}