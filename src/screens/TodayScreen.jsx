import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { SparkyCompanion } from '../components/SparkyCompanion';
import UpcomingEventBanner from '../components/UpcomingEventBanner';
import { audioService } from '../services/audioService';
import confetti from 'canvas-confetti';

const PRIORITY_CONFIG = {
  red:    { color: '#ef4444', label: 'Urgente' },
  yellow: { color: '#f59e0b', label: 'Normal' },
  green:  { color: '#10b981', label: 'Cuando pueda' }
};

const DIFFICULTY_CONFIG = {
  facil:   { color: '#10b981', icon: '🟢', label: 'Fácil' },
  media:   { color: '#f59e0b', icon: '🟡', label: 'Media' },
  dificil: { color: '#ef4444', icon: '🔴', label: 'Difícil' },
  epica:   { color: '#8b5cf6', icon: '⭐', label: 'Épica' }
};

const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function PriorityDot({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.yellow;
  return (
    <span
      className="w-3 h-3 rounded-full flex-shrink-0"
      style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}80` }}
      title={cfg.label}
    />
  );
}

function getGreeting(userName) {
  const now = new Date();
  const dayName = DAY_NAMES[now.getDay()];
  const day = now.getDate();
  return `¡hola ${userName}! hoy es ${dayName} ${day}. ¿qué planes tenés para hoy?`;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const TodayScreen = () => {
  const {
    activeTask,
    completeActiveTask,
    toggleMicroStep,
    tasks,
    setActiveTab,
    setSparkyMessage,
    userName,
    setActiveScreen
  } = useApp();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCompletedAnim, setIsCompletedAnim] = useState(false);

  const [timerState, setTimerState] = useState('idle');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const timerRef = useRef(null);
  const [showTimeUpModal, setShowTimeUpModal] = useState(false);

  const queuedTasks = tasks.filter((t) => t.status === 'queued');

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerState('idle');
    setShowTimeUpModal(false);

    if (activeTask) {
      const total = (activeTask.timeMinutes || 10) * 60;
      setTotalSeconds(total);
      setSecondsLeft(total);
    } else {
      setTotalSeconds(0);
      setSecondsLeft(0);
    }
  }, [activeTask?.id]);

  useEffect(() => {
    if (timerState === 'running') {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setTimerState('finished');
            try { audioService.playPomodoroAlarm(); } catch (e) {}
            setShowTimeUpModal(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleBubbleClick = () => {
    if (!activeTask) return;

    if (timerState === 'idle') {
      try { audioService.playPop(); } catch (e) {}
      setTimerState('running');
    } else if (timerState === 'running') {
      try { audioService.playClick(); } catch (e) {}
      setTimerState('paused');
    } else if (timerState === 'paused') {
      try { audioService.playPop(); } catch (e) {}
      setTimerState('running');
    } else if (timerState === 'finished') {
      try { audioService.playPop(); } catch (e) {}
      setSecondsLeft(totalSeconds);
      setTimerState('running');
    }
  };

  const handleResetTimer = () => {
    try { audioService.playClick(); } catch (e) {}
    setTimerState('idle');
    setSecondsLeft(totalSeconds);
    setShowTimeUpModal(false);
  };

  const handleComplete = () => {
    if (!activeTask) return;

    setIsCompletedAnim(true);
    completeActiveTask(activeTask.id);
    setSparkyMessage(
      `¡Increíble ${userName}! Has completado "${activeTask.title}". ¡Has ganado +${activeTask.xpReward} XP! 🎉`
    );

    try {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#ff6b00', '#10b981', '#f59e0b', '#8b5cf6']
      });
    } catch (e) {}

    setTimeout(() => {
      setIsCompletedAnim(false);
    }, 600);
  };

  const handleTimeUpYes = () => {
    setShowTimeUpModal(false);
    handleComplete();
  };

  const handleTimeUpNo = () => {
    setShowTimeUpModal(false);
  };

  const goToNotes = () => {
    try { audioService.playClick(); } catch (e) {}
    setActiveScreen('none');
    setActiveTab('notes');
  };

  const goToMissions = () => {
    try { audioService.playPop(); } catch (e) {}
    setActiveScreen('none');
    setActiveTab('missions');
  };

  const activePriority = activeTask?.priority || 'yellow';
  const activeDifficulty = activeTask?.difficulty || 'media';
  const diffCfg = DIFFICULTY_CONFIG[activeDifficulty] || DIFFICULTY_CONFIG.media;
  const activeMicroSteps = activeTask?.microSteps || [];
  const hasMicroSteps = activeMicroSteps.length > 0;
  const doneSteps = activeMicroSteps.filter((s) => s.done).length;
  const bonusXp = (activeMicroSteps.length - doneSteps) * 2;

  const progressPercent = totalSeconds > 0
    ? Math.min(100, Math.max(0, ((totalSeconds - secondsLeft) / totalSeconds) * 100))
    : 0;

  const RADIUS = 44;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progressPercent / 100);

  const isRunning = timerState === 'running';
  const isPaused = timerState === 'paused';
  const isFinished = timerState === 'finished';

  return (
    <div
      className="flex flex-col w-full max-w-md mx-auto items-center select-none pb-8"
      id="focus-screen-root"
    >
      {/* ============================================
          BLOQUE 1: Sparky + burbuja de saludo (clickeable)
          ============================================ */}
      <section className="w-full flex items-start gap-3 mb-4">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full ring-3 ring-[#ff6b00] shadow-[0_4px_12px_rgba(255,107,0,0.3)] overflow-hidden bg-white">
            <img
              src="/sparky.png"
              alt="Sparky"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-3xl">🐶</div>';
              }}
            />
          </div>
          <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 rounded-full text-[11px] p-0.5 shadow-md font-black border-2 border-white">
            ⚡
          </span>
        </div>

        <div className="relative flex-1 min-w-0">
          <button
            type="button"
            onClick={goToMissions}
            className="relative w-full text-left bg-white border-2 border-[#fed7aa] rounded-2xl shadow-[0_2px_0_0_#fed7aa] px-3.5 py-3 active:scale-[0.98] transition-all cursor-pointer hover:border-[#ff6b00]"
            title="Ir a mis planes del día"
          >
            <span className="absolute -left-2.5 top-5 w-0 h-0 border-y-[9px] border-y-transparent border-r-[11px] border-r-white z-10 pointer-events-none" />
            <span className="absolute -left-3 top-5 w-0 h-0 border-y-[9px] border-y-transparent border-r-[11px] border-r-[#fed7aa] pointer-events-none" />

            <p className="font-body-md text-body-md text-[#ea580c] font-bold leading-snug">
              {getGreeting(userName)}
            </p>
            <p className="font-label-sm text-[10px] text-[#ea580c]/70 font-black mt-1">
              👆 Tocar para ver mis planes
            </p>
          </button>
        </div>
      </section>

      {/* ============================================
          BLOQUE 2: 🎤 + Círculo con timer + 🍅
          ============================================ */}
      <section className="w-full flex items-start justify-center my-3">
        <button
          type="button"
          onClick={goToNotes}
          className="relative z-20 flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-[#1a1a1a] shadow-[0_3px_0_0_#000000] flex items-center justify-center active:translate-y-0.5 active:shadow-none transition-all cursor-pointer -mr-3"
          title="Mis notas de voz"
        >
          <span className="material-symbols-outlined text-[#1a1a1a] text-[22px]" style={{ fontVariationSettings: '"FILL" 1' }}>
            mic
          </span>
        </button>

        <div className="relative flex-shrink-0">
          <div className="absolute w-72 h-72 rounded-full bg-[#ff6b00]/15 blur-2xl -z-10 pointer-events-none"></div>

          <button
            type="button"
            onClick={handleBubbleClick}
            disabled={!activeTask}
            className={`relative w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-surface-container-lowest flex flex-col items-center justify-center p-6 text-center shadow-[0_8px_0_0_#fed7aa,0_20px_40px_rgba(255,107,0,0.12)] border-4 border-[#fff7ed] transition-all duration-300 cursor-pointer active:scale-[0.98] ${
              isCompletedAnim
                ? 'scale-105 shadow-[0_8px_0_0_#10b981,0_20px_40px_rgba(16,185,129,0.2)]'
                : ''
            }`}
          >
            <svg
              className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-0"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <circle cx="50" cy="50" fill="none" r={RADIUS} stroke="#ffedd5" strokeWidth="5"></circle>
              <circle
                className="transition-all duration-1000 ease-linear"
                cx="50" cy="50" fill="none" r={RADIUS}
                stroke={isCompletedAnim || !activeTask ? '#10b981' : '#ff6b00'}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={activeTask ? strokeDashoffset : 0}
                strokeLinecap="round"
                strokeWidth="5"
              ></circle>
            </svg>

            <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 w-full h-full">
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-[#fed7aa] shadow-[0_1px_0_0_#fed7aa] mb-2 ${
                timerState === 'idle' && activeTask ? 'animate-[pulseSoft_2s_ease-in-out_infinite]' : ''
              }`}>
                {activeTask && <PriorityDot priority={activePriority} />}
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-[#ea580c] font-black">
                  {activeTask
                    ? isRunning
                      ? 'Enfocándote...'
                      : isPaused
                      ? 'Pausado'
                      : isFinished
                      ? '¡Tiempo cumplido!'
                      : 'Tu única misión ahora'
                    : '¡Todo al día! 🎉'}
                </span>
              </div>

              {activeTask ? (
                <>
                  {timerState === 'idle' ? (
                    <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-black text-on-surface px-2 leading-tight line-clamp-2 my-1.5">
                      {activeTask.title}
                    </h1>
                  ) : (
                    <>
                      <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-black text-[#ea580c] px-2 leading-tight line-clamp-2 my-1">
                        {formatTime(secondsLeft)}
                      </h1>
                      <p className="font-body-sm text-body-sm text-on-surface-variant font-bold line-clamp-1 px-2 mb-1">
                        {activeTask.title}
                      </p>
                    </>
                  )}

                  <div className="flex items-center gap-1.5 flex-wrap justify-center mt-1">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-[#fed7aa] text-on-surface-variant">
                      <span className="material-symbols-outlined text-[#ea580c] text-[17px]">timer</span>
                      <span className="font-label-md text-label-md text-on-surface-variant">
                        <strong className="text-on-surface font-extrabold">
                          {timerState === 'idle' ? `${activeTask.timeMinutes} min` : formatTime(secondsLeft)}
                        </strong>
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-white font-black text-[10px] uppercase tracking-wider"
                      style={{ backgroundColor: diffCfg.color }}
                    >
                      <span>{diffCfg.icon}</span>
                      <span>{diffCfg.label}</span>
                    </div>
                  </div>

                  {timerState === 'idle' && (
                    <p className="font-label-sm text-[10px] text-[#ea580c] font-black mt-2 opacity-70">
                      👆 Tocar para empezar
                    </p>
                  )}
                  {isRunning && (
                    <p className="font-label-sm text-[10px] text-[#ea580c] font-black mt-2 opacity-70">
                      👆 Tocar para pausar
                    </p>
                  )}
                  {isPaused && (
                    <p className="font-label-sm text-[10px] text-[#ea580c] font-black mt-2 opacity-70">
                      👆 Tocar para continuar
                    </p>
                  )}
                  {isFinished && (
                    <p className="font-label-sm text-[10px] text-[#ea580c] font-black mt-2 opacity-70">
                      👆 Tocar para reiniciar
                    </p>
                  )}
                </>
              ) : (
                <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-black text-on-surface px-2 leading-tight line-clamp-2 my-1.5">
                  ¡No hay más misiones pendientes!
                </h1>
              )}
            </div>
          </button>

          {activeTask && timerState !== 'idle' && (
            <button
              type="button"
              onClick={handleResetTimer}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1.5 rounded-full bg-white border-2 border-[#fed7aa] text-[#ea580c] font-label-sm text-[10px] font-black shadow-[0_2px_0_0_#fed7aa] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center gap-1"
              title="Reiniciar tiempo"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              <span>Reiniciar</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setActiveScreen('pomodoro')}
          className="relative z-20 flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-[#dc2626] shadow-[0_3px_0_0_#991b1b] flex items-center justify-center text-xl active:translate-y-0.5 active:shadow-none transition-all cursor-pointer -ml-3"
          title="Modo Pomodoro"
        >
          🍅
        </button>
      </section>

      {/* Botón completado */}
      {activeTask && (
        <div className="w-full px-2 mt-4">
          <button
            onClick={handleComplete}
            className="w-full min-h-target-min h-14 rounded-full bg-[#ff6b00] hover:bg-[#ea580c] text-white font-label-lg text-label-lg font-black flex items-center justify-center gap-2 shadow-[0_5px_0_0_#c2410c,0_10px_20px_rgba(255,107,0,0.28)] active:translate-y-1 active:shadow-[0_1px_0_0_#c2410c] transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>stars</span>
            <span>¡Completado! (+{activeTask.xpReward} XP)</span>
          </button>
        </div>
      )}

      {/* Banner de evento próximo */}
      <div className="w-full mt-3">
        <UpcomingEventBanner />
      </div>

      {/* Micro-pasos */}
      {activeTask && hasMicroSteps && (
        <section className="w-full mt-4 px-2">
          <div className="bg-white rounded-2xl border-2 border-[#fed7aa] shadow-[0_3px_0_0_#fed7aa] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ea580c] text-[20px]">list</span>
                <span className="font-label-md text-label-md font-black text-on-surface">
                  Pasos de la misión
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#ffedd5] text-[#ea580c] border border-[#fed7aa] font-label-sm text-label-sm font-black">
                {doneSteps}/{activeMicroSteps.length}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-[#ffedd5] overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-[#ff6b00] transition-all duration-500"
                style={{ width: `${(doneSteps / activeMicroSteps.length) * 100}%` }}
              />
            </div>

            <div className="flex flex-col gap-2">
              {activeMicroSteps.map((step, idx) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => toggleMicroStep(activeTask.id, step.id)}
                  className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 text-left transition-all cursor-pointer active:scale-[0.98] ${
                    step.done
                      ? 'bg-[#f0fdf4] border-[#10b981]/40'
                      : 'bg-[#fff7ed] border-[#fed7aa] hover:border-[#ff6b00]'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                      step.done
                        ? 'bg-[#10b981] text-white'
                        : 'bg-white text-[#ea580c] border-2 border-[#fed7aa]'
                    }`}
                  >
                    {step.done ? (
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <span
                    className={`font-body-md text-body-md font-bold flex-1 ${
                      step.done ? 'line-through text-on-surface-variant opacity-60' : 'text-on-surface'
                    }`}
                  >
                    {step.text}
                  </span>
                  {!step.done && (
                    <span className="text-[10px] font-black text-[#ea580c] px-1.5 py-0.5 rounded-full bg-[#ffedd5] border border-[#fed7aa] flex-shrink-0">
                      +2 XP
                    </span>
                  )}
                </button>
              ))}
            </div>

            {bonusXp > 0 && (
              <p className="font-label-sm text-label-sm text-[#ea580c] text-center mt-3 font-bold">
                ✨ Te quedan {bonusXp} XP extra por ganar
              </p>
            )}
            {bonusXp === 0 && (
              <p className="font-label-sm text-label-sm text-[#10b981] text-center mt-3 font-bold">
                🎉 ¡Completaste todos los pasos! Ahora tocá "¡Completado!" para cerrar la misión.
              </p>
            )}
          </div>
        </section>
      )}

      {/* Sparky con tips integrados */}
      <section aria-label="Soporte y pausas" className="w-full flex flex-col gap-3 mt-4 px-2">
        <SparkyCompanion />
      </section>

      {/* Tareas guardadas */}
      <section aria-label="Tareas en espera protegidas" className="w-full mt-5 px-2 flex flex-col items-center">
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#fff7ed] border border-[#fed7aa] flex items-center justify-between text-on-surface-variant transition-colors shadow-[0_2px_0_0_#fed7aa] cursor-pointer"
          type="button"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#ea580c]">inventory_2</span>
            <span className="font-label-md text-label-md font-extrabold text-on-surface">Tareas guardadas</span>
            <span className="px-2 py-0.5 rounded-full bg-[#ffedd5] text-[#ea580c] border border-[#fed7aa] font-label-sm text-label-sm font-black">
              {queuedTasks.length} en espera
            </span>
          </div>
          <span className={`material-symbols-outlined text-[22px] text-[#ea580c] transition-transform duration-200 ${isDrawerOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>

        <p className="font-label-sm text-label-sm text-on-surface-variant/70 mt-2 text-center">
          🛡️ El resto espera su turno de forma segura. Una cosa a la vez.
        </p>

        {isDrawerOpen && (
          <div className="w-full flex flex-col gap-2.5 mt-3 transition-all">
            {queuedTasks.length === 0 ? (
              <p className="text-center text-sm text-on-surface-variant py-2">No hay más tareas en espera. ¡Buen trabajo!</p>
            ) : (
              queuedTasks.map((task) => (
                <div key={task.id} className="w-full p-3.5 rounded-2xl bg-surface-container-lowest border border-[#fed7aa]/50 flex items-center justify-between opacity-90 shadow-sm">
                  <div className="flex items-center gap-3">
                    <PriorityDot priority={task.priority || 'yellow'} />
                    <div className="flex flex-col">
                      <span className="font-title-md text-title-md font-bold text-on-surface">{task.title}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Siguiente en la fila • {task.timeMinutes} min</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">lock</span>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Modal "¡Tiempo cumplido!" */}
      {showTimeUpModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl border-4 border-[#ea580c] shadow-[0_10px_0_0_#c2410c] p-6 text-center">
            <span className="text-5xl block mb-3">⏰</span>
            <h3 className="font-headline-md text-headline-md font-black text-on-surface mb-2">
              ¡Tiempo cumplido!
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
              ¿Terminaste la misión "{activeTask?.title}"?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleTimeUpNo}
                className="flex-1 h-12 rounded-2xl bg-white border-2 border-[#e2e8f0] text-on-surface font-bold active:scale-95 transition-all cursor-pointer"
              >
                Aún no
              </button>
              <button
                type="button"
                onClick={handleTimeUpYes}
                className="flex-1 h-12 rounded-2xl bg-[#10b981] text-white font-black shadow-[0_4px_0_0_#047857] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>¡Sí!</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulseSoft {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.03); }
        }
      `}</style>
    </div>
  );
};