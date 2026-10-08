import React, { useState, useEffect, useRef, useCallback } from 'react';
import { audioService } from '../../../services/audioService';

// ============================================
// COLORES
// ============================================
const COLORS = {
  rojo:    { id: 'rojo',    label: 'ROJO',    hex: '#ef4444' },
  azul:    { id: 'azul',    label: 'AZUL',    hex: '#3b82f6' },
  verde:   { id: 'verde',   label: 'VERDE',   hex: '#22c55e' },
  amarillo:{ id: 'amarillo',label: 'AMARILLO',hex: '#f59e0b' }
};

const C = {
  card: '#131322',
  cardBorder: 'rgba(6, 182, 212, 0.25)',
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
  facil:   { id: 'facil',   label: 'Fácil',   emoji: '🟢', rounds: 10, timeLimit: null, colorCount: 3 },
  medio:   { id: 'medio',   label: 'Medio',   emoji: '🟡', rounds: 15, timeLimit: 3000, colorCount: 4 },
  dificil: { id: 'dificil', label: 'Difícil', emoji: '🔴', rounds: 20, timeLimit: 2000, colorCount: 4 }
};

// ============================================
// HELPER: GENERAR RONDA
// ============================================
function generateRound(colorCount) {
  const colorIds = Object.keys(COLORS).slice(0, colorCount);

  const wordIdx = Math.floor(Math.random() * colorIds.length);
  let paintIdx = Math.floor(Math.random() * colorIds.length);

  // Asegurar que la palabra y la pintura sean distintas (Stroop incongruente)
  while (paintIdx === wordIdx) {
    paintIdx = Math.floor(Math.random() * colorIds.length);
  }

  const wordColor = COLORS[colorIds[wordIdx]];
  const paintColor = COLORS[colorIds[paintIdx]];

  return {
    word: wordColor.label,
    wordColorHex: wordColor.hex,
    paintColorId: paintColor.id,
    paintColorHex: paintColor.hex,
    correctId: paintColor.id
  };
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function StroopGame({ onExit }) {
  const [difficulty, setDifficulty] = useState(null);
  const [gameState, setGameState] = useState('select'); // 'select' | 'tutorial' | 'playing' | 'results'
  const [round, setRound] = useState(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState(null); // { type: 'correct' | 'wrong' | 'timeout', correctId }

  const timerRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);

  // ============================================
  // INICIAR JUEGO
  // ============================================
  const startGame = (levelId, skipTutorial = false) => {
    try { audioService.playPop(); } catch (e) {}

    const level = LEVELS[levelId];
    setDifficulty(levelId);
    setRoundIndex(0);
    setCorrect(0);
    setFeedback(null);

    if (skipTutorial) {
      setRound(generateRound(level.colorCount));
      setGameState('playing');
    } else {
      setGameState('tutorial');
    }
  };

  const beginPlayAfterTutorial = () => {
    try { audioService.playPop(); } catch (e) {}
    const level = LEVELS[difficulty];
    setRound(generateRound(level.colorCount));
    setGameState('playing');
  };

  // ============================================
  // RESPONDER
  // ============================================
  const handleAnswer = useCallback(
    (colorId) => {
      if (!round || feedback) return;

      const level = LEVELS[difficulty];
      const isCorrect = colorId === round.correctId;

      if (isCorrect) {
        try { audioService.playPop(); } catch (e) {}
        setCorrect((c) => c + 1);
        setFeedback({ type: 'correct', correctId: round.correctId });
      } else {
        try { audioService.playError(); } catch (e) {}
        setFeedback({ type: 'wrong', correctId: round.correctId });
      }

      // Avanzar después del feedback
      const delay = isCorrect ? 400 : 900;
      feedbackTimeoutRef.current = setTimeout(() => {
        advanceRound();
      }, delay);
    },
    [round, feedback, difficulty]
  );

  // ============================================
  // AVANZAR RONDA
  // ============================================
  const advanceRound = useCallback(() => {
    setFeedback(null);

    const level = LEVELS[difficulty];
    const nextIndex = roundIndex + 1;

    if (nextIndex >= level.rounds) {
      // Fin del juego
      try { audioService.playSuccess(); } catch (e) {}
      setGameState('results');
      return;
    }

    setRoundIndex(nextIndex);
    setRound(generateRound(level.colorCount));
  }, [roundIndex, difficulty]);

  // ============================================
  // TIMEOUT
  // ============================================
  useEffect(() => {
    if (gameState !== 'playing' || !round || feedback) return;

    const level = LEVELS[difficulty];
    if (!level.timeLimit) return;

    timerRef.current = setTimeout(() => {
      try { audioService.playError(); } catch (e) {}
      setFeedback({ type: 'timeout', correctId: round.correctId });

      feedbackTimeoutRef.current = setTimeout(() => {
        advanceRound();
      }, 900);
    }, level.timeLimit);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, round, feedback, difficulty, advanceRound]);

  // ============================================
  // LIMPIEZA
  // ============================================
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    };
  }, []);

  // ============================================
  // RESET
  // ============================================
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
        <div className="text-5xl mb-2">🎨</div>
        <h2 className="text-2xl font-black text-white">Stroop</h2>
        <p className="text-xs font-bold text-center mb-4" style={{ color: C.textMuted }}>
          Tocá el color de la pintura,<br />
          no lo que dice la palabra.
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
                  {level.rounds} rondas · {level.colorCount} colores
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
    return (
      <div className="w-full flex flex-col gap-4 items-center py-6 px-4">
        <div className="text-5xl mb-2">👀</div>
        <h2 className="text-xl font-black text-white text-center">
          ¿Cómo se juega?
        </h2>

        {/* Ejemplo */}
        <div
          className="w-full p-6 rounded-3xl flex flex-col items-center gap-4"
          style={{
            background: C.card,
            border: `1.5px solid ${C.cyan}40`
          }}
        >
          <span
            className="text-[64px] leading-none font-black tracking-wider"
            style={{
              color: COLORS.azul.hex,
              textShadow: '0 2px 12px rgba(0,0,0,0.4)'
            }}
          >
            ROJO
          </span>

          <div
            className="w-full p-3 rounded-xl flex flex-col items-center gap-1"
            style={{
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.25)'
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: C.textMuted }}>
              La palabra dice "ROJO"
            </span>
            <span className="text-[11px] font-black" style={{ color: C.cyanBright }}>
              pero está pintada de AZUL 🔵
            </span>
            <span className="text-[11px] font-black mt-1" style={{ color: C.limeBright }}>
              👉 Tocá el botón AZUL
            </span>
          </div>
        </div>

        <p className="text-xs font-bold text-center" style={{ color: C.textMuted }}>
          Tu cerebro va a querer leer la palabra.<br />
          Tenés que <strong style={{ color: C.cyanBright }}>ignorarla</strong> y mirar solo el color.
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
      </div>
    );
  }

  // ============================================
  // JUEGO
  // ============================================
  const level = LEVELS[difficulty];
  const progress = ((roundIndex + 1) / level.rounds) * 100;
  const activeColorIds = Object.keys(COLORS).slice(0, level.colorCount);

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

      {/* Barra de progreso */}
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
        Tocá el color de la pintura
      </p>

      {/* Palabra */}
      <div
        className="w-full rounded-3xl flex items-center justify-center relative overflow-hidden"
        style={{
          background: C.card,
          border: `1.5px solid ${C.cardBorder}`,
          minHeight: '220px',
          padding: '24px'
        }}
      >
        {round && (
          <span
            className="font-black leading-none tracking-tight text-center"
            style={{
              fontSize: 'clamp(48px, 14vw, 84px)',
              color: round.paintColorHex,
              textShadow: '0 4px 16px rgba(0,0,0,0.5)',
              transition: 'color 0.15s'
            }}
          >
            {round.word}
          </span>
        )}

        {/* Overlay de feedback */}
        {feedback && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              background:
                feedback.type === 'correct'
                  ? 'rgba(34, 197, 94, 0.15)'
                  : 'rgba(255, 45, 135, 0.15)',
              animation: 'feedbackFade 0.5s ease-out'
            }}
          >
            <span className="text-6xl">
              {feedback.type === 'correct' ? '✅' : feedback.type === 'timeout' ? '⏰' : '❌'}
            </span>
          </div>
        )}
      </div>

      {/* Corrección visual */}
      {feedback && feedback.type !== 'correct' && (
        <div
          className="w-full px-3 py-2 rounded-xl flex items-center gap-2 justify-center"
          style={{
            background: 'rgba(255, 45, 135, 0.08)',
            border: '1px solid rgba(255, 45, 135, 0.3)'
          }}
        >
          <span className="text-[11px] font-black" style={{ color: C.textMuted }}>
            {feedback.type === 'timeout' ? 'Se acabó el tiempo ·' : 'Era ·'}
          </span>
          <span
            className="text-[12px] font-black px-2 py-0.5 rounded-full"
            style={{
              background: COLORS[feedback.correctId].hex,
              color: '#fff',
              boxShadow: `0 0 12px ${COLORS[feedback.correctId].hex}80`
            }}
          >
            {COLORS[feedback.correctId].label}
          </span>
        </div>
      )}

      {/* Botones de color */}
      <div className="grid grid-cols-4 gap-2 mt-1">
        {activeColorIds.map((colorId) => {
          const color = COLORS[colorId];
          const isTheCorrectOne = feedback && feedback.correctId === colorId;
          const isWrongChoice =
            feedback &&
            feedback.type !== 'correct' &&
            feedback.correctId !== colorId;

          return (
            <button
              key={colorId}
              type="button"
              onClick={() => handleAnswer(colorId)}
              disabled={!!feedback}
              className="rounded-2xl font-black transition-all cursor-pointer active:scale-95 flex items-center justify-center"
              style={{
                background: isTheCorrectOne ? color.hex : 'rgba(148, 163, 184, 0.08)',
                border: `2px solid ${color.hex}`,
                height: '70px',
                opacity: isWrongChoice ? 0.4 : 1,
                boxShadow: isTheCorrectOne ? `0 0 24px ${color.hex}` : 'none',
                transform: isTheCorrectOne ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.2s'
              }}
              aria-label={color.label}
            >
              <span
                className="w-8 h-8 rounded-full"
                style={{
                  background: color.hex,
                  boxShadow: `inset 0 0 12px rgba(0,0,0,0.3)`
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Instrucción inferior */}
      <p className="text-center text-[10px] font-bold mt-1" style={{ color: C.textMuted }}>
        🔵 Azul · 🔴 Rojo · 🟢 Verde · 🟡 Amarillo
      </p>

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
        @keyframes feedbackFade {
          0% { opacity: 0; }
          30% { opacity: 1; }
          100% { opacity: 1; }
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
    title = '¡Excelente!';
    message = 'Tu cerebro está entrenado para no distraerse';
    emoji = '🏆';
  } else if (percent >= 60) {
    title = '¡Muy bien!';
    message = 'Cada vez te cuesta menos ignorar la palabra';
    emoji = '🎉';
  } else if (percent >= 40) {
    title = '¡Buen intento!';
    message = 'Es normal. Este juego entrena algo que cuesta';
    emoji = '💪';
  } else {
    title = '¡Seguimos!';
    message = 'Este es difícil. Pero ya vas a mejorar';
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

        <h2 className="text-2xl font-black text-white mb-2">
          {title}
        </h2>

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