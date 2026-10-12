import React, { useState, useEffect, useRef, useCallback } from 'react';
import { audioService } from '../../../services/audioService';

// ============================================
// PALETA — Verde esmeralda (del logo)
// ============================================
const R = {
  frameTop: '#5eead4',
  frameMid: '#14b8a6',
  frameBot: '#0f766e',
  frameDeep: '#134e4a',
  frameBorder: '#042f2e',
  frameHighlight: 'rgba(220,255,250,0.6)',

  woodLight: '#c8956d',
  woodMid: '#8b5a2b',
  woodDark: '#4a2a10',
  woodDeep: '#2e1a0a',
  woodBorder: '#3d1f08',
  woodHighlight: 'rgba(255,240,200,0.6)',

  green: '#22c55e',
  greenBright: '#4ade80',
  greenGlow: 'rgba(74, 222, 128, 0.9)',

  red: '#ef4444',
  redBright: '#f87171',

  amber: '#f59e0b',
  amberBright: '#fbbf24',

  text: '#ffffff',
  textMuted: '#a7f3d0',
  cyan: '#06b6d4',
  cyanBright: '#38bdf8'
};

// ============================================
// NIVELES
// ============================================
const LEVELS = {
  facil: {
    id: 'facil',
    label: 'Fácil',
    rounds: 5,
    speed: 180,
    targetHalf: 45,
    timeLimit: null,
    moveTarget: false,
    colorTop: '#86efac',
    colorMid: '#22c55e',
    colorBot: '#15803d',
    colorDeep: '#052e16',
    colorBorder: '#14532d'
  },
  medio: {
    id: 'medio',
    label: 'Medio',
    rounds: 7,
    speed: 300,
    targetHalf: 30,
    timeLimit: null,
    moveTarget: true,
    colorTop: '#fde68a',
    colorMid: '#f59e0b',
    colorBot: '#b45309',
    colorDeep: '#451a03',
    colorBorder: '#78350f'
  },
  dificil: {
    id: 'dificil',
    label: 'Difícil',
    rounds: 10,
    speed: 450,
    targetHalf: 20,
    timeLimit: 5,
    moveTarget: true,
    colorTop: '#fca5a5',
    colorMid: '#ef4444',
    colorBot: '#991b1b',
    colorDeep: '#450a0a',
    colorBorder: '#7f1d1d'
  }
};

// ============================================
// FRASES DE SPARKY
// ============================================
const MESSAGES = {
  ready: [
    '¡Atento!',
    '¡Preparado!',
    'Mirá la aguja...',
    '¡Concentrate!',
    'Cuando pase por el verde...'
  ],
  spinning: [
    '¡Ahora!',
    '¡Ya!',
    '¡Tocá!'
  ],
  hit: [
    '¡Bien!',
    '¡Eso!',
    '¡Perfecto!',
    '¡Excelente!',
    '¡Genial!'
  ],
  miss: [
    'Casi...',
    'Otra vez',
    '¡Seguimos!',
    'Probá de nuevo'
  ],
  timeout: [
    '¡Se pasó!',
    'Uy, muy lento',
    'Quedó atrás'
  ],
  finished: [
    '¡Lo lograste!',
    '¡Campeón!',
    '¡Qué rapidez!',
    '¡Bien hecho!'
  ]
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function angularDistance(a, b) {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function ReactionGame({ onExit }) {
  const [difficulty, setDifficulty] = useState(null);
  const [gameState, setGameState] = useState('select'); // 'select' | 'tutorial' | 'playing' | 'results'

  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [roundStatus, setRoundStatus] = useState('waiting');
  const [targetCenter, setTargetCenter] = useState(0);
  const [lastResult, setLastResult] = useState(null);
  const [sparkyMessage, setSparkyMessage] = useState('¡Vamos a jugar!');
  const [timeLeft, setTimeLeft] = useState(null);

  const needleRef = useRef(null);
  const angleRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const timeoutRef = useRef(null);
  const advanceRef = useRef(null);

  const level = difficulty ? LEVELS[difficulty] : null;

  // ============================================
  // ARRANCAR JUEGO
  // ============================================
  const startGame = (levelId, skipTutorial = false) => {
    if (!LEVELS[levelId]) return;
    try { audioService.playPop(); } catch (e) {}

    setDifficulty(levelId);
    setRoundIndex(0);
    setScore(0);
    setMisses(0);
    setLastResult(null);
    setSparkyMessage(pickRandom(MESSAGES.ready));

    if (skipTutorial) {
      beginRound(levelId, 0);
      setGameState('playing');
    } else {
      setGameState('tutorial');
    }
  };

  const beginRound = (levelId, index) => {
    const lvl = LEVELS[levelId];

    // targetCenter = 0 significa "arriba" (12 en punto)
    // La aguja con rotate(0deg) apunta arriba también.
    const target = lvl.moveTarget
      ? Math.floor(Math.random() * 360)
      : 0;

    setTargetCenter(target);
    setRoundStatus('waiting');
    setLastResult(null);
    setSparkyMessage(pickRandom(MESSAGES.ready));
    setTimeLeft(lvl.timeLimit);

    // Resetear aguja a 0° manteniendo el translate que la centra
    angleRef.current = 0;
    if (needleRef.current) {
      needleRef.current.style.transform =
        'translate(-50%, -100%) rotate(0deg)';
    }

    const delay = 800 + Math.random() * 700;
    timeoutRef.current = setTimeout(() => {
      setRoundStatus('spinning');
      setSparkyMessage(pickRandom(MESSAGES.spinning));
    }, delay);
  };

  const beginPlayAfterTutorial = () => {
    if (!difficulty) return;
    try { audioService.playPop(); } catch (e) {}
    beginRound(difficulty, 0);
    setGameState('playing');
  };

  // ============================================
  // ANIMACIÓN DE LA AGUJA
  // ============================================
  useEffect(() => {
    if (roundStatus !== 'spinning' || !level) return;

    lastTimeRef.current = performance.now();

    const tick = (now) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      angleRef.current = (angleRef.current + level.speed * dt) % 360;

      if (needleRef.current) {
        // ⚠️ IMPORTANTE: conservar translate(-50%, -100%) para que la aguja
        // gire alrededor del punto correcto (base pegada al centro).
        needleRef.current.style.transform =
          `translate(-50%, -100%) rotate(${angleRef.current}deg)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [roundStatus, level]);

  // ============================================
  // CONTADOR DE TIEMPO (solo en difícil)
  // ============================================
  useEffect(() => {
    if (roundStatus !== 'spinning' || !level || !level.timeLimit) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        const next = prev - 0.1;
        if (next <= 0) {
          clearInterval(interval);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [roundStatus, level]);

  // Timeout: si se pasa el tiempo límite, marcar como fallo
  useEffect(() => {
    if (roundStatus !== 'spinning' || !level || !level.timeLimit) return;
    if (timeLeft === null) return;
    if (timeLeft > 0) return;

    setRoundStatus('resolved');
    setLastResult('timeout');
    setSparkyMessage(pickRandom(MESSAGES.timeout));
    try { audioService.playError(); } catch (e) {}

    const newMisses = misses + 1;
    setMisses(newMisses);

    advanceRef.current = setTimeout(() => {
      advanceRound(level, roundIndex, newMisses);
    }, 1200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, roundStatus, level]);

  // ============================================
  // LÓGICA DE TOCAR
  // ============================================
  const handleTap = useCallback(() => {
    if (roundStatus !== 'spinning' || !level) return;

    const currentAngle = angleRef.current;
    const dist = angularDistance(currentAngle, targetCenter);
    const isHit = dist <= level.targetHalf;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setRoundStatus('resolved');

    if (isHit) {
      try { audioService.playSuccess(); } catch (e) {}
      setLastResult('hit');
      setSparkyMessage(pickRandom(MESSAGES.hit));
      const newScore = score + 1;
      setScore(newScore);

      advanceRef.current = setTimeout(() => {
        advanceRound(level, roundIndex, misses);
      }, 900);
    } else {
      try { audioService.playError(); } catch (e) {}
      setLastResult('miss');
      setSparkyMessage(pickRandom(MESSAGES.miss));
      const newMisses = misses + 1;
      setMisses(newMisses);

      advanceRef.current = setTimeout(() => {
        advanceRound(level, roundIndex, newMisses);
      }, 900);
    }
  }, [roundStatus, level, score, misses, roundIndex, targetCenter]);

  const advanceRound = (lvl, currentIndex, currentMisses) => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= lvl.rounds) {
      try { audioService.playSuccess(); } catch (e) {}
      try { audioService.playBark(); } catch (e) {}
      setSparkyMessage(pickRandom(MESSAGES.finished));
      setGameState('results');
      return;
    }

    setRoundIndex(nextIndex);
    beginRound(lvl.id, nextIndex);
  };

  // ============================================
  // LIMPIEZA
  // ============================================
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (advanceRef.current) clearTimeout(advanceRef.current);
    };
  }, []);

  const handleRetry = () => {
    if (!difficulty) return;
    try { audioService.playPop(); } catch (e) {}
    setRoundIndex(0);
    setScore(0);
    setMisses(0);
    setLastResult(null);
    beginRound(difficulty, 0);
    setGameState('playing');
  };

  const handleChangeLevel = () => {
    try { audioService.playClick(); } catch (e) {}
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (advanceRef.current) clearTimeout(advanceRef.current);
    setDifficulty(null);
    setGameState('select');
  };

  // ============================================
  // SELECTOR DE NIVEL
  // ============================================
  if (gameState === 'select') {
    return (
      <div className="w-full flex flex-col gap-4 items-center py-6 px-4">
        <img
          src="/games/reaction.png"
          alt="Reacción"
          className="w-28 h-28 object-contain mb-2"
          draggable={false}
        />
        <h2
          className="text-3xl font-black text-white"
          style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}
        >
          Reacción
        </h2>
        <p className="text-xs font-bold text-center mb-4" style={{ color: R.textMuted }}>
          Tocá el botón cuando la aguja<br />
          pase por la zona verde.
        </p>

        <div className="w-full flex flex-col gap-3">
          {Object.values(LEVELS).map((lvl) => (
            <button
              key={lvl.id}
              type="button"
              onClick={() => startGame(lvl.id)}
              className="w-full p-4 rounded-2xl flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden"
              style={{
                backgroundImage: 'url(/memoria/fondo.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: `3px solid ${lvl.colorBorder}`,
                boxShadow: `
                  0 5px 0 ${lvl.colorDeep},
                  inset 0 2px 0 rgba(255,240,200,0.4),
                  inset 0 -3px 0 rgba(0,0,0,0.4)
                `
              }}
            >
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(180deg, ${lvl.colorMid}25 0%, ${lvl.colorMid}10 100%)`,
                  mixBlendMode: 'overlay'
                }}
              />
              <span
                className="w-14 h-14 rounded-full relative z-10 flex-shrink-0"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${lvl.colorTop} 0%, ${lvl.colorMid} 55%, ${lvl.colorBot} 100%)`,
                  border: `2px solid ${lvl.colorBorder}`,
                  boxShadow: `
                    inset 0 -4px 8px rgba(0,0,0,0.4),
                    inset 0 4px 8px rgba(255,255,255,0.7),
                    0 3px 10px ${lvl.colorDeep}90
                  `
                }}
              />
              <div className="flex flex-col flex-1 items-start relative z-10">
                <span
                  className="text-base font-black"
                  style={{
                    color: '#ffffff',
                    textShadow: `0 2px 0 ${lvl.colorDeep}, 0 3px 8px rgba(0,0,0,0.9)`
                  }}
                >
                  {lvl.label}
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{
                    color: 'rgba(255,255,255,0.95)',
                    textShadow: '0 1px 3px rgba(0,0,0,0.9)'
                  }}
                >
                  {lvl.rounds} toques
                  {lvl.timeLimit ? ` · ${lvl.timeLimit}s` : ' · sin tiempo'}
                  {lvl.moveTarget ? ' · zona móvil' : ' · zona fija'}
                </span>
              </div>
              <span
                className="relative z-10 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${lvl.colorTop}80 0%, ${lvl.colorMid}60 100%)`,
                  border: `2px solid ${lvl.colorBorder}`,
                  boxShadow: `inset 0 -2px 3px rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.4)`
                }}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ color: '#ffffff', textShadow: `0 1px 3px ${lvl.colorDeep}` }}
                >
                  arrow_forward
                </span>
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
            color: R.textMuted,
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
        <div className="text-5xl mb-2">⚡</div>
        <h2
          className="text-xl font-black text-white text-center"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          ¿Cómo se juega?
        </h2>

        <div
          className="w-full p-5 rounded-3xl flex flex-col items-center gap-4"
          style={{
            background: `linear-gradient(180deg, ${R.frameTop} 0%, ${R.frameMid} 50%, ${R.frameBot} 100%)`,
            border: `3px solid ${R.frameBorder}`,
            boxShadow: `
              0 8px 0 ${R.frameDeep},
              inset 0 3px 0 ${R.frameHighlight},
              inset 0 -4px 0 rgba(0,0,0,0.4)
            `
          }}
        >
          <div
            className="w-40 h-40 rounded-full relative"
            style={{
              backgroundImage: 'url(/memoria/fondo.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: `3px solid ${R.woodBorder}`,
              boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.6)'
            }}
          >
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 160">
              <circle
                cx="80"
                cy="80"
                r="60"
                fill="none"
                stroke={R.greenBright}
                strokeWidth="14"
                strokeDasharray={`${(90 / 360) * 2 * Math.PI * 60} ${2 * Math.PI * 60}`}
                strokeDashoffset="0"
                transform="rotate(-135 80 80)"
                opacity="0.9"
              />
            </svg>

            <div
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                width: '4px',
                height: '38%',
                background: R.amberBright,
                transformOrigin: 'bottom center',
                transform: 'translate(-50%, -100%) rotate(45deg)',
                borderRadius: '4px',
                boxShadow: `0 0 8px ${R.amberBright}`
              }}
            />

            <div
              className="absolute rounded-full"
              style={{
                left: '50%',
                top: '50%',
                width: '16px',
                height: '16px',
                background: R.amberBright,
                transform: 'translate(-50%, -50%)',
                border: `2px solid ${R.woodBorder}`,
                boxShadow: `0 0 12px ${R.amberBright}`
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-black text-center" style={{ color: R.text }}>
              La aguja gira alrededor del medidor.
            </span>
            <span className="text-xs font-black text-center" style={{ color: R.greenBright }}>
              Tocá el botón grande cuando pase por el verde.
            </span>
          </div>
        </div>

        <div
          className="w-full p-3 rounded-xl flex flex-col gap-1"
          style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${R.frameDeep}` }}
        >
          <span className="text-[11px] font-black" style={{ color: R.greenBright }}>
            ⚡ No hay tiempo límite
          </span>
          <span className="text-[11px] font-black" style={{ color: R.greenBright }}>
            🔁 Si fallás, la aguja sigue girando
          </span>
          <span className="text-[11px] font-black" style={{ color: R.greenBright }}>
            🎯 El objetivo es acertar tantas veces como puedas
          </span>
        </div>

        <div className="flex gap-2 w-full mt-2">
          <button
            type="button"
            onClick={handleChangeLevel}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: 'rgba(148, 163, 184, 0.12)',
              color: R.textMuted,
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
              background: `linear-gradient(135deg, ${R.green} 0%, ${R.greenBright} 100%)`,
              color: '#003300',
              border: `2px solid ${R.frameDeep}`,
              boxShadow: `0 4px 0 ${R.frameDeep}, 0 0 16px ${R.green}80`
            }}
          >
            ¡Entendido!
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RESULTADOS
  // ============================================
  if (gameState === 'results') {
    const total = level.rounds;
    const percent = Math.round((score / total) * 100);

    let emoji = '🐾';
    let message = 'Este es difícil, pero se entrena';
    if (percent >= 80) { emoji = '🏆'; message = '¡Reflejos de campeón!'; }
    else if (percent >= 60) { emoji = '🎉'; message = '¡Muy buena puntería!'; }
    else if (percent >= 40) { emoji = '💪'; message = '¡Vas por buen camino!'; }

    return (
      <div
        className="fixed inset-0 z-[210] flex items-center justify-center p-4"
        style={{ background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(6px)' }}
      >
        <div
          className="w-full max-w-sm p-6 rounded-3xl flex flex-col items-center text-center"
          style={{
            background: `linear-gradient(180deg, #1a1a2e 0%, #08081a 100%)`,
            border: `2px solid ${R.greenBright}`,
            boxShadow: `0 0 40px ${R.green}80`
          }}
        >
          <span className="text-6xl mb-3">{emoji}</span>
          <h2 className="text-2xl font-black text-white mb-2">¡Terminaste!</h2>
          <p className="text-sm font-bold mb-4" style={{ color: R.textMuted }}>
            {message}
          </p>

          <div
            className="w-full p-4 rounded-2xl mb-4 flex items-center justify-center gap-4"
            style={{
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
          >
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black" style={{ color: R.greenBright }}>
                {score}
              </span>
              <span className="text-[10px] font-black" style={{ color: R.textMuted }}>
                aciertos
              </span>
            </div>
            <span className="text-2xl font-black" style={{ color: R.textMuted }}>/</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-black" style={{ color: R.amberBright }}>
                {total}
              </span>
              <span className="text-[10px] font-black" style={{ color: R.textMuted }}>
                total
              </span>
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={handleRetry}
              className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
              style={{
                background: `linear-gradient(135deg, ${R.green} 0%, ${R.greenBright} 100%)`,
                color: '#003300',
                boxShadow: `0 0 16px ${R.green}80`
              }}
            >
              Otra ronda
            </button>
            <button
              type="button"
              onClick={handleChangeLevel}
              className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: R.cyanBright,
                border: `1.5px solid ${R.cyan}60`
              }}
            >
              Cambiar nivel
            </button>
          </div>

          <button
            type="button"
            onClick={onExit}
            className="mt-3 text-[11px] font-black cursor-pointer active:scale-95 transition-all"
            style={{ color: R.textMuted }}
          >
            Salir al arcade
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // JUEGO ACTIVO
  // ============================================
  if (!level) return null;

  const progress = ((roundIndex + (roundStatus === 'resolved' ? 1 : 0)) / level.rounds) * 100;

  // SVG config
  const SVG_SIZE = 260;
  const CENTER = SVG_SIZE / 2;
  const RADIUS = 100;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const arcFraction = (level.targetHalf * 2) / 360;
  const arcLength = CIRCUMFERENCE * arcFraction;

  // targetStart: en SVG los ángulos comienzan a las 3 en punto (0° = derecha)
  // y van en sentido horario. Queremos que targetCenter=0 sea "arriba".
  // "Arriba" en SVG = -90°. Por eso targetStart-90 más el offset del semicírculo.
  // Para un arco centrado en targetCenter, el inicio está en targetCenter - targetHalf.
  // Pero como el SVG empieza a las 3 en punto, hay que restarle 90 + targetHalf.
  const targetStart = targetCenter - level.targetHalf - 90;

  return (
    <div className="w-full flex flex-col gap-3 select-none">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleChangeLevel}
          className="px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer active:scale-95 transition-all"
          style={{
            background: 'rgba(20, 184, 166, 0.15)',
            color: R.frameTop,
            border: `1px solid ${R.frameMid}80`
          }}
        >
          ← Nivel
        </button>

        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 rounded-full text-[10px] font-black"
            style={{
              background: 'rgba(20, 184, 166, 0.15)',
              color: R.frameTop,
              border: `1px solid ${R.frameMid}80`
            }}
          >
            {roundIndex + 1}/{level.rounds}
          </span>
          <span
            className="px-2 py-1 rounded-full text-[10px] font-black"
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              color: R.greenBright,
              border: '1px solid rgba(34, 197, 94, 0.4)'
            }}
          >
            ✅ {score}
          </span>
          {level.timeLimit && timeLeft !== null && roundStatus === 'spinning' && (
            <span
              className="px-2 py-1 rounded-full text-[10px] font-black"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: R.redBright,
                border: '1px solid rgba(239, 68, 68, 0.5)'
              }}
            >
              ⏱ {timeLeft.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Barra progreso */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(148, 163, 184, 0.15)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${R.frameMid} 0%, ${R.greenBright} 100%)`,
            boxShadow: `0 0 10px ${R.green}80`
          }}
        />
      </div>

      {/* Globo de Sparky */}
      <div
        className="w-full px-3 py-2 rounded-2xl flex items-center gap-2"
        style={{
          background: 'rgba(20, 184, 166, 0.12)',
          border: `1.5px solid ${R.frameMid}60`
        }}
      >
        <img
          src="/favicon.png"
          alt="Sparky"
          className="w-8 h-8 rounded-full flex-shrink-0"
          style={{ border: `2px solid ${R.frameTop}` }}
        />
        <span
          className="text-xs font-black"
          style={{ color: R.frameTop }}
        >
          🐾 {sparkyMessage}
        </span>
      </div>

      {/* Medidor circular */}
      <div className="w-full flex items-center justify-center">
        <div
          className="relative p-3 rounded-full"
          style={{
            background: `linear-gradient(180deg, ${R.frameTop} 0%, ${R.frameMid} 50%, ${R.frameBot} 100%)`,
            border: `3px solid ${R.frameBorder}`,
            boxShadow: `
              0 8px 0 ${R.frameDeep},
              inset 0 3px 0 ${R.frameHighlight},
              inset 0 -4px 0 rgba(0,0,0,0.4),
              0 12px 32px rgba(0,0,0,0.6),
              0 0 40px ${R.frameMid}50
            `,
            width: '300px',
            height: '300px'
          }}
        >
          <div
            className="relative w-full h-full rounded-full overflow-hidden"
            style={{
              backgroundImage: 'url(/memoria/fondo.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              boxShadow: 'inset 0 6px 16px rgba(0,0,0,0.85)'
            }}
          >
            {/* SVG con marcas y zona verde */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            >
              {/* Marcas del velocímetro */}
              {Array.from({ length: 36 }).map((_, i) => {
                const angle = i * 10;
                const rad = ((angle - 90) * Math.PI) / 180;
                const x1 = CENTER + Math.cos(rad) * (RADIUS + 8);
                const y1 = CENTER + Math.sin(rad) * (RADIUS + 8);
                const x2 = CENTER + Math.cos(rad) * (RADIUS + (i % 3 === 0 ? 18 : 12));
                const y2 = CENTER + Math.sin(rad) * (RADIUS + (i % 3 === 0 ? 18 : 12));
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={i % 3 === 0 ? R.amberBright : 'rgba(251,191,36,0.4)'}
                    strokeWidth={i % 3 === 0 ? 3 : 1.5}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Anillo base */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke="rgba(0,0,0,0.35)"
                strokeWidth="20"
              />

              {/* Zona verde objetivo */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={
                  lastResult === 'hit'
                    ? R.greenBright
                    : lastResult === 'miss' || lastResult === 'timeout'
                    ? R.redBright
                    : R.green
                }
                strokeWidth="20"
                strokeDasharray={`${arcLength} ${CIRCUMFERENCE}`}
                strokeLinecap="round"
                transform={`rotate(${targetStart} ${CENTER} ${CENTER})`}
                style={{
                  filter: `drop-shadow(0 0 8px ${
                    lastResult === 'hit'
                      ? R.greenGlow
                      : lastResult === 'miss'
                      ? 'rgba(248,113,113,0.9)'
                      : R.greenGlow
                  })`,
                  transition: 'stroke 0.3s'
                }}
              />
            </svg>

            {/* Sparky en el centro */}
            <div
              className="absolute rounded-full overflow-hidden"
              style={{
                left: '50%',
                top: '50%',
                width: '90px',
                height: '90px',
                transform: 'translate(-50%, -50%)',
                border: `3px solid ${R.amberBright}`,
                boxShadow: `0 0 20px ${R.amberBright}80, inset 0 2px 6px rgba(0,0,0,0.5)`,
                zIndex: 2
              }}
            >
              <img
                src="/favicon.png"
                alt="Sparky"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Aguja giratoria — con ref, ocupa todo el contenedor */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '100%',
                height: '100%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 1
              }}
            >
              <div
                ref={needleRef}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: '6px',
                  height: '38.5%',
                  background: `linear-gradient(180deg, ${R.amberBright} 0%, ${R.amber} 100%)`,
                  transformOrigin: 'bottom center',
                  transform: 'translate(-50%, -100%) rotate(0deg)',
                  borderRadius: '4px 4px 0 0',
                  boxShadow: `0 0 12px ${R.amberBright}, 0 0 24px ${R.amber}80`,
                  willChange: 'transform'
                }}
              />
            </div>

            {/* Centro de la aguja (encima de la aguja) */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '22px',
                height: '22px',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, ${R.amberBright} 0%, ${R.amber} 60%, ${R.woodDark} 100%)`,
                border: `2px solid ${R.woodBorder}`,
                boxShadow: `0 0 12px ${R.amberBright}, inset 0 2px 3px rgba(255,255,255,0.6)`,
                pointerEvents: 'none',
                zIndex: 3
              }}
            />
          </div>
        </div>
      </div>

      {/* Botón TOCAR */}
      <button
        type="button"
        onClick={handleTap}
        disabled={roundStatus !== 'spinning'}
        className="w-full py-5 rounded-2xl font-black text-xl transition-all relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:translate-y-1"
        style={{
          background: roundStatus === 'spinning'
            ? `linear-gradient(180deg, ${R.greenBright} 0%, ${R.green} 50%, #15803d 100%)`
            : 'rgba(148, 163, 184, 0.15)',
          color: roundStatus === 'spinning' ? '#003300' : R.textMuted,
          border: `3px solid ${R.frameDeep}`,
          boxShadow: roundStatus === 'spinning'
            ? `0 6px 0 ${R.frameDeep}, 0 0 30px ${R.green}80, inset 0 3px 0 ${R.frameHighlight}`
            : `0 4px 0 ${R.frameDeep}`
        }}
      >
        <div className="flex items-center justify-center gap-3 relative z-10">
          <span className="material-symbols-outlined text-[28px]">adjust</span>
          <span style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.1em' }}>
            {roundStatus === 'spinning' ? '¡TOCAR AHORA!' : 'Preparate...'}
          </span>
        </div>

        {roundStatus === 'spinning' && (
          <span
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 50%)'
            }}
          />
        )}
      </button>

      {/* Indicador de resultado */}
      {lastResult && (
        <div
          className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-black text-sm"
          style={{
            background:
              lastResult === 'hit'
                ? 'rgba(34, 197, 94, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
            border: `2px solid ${
              lastResult === 'hit' ? R.green : R.red
            }`,
            color: lastResult === 'hit' ? R.greenBright : R.redBright
          }}
        >
          <span className="material-symbols-outlined text-[22px]">
            {lastResult === 'hit' ? 'check_circle' : 'close'}
          </span>
          <span>
            {lastResult === 'hit' ? '¡Acertaste!' : lastResult === 'timeout' ? '¡Se pasó!' : 'Fallaste'}
          </span>
        </div>
      )}

      {/* Puntitos indicadores */}
      <div className="flex justify-center gap-1.5">
        {Array.from({ length: level.rounds }).map((_, i) => {
          const isDone = i < roundIndex;
          const isCurrent = i === roundIndex;
          return (
            <span
              key={i}
              className="rounded-full transition-all"
              style={{
                width: isCurrent ? '20px' : '8px',
                height: '8px',
                background: isDone ? R.greenBright : isCurrent ? R.amberBright : 'rgba(148, 163, 184, 0.3)',
                boxShadow: isDone ? `0 0 6px ${R.greenBright}` : isCurrent ? `0 0 8px ${R.amberBright}` : 'none'
              }}
            />
          );
        })}
      </div>
    </div>
  );
}