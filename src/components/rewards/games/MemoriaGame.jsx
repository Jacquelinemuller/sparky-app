import React, { useState } from 'react';
import { audioService } from '../../../services/audioService';

const IMAGES = [
  '/memoria/1.png',
  '/memoria/2.png',
  '/memoria/3.png',
  '/memoria/4.png',
  '/memoria/5.png',
  '/memoria/6.png'
];

const C = {
  bg: '#09090f',
  cardBack: '#1e1e36',
  lime: '#22c55e',
  limeBright: '#4ade80',
  cyan: '#06b6d4',
  cyanBright: '#38bdf8',
  text: '#ffffff',
  textMuted: '#94a3b8'
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck() {
  const pairs = [...IMAGES, ...IMAGES];
  return shuffle(pairs).map((img, idx) => ({
    id: idx,
    img
  }));
}

export default function MemoriaGame({ onExit }) {
  const [deck, setDeck] = useState(buildDeck);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [lockBoard, setLockBoard] = useState(false);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const handleCardClick = (idx) => {
    if (lockBoard) return;
    if (flipped.includes(idx)) return;
    if (matched.includes(idx)) return;

    try { audioService.playPop(); } catch (e) {}

    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setLockBoard(true);
      setMoves((m) => m + 1);
      const [a, b] = newFlipped;

      if (deck[a].img === deck[b].img) {
        setTimeout(() => {
          const newMatched = [...matched, a, b];
          setMatched(newMatched);
          setFlipped([]);
          setLockBoard(false);
          try { audioService.playSuccess(); } catch (e) {}
          if (newMatched.length === deck.length) {
            setWon(true);
          }
        }, 450);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLockBoard(false);
        }, 800);
      }
    }
  };

  const handleReset = () => {
    setDeck(buildDeck());
    setFlipped([]);
    setMatched([]);
    setLockBoard(false);
    setMoves(0);
    setWon(false);
    try { audioService.playClick(); } catch (e) {}
  };

  // ============================================
  // PANTALLA DE VICTORIA
  // ============================================
  if (won) {
    return (
      <div className="w-full flex flex-col items-center gap-4 py-8 px-4">
        <div className="text-7xl animate-bounce">🎉</div>
        <h2 className="text-2xl font-black text-white">¡Ganaste!</h2>
        <p className="text-sm font-bold" style={{ color: C.textMuted }}>
          Lo lograste en <span style={{ color: C.limeBright }}>{moves}</span> intentos
        </p>
        <div className="flex gap-2 w-full max-w-xs mt-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 py-3 rounded-2xl font-black text-sm cursor-pointer active:scale-95 transition-all"
            style={{
              background: `linear-gradient(135deg, ${C.lime} 0%, ${C.limeBright} 100%)`,
              color: '#000',
              boxShadow: `0 0 16px ${C.lime}80`
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
              color: C.textMuted,
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
  // TABLERO
  // ============================================
  return (
    <div
      className="w-full flex flex-col gap-3 relative rounded-3xl overflow-hidden p-3"
      style={{
        backgroundImage: 'url(/memoria/fondo.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100%'
      }}
    >
      {/* O        {/* Overlay suave para legibilidad */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, rgba(9,9,15,0.15) 0%, rgba(9,9,15,0.55) 100%)'
        }}
      />

      {/* Contenido sobre el fondo */}
      <div className="relative z-10 flex flex-col gap-3">

        {/* Barra superior */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer active:scale-95 transition-all backdrop-blur-sm"
            style={{
              background: 'rgba(9, 9, 15, 0.6)',
              color: C.textMuted,
              border: '1px solid rgba(148, 163, 184, 0.3)'
            }}
          >
            ← Volver
          </button>

          <div
            className="px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 backdrop-blur-sm"
            style={{
              background: 'rgba(6, 182, 212, 0.25)',
              color: C.cyanBright,
              border: '1px solid rgba(6, 182, 212, 0.5)'
            }}
          >
            <span>🎯</span>
            <span>{moves} intentos</span>
          </div>
        </div>

        {/* Instrucción */}
        <p
          className="text-center text-xs font-black"
          style={{
            color: C.text,
            textShadow: '0 2px 6px rgba(0,0,0,0.8)'
          }}
        >
          Encontrá los 6 pares ✨
        </p>

        {/* Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          {deck.map((card, idx) => {
            const isFlipped = flipped.includes(idx);
            const isMatched = matched.includes(idx);
            const showImage = isFlipped || isMatched;

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(idx)}
                className="aspect-square rounded-2xl flex items-center justify-center overflow-hidden transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
                style={{
                  background: isMatched
                    ? 'rgba(34, 197, 94, 0.35)'
                    : showImage
                    ? 'rgba(6, 182, 212, 0.35)'
                    : 'rgba(19, 19, 34, 0.75)',
                  border: `2px solid ${
                    isMatched
                      ? 'rgba(34, 197, 94, 0.8)'
                      : showImage
                      ? 'rgba(6, 182, 212, 0.7)'
                      : 'rgba(6, 182, 212, 0.35)'
                  }`,
                  boxShadow: isMatched
                    ? '0 0 16px rgba(34, 197, 94, 0.5)'
                    : showImage
                    ? '0 0 12px rgba(6, 182, 212, 0.4)'
                    : '0 4px 12px rgba(0, 0, 0, 0.4)',
                  opacity: isMatched ? 0.85 : 1
                }}
              >
                {showImage ? (
                  <img
                    src={card.img}
                    alt=""
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <span
                    className="text-3xl font-black"
                    style={{ color: 'rgba(6, 182, 212, 0.6)' }}
                  >
                    ?
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}