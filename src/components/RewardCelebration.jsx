import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';

const BALL_LEVELS = [
  { id: 1, name: 'Verde', emoji: '🟢', color: '#10b981', glow: '#34d399', minTasks: 1, label: 'Verde' },
  { id: 2, name: 'Azul', emoji: '🔵', color: '#3b82f6', glow: '#60a5fa', minTasks: 2, label: 'Azul' },
  { id: 3, name: 'Morado', emoji: '🟣', color: '#8b5cf6', glow: '#a78bfa', minTasks: 3, label: 'Morado' },
  { id: 4, name: 'Dorado', emoji: '🟡', color: '#f59e0b', glow: '#fbbf24', minTasks: 4, label: 'Dorado' }
];

function getBallLevel(completedToday) {
  if (completedToday >= 4) return BALL_LEVELS[3];
  if (completedToday >= 3) return BALL_LEVELS[2];
  if (completedToday >= 2) return BALL_LEVELS[1];
  if (completedToday >= 1) return BALL_LEVELS[0];
  return null;
}

export default function RewardCelebration() {
  const { celebration, closeCelebration, tasks, setActiveTab, userName } = useApp();
  const [showSparkyCard, setShowSparkyCard] = useState(false);

  const completedToday = tasks.filter((t) => t.status === 'completed').length;
  const ballLevel = getBallLevel(completedToday);

  // Solo mostrar si es tipo 'boom'
  const isBoom = celebration?.type === 'boom';

  useEffect(() => {
    if (isBoom) {
      try {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#ff6b00', '#10b981', '#8b5cf6', '#f59e0b', '#3b82f6']
        });
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 120,
            origin: { y: 0.6 },
            colors: ['#dc2626', '#ec4899', '#06b6d4']
          });
        }, 300);
      } catch (e) {}

      const timer = setTimeout(() => setShowSparkyCard(true), 800);
      return () => clearTimeout(timer);
    } else {
      setShowSparkyCard(false);
    }
  }, [isBoom]);

  if (!isBoom) return null;

  const handleGoToRewards = () => {
    try { audioService.playPop(); } catch (e) {}
    closeCelebration();
    setActiveTab('rewards');
  };

  const handleGoHome = () => {
    try { audioService.playClick(); } catch (e) {}
    closeCelebration();
    setActiveTab('today');
  };

  const handleSkip = () => {
    try { audioService.playClick(); } catch (e) {}
    closeCelebration();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex justify-center items-start overflow-y-auto"
      style={{
        background: 'linear-gradient(180deg, rgba(11,15,25,0.96) 0%, rgba(17,24,39,0.96) 50%, rgba(11,15,25,0.96) 100%)',
        backdropFilter: 'blur(8px)'
      }}
    >
      {/* Botón saltar (esquina superior derecha) */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
        title="Saltar celebración"
      >
        <span className="material-symbols-outlined text-[20px]">close</span>
      </button>

      {/* Confeti CSS */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[
          { color: '#fbbf24', left: '10%', delay: '0.2s' },
          { color: '#10b981', left: '25%', delay: '0.7s' },
          { color: '#8b5cf6', left: '45%', delay: '1.1s' },
          { color: '#ff6b00', left: '68%', delay: '0.4s' },
          { color: '#06b6d4', left: '85%', delay: '0.9s' },
          { color: '#ec4899', left: '18%', delay: '1.5s' },
          { color: '#facc15', left: '58%', delay: '1.8s' },
          { color: '#14b8a6', left: '92%', delay: '2.1s' }
        ].map((p, i) => (
          <div
            key={i}
            className="absolute -top-4 w-2.5 h-3.5 rounded-sm"
            style={{
              backgroundColor: p.color,
              left: p.left,
              animation: `floatConfetti 3.5s linear ${p.delay} infinite`,
              transform: 'rotate(15deg)'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md min-h-screen flex flex-col px-6 pt-6 pb-8">

        {/* Barra superior */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/60">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
              ¡Modo Flow Activo!
            </span>
          </div>
        </div>

        {/* Badge BOOM */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 text-white font-extrabold text-[11px] tracking-wider uppercase shadow-lg shadow-orange-500/30 mb-3">
            <span>✨</span> ¡LOGRO DEL DÍA COMPLETADO!
          </div>

          <h1 className="font-black text-3xl sm:text-4xl text-white leading-tight tracking-tight">
            ¡Lo hiciste genial!
          </h1>

          <p className="text-slate-300 text-sm mt-2 max-w-xs font-medium leading-relaxed">
            Completaste tus misiones del día. ¡Tu cerebro merece celebrar!
          </p>
        </div>

        {/* Bola de Energía */}
        <div className="flex items-center justify-center my-6">
          <div className="relative">
            <div
              className="absolute inset-0 w-44 h-44 rounded-full opacity-40 blur-2xl -translate-x-3 -translate-y-3"
              style={{
                background: `radial-gradient(circle, ${
                  ballLevel?.glow || '#8b5cf6'
                } 0%, transparent 70%)`
              }}
            />

            <div
              className="relative w-36 h-36 rounded-full p-1 shadow-2xl flex flex-col items-center justify-center border-2 transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, #0c0c1a 0%, ${
                  ballLevel?.color || '#8b5cf6'
                } 100%)`,
                borderColor: ballLevel?.glow || '#a78bfa',
                boxShadow: `0 0 40px ${ballLevel?.glow || '#a78bfa'}80`
              }}
            >
              <div className="w-full h-full rounded-full bg-slate-950/50 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center">
                <span className="text-3xl filter drop-shadow-md">
                  {ballLevel?.emoji || '🔮'}
                </span>
                <span className="font-black text-lg text-white tracking-wide mt-0.5">
                  NIVEL {ballLevel?.id || 1}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                  Bola {ballLevel?.label || 'Verde'}
                </span>
              </div>

              {celebration.stars > 0 && (
                <div className="absolute -top-1.5 -right-1 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
                  +{celebration.stars} XP
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Evolución de la Bola */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-inner mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2 px-1">
            <span>Evolución de Bola de Energía:</span>
            <span className="text-purple-400">
              {Math.min(completedToday, 4)} de 4 desbloqueados
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {BALL_LEVELS.map((level) => {
              const isUnlocked = completedToday >= level.minTasks;
              const isCurrent = ballLevel?.id === level.id;
              return (
                <div
                  key={level.id}
                  className={`relative flex flex-col items-center p-2 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-purple-950/80 border-2'
                      : isUnlocked
                      ? 'bg-slate-800/70'
                      : 'bg-slate-800/40 opacity-60 border-dashed'
                  }`}
                  style={
                    isCurrent
                      ? { borderColor: level.glow, boxShadow: `0 0 15px ${level.glow}40` }
                      : isUnlocked
                      ? { borderColor: level.color + '60' }
                      : { borderColor: '#47556960' }
                  }
                >
                  <span
                    className="w-4 h-4 rounded-full mb-1"
                    style={{
                      backgroundColor: isUnlocked ? level.color : '#47556960',
                      boxShadow: isUnlocked ? `0 0 6px ${level.glow}` : 'none'
                    }}
                  />
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: isUnlocked ? level.glow : '#64748b' }}
                  >
                    {level.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 mt-2.5 font-medium text-center">
            ✨ Cada tarea cuenta. Vos decidís el ritmo.
          </p>
        </div>

        {/* Sparky */}
        {showSparkyCard && (
          <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-md mb-3 animate-[fadeIn_0.5s_ease-in]">
            <img
              src="/sparky.png"
              alt="Sparky"
              className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover bg-amber-100 flex-shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML =
                  '<div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl">🐶</div>';
              }}
            />
            <div className="text-left min-w-0">
              <span className="text-[11px] font-bold text-amber-400">Sparky dice:</span>
              <p className="text-xs text-slate-200 font-medium leading-tight mt-0.5">
                «¡Todas esas tareas ya no ocupan memoria en tu cabeza, {userName}! Descansá tranquilo, te lo ganaste.»
              </p>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="w-full space-y-2.5">
          <button
            type="button"
            onClick={handleGoToRewards}
            className="w-full py-3.5 px-5 rounded-2xl text-white font-extrabold text-base shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)',
              boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)',
              border: '1px solid rgba(167, 139, 250, 0.3)'
            }}
          >
            <span>⚡</span> Ver Baúl de Poderes →
          </button>

          <button
            type="button"
            onClick={handleGoHome}
            className="w-full py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-sm border border-slate-700/80 flex items-center justify-center gap-2 active:scale-[0.98] transition-colors cursor-pointer"
          >
            <span>🏠</span> Volver al Círculo de Enfoque
          </button>
        </div>

      </div>

      <style>{`
        @keyframes floatConfetti {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}