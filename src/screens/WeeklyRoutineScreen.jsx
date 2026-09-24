import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import ViewSwitcher from '../components/ViewSwitcher';
import { audioService } from '../services/audioService';

const DAYS = [
  { id: 'monday',    label: 'Lunes',     short: 'Lun' },
  { id: 'tuesday',   label: 'Martes',    short: 'Mar' },
  { id: 'wednesday', label: 'Miércoles', short: 'Mié' },
  { id: 'thursday',  label: 'Jueves',    short: 'Jue' },
  { id: 'friday',    label: 'Viernes',   short: 'Vie' },
  { id: 'saturday',  label: 'Sábado',    short: 'Sáb' },
  { id: 'sunday',    label: 'Domingo',   short: 'Dom' }
];

const BLOCK_COLORS = {
  school: '#3b82f6',
  sports: '#10b981',
  arts: '#8b5cf6',
  relax: '#f59e0b',
  routine: '#6b7280',
  free_slot: '#ff6b00',
  default: '#94a3b8'
};

function getBlockType(block) {
  const title = (block.title || '').toLowerCase();
  const icon = (block.icon || '').toLowerCase();

  if (block.type === 'free_slot') return 'free_slot';
  if (icon === 'school' || title.includes('colegio') || title.includes('escuela')) return 'school';
  if (icon === 'sports_soccer' || title.includes('fútbol') || title.includes('entrena') || title.includes('deporte')) return 'sports';
  if (icon === 'palette' || icon === 'music_note' || title.includes('arte') || title.includes('música') || title.includes('taller')) return 'arts';
  if (icon === 'sports_esports' || title.includes('juego') || title.includes('libre') || title.includes('relax')) return 'relax';
  return 'routine';
}

function getTodayId() {
  const d = new Date().getDay();
  const map = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return map[d];
}

export const WeeklyRoutineScreen = () => {
  const {
    weeklyTemplate,
    setActiveTab,
    setActiveScreen
  } = useApp();

  const todayId = useMemo(() => getTodayId(), []);

  const handleGoToDay = () => {
    try { audioService.playPop(); } catch (e) {}
    setActiveTab('schedule');
    setActiveScreen('none');
  };

  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #f7fee7 0%, #ecfccb 50%, #d9f99d 100%)'
      }}
    >
      {/* Header con switcher */}
      <header
        className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl shadow-[0_1px_8px_rgba(101,163,13,0.08)]"
        style={{ background: 'rgba(255,255,255,0.92)', borderBottom: '2px solid rgba(190,242,100,0.5)' }}
      >
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <ViewSwitcher current="weekly" />
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 pb-28 px-4 max-w-md mx-auto">

        {/* Intro */}
        <div className="w-full mb-4">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-black text-on-surface leading-tight">
            Mi rutina semanal
          </h1>
          <p className="font-body-sm text-body-sm text-[#3f6212] mt-1">
            Esto es lo que pasa cada día. Tu rutina predecible 💚
          </p>
        </div>

        {/* Consejo de Sparky */}
        <div className="w-full mb-4 p-3.5 rounded-2xl bg-white border-2 border-[#bef264] shadow-[0_3px_0_0_#d9f99d]">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#ecfccb] p-1">
              <img
                src="/sparky.png"
                alt="Sparky"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl">🐶</div>';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-label-md text-label-md font-black text-[#365314]">
                Sparky dice:
              </p>
              <p className="font-body-sm text-body-sm text-[#3f6212] leading-snug mt-0.5">
                Conocer tu semana te ayuda a estar preparado. Los bloques naranjas 🟠 son espacios libres para tus misiones.
              </p>
            </div>
          </div>
        </div>

        {/* Lista de días */}
        <div className="flex flex-col gap-3">
          {DAYS.map((day) => {
            const blocks = weeklyTemplate[day.id] || [];
            const isToday = day.id === todayId;

            return (
              <div
                key={day.id}
                className={`w-full bg-white rounded-2xl border-2 shadow-[0_3px_0_0_#d9f99d] overflow-hidden ${
                  isToday ? 'border-[#65a30d] ring-2 ring-[#65a30d]/20' : 'border-[#ecfccb]'
                }`}
              >
                {/* Header del día */}
                <div
                  className={`px-4 py-2.5 flex items-center justify-between gap-2 border-b ${
                    isToday
                      ? 'bg-[#65a30d] border-[#3f6212]'
                      : 'bg-[#f7fee7] border-[#d9f99d]/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-headline-md font-black ${
                        isToday ? 'text-white' : 'text-[#365314]'
                      }`}
                    >
                      {day.label}
                    </span>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full bg-white/25 border border-white/40 text-white font-label-sm text-[10px] font-black uppercase">
                        HOY
                      </span>
                    )}
                  </div>
                  <span
                    className={`font-label-sm text-[10px] font-black uppercase tracking-wider ${
                      isToday ? 'text-white/80' : 'text-[#4d7c0f]/70'
                    }`}
                  >
                    {blocks.length} bloques
                  </span>
                </div>

                {/* Bloques del día */}
                <div className="p-3 flex flex-col gap-2">
                  {blocks.length === 0 ? (
                    <p className="text-center text-sm text-on-surface-variant py-2">
                      Sin bloques configurados
                    </p>
                  ) : (
                    blocks.map((block) => {
                      const type = getBlockType(block);
                      const color = BLOCK_COLORS[type];
                      return (
                        <div
                          key={block.id}
                          className="flex items-center gap-2.5 p-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-base flex-shrink-0">
                            {block.type === 'free_slot' ? '⭐' : '📌'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span
                              className={`font-label-md text-[13px] font-black block truncate ${
                                block.type === 'free_slot' ? 'text-[#ea580c]' : 'text-on-surface'
                              }`}
                            >
                              {block.title}
                            </span>
                          </div>
                          <span className="font-label-sm text-[10px] text-on-surface-variant font-bold flex-shrink-0 whitespace-nowrap">
                            {block.time}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Botón "Ver hoy" solo para el día de hoy */}
                {isToday && (
                  <button
                    type="button"
                    onClick={handleGoToDay}
                    className="w-full py-2.5 bg-[#ecfccb] border-t border-[#d9f99d] text-[#365314] font-label-sm text-[12px] font-black flex items-center justify-center gap-1.5 active:bg-[#d9f99d] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>Ver la agenda de hoy en detalle</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Leyenda de colores */}
        <div className="w-full mt-4 bg-white rounded-2xl p-3 border-2 border-[#ecfccb] shadow-[0_3px_0_0_#d9f99d]">
          <p className="font-label-md text-[12px] font-black text-[#365314] uppercase tracking-wider mb-2">
            Colores
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: BLOCK_COLORS.school }} />
              <span className="font-label-sm text-[11px] font-bold text-[#3f6212]">Escuela</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: BLOCK_COLORS.sports }} />
              <span className="font-label-sm text-[11px] font-bold text-[#3f6212]">Deporte</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: BLOCK_COLORS.arts }} />
              <span className="font-label-sm text-[11px] font-bold text-[#3f6212]">Arte</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: BLOCK_COLORS.relax }} />
              <span className="font-label-sm text-[11px] font-bold text-[#3f6212]">Relax</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: BLOCK_COLORS.routine }} />
              <span className="font-label-sm text-[11px] font-bold text-[#3f6212]">Rutina</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: BLOCK_COLORS.free_slot }} />
              <span className="font-label-sm text-[11px] font-bold text-[#3f6212]">Libre</span>
            </div>
          </div>
        </div>

        {/* Botón editar plantilla */}
        <button
          type="button"
          onClick={handleGoToDay}
          className="w-full mt-4 py-3 rounded-2xl bg-white border-2 border-[#d9f99d] text-[#65a30d] font-label-md text-label-md font-black flex items-center justify-center gap-2 shadow-[0_3px_0_0_#d9f99d] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span>Editar mi rutina semanal</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>

      </main>
    </div>
  );
};