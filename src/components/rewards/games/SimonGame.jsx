import React, { useState, useRef, useEffect } from 'react';
import { audioService } from '../../../services/audioService';

// ============================================
// PADS (colores arcade + frecuencias pentatónicas)
// ============================================
const PADS = [
  { id: 0, color: '#22c55e', glow: '#4ade80', freq: 261.63, label: 'Verde' },
  { id: 1, color: '#ff2d87', glow: '#ff5fa6', freq: 329.63, label: 'Rosa' },
  { id: 2, color: '#facc15', glow: '#fde047', freq: 392.00, label: 'Amarillo' },
  { id: 3, color: '#06b6d4', glow: '#22d3ee', freq: 523.25, label: 'Cian' }
];

const BEST_SCORE_KEY = 'sparky_simon_best';

export default function SimonGame({ onExit }) {
  const [sequence, setSequence] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [activePad, setActivePad] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle' | 'showing' | 'waiting' | 'gameover'
  const [completedRounds, setCompletedRounds] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem(BEST_SCORE_KEY)) || 0;
    } catch (e) {
      return 0;
    }
  });

  const timerRef = useRef(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const wait = (ms) =>
    new Promise((res) => {
      timerRef.current = setTimeout(res, ms);
    });

  // ============================================
  // MOSTRAR SECUENCIA
  // ============================================
  const showSequence = async (seq) => {
    setStatus('showing');
    setActivePad(null);

    await wait(700);
    if (!isMounted.current) return;

    for (let i = 0; i < seq.length; i++) {
      if (!isMounted.current) return;
      const padId = seq[i];

      setActivePad(padId);
      try { audioService.playTone(PADS[padId].freq, 0.35); } catch (e) {}

      await wait(500);
      if (!isMounted.current) return;

      setActivePad(null);
      await wait(220);
    }

    if (!isMounted.current) return;
    setStatus('waiting');
    setPlayerIndex(0);
  };

  // ============================================
  // INICIAR JUEGO
  // ============================================
  const startGame = () => {
    try { audioService.playPop(); } catch (e) {}
    const first = Math.floor(Math.random() * 4);
    const newSeq = [first];
    setSequence(newSeq);
    setCompletedRounds(0);
    setPlayerIndex(0);
    showSequence(newSeq);
  };

  // ============================================
  // CLICK EN UN PAD
  // ============================================
  const handlePadClick = (padId) => {
    if (status !== 'waiting') return;

    // Feedback visual + sonoro
    setActivePad(padId);
    try { audioService.playTone(PADS[padId].freq, 0.3); } catch (e) {}

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (isMounted.current) setActivePad(null);
    }, 280);

    // Verificar
    if (padId === sequence[playerIndex]) {
      const nextIndex = playerIndex + 1;

      if (nextIndex === sequence.length) {
        // Ronda completada
        const newCompleted = completedRounds + 1;
        setCompletedRounds(newCompleted);

        // Guardar récord si aplica
        if (newCompleted > bestScore) {
          setBestScore(newCompleted);
          try {
            localStorage.setItem(BEST_SCORE_KEY, String(newCompleted));
          } catch (e) {}
        }

        // Nueva secuencia con un paso más
        const newSeq = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(newSeq);
        setPlayerIndex(0);

        // Pausa dramática y mostrar siguiente ronda
        setStatus('showing');
        timerRef.current = setTimeout(() => {
          if (isMounted.current) showSequence(newSeq);
        }, 900);
      } else {
        setPlayerIndex(nextIndex);
      }
    } else {
      // Error
      try { audioService.playError(); } catch (e) {}
      setStatus('gameover');
    }
  };

  // ============================================
  // PANTALLA GAME OVER
  // ============================================
  if (status === 'gameover') {
    const newRecord = completedRounds > 0 && completedRounds === bestScore;
    return (
      <div className="w-full flex flex-col items-center gap-4 py-8 px-4">
        <div className="text-6xl">{newRecord ? '🏆' : '😅'}</div>
        <h2 className="text-2xl font-black text-white">
          {newRecord ? '¡Nuevo récord!' : '¡Perdiste!'}
        </h2>
        <p className="text-sm font-bold" style={{ color: '#94a3b8' }}>
          Llegaste al <span style={{ color: '#4ade80' }}>nivel {completedRounds + 1}</span>
        </p>

        <div className="flex items-center gap-3 mt-2">
          <div
            className="px-4 py-2 rounded-xl flex items-center gap-2"
            style={{
              background: 'rgba(250, 204, 21, 0.12)',
              border: '1px solid rgba(250, 204, 21, 0.4)'
            }}
          >
            <span className="text-sm">🎯</span>
            <span className="text-sm font-black" style={{ color: '#facc15' }}>
              {completedRounds} rondas
            </span>
          </div>

          <div
            className="px-4 py-2 rounded-xl flex items-center gap-2"
            style={{
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.4)'
            }}
          >
            <span className="text-sm">👑</span>
            <span className="text-sm font-black" style={{ color: '#22d3ee' }}>
              {bestScore} récord
            </span>
          </div>
        </div>

        <div className="flex gap-2 w-full max-w-xs mt-4">
          <button
            type="button"
            onClick={startGame}
            className="flex-1 py-3 rounded-2xl font-black text-sm cursor-pointer active:scale-95 transition-all"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
              color: '#000',
              boxShadow: '0 0 16px #22c55e80'
            }}
          >
            Jugar otra vez
          </button>
          <button
            type="button"
            onClick={onExit}
            className="flex-1 py-3 rounded-2xl font-black text-sm cursor-pointer active:scale-95 transition-all"
            style={{
              background: 'rgba(148, 163, 184, 0.15)',
              color: '#94a3b8',
              border: '1px solid rgba(148, 163, 184, 0.25)'
            }}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // JUEGO EN SÍ
  // ============================================
  const isShowing = status === 'showing';
  const isWaiting = status === 'waiting';
  const isIdle = status === 'idle';

  return (
    <div className="w-full flex flex-col gap-3">

      {/* Barra superior */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onExit}
          className="px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer active:scale-95 transition-all"
          style={{
            background: 'rgba(148, 163, 184, 0.12)',
            color: '#94a3b8',
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}
        >
          ← Volver
        </button>

        <div
          className="px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1"
          style={{
            background: 'rgba(6, 182, 212, 0.12)',
            color: '#22d3ee',
            border: '1px solid rgba(6, 182, 212, 0.3)'
          }}
        >
          <span>🎯</span>
          <span>Nivel {completedRounds + 1}</span>
        </div>

        <div
          className="px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1"
          style={{
            background: 'rgba(250, 204, 21, 0.12)',
            color: '#facc15',
            border: '1px solid rgba(250, 204, 21, 0.3)'
          }}
        >
          <span>👑</span>
          <span>{bestScore}</span>
        </div>
      </div>

      {/* Estado / instrucción */}
      <div
        className="w-full px-3 py-2.5 rounded-2xl flex items-center justify-center gap-2 min-h-[44px]"
        style={{
          background: isShowing
            ? 'rgba(6, 182, 212, 0.12)'
            : isWaiting
            ? 'rgba(34, 197, 94, 0.12)'
            : 'rgba(148, 163, 184, 0.08)',
          border: `1px solid ${
            isShowing
              ? 'rgba(6, 182, 212, 0.3)'
              : isWaiting
              ? 'rgba(34, 197, 94, 0.3)'
              : 'rgba(148, 163, 184, 0.2)'
          }`
        }}
      >
        {isIdle && (
          <span className="text-xs font-black" style={{ color: '#94a3b8' }}>
            Tocá "Empezar" para arrancar 🎮
          </span>
        )}
        {isShowing && (
          <>
            <span className="text-base animate-pulse">👀</span>
            <span className="text-xs font-black" style={{ color: '#22d3ee' }}>
              Mirá la secuencia...
            </span>
          </>
        )}
        {isWaiting && (
          <>
            <span className="text-base">👆</span>
            <span className="text-xs font-black" style={{ color: '#4ade80' }}>
              ¡Tu turno! Repetí la secuencia
            </span>
          </>
        )}
      </div>

      {/* Tablero 2x2 */}
      <div className="grid grid-cols-2 gap-3 mt-1">
        {PADS.map((pad) => {
          const isActive = activePad === pad.id;
          const clickable = isWaiting;

          return (
            <button
              key={pad.id}
              type="button"
              onClick={() => handlePadClick(pad.id)}
              disabled={!clickable}
              className="aspect-square rounded-3xl transition-all duration-150"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${pad.glow} 0%, ${pad.color} 100%)`
                  : pad.color,
                opacity: isActive ? 1 : clickable ? 0.75 : isShowing ? 0.5 : 0.7,
                boxShadow: isActive
                  ? `0 0 40px ${pad.glow}, 0 0 80px ${pad.glow}80, inset 0 0 24px rgba(255,255,255,0.55)`
                  : `0 6px 0 rgba(0,0,0,0.35), inset 0 -6px 12px rgba(0,0,0,0.2)`,
                cursor: clickable ? 'pointer' : 'default',
                transform: isActive ? 'scale(1.04)' : 'scale(1)'
              }}
              aria-label={pad.label}
            />
          );
        })}
      </div>

      {/* Botón Empezar (solo en idle) */}
      {isIdle && (
        <button
          type="button"
          onClick={startGame}
          className="w-full mt-2 py-3.5 rounded-2xl font-black text-sm cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
            color: '#000',
            boxShadow: '0 0 16px #06b6d480'
          }}
        >
          <span>▶</span>
          <span>Empezar</span>
        </button>
      )}
    </div>
  );
}