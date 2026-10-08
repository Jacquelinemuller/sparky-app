import React, { useState, useEffect, useRef, useCallback } from 'react';
import { audioService } from '../../../services/audioService';

// ============================================
// COLORES
// ============================================
const C = {
  card: '#131322',
  cardBorder: 'rgba(6, 182, 212, 0.25)',
  cellBg: 'rgba(6, 182, 212, 0.05)',
  cellBorder: 'rgba(6, 182, 212, 0.15)',
  cellQuestion: 'rgba(250, 204, 21, 0.15)',
  cellQuestionBorder: '#facc15',
  cellAnswer: '#22c55e',
  cellWrong: '#ff2d87',
  lime: '#22c55e',
  limeBright: '#4ade80',
  cyan: '#06b6d4',
  cyanBright: '#38bdf8',
  magenta: '#ff2d87',
  amber: '#facc15',
  text: '#ffffff',
  textMuted: '#94a3b8'
};

// ============================================
// NIVELES
// ============================================
const LEVELS = {
  facil:   { id: 'facil',   label: 'Fácil',   emoji: '🟢', rounds: 8,  timeLimit: null },
  medio:   { id: 'medio',   label: 'Medio',   emoji: '🟡', rounds: 12, timeLimit: 10000 },
  dificil: { id: 'dificil', label: 'Difícil', emoji: '🔴', rounds: 16, timeLimit: 8000 }
};

// ============================================
// BANCO DE PATRONES
// Cada patrón tiene: sequence (array de emojis), answer (el que sigue), pool (para distractores)
// ============================================

const PATTERNS = {
  // ─── FÁCIL: alternancia de 2 y ciclo de 3 ───
  facil: [
    {
      sequence: ['🔴', '🔵', '🔴', '🔵', '🔴'],
      answer: '🔵',
      pool: ['🔴', '🔵', '🟢', '🟡']
    },
    {
      sequence: ['⭐', '🌙', '⭐', '🌙', '⭐'],
      answer: '🌙',
      pool: ['⭐', '🌙', '☀️', '✨']
    },
    {
      sequence: ['🍎', '🍌', '🍎', '🍌', '🍎'],
      answer: '🍌',
      pool: ['🍎', '🍌', '🍇', '🍓']
    },
    {
      sequence: ['🐶', '🐱', '🐶', '🐱', '🐶'],
      answer: '🐱',
      pool: ['🐶', '🐱', '🐰', '🐻']
    },
    {
      sequence: ['🔴', '🔵', '🟢', '🔴', '🔵'],
      answer: '🟢',
      pool: ['🔴', '🔵', '🟢', '🟡']
    },
    {
      sequence: ['🍎', '🍌', '🍇', '🍎', '🍌'],
      answer: '🍇',
      pool: ['🍎', '🍌', '🍇', '🍓']
    },
    {
      sequence: ['😀', '😎', '😀', '😎', '😀'],
      answer: '😎',
      pool: ['😀', '😎', '😢', '😡']
    },
    {
      sequence: ['⬆️', '⬇️', '⬆️', '⬇️', '⬆️'],
      answer: '⬇️',
      pool: ['⬆️', '⬇️', '⬅️', '➡️']
    }
  ],

  // ─── MEDIO: ciclos de 4 y dobles ───
  medio: [
    {
      sequence: ['🔴', '🔵', '🟢', '🟡', '🔴', '🔵'],
      answer: '🟢',
      pool: ['🔴', '🔵', '🟢', '🟡']
    },
    {
      sequence: ['🔴', '🔴', '🔵', '🔴', '🔴', '🔵'],
      answer: '🔴',
      pool: ['🔴', '🔵', '🟢', '🟡']
    },
    {
      sequence: ['🔴', '🔵', '🟢', '🔵', '🔴', '🔵'],
      answer: '🟢',
      pool: ['🔴', '🔵', '🟢', '🟡']
    },
    {
      sequence: ['⬆️', '➡️', '⬇️', '⬅️', '⬆️', '➡️'],
      answer: '⬇️',
      pool: ['⬆️', '➡️', '⬇️', '⬅️']
    },
    {
      sequence: ['🍎', '🍌', '🍇', '🍓', '🍎', '🍌'],
      answer: '🍇',
      pool: ['🍎', '🍌', '🍇', '🍓']
    },
    {
      sequence: ['⭐', '⭐', '🌙', '⭐', '⭐', '🌙'],
      answer: '⭐',
      pool: ['⭐', '🌙', '☀️', '✨']
    },
    {
      sequence: ['🐶', '🐱', '🐰', '🐻', '🐶', '🐱'],
      answer: '🐰',
      pool: ['🐶', '🐱', '🐰', '🐻']
    },
    {
      sequence: ['🔴', '🟡', '🔴', '🟡', '🔴', '🟡'],
      answer: '🔴',
      pool: ['🔴', '🟡', '🔵', '🟢']
    },
    {
      sequence: ['1️⃣', '2️⃣', '3️⃣', '1️⃣', '2️⃣', '3️⃣'],
      answer: '1️⃣',
      pool: ['1️⃣', '2️⃣', '3️⃣', '4️⃣']
    },
    {
      sequence: ['😀', '😀', '😎', '😀', '😀', '😎'],
      answer: '😀',
      pool: ['😀', '😎', '😢', '😡']
    }
  ],

  // ─── DIFÍCIL: ciclos de 5, estructuras complejas ───
  dificil: [
    {
      sequence: ['🔴', '🔵', '🟢', '🟡', '🟣', '🔴'],
      answer: '🔵',
      pool: ['🔴', '🔵', '🟢', '🟡', '🟣']
    },
    {
      sequence: ['🔴', '🔵', '🔵', '🔴', '🔴', '🔵'],
      answer: '🔵',
      pool: ['🔴', '🔵', '🟢', '🟡']
    },
    {
      sequence: ['🔴', '🟢', '🔵', '🟢', '🔴', '🟢'],
      answer: '🔵',
      pool: ['🔴', '🔵', '🟢', '🟡']
    },
    {
      sequence: ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️'],
      answer: '⬅️',
      pool: ['⬆️', '➡️', '⬇️', '⬅️', '↗️', '↘️', '↙️', '↖️']
    },
    {
      sequence: ['⭐', '🌙', '⭐', '⭐', '🌙', '⭐'],
      answer: '⭐',
      pool: ['⭐', '🌙', '☀️', '✨']
    },
    {
      sequence: ['🔴', '🔵', '🟢', '🟢', '🔵', '🔴'],
      answer: '🔵',
      pool: ['🔴', '🔵', '🟢', '🟡']
    },
    {
      sequence: ['🍎', '🍌', '🍇', '🍓', '🍒', '🍎'],
      answer: '🍌',
      pool: ['🍎', '🍌', '🍇', '🍓', '🍒']
    },
    {
      sequence: ['🔴', '🔵', '🔴', '🔴', '🔵', '🔴'],
      answer: '🔵',
      pool: ['🔴', '🔵', '🟢', '🟡']
    },
    {
      sequence: ['1️⃣', '2️⃣', '4️⃣', '8️⃣', '1️⃣', '2️⃣'],
      answer: '4️⃣',
      pool: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '8️⃣']
    },
    {
      sequence: ['😀', '😀', '😎', '😡', '😀', '😀'],
      answer: '😎',
      pool: ['😀', '😎', '😢', '😡']
    }
  ]
};

// ============================================
// HELPER: CREAR RONDA
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
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];

  // Distractores: del pool, sin incluir la respuesta correcta
  const candidates = pattern.pool.filter((e) => e !== pattern.answer);
  const shuffled = shuffle(candidates);
  const distractors = shuffled.slice(0, 3);

  // Si el pool no alcanza, completar con emojis de relleno
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
  const [gameState, setGameState] = useState('select'); // 'select' | 'tutorial' | 'playing' | 'results'
  const [round, setRound] = useState(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState(null); // { type, choice, correctAnswer }

  const timerRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  const startGame = (levelId, skipTutorial = false) => {
    try { audioService.playPop(); } catch (e) {}

    const level = LEVELS[levelId];
    setDifficulty(levelId);
    setRoundIndex(0);
    setCorrect(0);
    setFeedback(null);

    if (skipTutorial) {
      setRound(createRound(levelId));
      setGameState('playing');
    } else {
      setGameState('tutorial');
    }
  };

  const beginPlayAfterTutorial = () => {
    try { audioService.playPop(); } catch (e) {}
    setRound(createRound(difficulty));
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
    const nextIndex = roundIndex + 1;

    if (nextIndex >= level.rounds) {
      try { audioService.playSuccess(); } catch (e) {}
      setGameState('results');
      return;
    }

    setRoundIndex(nextIndex);
    setRound(createRound(difficulty));
  }, [roundIndex, difficulty]);

  // Timeout
  useEffect(() => {
    if (gameState !== 'playing' || !round || feedback) return;

    const level = LEVELS[difficulty];
    if (!level.timeLimit) return;

    timerRef.current = setTimeout(() => {
      try { audioService.playError(); } catch (e) {}
      setFeedback({
        type: 'timeout',
        choice: null,
        correctAnswer: round.answer
      });

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
        <div className="text-5xl mb-2">🔢</div>
        <h2 className="text-2xl font-black text-white">Secuencias</h2>
        <p className="text-xs font-bold text-center mb-4" style={{ color: C.textMuted }}>
          Mirá el patrón y elegí<br />
          qué viene después.
        </p>

        <div className="w-full flex flex-col gap-2.5">
          {Object.values(LEVELS).map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => startGame(level.id)}
              className="w-full p-4 rounded-2xl flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
              style={{
                background: C.card,
                border: `1.5px solid ${C.cyan}40`
              }}
            >
              <span className="text-3xl">{level.emoji}</span>
              <div className="flex flex-col flex-1 items-start">
                <span className="text-sm font-black text-white">{level.label}</span>
                <span className="text-[10px] font-bold" style={{ color: C.textMuted }}>
                  {level.rounds} rondas
                  {level.timeLimit ? ` · ${level.timeLimit / 1000}s` : ' · sin tiempo'}
                </span>
              </div>
              <span className="material-symbols-outlined text-[20px]" style={{ color: C.cyanBright }}>
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
            color: C.textMuted,
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
          className="w-full p-4 rounded-3xl flex flex-col items-center gap-3"
          style={{
            background: C.card,
            border: `1.5px solid ${C.cyan}40`
          }}
        >
          {/* Secuencia de ejemplo */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {exampleSequence.map((emoji, i) => (
              <div
                key={i}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                style={{
                  background: C.cellBg,
                  border: `1.5px solid ${C.cellBorder}`
                }}
              >
                {emoji}
              </div>
            ))}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl font-black"
              style={{
                background: C.cellQuestion,
                border: `2px solid ${C.cellQuestionBorder}`,
                animation: 'pulseQuestion 1.5s ease-in-out infinite'
              }}
            >
              ?
            </div>
          </div>

          <div
            className="w-full p-3 rounded-xl flex flex-col items-center gap-1"
            style={{
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.25)'
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: C.textMuted }}>
              El patrón es: rojo → azul → rojo → azul...
            </span>
            <span className="text-[11px] font-black mt-1" style={{ color: C.limeBright }}>
              👉 Así que el que sigue es {exampleAnswer}
            </span>
          </div>
        </div>

        <p className="text-xs font-bold text-center" style={{ color: C.textMuted }}>
          Buscá la regla y elegí el que sigue.
        </p>

        <div className="flex gap-2 w-full mt-2">
          <button
            type="button"
            onClick={handleChangeLevel}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: 'rgba(148, 163, 184, 0.12)',
              color: C.textMuted,
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
              background: `linear-gradient(135deg, ${C.lime} 0%, ${C.limeBright} 100%)`,
              color: '#000',
              boxShadow: `0 0 16px ${C.lime}80`
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
            color: C.textMuted,
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
              color: C.cyanBright,
              border: '1px solid rgba(6, 182, 212, 0.4)'
            }}
          >
            {roundIndex + 1}/{level.rounds}
          </span>
          <span
            className="px-2 py-1 rounded-full text-[10px] font-black"
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              color: C.limeBright,
              border: '1px solid rgba(34, 197, 94, 0.4)'
            }}
          >
            ✅ {correct}
          </span>
        </div>
      </div>

      {/* Progreso */}
      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(148, 163, 184, 0.15)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${C.cyan} 0%, ${C.limeBright} 100%)`,
            boxShadow: `0 0 10px ${C.cyan}80`
          }}
        />
      </div>

      {/* Instrucción */}
      <p className="text-center text-xs font-black" style={{ color: C.textMuted }}>
        ¿Qué viene después?
      </p>

      {/* Secuencia */}
      <div
        className="w-full rounded-3xl flex items-center justify-center"
        style={{
          background: C.card,
          border: `1.5px solid ${C.cardBorder}`,
          minHeight: '140px',
          padding: '20px'
        }}
      >
        {round && (
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {round.sequence.map((emoji, i) => {
              const isLastInSequence = i === round.sequence.length - 1;
              return (
                <div
                  key={i}
                  className="flex items-center justify-center text-3xl rounded-xl transition-all"
                  style={{
                    width: '48px',
                    height: '48px',
                    background: C.cellBg,
                    border: `1.5px solid ${C.cellBorder}`
                  }}
                >
                  {emoji}
                </div>
              );
            })}
            {/* Celda del "?" */}
            <div
              className="flex items-center justify-center text-3xl font-black rounded-xl transition-all"
              style={{
                width: '48px',
                height: '48px',
                background: feedback
                  ? feedback.type === 'correct'
                    ? `${C.cellAnswer}30`
                    : `${C.cellWrong}30`
                  : C.cellQuestion,
                border: feedback
                  ? feedback.type === 'correct'
                    ? `2px solid ${C.cellAnswer}`
                    : `2px solid ${C.cellWrong}`
                  : `2px solid ${C.cellQuestionBorder}`,
                animation: feedback ? 'none' : 'pulseQuestion 1.5s ease-in-out infinite'
              }}
            >
              {feedback ? (
                <span>{feedback.correctAnswer}</span>
              ) : (
                <span style={{ color: C.amber }}>?</span>
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
                ? 'rgba(34, 197, 94, 0.08)'
                : 'rgba(255, 45, 135, 0.08)',
            border: `1px solid ${
              feedback.type === 'correct'
                ? 'rgba(34, 197, 94, 0.3)'
                : 'rgba(255, 45, 135, 0.3)'
            }`
          }}
        >
          <span className="text-base">
            {feedback.type === 'correct' ? '✅' : feedback.type === 'timeout' ? '⏰' : '❌'}
          </span>
          <span
            className="text-[11px] font-black"
            style={{
              color: feedback.type === 'correct' ? C.limeBright : C.magenta
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
      <div className="grid grid-cols-4 gap-2 mt-1">
        {round &&
          round.options.map((opt) => {
            const isTheCorrectOne = feedback && feedback.correctAnswer === opt;
            const isWrongChoice = feedback && feedback.choice === opt;

            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleAnswer(opt)}
                disabled={!!feedback}
                className="rounded-2xl font-black transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                style={{
                  background: isTheCorrectOne
                    ? `${C.cellAnswer}30`
                    : isWrongChoice
                    ? `${C.cellWrong}30`
                    : C.card,
                  border: `2px solid ${
                    isTheCorrectOne
                      ? C.cellAnswer
                      : isWrongChoice
                      ? C.cellWrong
                      : C.cardBorder
                  }`,
                  height: '70px',
                  boxShadow: isTheCorrectOne
                    ? `0 0 20px ${C.cellAnswer}80`
                    : isWrongChoice
                    ? `0 0 20px ${C.cellWrong}80`
                    : 'none',
                  transform: isTheCorrectOne ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s'
                }}
                aria-label={opt}
              >
                <span className="text-3xl">{opt}</span>
              </button>
            );
          })}
      </div>

      {/* Modal de resultados */}
      {gameState === 'results' && (
        <ResultsModal
          correct={correct}
          total={level.rounds}
          onRetry={handleRetry}
          onChangeLevel={handleChangeLevel}
          onExit={onExit}
        />
      )}

      <style>{`
        @keyframes pulseQuestion {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
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
          background: `linear-gradient(180deg, ${C.card} 0%, #08081a 100%)`,
          border: `2px solid ${C.cyanBright}`,
          boxShadow: `0 0 40px ${C.cyan}80`
        }}
      >
        <span className="text-6xl mb-3">{emoji}</span>

        <h2 className="text-2xl font-black text-white mb-2">{title}</h2>

        <p className="text-sm font-bold mb-4" style={{ color: C.textMuted }}>
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
            <span className="text-3xl font-black" style={{ color: C.limeBright }}>
              {correct}
            </span>
            <span className="text-[10px] font-black" style={{ color: C.textMuted }}>
              aciertos
            </span>
          </div>
          <span className="text-2xl font-black" style={{ color: C.textMuted }}>
            /
          </span>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black" style={{ color: C.cyanBright }}>
              {total}
            </span>
            <span className="text-[10px] font-black" style={{ color: C.textMuted }}>
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
              background: `linear-gradient(135deg, ${C.lime} 0%, ${C.limeBright} 100%)`,
              color: '#000',
              boxShadow: `0 0 16px ${C.lime}80`
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
              color: C.cyanBright,
              border: `1.5px solid ${C.cyan}60`
            }}
          >
            Cambiar nivel
          </button>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="mt-3 text-[11px] font-black cursor-pointer active:scale-95 transition-all"
          style={{ color: C.textMuted }}
        >
          Salir al arcade
        </button>
      </div>
    </div>
  );
}