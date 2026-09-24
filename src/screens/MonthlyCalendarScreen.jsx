import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';
import EventFormModal from '../components/EventFormModal';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const CATEGORY_CONFIG = {
  cumple: { label: 'Cumpleaños',    icon: '🎂', color: '#ec4899' },
  salida: { label: 'Salida',        icon: '🚌', color: '#3b82f6' },
  examen: { label: 'Examen',        icon: '📝', color: '#ef4444' },
  medico: { label: 'Turno médico',  icon: '🏥', color: '#10b981' },
  otro:   { label: 'Otro',          icon: '⭐', color: '#f59e0b' }
};

function getDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMonthDays(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastOfMonth.getDate();

  let firstWeekday = firstOfMonth.getDay();
  firstWeekday = firstWeekday === 0 ? 6 : firstWeekday - 1;

  const days = [];

  for (let i = 0; i < firstWeekday; i++) {
    days.push(null);
  }

  for (let d = 1; d <= totalDays; d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}

export const MonthlyCalendarScreen = () => {
  const {
    customEvents,
    tasks,
    dayOverrides,
    addCustomEvent,
    updateCustomEvent,
    deleteCustomEvent,
    setActiveTab,
    setActiveScreen,
    activeTab
  } = useApp();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState(null);

  // Swipe
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const todayKey = getDateKey(today);

  const goPrevMonth = () => {
    try { audioService.playClick(); } catch (e) {}
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goNextMonth = () => {
    try { audioService.playClick(); } catch (e) {}
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const goToday = () => {
    try { audioService.playPop(); } catch (e) {}
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(today);
  };

  // Swipe handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold) {
      goNextMonth();
    } else if (diff < -threshold) {
      goPrevMonth();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const days = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const eventsByDate = useMemo(() => {
    const map = {};

    (customEvents || []).forEach((evt) => {
      if (!map[evt.date]) map[evt.date] = { events: [], tasks: [], hasOverride: false };
      map[evt.date].events.push(evt);
    });

    tasks.forEach((t) => {
      if (t.slotDate) {
        if (!map[t.slotDate]) map[t.slotDate] = { events: [], tasks: [], hasOverride: false };
        map[t.slotDate].tasks.push(t);
      }
    });

    Object.keys(dayOverrides || {}).forEach((key) => {
      if (!map[key]) map[key] = { events: [], tasks: [], hasOverride: false };
      map[key].hasOverride = true;
    });

    return map;
  }, [customEvents, tasks, dayOverrides]);

  const selectedDateKey = selectedDate ? getDateKey(selectedDate) : null;
  const selectedData = selectedDateKey ? eventsByDate[selectedDateKey] : null;
  const selectedEvents = selectedData?.events || [];
  const selectedTasks = selectedData?.tasks || [];
  const selectedHasOverride = selectedData?.hasOverride || false;

  const totalEventsThisMonth = useMemo(() => {
    return days.reduce((acc, d) => {
      if (!d) return acc;
      const key = getDateKey(d);
      const data = eventsByDate[key];
      if (!data) return acc;
      return acc + data.events.length;
    }, 0);
  }, [days, eventsByDate]);

  const getDayEventTypes = (date) => {
    if (!date) return [];
    const key = getDateKey(date);
    const data = eventsByDate[key];
    if (!data) return [];

    const types = new Set();

    data.events.forEach((e) => {
      types.add(e.category);
    });

    if (data.tasks.length > 0) types.add('tarea');
    if (data.hasOverride) types.add('override');

    return Array.from(types).slice(0, 3);
  };

  const getTypeColor = (type) => {
    if (type === 'tarea') return '#ff6b00';
    if (type === 'override') return '#8b5cf6';
    return CATEGORY_CONFIG[type]?.color || '#94a3b8';
  };

  const isToday = (date) => date && getDateKey(date) === todayKey;
  const isSelected = (date) => date && selectedDate && getDateKey(date) === getDateKey(selectedDate);

  const handleSelectDate = (date) => {
    try { audioService.playPop(); } catch (e) {}
    setSelectedDate(date);
  };

  const handleOpenNewEvent = (date = null) => {
    try { audioService.playPop(); } catch (e) {}
    setEditingEvent(null);
    if (date) setSelectedDate(date);
    setIsEventModalOpen(true);
  };

  const handleEditEvent = (evt) => {
    try { audioService.playClick(); } catch (e) {}
    setEditingEvent(evt);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (data) => {
    if (editingEvent) {
      updateCustomEvent(editingEvent.id, data);
    } else {
      addCustomEvent(data);
    }
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteEvent) {
      deleteCustomEvent(confirmDeleteEvent);
      setConfirmDeleteEvent(null);
    }
  };

  // ============ BOTTOM NAV ============
  const navItems = [
    { id: 'today',    label: 'Inicio',   icon: 'home',           fill: true },
    { id: 'missions', label: 'Misiones', icon: 'task_alt',       fill: false },
    { id: 'schedule', label: 'Agenda',   icon: 'calendar_month', fill: false },
    { id: 'rewards',  label: 'Premios',  icon: 'trophy',         fill: false },
  ];

  const handleNavClick = (id) => {
    try { audioService.playClick(); } catch (e) {}
    setActiveScreen('none');
    setActiveTab(id);
  };

  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #f7fee7 0%, #ecfccb 50%, #d9f99d 100%)'
      }}
    >
      {/* ============ HEADER ============ */}
      <header
        className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl shadow-[0_1px_8px_rgba(101,163,13,0.08)]"
        style={{
          background: 'rgba(255,255,255,0.92)',
          borderBottom: '2px solid rgba(190,242,100,0.5)'
        }}
      >
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={goToday}
            className="flex items-center gap-2 cursor-pointer"
            title="Volver a hoy"
          >
            <span
              className="material-symbols-outlined text-[#65a30d] text-[24px]"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              calendar_month
            </span>
            <span className="font-headline-md font-black text-[#365314]">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenNewEvent(null)}
            className="px-3.5 py-2 rounded-2xl bg-[#8b5cf6] text-white font-label-md text-label-md font-black shadow-[0_3px_0_0_#5b21b6] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Evento</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 pb-24 px-4 max-w-md mx-auto">

        {/* ============ NAVEGACIÓN DE MES ============ */}
        <div className="w-full flex items-center justify-between gap-2 mb-3">
          <button
            type="button"
            onClick={goPrevMonth}
            className="w-10 h-10 rounded-full bg-white border-2 border-[#d9f99d] text-[#65a30d] flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-[0_2px_0_0_#d9f99d]"
            title="Mes anterior"
          >
            <span className="material-symbols-outlined text-[22px]">chevron_left</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#d9f99d]/60">
            <span className="font-label-sm text-[11px] font-bold text-[#3f6212]">
              {totalEventsThisMonth} {totalEventsThisMonth === 1 ? 'evento' : 'eventos'}
            </span>
            <button
              type="button"
              onClick={() => {
                try { audioService.playClick(); } catch (e) {}
                setIsLegendOpen((prev) => !prev);
              }}
              className="w-6 h-6 rounded-full bg-[#ecfccb] flex items-center justify-center active:scale-90 transition-all cursor-pointer"
              title="¿Qué significan los colores?"
            >
              <span className="material-symbols-outlined text-[#65a30d] text-[14px]">help</span>
            </button>
          </div>

          <button
            type="button"
            onClick={goNextMonth}
            className="w-10 h-10 rounded-full bg-white border-2 border-[#d9f99d] text-[#65a30d] flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-[0_2px_0_0_#d9f99d]"
            title="Mes siguiente"
          >
            <span className="material-symbols-outlined text-[22px]">chevron_right</span>
          </button>
        </div>

        {/* ============ LEYENDA COLAPSABLE ============ */}
        {isLegendOpen && (
          <div className="w-full mb-3 p-3 rounded-2xl bg-white border-2 border-[#d9f99d] shadow-[0_2px_0_0_#d9f99d] flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_CONFIG.cumple.color }} />
              <span className="font-label-sm text-[10px] font-bold text-[#3f6212]">Cumple</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_CONFIG.salida.color }} />
              <span className="font-label-sm text-[10px] font-bold text-[#3f6212]">Salida</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_CONFIG.examen.color }} />
              <span className="font-label-sm text-[10px] font-bold text-[#3f6212]">Examen</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_CONFIG.medico.color }} />
              <span className="font-label-sm text-[10px] font-bold text-[#3f6212]">Médico</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ff6b00' }} />
              <span className="font-label-sm text-[10px] font-bold text-[#3f6212]">Misión</span>
            </div>
          </div>
        )}

        {/* ============ GRILLA DEL CALENDARIO ============ */}
        <div
          className="w-full bg-white rounded-2xl p-3 shadow-[0_3px_0_0_#d9f99d] border-2 border-[#ecfccb] mb-4 select-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAY_LABELS.map((d, i) => (
              <span
                key={i}
                className={`font-label-sm text-[11px] font-black ${
                  i >= 5 ? 'text-[#65a30d]' : 'text-[#3f6212]'
                }`}
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((date, idx) => {
              if (!date) {
                return <div key={idx} className="aspect-square" />;
              }

              const types = getDayEventTypes(date);
              const todayFlag = isToday(date);
              const selectedFlag = isSelected(date);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDate(date)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                    selectedFlag
                      ? 'bg-[#65a30d] text-white shadow-[0_2px_0_0_#3f6212] scale-105'
                      : todayFlag
                      ? 'bg-[#ecfccb] border-2 border-[#65a30d]'
                      : isWeekend
                      ? 'bg-[#f7fee7]'
                      : 'bg-[#f8fafc] hover:bg-[#ecfccb]'
                  }`}
                >
                  <span
                    className={`font-label-md text-[14px] font-black ${
                      selectedFlag
                        ? 'text-white'
                        : todayFlag
                        ? 'text-[#365314]'
                        : isWeekend
                        ? 'text-[#65a30d]'
                        : 'text-on-surface'
                    }`}
                  >
                    {date.getDate()}
                  </span>

                  {types.length > 0 && (
                    <div className="flex items-center gap-0.5 mt-0.5 flex-wrap justify-center max-w-[85%]">
                      {types.map((type, i) => (
                        <span
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: selectedFlag ? '#fff' : getTypeColor(type)
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="font-label-sm text-[10px] text-[#4d7c0f]/60 font-bold text-center mt-3">
            ← Deslizá para cambiar de mes →
          </p>
        </div>

        {/* ============ DETALLE DEL DÍA (siempre visible) ============ */}
        {selectedDate && (
          <div className="w-full bg-white rounded-2xl p-4 shadow-[0_3px_0_0_#d9f99d] border-2 border-[#ecfccb] mb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#ecfccb] flex items-center justify-center font-headline-md font-black text-[#365314]">
                  {selectedDate.getDate()}
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-md font-black text-on-surface leading-tight">
                    {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][selectedDate.getDay()]}, {selectedDate.getDate()} de {MONTH_NAMES[selectedDate.getMonth()]}
                  </span>
                  <span className="font-label-sm text-[11px] text-[#3f6212] font-bold">
                    {selectedEvents.length + selectedTasks.length === 0
                      ? 'Sin novedades'
                      : `${selectedEvents.length + selectedTasks.length} ${selectedEvents.length + selectedTasks.length === 1 ? 'evento' : 'eventos'}`}
                  </span>
                </div>
              </div>

              {isToday(selectedDate) && (
                <span className="px-2 py-0.5 rounded-full bg-[#ecfccb] border border-[#bef264] text-[#365314] font-label-sm text-[10px] font-black uppercase">
                  HOY
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {selectedEvents.length === 0 && selectedTasks.length === 0 && !selectedHasOverride && (
                <div className="p-3 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] text-center">
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Sin eventos especiales este día
                  </p>
                </div>
              )}

              {selectedEvents.map((evt) => {
                const cfg = CATEGORY_CONFIG[evt.category] || CATEGORY_CONFIG.otro;
                return (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl border-2 flex items-start gap-3"
                    style={{
                      backgroundColor: cfg.color + '15',
                      borderColor: cfg.color + '60'
                    }}
                  >
                    <span className="text-xl flex-shrink-0">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-title-md font-black text-on-surface break-words">
                          {evt.title}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditEvent(evt)}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/60 active:scale-95 transition-all cursor-pointer"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-[16px]" style={{ color: cfg.color }}>
                              edit
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteEvent(evt.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 active:scale-95 transition-all cursor-pointer"
                            title="Eliminar"
                          >
                            <span className="material-symbols-outlined text-red-500 text-[16px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span
                          className="font-label-sm text-[11px] font-bold"
                          style={{ color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                        {evt.time && (
                          <span className="font-label-sm text-[11px] text-on-surface-variant flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                            {evt.time}
                          </span>
                        )}
                      </div>
                      {evt.notes && (
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-snug">
                          {evt.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {selectedTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border-2 border-[#fed7aa] bg-[#fff7ed] flex items-start gap-3"
                >
                  <span className="text-xl flex-shrink-0">📋</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-title-md font-black text-on-surface break-words">
                      {task.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="font-label-sm text-[11px] font-bold text-[#ea580c]">
                        Misión asignada
                      </span>
                      <span className="font-label-sm text-[11px] text-on-surface-variant">
                        {task.timeMinutes} min • +{task.xpReward} XP
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {selectedHasOverride && (
                <div className="p-2.5 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#8b5cf6] text-[18px]">
                    edit_calendar
                  </span>
                  <span className="font-label-sm text-[11px] font-bold text-[#5b21b6]">
                    Este día tiene cambios personalizados en la rutina
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleOpenNewEvent(selectedDate)}
              className="w-full mt-3 py-2.5 rounded-2xl bg-[#f5f3ff] border-2 border-dashed border-[#c4b5fd] text-[#8b5cf6] font-label-md text-label-md font-black flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Agregar evento este día</span>
            </button>
          </div>
        )}

      </main>

      {/* ============ BOTTOM NAV ============ */}
      <nav
        className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl border-t border-[#fed7aa]/50 shadow-[0_-2px_12px_rgba(255,107,0,0.06)]"
        style={{
          background: 'rgba(255, 255, 255, 0.94)',
          borderTop: '2px solid rgba(254, 215, 170, 0.85)',
          boxShadow: 'rgba(255, 107, 0, 0.1) 0px -4px 20px'
        }}
      >
        <div className="flex items-center justify-around h-14 px-space-xs max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] min-h-[48px] px-2 py-0.5 rounded-2xl transition-transform active:scale-95 cursor-pointer ${
                  isActive
                    ? 'text-[#ea580c] font-black'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={isActive && item.fill ? { fontVariationSettings: '"FILL" 1' } : {}}
                >
                  {item.icon}
                </span>
                <span className="font-label-sm text-[10px] tracking-wide">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ============ MODAL DE EVENTO ============ */}
      <EventFormModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        editingEvent={editingEvent}
        defaultDate={selectedDate}
      />

      {/* ============ CONFIRMAR BORRADO ============ */}
      {confirmDeleteEvent && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl border-4 border-[#8b5cf6] shadow-[0_10px_0_0_#7c3aed] p-6 text-center">
            <span className="text-4xl block mb-3">🗑️</span>
            <h3 className="font-headline-md text-headline-md font-black text-on-surface mb-2">
              ¿Eliminar este evento?
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-5">
              No se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteEvent(null)}
                className="flex-1 h-12 rounded-2xl bg-white border-2 border-[#e2e8f0] text-on-surface font-bold active:scale-95 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 h-12 rounded-2xl bg-red-500 text-white font-black shadow-[0_4px_0_0_#991b1b] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};