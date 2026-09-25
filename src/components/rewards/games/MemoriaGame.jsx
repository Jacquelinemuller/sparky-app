import React, { useState } from 'react';
import { audioService } from '../../../services/audioService';

// ============================================
// IMÁGENES DE LOS PARES
// Los archivos van en: public/memoria/1.png ... 6.png
// ============================================
const IMAGES = [
  '/memoria/1.png',
  '/memoria/2.png',
  '/memoria/3.png',
  '/memoria/4.png',
  '/memoria/5.png',
  '/memoria/6.png'
];

// ============================================
// COLORES ARCADE
// ============================================
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

// ============================================
// HELPERS
// ============================================
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

// ============================================
// COMPONENTE
// ============================================
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
    <div className="w-full flex flex-col gap-3">

      {/* Barra superior */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onExit}
          className="px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer active:scale-95 transition-all"
          style={{
            background: 'rgba(148, 163, 184, 0.12)',
            color: C.textMuted,
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}
        >
          ← Volver
        </button>

        <div
          className="px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1"
          style={{
            background: 'rgba(6, 182, 212, 0.12)',
            color: C.cyanBright,
            border: '1px solid rgba(6, 182, 212, 0.3)'
          }}
        >
          <span>🎯</span>
          <span>{moves} intentos</span>
        </div>
      </div>

      {/* Instrucción */}
      <p className="text-center text-xs font-black" style={{ color: C.textMuted }}>
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
              className="aspect-square rounded-2xl flex items-center justify-center overflow-hidden transition-all active:scale-95 cursor-pointer p-1.5"
              style={{
                background: isMatched
                  ? 'rgba(34, 197, 94, 0.15)'
                  : showImage
                  ? 'rgba(6, 182, 212, 0.12)'
                  : C.cardBack,
                border: `2px solid ${
                  isMatched
                    ? 'rgba(34, 197, 94, 0.6)'
                    : showImage
                    ? 'rgba(6, 182, 212, 0.5)'
                    : 'rgba(6, 182, 212, 0.2)'
                }`,
                boxShadow: isMatched
                  ? '0 0 12px rgba(34, 197, 94, 0.4)'
                  : showImage
                  ? '0 0 10px rgba(6, 182, 212, 0.3)'
                  : 'none',
                opacity: isMatched ? 0.75 : 1
              }}
            >
              {showImage ? (
                <img
                  src={card.img}
                  alt=""
                  className="w-full h-full object-contain rounded-xl"
                  draggable={false}
                />
              ) : (
                <span
                  className="text-3xl font-black"
                  style={{ color: 'rgba(6, 182, 212, 0.5)' }}
                >
                  ?
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}