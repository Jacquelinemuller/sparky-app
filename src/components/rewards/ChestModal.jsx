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

const ORBITING_PARTICLES = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  angle: (i / 18) * 360,
  delay: (i * 0.1) % 2,
  size: i % 3 === 0 ? 14 : i % 3 === 1 ? 10 : 8,
  color: i % 3 === 0 ? C.amber : i % 3 === 1 ? C.cyanBright : C.magenta,
  emoji: ['✨', '⭐', '💫', '🌟'][i % 4]
}));

export default function ChestModal() {
  const { pendingChest, openChest } = useApp();
  const [stage, setStage] = useState('closed');
  const revealedRef = useRef(false);

  useEffect(() => {
    if (!pendingChest) {
      setStage('closed');
      revealedRef.current = false;
    }
  }, [pendingChest]);

  if (!pendingChest) return null;

  const game = GAMES_CATALOG.find((g) => g.id === pendingChest.gameId);
  const isFullReward = pendingChest.minutes >= 20;

  const handleOpen = () => {
    if (stage !== 'closed') return;

    try { audioService.playPop(); } catch (e) {}
    setStage('shaking');

    setTimeout(() => {
      try { audioService.playSuccess(); } catch (e) {}
      setStage('burst');

      try {
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.5 },
          colors: [C.amber, C.amberBright, C.magenta, C.cyanBright, C.violet],
          scalar: 1.2
        });
      } catch (e) {}
    }, 600);

    setTimeout(() => {
      setStage('flying');

      try {
        confetti({
          particleCount: 120,
          spread: 160,
          origin: { y: 0.4 },
          colors: [C.lime, C.limeBright, C.cyan, C.amber],
          scalar: 0.9
        });
      } catch (e) {}
    }, 1400);

    setTimeout(() => {
      setStage('revealed');

      try {
        const duration = 1500;
        const end = Date.now() + duration;
        const frame = () => {
          confetti({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.9 },
            colors: [C.amber, C.magenta, C.cyanBright]
          });
          confetti({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.9 },
            colors: [C.lime, C.violet, C.amber]
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
      } catch (e) {}
    }, 2200);
  };

  const handleClaim = () => {
    try { audioService.playSuccess(); } catch (e) {}
    openChest();
    setStage('closed');
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 overflow-hidden"
      style={{ background: C.overlay, backdropFilter: 'blur(10px)' }}
    >
      {stage === 'burst' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 30%, transparent 70%)',
            animation: 'whiteFlash 0.6s ease-out forwards'
          }}
        />
      )}

      {(stage === 'burst' || stage === 'flying' || stage === 'revealed') && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{ animation: 'raysIn 1.2s ease-out forwards' }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute origin-center"
              style={{
                width: '4px',
                height: '320px',
                background: `linear-gradient(to top, transparent 0%, ${C.amber} 30%, ${C.amberBright} 50%, ${C.amber} 70%, transparent 100%)`,
                transform: `rotate(${i * 30}deg)`,
                opacity: 0.75,
                animation: `rayPulse 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.06}s`
              }}
            />
          ))}
        </div>
      )}

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
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => {
            const top = (i * 37) % 100;
            const left = (i * 53) % 100;
            return (
              <span
                key={i}
                className="absolute text-[8px]"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  color: i % 3 === 0 ? C.amber : i % 3 === 1 ? C.cyanBright : C.magenta,
                  animation: `twinkle 2.5s ease-in-out infinite`,
                  animationDelay: `${(i % 8) * 0.3}s`
                }}
              >
                ✦
              </span>
            );
          })}
        </div>

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
              className="relative w-48 h-48 flex items-center justify-center cursor-pointer z-10"
              style={{ animation: 'chestWobble 3s ease-in-out infinite' }}
              aria-label="Abrir cofre"
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${C.amber}50 0%, ${C.amber}20 40%, transparent 70%)`,
                  animation: 'auraPulse 2s ease-in-out infinite'
                }}
              />
              <div
                className="absolute inset-4 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${C.magenta}30 0%, transparent 60%)`,
                  animation: 'auraPulse 2s ease-in-out infinite reverse'
                }}
              />

              {ORBITING_PARTICLES.map((p) => (
                <span
                  key={p.id}
                  className="absolute pointer-events-none"
                  style={{
                    fontSize: `${p.size}px`,
                    animation: `orbit 4s linear infinite`,
                    animationDelay: `${p.delay}s`,
                    ['--orbit-angle']: `${p.angle}deg`,
                    ['--orbit-radius']: '90px'
                  }}
                >
                  {p.emoji}
                </span>
              ))}

              <span
                className="text-[110px] leading-none select-none relative z-10"
                style={{
                  filter: `drop-shadow(0 0 30px ${C.amber}) drop-shadow(0 0 50px ${C.magenta}80)`,
                  animation: 'chestBounce 1.4s ease-in-out infinite'
                }}
              >
                🎁
              </span>
            </button>

            <p
              className="mt-3 text-[13px] font-black z-10"
              style={{
                color: C.amberBright,
                animation: 'pulseText 1.4s ease-in-out infinite'
              }}
            >
              👆 ¡Tocalo para abrir!
            </p>
          </>
        )}

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
              Tenés un cofre
            </h2>

            <div className="relative w-48 h-48 flex items-center justify-center z-10">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${C.amber}90 0%, ${C.amber}30 50%, transparent 80%)`,
                  animation: 'auraPulse 0.3s ease-in-out infinite'
                }}
              />
              <span
                className="text-[110px] leading-none select-none"
                style={{
                  filter: `drop-shadow(0 0 40px ${C.amber}) drop-shadow(0 0 60px ${C.magenta})`,
                  animation: 'chestShake 0.35s ease-in-out infinite'
                }}
              >
                🎁
              </span>
            </div>

            <p
              className="mt-3 text-[13px] font-black z-10"
              style={{ color: C.amberBright }}
            >
              ¡Se está abriendo!
            </p>
          </>
        )}

        {stage === 'burst' && (
          <div className="flex flex-col items-center justify-center py-10 z-10 min-h-[280px]">
            <span
              className="text-[140px] leading-none select-none"
              style={{
                animation: 'burstZoom 0.8s ease-out forwards',
                filter: `drop-shadow(0 0 40px ${C.amberBright})`
              }}
            >
              💥
            </span>
          </div>
        )}

        {stage === 'flying' && (
          <div className="flex flex-col items-center justify-center py-6 z-10 min-h-[280px] w-full">
            <img
              src={game?.icon}
              alt={game?.label || ''}
              className="w-24 h-24 object-contain mb-2"
              style={{
                animation: 'cardFly 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
              }}
              draggable={false}
            />
            <span
              className="text-sm font-black"
              style={{ color: C.amberBright, animation: 'pulseText 0.8s ease-in-out infinite' }}
            >
              ✨ Preparando tu premio...
            </span>
          </div>
        )}

        {stage === 'revealed' && game && (
          <div
            className="flex flex-col items-center w-full z-10"
            style={{ animation: 'revealIn 0.5s ease-out' }}
          >
            <span
              className="font-black uppercase tracking-wider text-[11px] mb-2"
              style={{ color: C.limeBright }}
            >
              🎉 ¡Nuevo juego desbloqueado!
            </span>

            <div
              className="w-32 h-32 rounded-3xl flex items-center justify-center mb-3 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${C.lime}30 0%, ${C.cyan}30 100%)`,
                border: `2px solid ${C.limeBright}`,
                boxShadow: `0 0 40px ${C.lime}80, inset 0 0 20px ${C.lime}40`,
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
                  background: `conic-gradient(from 0deg, transparent, ${C.amber}40, transparent, ${C.cyanBright}40, transparent)`,
                  animation: 'spinSlow 3s linear infinite',
                  filter: 'blur(4px)'
                }}
              />
            </div>

            <h2
              className="font-black text-2xl mb-1"
              style={{ color: C.text }}
            >
              {game.label}
            </h2>
            <p className="text-xs font-bold mb-3" style={{ color: C.textMuted }}>
              {game.subtitle}
            </p>

            <div
              className="w-full p-3 rounded-2xl mb-3 flex items-center justify-center gap-2 relative overflow-hidden"
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

            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-12 h-12 rounded-full overflow-hidden bg-white"
                style={{
                  border: `2px solid ${C.limeBright}`,
                  boxShadow: `0 0 16px ${C.lime}80`,
                  animation: 'sparkyBounce 0.8s ease-in-out infinite'
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
                className="text-[12px] font-black"
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
            50% { transform: rotate(-2deg) translateY(-4px); }
          }
          @keyframes chestBounce {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-8px) scale(1.05); }
          }
          @keyframes chestShake {
            0% { transform: rotate(-8deg) scale(1); }
            25% { transform: rotate(8deg) scale(1.08); }
            50% { transform: rotate(-6deg) scale(1); }
            75% { transform: rotate(6deg) scale(1.08); }
            100% { transform: rotate(-8deg) scale(1); }
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
            0% { transform: scale(0.3) rotate(-20deg); opacity: 0; }
            40% { transform: scale(1.6) rotate(10deg); opacity: 1; }
            70% { transform: scale(1.2) rotate(-5deg); opacity: 1; }
            100% { transform: scale(1.4) rotate(0deg); opacity: 0.6; }
          }
          @keyframes cardFly {
            0% { transform: translateY(60px) scale(0.4) rotate(-15deg); opacity: 0; }
            60% { transform: translateY(-20px) scale(1.15) rotate(8deg); opacity: 1; }
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
            30% { opacity: 1; }
            100% { opacity: 0; }
          }
          @keyframes raysIn {
            0% { opacity: 0; transform: scale(0.5) rotate(0deg); }
            50% { opacity: 1; }
            100% { opacity: 0.6; transform: scale(1.2) rotate(45deg); }
          }
          @keyframes rayPulse {
            0%, 100% { opacity: 0.5; }
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
            50% { transform: translateY(-4px) scale(1.05); }
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