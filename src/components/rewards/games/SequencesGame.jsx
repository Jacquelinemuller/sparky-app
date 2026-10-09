import React, { useState, useEffect, useRef, useCallback } from 'react';
import { audioService } from '../../../services/audioService';

// ============================================
// PALETA DE MADERA
// ============================================
const W = {
  frameLight: '#f5d5a8',
  frameMid: '#c8956d',
  frameDark: '#7c4a1e',
  frameBorder: '#3d1f08',
  frameHighlight: 'rgba(255,240,200,0.7)',

  tileLight: '#f0d4a8',
  tileMid: '#d4a876',
  tileDark: '#8b5a2b',
  tileDeep: '#4a2a10',
  tileBorder: '#3d1f08',
  tileHighlight: 'rgba(255,240,200,0.8)',

  panelBg: '#5c3a1e',
  panelDeep: '#2e1a0a',

  text: '#ffffff',
  textDark: '#3d1f08',
  textMuted: '#e8d5b5',

  cyan: '#06b6d4',
  cyanBright: '#38bdf8',
  limeBright: '#4ade80',
  magenta: '#ff2d87',
  amber: '#facc15'
};

// ============================================
// NIVELES con colores propios
// ============================================
const LEVELS = {
  facil: {
    id: 'facil',
    label: 'Fácil',
    emoji: '🟢',

    rounds: 8,
    timeLimit: null,
    colorTop: '#86efac',
    colorMid: '#22c55e',
    colorBot: '#15803d',
    colorDeep: '#052e16',
    colorBorder: '#14532d',
    colorHighlight: 'rgba(255,255,255,0.6)'
  },
  medio: {
    id: 'medio',
    label: 'Medio',
    emoji: '🟡',
    rounds: 12,
    timeLimit: 10000,
    colorTop: '#fde68a',
    colorMid: '#f59e0b',
    colorBot: '#b45309',
    colorDeep: '#451a03',
    colorBorder: '#78350f',
    colorHighlight: 'rgba(255,255,255,0.6)'
  },
  dificil: {
    id: 'dificil',
    label: 'Difícil',
    emoji: '🔴',
    rounds: 16,
    timeLimit: 8000,
    colorTop: '#fca5a5',
    colorMid: '#ef4444',
    colorBot: '#991b1b',
    colorDeep: '#450a0a',
    colorBorder: '#7f1d1d',
    colorHighlight: 'rgba(255,255,255,0.6)'
  }
};

// ============================================
// BANCO DE PATRONES
// ============================================
const PATTERNS = {
  facil: [
    { sequence: ['🔴', '🔵', '🔴', '🔵', '🔴'], answer: '🔵', pool: ['🔴', '🔵', '🟢', '🟡'] },
    { sequence: ['⭐', '🌙', '⭐', '🌙', '⭐'], answer: '🌙', pool: ['⭐', '🌙', '☀️', '✨'] },
    { sequence: ['🍎', '🍌', '🍎', '🍌', '🍎'], answer: '🍌', pool: ['🍎', '🍌', '🍇', '🍓'] },
    { sequence: ['🐶', '🐱', '🐶', '🐱', '🐶'], answer: '🐱', pool: ['🐶', '🐱', '🐰', '🐻'] },
    { sequence: ['🔴', '🔵', '🟢', '🔴', '🔵'], answer: '🟢', pool: ['🔴', '🔵', '🟢', '🟡'] },
    { sequence: ['🍎', '🍌', '🍇', '🍎', '🍌'], answer: '🍇', pool: ['🍎', '🍌', '🍇', '🍓'] },
    { sequence: ['😀', '😎', '😀', '😎', '😀'], answer: '😎', pool: ['😀', '😎', '😢', '😡'] },
    { sequence: ['⬆️', '⬇️', '⬆️', '⬇️', '⬆️'], answer: '⬇️', pool: ['⬆️', '⬇️', '⬅️', '➡️'] }
  ],
  medio: [
    { sequence: ['🔴', '🔵', '🟢', '🟡', '🔴', '🔵'], answer: '🟢', pool: ['🔴', '🔵', '🟢', '🟡'] },
    { sequence: ['🔴', '🔴', '🔵', '🔴', '🔴', '🔵'], answer: '🔴', pool: ['🔴', '🔵', '🟢', '🟡'] },
    { sequence: ['🔴', '🔵', '🟢', '🔵', '🔴', '🔵'], answer: '🟢', pool: ['🔴', '🔵', '🟢', '🟡'] },
    { sequence: ['⬆️', '➡️', '⬇️', '⬅️', '⬆️', '➡️'], answer: '⬇️', pool: ['⬆️', '➡️', '⬇️', '⬅️'] },
    { sequence: ['🍎', '🍌', '🍇', '🍓', '🍎', '🍌'], answer: '🍇', pool: ['🍎', '🍌', '🍇', '🍓'] },
    { sequence: ['⭐', '⭐', '🌙', '⭐', '⭐', '🌙'], answer: '⭐', pool: ['⭐', '🌙', '☀️', '✨'] },
    { sequence: ['🐶', '🐱', '🐰', '🐻', '🐶', '🐱'], answer: '🐰', pool: ['🐶', '🐱', '🐰', '🐻'] },
    { sequence: ['🔴', '🟡', '🔴', '🟡', '🔴', '🟡'], answer: '🔴', pool: ['🔴', '🟡', '🔵', '🟢'] },
    { sequence: ['1️⃣', '2️⃣', '3️⃣', '1️⃣', '2️⃣', '3️⃣'], answer: '1️⃣', pool: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'] },
    { sequence: ['😀', '😀', '😎', '😀', '😀', '😎'], answer: '😀', pool: ['😀', '😎', '😢', '😡'] }
  ],
  dificil: [
    { sequence: ['🔴', '🔵', '🟢', '🟡', '🟣', '🔴'], answer: '🔵', pool: ['🔴', '🔵', '🟢', '🟡', '🟣'] },
    { sequence: ['🔴', '🔵', '🔵', '🔴', '🔴', '🔵'], answer: '🔵', pool: ['🔴', '🔵', '🟢', '🟡'] },
    { sequence: ['🔴', '🟢', '🔵', '🟢', '🔴', '🟢'], answer: '🔵', pool: ['🔴', '🔵', '🟢', '🟡'] },
    { sequence: ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️'], answer: '⬅️', pool: ['⬆️', '➡️', '⬇️', '⬅️', '↗️', '↘️', '↙️', '↖️'] },
    { sequence: ['⭐', '🌙', '⭐', '⭐', '🌙', '⭐'], answer: '⭐', pool: ['⭐', '🌙', '☀️', '✨'] },
    { sequence: ['🔴', '🔵', '🟢', '🟢', '🔵', '🔴'], answer: '🔵', pool: ['🔴', '🔵', '🟢', '🟡'] },
    { sequence: ['🍎', '🍌', '🍇', '🍓', '🍒', '🍎'], answer: '🍌', pool: ['🍎', '🍌', '🍇', '🍓', '🍒'] },
    { sequence: ['🔴', '🔵', '🔴', '🔴', '🔵', '🔴'], answer: '🔵', pool: ['🔴', '🔵', '🟢', '🟡'] },
    { sequence: ['1️⃣', '2️⃣', '4️⃣', '8️⃣', '1️⃣', '2️⃣'], answer: '4️⃣', pool: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '8️⃣'] },
    { sequence: ['😀', '😀', '😎', '😡', '😀', '😀'], answer: '😎', pool: ['😀', '😎', '😢', '😡'] }
  ]
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

function createRound(levelId) {
  const patterns = PATTERNS[levelId];
  if (!patterns || patterns.length === 0) return null;

  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  if (!pattern) return null;

  const candidates = pattern.pool.filter((e) => e !== pattern.answer);
  const shuffled = shuffle(candidates);
  const distractors = shuffled.slice(0, 3);

  const fallback = ['🔴', '🔵', '🟢', '🟡', '🟣', '⭐'];
  let i = 0;
  while (distractors.length < 3 && i < fallback.length) {
    if (fallback[i] !== pattern.answer && !distractors.includes(fallback[i])) {
      distractors.push(fallback[i]);
    }
    i++;
  }

  const options = shuffle([pattern.answer, ...distractors]);

  return {
    sequence: pattern.sequence,
    answer: pattern.answer,
    options
  };
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function SequencesGame({ onExit }) {
  const [difficulty, setDifficulty] = useState(null);
  const [gameState, setGameState] = useState('select');
  const [round, setRound] = useState(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const timerRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  const startGame = (levelId, skipTutorial = false) => {
    if (!LEVELS[levelId]) {
      console.warn('startGame con levelId inválido:', levelId);
      return;
    }
    try { audioService.playPop(); } catch (e) {}

    setDifficulty(levelId);
    setRoundIndex(0);
    setCorrect(0);
    setFeedback(null);

    if (skipTutorial) {
      const r = createRound(levelId);
      if (r) {
        setRound(r);
        setGameState('playing');
      } else {
        setGameState('select');
      }
    } else {
      setGameState('tutorial');
    }
  };

  const beginPlayAfterTutorial = () => {
    if (!difficulty || !LEVELS[difficulty]) {
      console.warn('beginPlayAfterTutorial sin difficulty válido. Volviendo al selector.');
      setGameState('select');
      return;
    }
    const r = createRound(difficulty);
    if (!r) {
      console.warn('No se pudo crear la ronda. Volviendo al selector.');
      setGameState('select');
      return;
    }
    try { audioService.playPop(); } catch (e) {}
    setRound(r);
    setGameState('playing');
  };

  const handleAnswer = useCallback(
    (choice) => {
      if (!round || feedback) return;

      const isCorrect = choice === round.answer;

      if (isCorrect) {
        try { audioService.playPop(); } catch (e) {}
        setCorrect((c) => c + 1);
        setFeedback({ type: 'correct', choice, correctAnswer: round.answer });
      } else {
        try { audioService.playError(); } catch (e) {}
        setFeedback({ type: 'wrong', choice, correctAnswer: round.answer });
      }

      const delay = isCorrect ? 450 : 1000;
      feedbackTimeoutRef.current = setTimeout(() => {
        advanceRound();
      }, delay);
    },
    [round, feedback]
  );

  const advanceRound = useCallback(() => {
    setFeedback(null);

    const level = LEVELS[difficulty];
    if (!level) {
      setGameState('select');
      return;
    }

    const nextIndex = roundIndex + 1;

    if (nextIndex >= level.rounds) {
      try { audioService.playSuccess(); } catch (e) {}
      setGameState('results');
      return;
    }

    setRoundIndex(nextIndex);
    const r = createRound(difficulty);
    if (r) setRound(r);
  }, [roundIndex, difficulty]);

  useEffect(() => {
    if (gameState !== 'playing' || !round || feedback) return;

    const level = LEVELS[difficulty];
    if (!level || !level.timeLimit) return;

    timerRef.current = setTimeout(() => {
      try { audioService.playError(); } catch (e) {}
      setFeedback({ type: 'timeout', choice: null, correctAnswer: round.answer });

      feedbackTimeoutRef.current = setTimeout(() => {
        advanceRound();
      }, 1000);
    }, level.timeLimit);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, round, feedback, difficulty, advanceRound]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  const handleRetry = () => {
    if (!difficulty) return;
    startGame(difficulty, true);
  };

  const handleChangeLevel = () => {
    try { audioService.playClick(); } catch (e) {}
    setDifficulty(null);
    setRound(null);
    setGameState('select');
  };

  // ============================================
  // SELECTOR DE NIVEL
  // ============================================
  if (gameState === 'select') {
    return (
      <div className="w-full flex flex-col gap-4 items-center py-6 px-4">
        <img
          src="/games/secuencias.png"
          alt="Secuencias"
          className="w-24 h-24 object-contain mb-2"
          draggable={false}
        />
        <h2 className="text-2xl font-black text-white">Secuencias</h2>
        <p className="text-xs font-bold text-center mb-4" style={{ color: W.textMuted }}>
          Mirá el patrón y elegí<br />
          qué viene después.
        </p>

        <div className="w-full flex flex-col gap-3">
          {Object.values(LEVELS).map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => startGame(level.id)}
              className="w-full p-4 rounded-2xl flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden"
              style={{
                backgroundImage: 'url(/memoria/fondo.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: `3px solid ${level.colorBorder}`,
                boxShadow: `
                  0 5px 0 ${level.colorDeep},
                  inset 0 2px 0 rgba(255,240,200,0.4),
                  inset 0 -3px 0 rgba(0,0,0,0.4),
                  0 6px 16px rgba(0,0,0,0.4)
                `
              }}
            >
              {/* Overlay de color sutil según nivel */}
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(180deg, ${level.colorMid}40 0%, ${level.colorMid}20 100%)`,
                  mixBlendMode: 'overlay'
                }}
              />

              {/* Círculo del ícono con color del nivel */}
              <span
                className="text-3xl w-12 h-12 flex items-center justify-center rounded-full relative z-10"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${level.colorTop} 0%, ${level.colorMid} 60%, ${level.colorBot} 100%)`,
                  border: `2px solid ${level.colorBorder}`,
                  boxShadow: `
                    inset 0 -2px 4px rgba(0,0,0,0.3),
                    inset 0 2px 4px rgba(255,255,255,0.5),
                    0 2px 6px ${level.colorDeep}80
                  `
                }}
              >
                {level.emoji}
              </span>

              <div className="flex flex-col flex-1 items-start relative z-10">
                <span
                  className="text-sm font-black"
                  style={{
                    color: '#ffffff',
                    textShadow: `0 2px 0 ${level.colorDeep}, 0 3px 6px rgba(0,0,0,0.6)`
                  }}
                >
                  {level.label}
                </span>
                <span
                  className="text-[10px] font-bold"
                  style={{
                    color: 'rgba(255,255,255,0.95)',
                    textShadow: `0 1px 2px rgba(0,0,0,0.8)`
                  }}
                >
                  {level.rounds} rondas
                  {level.timeLimit ? ` · ${level.timeLimit / 1000}s` : ' · sin tiempo'}
                </span>
              </div>

              {/* Flecha con color del nivel */}
              <span
                className="material-symbols-outlined text-[22px] relative z-10 rounded-full w-9 h-9 flex items-center justify-center"
                style={{
                  color: '#ffffff',
                  background: `${level.colorMid}40`,
                  border: `1.5px solid ${level.colorBorder}`,
                  textShadow: `0 1px 2px ${level.colorDeep}`
                }}
              >
                arrow_forward
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onExit}
          className="mt-4 px-6 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
          style={{
            background: 'rgba(148, 163, 184, 0.12)',
            color: W.textMuted,
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}
        >
          ← Volver al arcade
        </button>
      </div>
    );
  }

  // ============================================
  // TUTORIAL
  // ============================================
  if (gameState === 'tutorial') {
    const exampleSequence = ['🔴', '🔵', '🔴', '🔵', '🔴'];
    const exampleAnswer = '🔵';

    return (
      <div className="w-full flex flex-col gap-4 items-center py-6 px-4">
        <div className="text-5xl mb-2">🧐</div>
        <h2 className="text-xl font-black text-white text-center">
          ¿Cómo se juega?
        </h2>

        <div
          className="w-full p-5 rounded-3xl flex flex-col items-center gap-4"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${W.panelBg} 0%, ${W.panelDeep} 100%)`,
            border: `3px solid ${W.frameBorder}`,
            boxShadow: `
              0 8px 0 ${W.frameBorder},
              inset 0 3px 0 ${W.frameHighlight},
              inset 0 -4px 0 rgba(0,0,0,0.4)
            `
          }}
        >
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {exampleSequence.map((emoji, i) => (
              <div
                key={`example-${i}`}
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{
                  background: `linear-gradient(180deg, ${W.tileLight} 0%, ${W.tileMid} 50%, ${W.tileDark} 100%)`,
                  border: `2px solid ${W.tileBorder}`,
                  boxShadow: `
                    inset 0 2px 0 ${W.tileHighlight},
                    inset 0 -3px 0 rgba(0,0,0,0.3),
                    0 3px 0 ${W.tileDeep}
                  `
                }}
              >
                {emoji}
              </div>
            ))}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-black"
              style={{
                background: `linear-gradient(180deg, ${W.tileLight} 0%, ${W.tileMid} 50%, ${W.tileDark} 100%)`,
                border: `2px solid ${W.tileBorder}`,
                boxShadow: `
                  inset 0 2px 0 ${W.tileHighlight},
                  inset 0 -3px 0 rgba(0,0,0,0.3),
                  0 3px 0 ${W.tileDeep},
                  0 0 20px rgba(250, 204, 21, 0.8)
                `,
                animation: 'pulseQuestion 1.5s ease-in-out infinite'
              }}
            >
              <span style={{ color: W.textDark }}>?</span>
            </div>
          </div>

          <div
            className="w-full p-3 rounded-xl flex flex-col items-center gap-1"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${W.frameDark}`
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: W.textMuted }}>
              El patrón es: rojo → azul → rojo → azul...
            </span>
            <span className="text-[11px] font-black mt-1" style={{ color: W.limeBright }}>
              👉 Así que el que sigue es {exampleAnswer}
            </span>
          </div>
        </div>

        <p className="text-xs font-bold text-center" style={{ color: W.textMuted }}>
          Buscá la regla y elegí el que sigue.
        </p>

        <div className="flex gap-2 w-full mt-2">
          <button
            type="button"
            onClick={handleChangeLevel}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: 'rgba(148, 163, 184, 0.12)',
              color: W.textMuted,
              border: '1px solid rgba(148, 163, 184, 0.2)'
            }}
          >
            ← Nivel
          </button>
          <button
            type="button"
            onClick={beginPlayAfterTutorial}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: `linear-gradient(180deg, ${W.tileLight} 0%, ${W.tileMid} 50%, ${W.tileDark} 100%)`,
              color: W.textDark,
              border: `2px solid ${W.tileBorder}`,
              boxShadow: `0 4px 0 ${W.tileDeep}, inset 0 2px 0 ${W.frameHighlight}`
            }}
          >
            ¡Entendido!
          </button>
        </div>

        <style>{`
          @keyframes pulseQuestion {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
        `}</style>
      </div>
    );
  }

  // ============================================
  // JUEGO
  // ============================================
  const level = LEVELS[difficulty];
  if (!level) {
    return (
      <div className="w-full flex flex-col gap-3 items-center py-8">
        <p className="text-white font-bold">Error de nivel. Volviendo...</p>
        <button
          type="button"
          onClick={handleChangeLevel}
          className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold"
        >
          Volver
        </button>
      </div>
    );
  }

  const progress = ((roundIndex + 1) / level.rounds) * 100;

  return (
    <div className="w-full flex flex-col gap-3 select-none">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleChangeLevel}
          className="px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer active:scale-95 transition-all"
          style={{
            background: 'rgba(148, 163, 184, 0.12)',
            color: W.textMuted,
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}
        >
          ← Nivel
        </button>

        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 rounded-full text-[10px] font-black"
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: W.cyanBright,
              border: '1px solid rgba(6, 182, 212, 0.4)'
            }}
          >
            {roundIndex + 1}/{level.rounds}
          </span>
          <span
            className="px-2 py-1 rounded-full text-[10px] font-black"
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              color: W.limeBright,
              border: '1px solid rgba(34, 197, 94, 0.4)'
            }}
          >
            ✅ {correct}
          </span>
        </div>
      </div>

      {/* Barra progreso */}
      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(148, 163, 184, 0.15)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${W.cyan} 0%, ${W.limeBright} 100%)`,
            boxShadow: `0 0 10px ${W.cyan}80`
          }}
        />
      </div>

      <p className="text-center text-xs font-black" style={{ color: W.textMuted }}>
        ¿Qué viene después?
      </p>

      {/* Panel de secuencia */}
      <div
        className="w-full rounded-3xl flex items-center justify-center p-6 relative overflow-hidden"
        style={{
          backgroundImage: 'url(/memoria/fondo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          border: `3px solid ${W.frameBorder}`,
          boxShadow: `
            0 8px 0 ${W.frameBorder},
            inset 0 3px 0 ${W.frameHighlight},
            inset 0 -4px 0 rgba(0,0,0,0.4),
            0 12px 32px rgba(0,0,0,0.6)
          `,
          minHeight: '160px'
        }}
      >
        {/* Tinte verde clarito sobre la madera */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'rgba(134, 239, 172, 0.65)',
            mixBlendMode: 'color'
          }}
        />

        {/* Highlight superior (le da relieve) */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: 0,
            left: 0,
            right: 0,
            height: '45%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)'
          }}
        />

        {/* Círculos decorativos sutiles (vetas) */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: '200px',
            height: '200px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        />
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: '130px',
            height: '130px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}
        />

        {round && (
          <div className="flex items-center gap-1.5 flex-wrap justify-center relative z-10">
            {round.sequence.map((emoji, i) => (
              <div
                key={`seq-${i}`}
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{
                  background: `linear-gradient(180deg, ${W.tileLight} 0%, ${W.tileMid} 50%, ${W.tileDark} 100%)`,
                  border: `2px solid ${W.tileBorder}`,
                  boxShadow: `
                    inset 0 2px 0 ${W.tileHighlight},
                    inset 0 -3px 0 rgba(0,0,0,0.3),
                    0 3px 0 ${W.tileDeep}
                  `
                }}
              >
                {emoji}
              </div>
            ))}
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-black"
              style={{
                background: feedback
                  ? feedback.type === 'correct'
                    ? `linear-gradient(180deg, #86efac 0%, #22c55e 50%, #15803d 100%)`
                    : `linear-gradient(180deg, #fca5a5 0%, #dc2626 50%, #7f1d1d 100%)`
                  : `linear-gradient(180deg, ${W.tileLight} 0%, ${W.tileMid} 50%, ${W.tileDark} 100%)`,
                border: `2px solid ${W.tileBorder}`,
                boxShadow: feedback
                  ? feedback.type === 'correct'
                    ? `inset 0 2px 0 rgba(255,255,255,0.6), 0 3px 0 ${W.tileDeep}, 0 0 20px #22c55e`
                    : `inset 0 2px 0 rgba(255,255,255,0.6), 0 3px 0 ${W.tileDeep}, 0 0 20px #dc2626`
                  : `inset 0 2px 0 ${W.tileHighlight}, inset 0 -3px 0 rgba(0,0,0,0.3), 0 3px 0 ${W.tileDeep}, 0 0 20px rgba(250, 204, 21, 0.6)`,
                animation: feedback ? 'none' : 'pulseQuestion 1.5s ease-in-out infinite'
              }}
            >
              {feedback ? (
                <span>{feedback.correctAnswer}</span>
              ) : (
                <span style={{ color: W.textDark }}>?</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className="w-full px-3 py-2 rounded-xl flex items-center gap-2 justify-center"
          style={{
            background:
              feedback.type === 'correct'
                ? 'rgba(34, 197, 94, 0.15)'
                : 'rgba(255, 45, 135, 0.15)',
            border: `1px solid ${
              feedback.type === 'correct'
                ? 'rgba(34, 197, 94, 0.4)'
                : 'rgba(255, 45, 135, 0.4)'
            }`
          }}
        >
          <span className="text-base">
            {feedback.type === 'correct' ? '✅' : feedback.type === 'timeout' ? '⏰' : '❌'}
          </span>
          <span
            className="text-[11px] font-black"
            style={{
              color: feedback.type === 'correct' ? W.limeBright : W.magenta
            }}
          >
            {feedback.type === 'correct'
              ? '¡Bien!'
              : feedback.type === 'timeout'
              ? 'Se acabó el tiempo'
              : 'Casi...'}
          </span>
        </div>
      )}

      {/* Opciones */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {round &&
          round.options.map((opt, idx) => {
            const isTheCorrectOne = feedback && feedback.correctAnswer === opt;
            const isWrongChoice = feedback && feedback.choice === opt;

            return (
              <button
                key={`opt-${idx}`}
                type="button"
                onClick={() => handleAnswer(opt)}
                disabled={!!feedback}
                className="rounded-xl transition-all cursor-pointer active:translate-y-1 flex items-center justify-center relative overflow-hidden"
                style={{
                  width: '72px',
                  height: '72px',
                  backgroundImage: 'url(/memoria/fondo.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: `2px solid ${W.tileBorder}`,
                  opacity: isWrongChoice ? 0.5 : 1,
                  boxShadow: isTheCorrectOne
                    ? `inset 0 2px 0 rgba(255,255,255,0.6), 0 4px 0 ${W.tileDeep}, 0 0 24px #22c55e`
                    : isWrongChoice
                    ? `inset 0 2px 0 rgba(255,255,255,0.6), 0 4px 0 ${W.tileDeep}, 0 0 24px #dc2626`
                    : `inset 0 2px 0 rgba(255,240,200,0.5), inset 0 -3px 0 rgba(0,0,0,0.35), 0 4px 0 ${W.tileDeep}`,
                  transform: isTheCorrectOne ? 'scale(1.08)' : 'scale(1)'
                }}
                aria-label={opt}
              >
                {/* Tinte verde clarito — cambia según estado */}
                <span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: isTheCorrectOne
                      ? 'rgba(173, 197, 34, 0.7)'
                      : isWrongChoice
                      ? 'rgba(239, 68, 68, 0.7)'
                      : 'rgba(240, 220, 190, 0.7)',
                    mixBlendMode: isTheCorrectOne || isWrongChoice ? 'multiply' : 'color'
                  }}
                />

                {/* Highlight superior */}
                <span
                  className="absolute pointer-events-none"
                  style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '45%',
                    background: `linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 100%)`,
                    borderTopLeftRadius: '10px',
                    borderTopRightRadius: '10px'
                  }}
                />

                {/* Emoji */}
                <span className="relative z-10 text-3xl">{opt}</span>
              </button>
            );
          })}
      </div>

      <style>{`
        @keyframes pulseQuestion {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>

      {gameState === 'results' && (
        <ResultsModal
          correct={correct}
          total={level.rounds}
          onRetry={handleRetry}
          onChangeLevel={handleChangeLevel}
          onExit={onExit}
        />
      )}
    </div>
  );
}

// ============================================
// MODAL DE RESULTADOS
// ============================================
function ResultsModal({ correct, total, onRetry, onChangeLevel, onExit }) {
  const percent = Math.round((correct / total) * 100);

  let title, message, emoji;
  if (percent >= 80) {
    title = '¡Increíble!';
    message = 'Tu cerebro ve los patrones al toque';
    emoji = '🏆';
  } else if (percent >= 60) {
    title = '¡Muy bien!';
    message = 'Se te dan bien las secuencias';
    emoji = '🎉';
  } else if (percent >= 40) {
    title = '¡Buen intento!';
    message = 'Buscá el ritmo de los patrones';
    emoji = '💪';
  } else {
    title = '¡Seguimos!';
    message = 'Este es difícil, pero se entrena';
    emoji = '🐾';
  }

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-sm p-6 rounded-3xl flex flex-col items-center text-center"
        style={{
          background: `linear-gradient(180deg, #1a1a2e 0%, #08081a 100%)`,
          border: `2px solid ${W.limeBright}`,
          boxShadow: `0 0 40px ${W.limeBright}80`
        }}
      >
        <span className="text-6xl mb-3">{emoji}</span>

        <h2 className="text-2xl font-black text-white mb-2">{title}</h2>

        <p className="text-sm font-bold mb-4" style={{ color: W.textMuted }}>
          {message}
        </p>

        <div
          className="w-full p-4 rounded-2xl mb-4 flex items-center justify-center gap-4"
          style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.3)'
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black" style={{ color: W.limeBright }}>
              {correct}
            </span>
            <span className="text-[10px] font-black" style={{ color: W.textMuted }}>
              aciertos
            </span>
          </div>
          <span className="text-2xl font-black" style={{ color: W.textMuted }}>/</span>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black" style={{ color: W.cyanBright }}>
              {total}
            </span>
            <span className="text-[10px] font-black" style={{ color: W.textMuted }}>
              total
            </span>
          </div>
        </div>

        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: `linear-gradient(135deg, #22c55e 0%, ${W.limeBright} 100%)`,
              color: '#000',
              boxShadow: `0 0 16px #22c55e80`
            }}
          >
            Otra ronda
          </button>
          <button
            type="button"
            onClick={onChangeLevel}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: W.cyanBright,
              border: `1.5px solid ${W.cyan}60`
            }}
          >
            Cambiar nivel
          </button>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="mt-3 text-[11px] font-black cursor-pointer active:scale-95 transition-all"
          style={{ color: W.textMuted }}
        >
          Salir al arcade
        </button>
      </div>
    </div>
  );
}