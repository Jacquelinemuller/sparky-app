import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';
import { GAMES_CATALOG } from '../../services/gamesCatalog';
import confetti from 'canvas-confetti';
import sparkyVideo from '../../assets/sparky.mp4';

const C = {
  overlay: 'rgba(5,5,15,0.92)',
  card: '#1a1a2e',
  lime: '#22c55e',
  limeBright: '#4ade80',
  cyan: '#06b6d4',
  cyanBright: '#38bdf8',
  amber: '#facc15',
  amberBright: '#fde047',
  magenta: '#ff2d87',
  violet: '#8b5cf6',
  text: '#ffffff',
  textMuted: '#94a3b8'
};

// ============================================
// SPRITE SHEET DEL COFRE
// ============================================
const CHEST_FRAMES = 16;
const CHEST_COLS = 4;
const CHEST_ROWS = 4;

// ============================================
// PARTÍCULAS ORBITANDO
// ============================================
const ORBITING_PARTICLES = Array.from({ length: 14 }).map((_, i) => ({
  id: i,
  angle: (i / 14) * 360,
  delay: (i * 0.15) % 2,
  size: i % 3 === 0 ? 16 : i % 3 === 1 ? 12 : 10,
  emoji: ['✨', '⭐', '💫', '🌟', '💎'][i % 5]
}));

// ============================================
// COFRE CON SPRITE SHEET
// ============================================
function ChestSprite({ frame = 0, size = 220 }) {
  const clampedFrame = Math.max(0, Math.min(CHEST_FRAMES - 1, frame));
  const col = clampedFrame % CHEST_COLS;
  const row = Math.floor(clampedFrame / CHEST_COLS);

  const colPercent = CHEST_COLS === 1 ? 0 : (col / (CHEST_COLS - 1)) * 100;
  const rowPercent = CHEST_ROWS === 1 ? 0 : (row / (CHEST_ROWS - 1)) * 100;

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundImage: 'url(/games/chest-spritesheet.png)',
        backgroundSize: `${CHEST_COLS * 100}% ${CHEST_ROWS * 100}%`,
        backgroundPosition: `${colPercent}% ${rowPercent}%`,
        backgroundRepeat: 'no-repeat',
        imageRendering: 'auto',
        filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.8)) drop-shadow(0 0 40px rgba(251, 191, 36, 0.4))'
      }}
    />
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function ChestModal() {
  const { pendingChest, openChest } = useApp();
  const [stage, setStage] = useState('closed');
  const [chestFrame, setChestFrame] = useState(0);
  const timersRef = useRef([]);
  const frameIntervalRef = useRef(null);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!pendingChest) {
      setStage('closed');
      setChestFrame(0);
      clearTimers();
    }
  }, [pendingChest]);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  if (!pendingChest) return null;

  const game = GAMES_CATALOG.find((g) => g.id === pendingChest.gameId);
  const isFullReward = pendingChest.minutes >= 20;

  // ============================================
  // ANIMAR FRAMES DEL COFRE
  // ============================================
  const animateChestFrames = (fromFrame, toFrame, durationMs) => {
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);

    const totalFrames = toFrame - fromFrame;
    const stepDuration = durationMs / Math.max(1, totalFrames);

    let current = fromFrame;
    setChestFrame(current);

    frameIntervalRef.current = setInterval(() => {
      current += 1;
      if (current >= toFrame) {
        setChestFrame(toFrame);
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      } else {
        setChestFrame(current);
      }
    }, stepDuration);
  };

  // ============================================
  // ABRIR EL COFRE
  // ============================================
  const handleOpen = () => {
    if (stage !== 'closed') return;

    // Vibración del celu
    try {
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 80, 30, 150, 50, 200]);
      }
    } catch (e) {}

    // Sonido ascendente
    try {
      audioService.playTone(300, 0.12);
      setTimeout(() => { try { audioService.playTone(400, 0.12); } catch (e) {} }, 200);
      setTimeout(() => { try { audioService.playTone(520, 0.12); } catch (e) {} }, 400);
      setTimeout(() => { try { audioService.playTone(660, 0.15); } catch (e) {} }, 600);
      setTimeout(() => { try { audioService.playTone(850, 0.2); } catch (e) {} }, 800);
    } catch (e) {}

    // FASE 1: temblor (0-1s) → frames 0 a 6
    setStage('shaking');
    animateChestFrames(0, 6, 1000);

    // FASE 2: explosión (1s) → frames 6 a 11
    timersRef.current.push(
      setTimeout(() => {
        try { audioService.playSuccess(); } catch (e) {}
        try {
          if (navigator.vibrate) navigator.vibrate([100, 30, 150]);
        } catch (e) {}

        try {
          confetti({
            particleCount: 120,
            spread: 110,
            origin: { y: 0.5 },
            colors: ['#fbbf24', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7'],
            scalar: 1.3
          });
        } catch (e) {}

        setStage('burst');
        animateChestFrames(6, 11, 500);
      }, 1000)
    );

    // FASE 3: el juego vuela (1.8s)
    timersRef.current.push(
      setTimeout(() => {
        setStage('flying');

        try {
          confetti({
            particleCount: 100,
            spread: 160,
            origin: { y: 0.4 },
            colors: ['#22c55e', '#4ade80', '#38bdf8', '#facc15'],
            scalar: 1
          });
        } catch (e) {}
      }, 1800)
    );

    // FASE 4: revelado (2.5s)
    timersRef.current.push(
      setTimeout(() => {
        setStage('revealed');

        try { audioService.playBark(); } catch (e) {}

        try {
          if (navigator.vibrate) navigator.vibrate([50, 100, 50, 100, 100]);
        } catch (e) {}

        try {
          const duration = 1500;
          const end = Date.now() + duration;
          const frame = () => {
            confetti({
              particleCount: 4,
              angle: 60,
              spread: 55,
              origin: { x: 0, y: 0.9 },
              colors: ['#fbbf24', '#ec4899', '#06b6d4']
            });
            confetti({
              particleCount: 4,
              angle: 120,
              spread: 55,
              origin: { x: 1, y: 0.9 },
              colors: ['#22c55e', '#a855f7', '#fbbf24']
            });
            if (Date.now() < end) requestAnimationFrame(frame);
          };
          frame();
        } catch (e) {}
      }, 2500)
    );
  };

  const handleClaim = () => {
    clearTimers();
    try { audioService.playSuccess(); } catch (e) {}
    openChest();
    setStage('closed');
    setChestFrame(0);
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-hidden"
      style={{ background: C.overlay, backdropFilter: 'blur(10px)' }}
    >
      {/* Flash blanco al explotar */}
      {stage === 'burst' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 30%, transparent 70%)',
            animation: 'whiteFlash 0.7s ease-out forwards'
          }}
        />
      )}

      {/* Rayos de luz */}
      {(stage === 'burst' || stage === 'flying' || stage === 'revealed') && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{ animation: 'raysIn 1.4s ease-out forwards' }}
        >
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className="absolute origin-center"
              style={{
                width: '5px',
                height: '400px',
                background: `linear-gradient(to top, transparent 0%, ${C.amber} 25%, ${C.amberBright} 50%, ${C.amber} 75%, transparent 100%)`,
                transform: `rotate(${i * 22.5}deg)`,
                opacity: 0.7,
                animation: `rayPulse 1.6s ease-in-out infinite`,
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Card principal */}
      <div
        className="relative w-full max-w-sm rounded-3xl p-6 flex flex-col items-center text-center overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${C.card} 0%, #08081a 100%)`,
          border: `2px solid ${stage === 'revealed' ? C.limeBright : C.amber}`,
          boxShadow:
            stage === 'revealed'
              ? `0 0 80px ${C.lime}80, 0 0 160px ${C.cyan}40`
              : `0 0 60px ${C.amber}80, 0 0 120px ${C.magenta}40`,
          transition: 'border-color 0.5s ease, box-shadow 0.5s ease'
        }}
      >
        {/* Estrellas de fondo */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 28 }).map((_, i) => {
            const top = (i * 37) % 100;
            const left = (i * 53) % 100;
            return (
              <span
                key={i}
                className="absolute text-[9px]"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  color: i % 3 === 0 ? C.amber : i % 3 === 1 ? C.cyanBright : C.magenta,
                  animation: `twinkle 2.6s ease-in-out infinite`,
                  animationDelay: `${(i % 8) * 0.3}s`
                }}
              >
                ✦
              </span>
            );
          })}
        </div>

        {/* ============================================ */}
        {/* FASE 1: Cofre cerrado                        */}
        {/* ============================================ */}
        {stage === 'closed' && (
          <>
            <span
              className="font-black uppercase tracking-wider text-[11px] mb-2 z-10"
              style={{ color: C.amber, animation: 'slideDown 0.4s ease-out' }}
            >
              ⭐ ¡Reto cumplido! ⭐
            </span>
            <h2
              className="font-black text-2xl mb-1 z-10"
              style={{ color: C.text }}
            >
              Tenés un cofre
            </h2>
            <p
              className="text-xs font-bold mb-4 z-10"
              style={{ color: C.textMuted }}
            >
              {pendingChest.challengeIcon} {pendingChest.challengeTitle}
            </p>

            <button
              type="button"
              onClick={handleOpen}
              className="relative w-60 h-60 flex items-center justify-center cursor-pointer z-10"
              aria-label="Abrir cofre"
            >
              {/* Aura pulsante externa */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${C.amber}40 0%, ${C.amber}15 40%, transparent 70%)`,
                  animation: 'auraPulse 2s ease-in-out infinite'
                }}
              />

              {/* Partículas orbitando */}
              {ORBITING_PARTICLES.map((p) => (
                <span
                  key={p.id}
                  className="absolute pointer-events-none"
                  style={{
                    fontSize: `${p.size}px`,
                    animation: `orbit 4.5s linear infinite`,
                    animationDelay: `${p.delay}s`,
                    ['--orbit-angle']: `${p.angle}deg`,
                    ['--orbit-radius']: '100px'
                  }}
                >
                  {p.emoji}
                </span>
              ))}

              {/* Cofre con sprite sheet */}
              <div
                className="relative z-10"
                style={{ animation: 'chestWobble 2.5s ease-in-out infinite' }}
              >
                <ChestSprite frame={chestFrame} size={220} />
              </div>
            </button>

            <p
              className="mt-4 text-[13px] font-black z-10"
              style={{
                color: C.amberBright,
                animation: 'pulseText 1.4s ease-in-out infinite'
              }}
            >
              👆 ¡Tocalo para abrir!
            </p>
          </>
        )}

        {/* ============================================ */}
        {/* FASE 2: Temblando                            */}
        {/* ============================================ */}
        {stage === 'shaking' && (
          <>
            <span
              className="font-black uppercase tracking-wider text-[11px] mb-2 z-10"
              style={{ color: C.amber }}
            >
              ⭐ ¡Reto cumplido! ⭐
            </span>
            <h2
              className="font-black text-2xl mb-4 z-10"
              style={{ color: C.text }}
            >
              ¡Se está abriendo!
            </h2>

            <div className="relative w-60 h-60 flex items-center justify-center z-10">
              {/* Aura intensa */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${C.amber}80 0%, ${C.amber}30 50%, transparent 80%)`,
                  animation: 'auraPulse 0.35s ease-in-out infinite'
                }}
              />

              {/* Partículas rápidas */}
              {ORBITING_PARTICLES.map((p) => (
                <span
                  key={p.id}
                  className="absolute pointer-events-none"
                  style={{
                    fontSize: `${p.size}px`,
                    animation: `orbit 1.5s linear infinite`,
                    animationDelay: `${p.delay * 0.4}s`,
                    ['--orbit-angle']: `${p.angle}deg`,
                    ['--orbit-radius']: '100px'
                  }}
                >
                  {p.emoji}
                </span>
              ))}

              {/* Cofre vibrando con sprite animado */}
              <div
                className="relative z-10"
                style={{ animation: 'chestShake 0.3s ease-in-out infinite' }}
              >
                <ChestSprite frame={chestFrame} size={220} />
              </div>
            </div>
          </>
        )}

        {/* ============================================ */}
        {/* FASE 3: Explosión + salida del juego         */}
        {/* ============================================ */}
        {stage === 'burst' && (
          <div className="flex flex-col items-center justify-center py-10 z-10 min-h-[340px] relative">
            {/* Cofre abierto al centro */}
            <div
              className="relative"
              style={{
                animation: 'burstZoom 0.9s ease-out forwards'
              }}
            >
              <ChestSprite frame={chestFrame} size={240} />

              {/* Ícono del juego saliendo de adentro del cofre */}
              <img
                src={game?.icon}
                alt={game?.label || ''}
                className="absolute pointer-events-none"
                style={{
                  left: '50%',
                  top: '52%',
                  width: '70px',
                  height: '70px',
                  objectFit: 'contain',
                  transform: 'translate(-50%, -50%)',
                  animation: 'treasureEmerge 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                  filter: 'drop-shadow(0 0 16px #fbbf24) drop-shadow(0 0 32px rgba(251,191,36,0.6))',
                  zIndex: 5
                }}
                draggable={false}
              />
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* FASE 4: Carta volando                        */}
        {/* ============================================ */}
        {stage === 'flying' && (
          <div className="flex flex-col items-center justify-center py-6 z-10 min-h-[340px] w-full relative">
            {/* Cofre abierto en el fondo (más chico y oscuro) */}
            <div
              className="absolute top-12 opacity-50"
              style={{
                animation: 'chestFadeOut 0.6s ease-out forwards'
              }}
            >
              <ChestSprite frame={chestFrame} size={150} />
            </div>

            {/* Ícono del juego ya salido y creciendo */}
            <img
              src={game?.icon}
              alt={game?.label || ''}
              className="object-contain relative z-10"
              style={{
                width: '140px',
                height: '140px',
                animation: 'cardFly 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
                filter: 'drop-shadow(0 0 24px #fbbf24) drop-shadow(0 0 48px rgba(251,191,36,0.5))'
              }}
              draggable={false}
            />
            <span
              className="text-sm font-black relative z-10 mt-2"
              style={{
                color: C.amberBright,
                animation: 'pulseText 0.8s ease-in-out infinite'
              }}
            >
              ✨ ¡{game?.label}!
            </span>
          </div>
        )}

        {/* ============================================ */}
        {/* FASE 5: Revelado                             */}
        {/* ============================================ */}
        {stage === 'revealed' && game && (
          <div
            className="flex flex-col items-center w-full z-10"
            style={{ animation: 'revealIn 0.6s ease-out' }}
          >
            <span
              className="font-black uppercase tracking-wider text-[11px] mb-3"
              style={{ color: C.limeBright }}
            >
              🎉 ¡Nuevo juego desbloqueado!
            </span>

            {/* Carta del juego con anillo giratorio */}
            <div
              className="w-36 h-36 rounded-3xl flex items-center justify-center mb-4 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${C.lime}30 0%, ${C.cyan}30 100%)`,
                border: `3px solid ${C.limeBright}`,
                boxShadow: `0 0 40px ${C.lime}80, inset 0 0 24px ${C.lime}40`,
                animation: 'cardFloat 2.5s ease-in-out infinite'
              }}
            >
              <img
                src={game.icon}
                alt={game.label}
                className="w-full h-full object-contain p-3 relative z-10"
                draggable={false}
              />

              <span
                className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  background: `conic-gradient(from 0deg, transparent, ${C.amber}50, transparent, ${C.cyanBright}50, transparent)`,
                  animation: 'spinSlow 3s linear infinite',
                  filter: 'blur(6px)'
                }}
              />
            </div>

            <h2
              className="font-black text-2xl mb-1"
              style={{ color: C.text }}
            >
              {game.label}
            </h2>
            <p className="text-xs font-bold mb-4" style={{ color: C.textMuted }}>
              {game.subtitle}
            </p>

            {/* Bonus de minutos */}
            <div
              className="w-full p-3 rounded-2xl mb-4 flex items-center justify-center gap-2 relative overflow-hidden"
              style={{
                background: `${C.amber}15`,
                border: `1.5px solid ${C.amber}60`
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent, ${C.amber}30, transparent)`,
                  animation: 'shineSweep 2s ease-in-out infinite'
                }}
              />
              <span className="text-xl relative z-10">⏱️</span>
              <span
                className="font-black text-sm relative z-10"
                style={{ color: C.amberBright }}
              >
                +{pendingChest.minutes} min de regalo
              </span>
            </div>

            {/* Sparky festejando */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-14 h-14 rounded-full overflow-hidden bg-white flex-shrink-0"
                style={{
                  border: `3px solid ${C.limeBright}`,
                  boxShadow: `0 0 20px ${C.lime}80`,
                  animation: 'sparkyBounce 0.7s ease-in-out infinite'
                }}
              >
                <video
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  src={sparkyVideo}
                />
              </div>
              <span
                className="text-[13px] font-black"
                style={{ color: C.limeBright }}
              >
                ¡Guau! ¡Lo lograste! 🐾
              </span>
            </div>

            {!isFullReward && (
              <p
                className="text-[10px] font-bold mb-3"
                style={{ color: C.textMuted }}
              >
                💡 La próxima, si cumplís más días, el regalo es más grande
              </p>
            )}

            <button
              type="button"
              onClick={handleClaim}
              className="w-full py-4 rounded-2xl font-black text-base cursor-pointer active:scale-95 transition-all relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${C.lime} 0%, ${C.limeBright} 100%)`,
                color: '#000',
                boxShadow: `0 4px 0 0 #047857, 0 0 32px ${C.lime}80`
              }}
            >
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)`,
                  animation: 'shineSweep 2.2s ease-in-out infinite'
                }}
              />
              <span className="relative z-10">🎮 ¡A jugar!</span>
            </button>
          </div>
        )}

        <style>{`
          @keyframes chestWobble {
            0%, 100% { transform: rotate(0deg) translateY(0); }
            50% { transform: rotate(-2deg) translateY(-5px); }
          }
          @keyframes chestShake {
            0% { transform: rotate(-6deg) scale(1); }
            25% { transform: rotate(6deg) scale(1.06); }
            50% { transform: rotate(-4deg) scale(1); }
            75% { transform: rotate(4deg) scale(1.06); }
            100% { transform: rotate(-6deg) scale(1); }
          }
          @keyframes auraPulse {
            0%, 100% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.25); opacity: 1; }
          }
          @keyframes orbit {
            from {
              transform: rotate(var(--orbit-angle)) translateX(var(--orbit-radius)) rotate(calc(-1 * var(--orbit-angle)));
            }
            to {
              transform: rotate(calc(var(--orbit-angle) + 360deg)) translateX(var(--orbit-radius)) rotate(calc(-1 * (var(--orbit-angle) + 360deg)));
            }
          }
          @keyframes burstZoom {
            0% { transform: scale(0.5) rotate(-15deg); opacity: 0; }
            40% { transform: scale(1.4) rotate(8deg); opacity: 1; }
            70% { transform: scale(1.15) rotate(-4deg); opacity: 1; }
            100% { transform: scale(1.2) rotate(0deg); opacity: 0.9; }
          }
          @keyframes treasureEmerge {
            0% {
              transform: translate(-50%, -50%) scale(0.2);
              opacity: 0;
              top: 52%;
            }
            40% {
              transform: translate(-50%, -50%) scale(0.9);
              opacity: 1;
              top: 40%;
            }
            100% {
              transform: translate(-50%, -50%) scale(1.1);
              opacity: 1;
              top: 15%;
            }
          }
          @keyframes chestFadeOut {
            0% { opacity: 0.6; transform: scale(1); }
            100% { opacity: 0.15; transform: scale(0.85); }
          }
          @keyframes cardFly {
            0% { transform: translateY(80px) scale(0.3) rotate(-20deg); opacity: 0; }
            60% { transform: translateY(-20px) scale(1.2) rotate(10deg); opacity: 1; }
            100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
          }
          @keyframes revealIn {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes cardFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes whiteFlash {
            0% { opacity: 0; }
            25% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes raysIn {
            0% { opacity: 0; transform: scale(0.3) rotate(0deg); }
            50% { opacity: 1; }
            100% { opacity: 0.5; transform: scale(1.3) rotate(35deg); }
          }
          @keyframes rayPulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.9; }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.3); }
          }
          @keyframes pulseText {
            0%, 100% { opacity: 0.7; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.06); }
          }
          @keyframes slideDown {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes sparkyBounce {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-5px) scale(1.08); }
          }
          @keyframes spinSlow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes shineSweep {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </div>
  );
}