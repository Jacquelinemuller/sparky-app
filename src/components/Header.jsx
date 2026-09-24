import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getDayProgress, getHeaderDots, getTodayTipKey } from '../utils/dayProgress';

export const Header = () => {
  const {
    xp,
    tasks,
    completedTips,
    activeWeek,
    setActiveTab,
    setActiveScreen,
    userName,
    userAvatar
  } = useApp();

  const todayDay = useMemo(() => {
    const d = new Date().getDay();
    return d === 0 ? 7 : d;
  }, []);

  const todayTipKey = useMemo(
    () => getTodayTipKey(activeWeek, todayDay),
    [activeWeek, todayDay]
  );

  const progress = useMemo(
    () => getDayProgress({ tasks, completedTips, todayTipKey }),
    [tasks, completedTips, todayTipKey]
  );

  const dots = useMemo(() => getHeaderDots(progress.total), [progress.total]);

  const openStats = () => {
    setActiveTab('today');
    setActiveScreen('stats');
  };

  const openParents = () => {
    setActiveScreen('parents');
  };

  const openProfile = () => {
    setActiveScreen('profile');
  };

  return (
    <header
      className="fixed top-0 w-full z-50 pt-safe bg-surface-container-lowest/90 backdrop-blur-xl border-b border-[#fed7aa]/40"
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        borderBottom: '2px solid rgba(254, 215, 170, 0.8)',
        boxShadow: 'rgba(255, 107, 0, 0.08) 0px 4px 16px'
      }}
    >
      <div className="h-16 px-gutter-mobile flex items-center justify-between gap-space-xs">
        <div className="flex items-center justify-between w-full max-w-lg mx-auto gap-2 select-none">

          {/* Indicador de Energía Flow */}
          <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-white/90 border border-[#fed7aa] shadow-[0_2px_0_0_#fed7aa] backdrop-blur-md">
            <div className="flex items-center gap-1 mr-1">
              <span className="text-[12px] leading-none text-[#ea580c] font-black">⚡</span>
              <span className="font-label-sm text-[11px] font-extrabold text-[#ea580c] uppercase tracking-wider hidden sm:inline">
                Flow
              </span>
            </div>

            <div
              className="flex items-center gap-1.5"
              title={`Progreso del día: ${progress.total}% (${progress.completedTasks} de ${progress.totalTasks} tareas)`}
            >
              {dots.map((percent, i) => (
                <ProgressDot key={i} percent={percent} />
              ))}
            </div>
          </div>

          {/* XP + Stats + Padres + Avatar */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 border-2 border-[#fed7aa] shadow-[0_2px_0_0_#fed7aa,0_2px_8px_rgba(255,107,0,0.12)]">
              <span className="text-[15px] leading-none drop-shadow-[0_1px_4px_rgba(245,158,11,0.5)]">⭐</span>
              <span className="font-label-md text-label-md font-black text-[#ea580c] tracking-tight">
                {xp} <span className="text-[#9a3412] text-[11px] font-extrabold">XP</span>
              </span>
            </div>

            {/* Botón Stats */}
            <button
              onClick={openStats}
              className="flex-shrink-0 focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer transition-transform active:scale-95"
              title="Ver mi progreso semanal"
              type="button"
            >
              <span
                className="material-symbols-outlined text-[#ea580c] text-[22px]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                trending_up
              </span>
            </button>

            {/* Botón Padres (semi-transparente) */}
            <button
              onClick={openParents}
              className="flex-shrink-0 focus:outline-none min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer transition-all active:scale-95 opacity-30 hover:opacity-100"
              title="Sección Padres"
              type="button"
            >
              <span
                className="material-symbols-outlined text-[#8b5cf6] text-[20px]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                supervisor_account
              </span>
            </button>

            {/* Avatar → Perfil */}
            <button
              onClick={openProfile}
              className="flex-shrink-0 focus:outline-none min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer transition-transform active:scale-95"
              title={`Perfil de ${userName}`}
              type="button"
            >
              <div className="relative">
                <img
                  alt={`Avatar de ${userName}`}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-[#ff6b00] shadow-[0_2px_8px_rgba(255,107,0,0.25)]"
                  src={userAvatar}
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#10b981] border-2 border-white rounded-full"></span>
              </div>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

function ProgressDot({ percent = 0 }) {
  const isFull = percent >= 100;
  const isEmpty = percent === 0;

  return (
    <div
      className="relative w-4 h-4 rounded-full flex items-center justify-center transition-all duration-500"
      style={{
        background: isEmpty
          ? 'rgba(120, 53, 15, 0.15)'
          : `conic-gradient(#22c55e 0% ${percent}%, rgba(120, 53, 15, 0.15) ${percent}% 100%)`,
        border: isFull ? '1.5px solid #86efac' : '1.5px solid #fed7aa',
        boxShadow: isFull ? '0 0 8px rgba(34, 197, 94, 0.7)' : 'none'
      }}
    >
      {isFull && (
        <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white/70" />
      )}
    </div>
  );
}