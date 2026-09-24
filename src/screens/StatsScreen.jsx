import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DAY_LABELS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function getLastNDays(n) {
  const days = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
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

export const StatsScreen = () => {
  const { dailyHistory, tasks, setActiveScreen, userName } = useApp();

  const todayCompleted = tasks.filter((t) => t.status === 'completed').length;
  const todayKey = getDateKey(new Date());

  const last7 = useMemo(() => {
    const days = getLastNDays(7);
    const history = dailyHistory || [];
    return days.map((date) => {
      const key = getDateKey(date);
      if (key === todayKey) {
        return { date, label: DAY_LABELS[date.getDay()], count: todayCompleted, xp: 0, isToday: true };
      }
      const entry = history.find((h) => h.date === key);
      return {
        date,
        label: DAY_LABELS[date.getDay()],
        count: entry?.completedCount || 0,
        xp: entry?.xpEarned || 0,
        isToday: false
      };
    });
  }, [dailyHistory, todayCompleted, todayKey]);

  const totalTasks = last7.reduce((sum, d) => sum + d.count, 0);
  const totalXp = last7.reduce((sum, d) => sum + d.xp, 0);

  const bestDay = last7.reduce(
    (best, d) => (d.count > (best?.count || 0) ? d : best),
    null
  );

  const activeDays = last7.filter((d) => d.count > 0).length;

  const maxCount = Math.max(...last7.map((d) => d.count), 1);

  const goBack = () => setActiveScreen('none');

  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)'
      }}
    >
      {/* Header */}
      <header className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl shadow-[0_1px_8px_rgba(255,107,0,0.08)]"
        style={{ background: 'rgba(255,255,255,0.92)' }}>
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full bg-[#fff7ed] border border-[#fed7aa] text-[#ea580c] font-label-md text-label-md font-bold active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Volver</span>
          </button>

          <div className="inline-flex items-center gap-2 bg-[#ffedd5] px-3 py-1.5 rounded-full shadow-[0_2px_0_0_#fed7aa]">
            <span className="material-symbols-outlined text-[16px] text-[#ea580c]" style={{ fontVariationSettings: '"FILL" 1' }}>
              insights
            </span>
            <span className="font-label-sm text-label-sm font-black text-[#ea580c] uppercase tracking-wider">
              Mi progreso
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 pb-28 px-4 max-w-md mx-auto">

        {/* Saludo */}
        <div className="mb-4">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-black text-on-surface leading-tight">
            ¡Mirá tu semana, {userName}!
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Cada barrita es un día. Cada tarea cuenta. 💪
          </p>
        </div>

        {/* Card principal con gráfico */}
        <div className="bg-white rounded-3xl p-5 shadow-[0_5px_0_0_#fed7aa] border border-[#fed7aa]/50 mb-4">
          <div className="flex items-end justify-between gap-2 h-40 mb-3">
            {last7.map((d, i) => {
              const heightPercent = d.count === 0 ? 8 : Math.max(8, (d.count / maxCount) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  {/* Número encima */}
                  <span className={`font-label-sm text-[11px] font-black ${
                    d.count > 0 ? 'text-on-surface' : 'text-on-surface-variant/40'
                  }`}>
                    {d.count}
                  </span>

                  {/* Barra */}
                  <div className="w-full flex-1 flex items-end justify-center">
                    <div
                      className="w-full rounded-t-2xl transition-all duration-700"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: getBarColor(d.count, d.isToday),
                        boxShadow: d.isToday
                          ? '0 0 12px rgba(255,107,0,0.5)'
                          : d.count >= 5
                          ? '0 0 8px rgba(245,158,11,0.5)'
                          : 'none'
                      }}
                    />
                  </div>

                  {/* Día */}
                  <span className={`font-label-sm text-[11px] font-black ${
                    d.isToday ? 'text-[#ea580c]' : 'text-on-surface-variant'
                  }`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="flex items-center justify-center gap-3 pt-3 border-t border-[#fed7aa]/50">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#a3e635]" />
              <span className="font-label-sm text-[10px] text-on-surface-variant">1-2</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#65a30d]" />
              <span className="font-label-sm text-[10px] text-on-surface-variant">3-4</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" />
              <span className="font-label-sm text-[10px] text-on-surface-variant">5+</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#ff6b00]" />
              <span className="font-label-sm text-[10px] text-on-surface-variant">Hoy</span>
            </div>
          </div>
        </div>

        {/* Totales de la semana */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-4 shadow-[0_3px_0_0_#fed7aa] border border-[#fed7aa]/50 flex flex-col items-center">
            <span className="text-3xl mb-1">✅</span>
            <span className="font-headline-lg-mobile text-headline-lg-mobile font-black text-[#ea580c]">
              {totalTasks}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase">
              Tareas
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-[0_3px_0_0_#fed7aa] border border-[#fed7aa]/50 flex flex-col items-center">
            <span className="text-3xl mb-1">⭐</span>
            <span className="font-headline-lg-mobile text-headline-lg-mobile font-black text-[#ea580c]">
              {totalXp}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase">
              XP ganados
            </span>
          </div>
        </div>

        {/* Días activos */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_3px_0_0_#fed7aa] border border-[#fed7aa]/50 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-md text-label-md font-black text-on-surface">
              Días con actividad
            </span>
            <span className="font-headline-md text-headline-md font-black text-[#ea580c]">
              {activeDays} de 7
            </span>
          </div>
          <div className="flex gap-1">
            {last7.map((d, i) => (
              <div
                key={i}
                className="flex-1 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: d.count > 0 ? '#65a30d' : '#e7e1de'
                }}
              />
            ))}
          </div>
        </div>

        {/* Mejor día */}
        {bestDay && bestDay.count > 0 && (
          <div className="bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] rounded-2xl p-4 border-2 border-[#fed7aa] shadow-[0_3px_0_0_#fed7aa] mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🏆</span>
              <span className="font-label-md text-label-md font-black text-[#ea580c]">
                Tu mejor día
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface">
              <strong>{DAY_NAMES[bestDay.date.getDay()]}</strong> con{' '}
              <strong className="text-[#ea580c]">{bestDay.count} {bestDay.count === 1 ? 'tarea' : 'tareas'}</strong>.
              ¡Ese día volaste! 🚀
            </p>
          </div>
        )}

        {/* Sparky mensaje */}
        <div className="bg-white p-4 rounded-2xl shadow-[0_4px_0_0_#fed7aa] border border-[#fed7aa]/50 flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-[#fff7ed] p-1 shadow-[0_3px_0_0_#fed7aa]">
              <img
                src="/sparky.png"
                alt="Sparky"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML =
                    '<div class="w-full h-full flex items-center justify-center text-2xl">🐶</div>';
                }}
              />
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-md text-label-md text-[#ea580c] font-black">
              Sparky dice:
            </span>
            <p className="font-body-sm text-body-sm text-on-surface mt-0.5 leading-snug">
              {totalTasks === 0
                ? '¡Cada gran viaje empieza con un paso! Empezá hoy 💚'
                : totalTasks < 5
                ? `¡${totalTasks} ${totalTasks === 1 ? 'tarea es' : 'tareas son'} un montón! Estoy orgulloso de vos 🐾`
                : `¡${totalTasks} tareas esta semana! ¡Eso es enorme, seguí así! 🎉`}
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};