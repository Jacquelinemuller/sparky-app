import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';

const DAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function getLast7Days() {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

function getDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getBarColor(count, isToday) {
  if (isToday) return '#ff6b00';
  if (count === 0) return '#e7e1de';
  if (count <= 2) return '#a3e635';
  if (count <= 4) return '#65a30d';
  return '#f59e0b';
}

export default function WeekProgressMini({ onOpenFull }) {
  const { dailyHistory, tasks } = useApp();

  const todayCompleted = tasks.filter((t) => t.status === 'completed').length;
  const todayKey = getDateKey(new Date());

  const weekData = useMemo(() => {
    const days = getLast7Days();
    const history = dailyHistory || [];

    return days.map((date) => {
      const key = getDateKey(date);
      if (key === todayKey) {
        return {
          date,
          label: DAY_LABELS[date.getDay()],
          count: todayCompleted,
          isToday: true
        };
      }
      const entry = history.find((h) => h.date === key);
      return {
        date,
        label: DAY_LABELS[date.getDay()],
        count: entry?.completedCount || 0,
        isToday: false
      };
    });
  }, [dailyHistory, todayCompleted, todayKey]);

  const weekTotal = weekData.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...weekData.map((d) => d.count), 1);

  return (
    <button
      type="button"
      onClick={onOpenFull}
      className="w-full bg-white rounded-2xl p-4 shadow-[0_3px_0_0_#fed7aa] border border-[#fed7aa]/50 active:scale-[0.98] transition-all cursor-pointer text-left"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ea580c] text-[20px]">insights</span>
          <span className="font-label-md text-label-md font-black text-on-surface">
            Mi semana
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-[#ffedd5] text-[#ea580c] border border-[#fed7aa] font-label-sm text-label-sm font-black">
            {weekTotal} {weekTotal === 1 ? 'tarea' : 'tareas'}
          </span>
          <span className="material-symbols-outlined text-[#ea580c] text-[18px]">chevron_right</span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-1.5 h-16 mb-2">
        {weekData.map((d, i) => {
          const heightPercent = d.count === 0 ? 12 : Math.max(12, (d.count / maxCount) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: getBarColor(d.count, d.isToday),
                  boxShadow: d.isToday ? '0 0 8px rgba(255,107,0,0.5)' : 'none'
                }}
                title={`${d.count} ${d.count === 1 ? 'tarea' : 'tareas'}`}
              />
              <span
                className={`font-label-sm text-[10px] font-black ${
                  d.isToday ? 'text-[#ea580c]' : 'text-on-surface-variant'
                }`}
              >
                {d.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
        {weekTotal === 0
          ? '¡Empezá hoy! Cada tarea cuenta ✨'
          : `¡${weekTotal} ${weekTotal === 1 ? 'tarea' : 'tareas'} esta semana! Seguí así 🎉`}
      </p>
    </button>
  );
}