import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getDayProgress, getTodayTipKey } from '../utils/dayProgress';
import DaySelector from '../components/schedule/DaySelector';
import EnergyBall from '../components/schedule/EnergyBall';
import SparkyDayBanner from '../components/schedule/SparkyDayBanner';
import TimelineBlock from '../components/schedule/TimelineBlock';
import FreeSlotCard from '../components/schedule/FreeSlotCard';
import EditDayModal from '../components/schedule/EditDayModal';
import WeeklyTemplateModal from '../components/schedule/WeeklyTemplateModal';
import AssignTaskModal from '../components/schedule/AssignTaskModal';

const DAY_NAMES = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday'
];

const DAY_LABELS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
];

function getDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDayNumber(date) {
  const d = date.getDay();
  return d === 0 ? 7 : d;
}

export const ScheduleScreen = () => {
  const {
    weeklyTemplate,
    dayOverrides,
    tasks,
    completedTips,
    activeWeek,
    setDayOverride,
    updateTemplateBlock,
    addTemplateBlock,
    deleteTemplateBlock,
    setActiveScreen
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditDayOpen, setIsEditDayOpen] = useState(false);
  const [isEditTemplateOpen, setIsEditTemplateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignSlot, setAssignSlot] = useState(null);

  const dayOfWeekKey = DAY_NAMES[selectedDate.getDay()];
  const dateKey = getDateKey(selectedDate);
  const dayLabel = `${DAY_LABELS[selectedDate.getDay()]} ${selectedDate.getDate()}`;

  const blocks = useMemo(() => {
    if (dayOverrides[dateKey]) return dayOverrides[dateKey];
    return weeklyTemplate[dayOfWeekKey] || [];
  }, [dayOverrides, dateKey, weeklyTemplate, dayOfWeekKey]);

  const freeSlots = useMemo(
    () => blocks.filter((b) => b.type === 'free_slot'),
    [blocks]
  );

  const getAssignedTask = (slotId) => {
    return tasks.find((t) => t.slotId === slotId && t.slotDate === dateKey);
  };

  const todayTipKey = useMemo(
    () => getTodayTipKey(activeWeek, getDayNumber(selectedDate)),
    [activeWeek, selectedDate]
  );

  const progress = useMemo(
    () => getDayProgress({ tasks, completedTips, todayTipKey }),
    [tasks, completedTips, todayTipKey]
  );

  const handleEditBlock = (block) => {
    setIsEditDayOpen(true);
  };

  const handleAssign = (slot) => {
    setAssignSlot(slot);
    setIsAssignOpen(true);
  };

  const handleViewTask = (task) => {
    // placeholder
  };

  const handleSaveDay = (newBlocks) => {
    setDayOverride(dateKey, newBlocks);
  };

  const isToday = getDateKey(new Date()) === dateKey;

  return (
    <div className="flex flex-col w-full max-w-md mx-auto items-center select-none pb-8 px-2">

      {/* Header del día + íconos de acción */}
      <div className="w-full flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#65a30d] text-[24px]">
              calendar_today
            </span>
            <h1 className="font-headline-lg font-black text-on-surface leading-tight">
              {isToday ? 'Hoy' : DAY_LABELS[selectedDate.getDay()]}
            </h1>
            {isToday && (
              <span className="px-2 py-0.5 rounded-full bg-[#ecfccb] border border-[#bef264] text-[#365314] font-label-sm text-label-sm font-black">
                HOY
              </span>
            )}
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-bold mt-0.5">
            {selectedDate.getDate()} de{' '}
            {selectedDate.toLocaleString('es', { month: 'long' })}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* 📅 Calendario mensual */}
          <button
            type="button"
            onClick={() => setActiveScreen('monthly')}
            className="w-11 h-11 rounded-2xl bg-white border-2 border-[#d9f99d] text-[#65a30d] flex items-center justify-center shadow-[0_2px_0_0_#d9f99d] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            title="Ver calendario mensual"
          >
            <span className="material-symbols-outlined text-[22px]">
              calendar_month
            </span>
          </button>

          {/* ⚙️ Editar plantilla */}
          <button
            type="button"
            onClick={() => setIsEditTemplateOpen(true)}
            className="w-11 h-11 rounded-2xl bg-white border-2 border-[#d9f99d] text-[#65a30d] flex items-center justify-center shadow-[0_2px_0_0_#d9f99d] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            title="Editar plantilla semanal"
          >
            <span className="material-symbols-outlined text-[22px]">
              settings
            </span>
          </button>
        </div>
      </div>

      {/* Selector de días */}
      <div className="w-full mb-3">
        <DaySelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </div>

      {/* Bola de Energía (versión mini-compacta) */}
      <div className="w-full mb-3">
        <EnergyBall progress={progress} />
      </div>

      {/* Banner de Sparky con el mapeo del día */}
      <div className="w-full mb-4">
        <SparkyDayBanner freeSlots={freeSlots} />
      </div>

      {/* Título de la línea de tiempo */}
      <div className="w-full flex items-center justify-between mb-2 px-1">
        <span className="font-label-md text-label-md uppercase tracking-wider text-[#3f6212] font-black">
          Línea de Tiempo
        </span>
        <span className="font-label-sm text-label-sm text-[#4d7c0f] flex items-center gap-1 font-bold">
          <span className="w-2 h-2 rounded-full bg-[#65a30d] animate-pulse" />
          {blocks.length} bloques
        </span>
      </div>

      {/* Timeline */}
      <div className="w-full flex flex-col gap-2.5 mb-4">
        {blocks.length === 0 ? (
          <div className="w-full p-6 rounded-2xl bg-[#f7fee7] border-2 border-dashed border-[#bef264] text-center">
            <span className="text-3xl">📅</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
              No hay bloques para este día. Configurá la plantilla semanal.
            </p>
          </div>
        ) : (
          blocks.map((block) => {
            if (block.type === 'free_slot') {
              const assignedTask = getAssignedTask(block.id);
              return (
                <FreeSlotCard
                  key={block.id}
                  block={block}
                  assignedTask={assignedTask}
                  onAssign={handleAssign}
                  onViewTask={handleViewTask}
                />
              );
            }
            return (
              <TimelineBlock
                key={block.id}
                block={block}
                onEdit={handleEditBlock}
              />
            );
          })
        )}
      </div>

      {/* Botón editar solo hoy */}
      {blocks.length > 0 && (
        <button
          type="button"
          onClick={() => setIsEditDayOpen(true)}
          className="w-full py-3 rounded-2xl bg-[#f7fee7] border-2 border-dashed border-[#bef264] text-[#65a30d] font-label-md text-label-md font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer mb-2"
        >
          <span className="material-symbols-outlined text-[20px]">edit_calendar</span>
          Editar solo este día
        </button>
      )}

      {/* Nota si hay override */}
      {dayOverrides[dateKey] && (
        <p className="font-label-sm text-label-sm text-[#4d7c0f] text-center mb-4">
          ⚠️ Este día tiene cambios personalizados. No afecta la plantilla semanal.
        </p>
      )}

      {/* Modales */}
      <EditDayModal
        isOpen={isEditDayOpen}
        onClose={() => setIsEditDayOpen(false)}
        dayId={dayOfWeekKey}
        dayLabel={dayLabel}
        blocks={blocks}
        onSave={handleSaveDay}
      />

      <WeeklyTemplateModal
        isOpen={isEditTemplateOpen}
        onClose={() => setIsEditTemplateOpen(false)}
        weeklyTemplate={weeklyTemplate}
        onUpdateBlock={updateTemplateBlock}
        onAddBlock={addTemplateBlock}
        onDeleteBlock={deleteTemplateBlock}
      />

      <AssignTaskModal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        slot={assignSlot}
        dateKey={dateKey}
      />

    </div>
  );
};