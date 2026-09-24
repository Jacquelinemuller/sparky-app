import React from 'react';
import { audioService } from '../../services/audioService';

// Días de la semana (índice JS: 0=Domingo, 1=Lunes, ... 6=Sábado)
const DAYS_SHORT = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

// Genera los 5 días de la semana alrededor de hoy (Lun-Vie por defecto)
function getWeekDays(referenceDate = new Date()) {
  const days = [];
  const today = new Date(referenceDate);

  // Calcular el lunes de esta semana
  const dayOfWeek = today.getDay(); // 0=Dom, 1=Lun, ..., 6=Sáb
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  // Generar 7 días desde el lunes
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }

  return days;
}

export default function DaySelector({ selectedDate, onSelectDate }) {
  const weekDays = getWeekDays(new Date());

  const isSameDay = (a, b) => {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  };

  const handleSelect = (date) => {
    try { audioService.playClick(); } catch (e) {}
    onSelectDate(date);
  };

  return (
    <div className="flex items-center justify-between gap-1 p-1.5 bg-[#ecfccb]/60 border-2 border-[#d9f99d]/60 rounded-2xl shadow-sm">
      {weekDays.map((day, idx) => {
        const isSelected = isSameDay(day, selectedDate);
        const dayLabel = DAYS_SHORT[day.getDay()];
        const dayNum = day.getDate();

        return (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelect(day)}
            className={`flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              isSelected
                ? 'bg-[#65a30d] text-white shadow-[0_3px_0_0_#3f6212] border border-[#84cc16]'
                : 'bg-white text-[#365314] hover:bg-[#f7fee7] border border-transparent hover:border-[#bef264]'
            }`}
          >
            <span
              className={`font-label-sm text-[10px] font-black tracking-wider ${
                isSelected ? 'text-[#d9f99d]' : 'opacity-70'
              }`}
            >
              {dayLabel}
            </span>
            <span
              className={`font-headline text-base font-black ${
                isSelected ? 'text-white' : 'text-[#365314]'
              }`}
            >
              {dayNum}
            </span>
          </button>
        );
      })}
    </div>
  );
}