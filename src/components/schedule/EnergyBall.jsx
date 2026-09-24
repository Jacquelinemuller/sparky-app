import React, { useState } from 'react';
import { audioService } from '../../services/audioService';

export default function EnergyBall({ progress }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!progress) return null;

  const {
    total = 0,
    tasksProgress = 0,
    tipProgress = 0,
    streakProgress = 0,
    completedTasks = 0,
    totalTasks = 0,
    tipCompletedToday = false,
    streakActive = false
  } = progress;

  const statusLabel = (() => {
    if (total === 0) return 'Iniciando';
    if (total < 30) return 'Iniciando';
    if (total < 70) return 'Energía Activa';
    if (total < 100) return 'Casi lleno';
    return '¡Completo!';
  })();

  const toggleExpand = () => {
    try { audioService.playClick(); } catch (e) {}
    setIsExpanded((prev) => !prev);
  };

  return (
    <div className="w-full bg-white rounded-2xl border-2 border-[#bef264] shadow-[0_2px_0_0_#d9f99d] overflow-hidden transition-all">
      {/* Vista compacta (siempre visible) */}
      <button
        type="button"
        onClick={toggleExpand}
        className="w-full px-3 py-2.5 flex items-center gap-2.5 cursor-pointer hover:bg-[#f7fee7]/40 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#bef264] via-[#84cc16] to-[#65a30d] flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-[16px] text-white" style={{ fontVariationSettings: '"FILL" 1' }}>
            bolt
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-label-sm text-[11px] font-black text-[#365314]">
              {total}%
            </span>
            <span className="font-label-sm text-[10px] font-bold text-[#4d7c0f] flex items-center gap-1">
              {streakActive && '🔥'}
              {statusLabel}
            </span>
          </div>
          <div className="w-full bg-[#ecfccb] h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#84cc16] to-[#65a30d] transition-all duration-700"
              style={{ width: `${total}%` }}
            />
          </div>
        </div>

        <span
          className={`material-symbols-outlined text-[#65a30d] text-[18px] transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {/* Vista expandida (al tocar) */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-[#d9f99d]/50 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#3f6212]">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${tasksProgress > 0 ? 'bg-[#65a30d]' : 'bg-[#d9f99d]'}`} />
              <span>Tareas {tasksProgress}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${tipCompletedToday ? 'bg-[#65a30d]' : 'bg-[#d9f99d]'}`} />
              <span>Tip {tipProgress}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${streakActive ? 'bg-[#65a30d]' : 'bg-[#d9f99d]'}`} />
              <span>Racha {streakProgress}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-[#4d7c0f]/80">
            <span>
              {completedTasks} de {totalTasks} tareas
            </span>
            <span>
              {total >= 100 ? '¡Meta del día! 🎉' : '¡En racha! 🔥'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}