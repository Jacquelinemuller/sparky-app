import React from 'react';
import { audioService } from '../../services/audioService';
import Button3D from '../common/Button3D';

const DAYS_OF_WEEK = [
  { num: 1, label: 'L' },
  { num: 2, label: 'M' },
  { num: 3, label: 'M' },
  { num: 4, label: 'J' },
  { num: 5, label: 'V' },
  { num: 6, label: 'S' },
  { num: 7, label: 'D' }
];

export default function DailyTipCard({
  guide,
  tip,
  activeDay,
  onSelectDay,
  isCompleted,
  onComplete,
  onOpenSheet
}) {
  if (!guide || !tip) return null;

  const isCustom = tip.isCustom === true;
  const reward = tip.reward || 15;

  return (
    <div
      className={`w-full p-5 rounded-3xl bg-gradient-to-b from-[#fff7ed] to-[#ffedd5] border-2 shadow-[0_4px_0_0_#fed7aa,0_10px_20px_rgba(255,107,0,0.08)] ${
        isCustom ? 'border-[#8b5cf6] shadow-[0_4px_0_0_#c4b5fd]' : 'border-[#fed7aa]'
      }`}
      style={{
        borderLeft: isCustom
          ? '6px solid #8b5cf6'
          : '6px solid #ff6b00'
      }}
    >
      {/* Header: semana + botón ver lámina */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-label-sm text-label-sm font-black uppercase tracking-wider ${
                isCustom ? 'text-[#8b5cf6]' : 'text-[#ea580c]'
              }`}
            >
              Semana {guide.weekNumber} ⚡ {guide.categoryName}
            </span>
            {isCustom && (
              <span className="px-2 py-0.5 rounded-full bg-[#ede9fe] border border-[#c4b5fd] text-[#6d28d9] font-label-sm text-label-sm font-black flex items-center gap-1">
                👨‍👩‍👧 De casa
              </span>
            )}
          </div>
          <h3 className="font-headline-md text-headline-md font-black text-on-surface mt-1 leading-tight">
            {guide.title}
          </h3>
        </div>

        {!isCustom && (
          <button
            type="button"
            onClick={() => {
              try { audioService.playClick(); } catch (e) {}
              onOpenSheet();
            }}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border-2 border-[#fed7aa] text-[#ea580c] font-label-sm text-label-sm font-extrabold shadow-[0_2px_0_0_#fed7aa] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            title="Ver infografía original"
          >
            <span className="material-symbols-outlined text-[18px]">image</span>
            <span className="hidden sm:inline">Ver Lámina</span>
          </button>
        )}
      </div>

      {/* Selector de días */}
      <div className="flex items-center justify-between gap-1 p-1.5 bg-white/70 border-2 border-[#fed7aa] rounded-full mb-4">
        {DAYS_OF_WEEK.map((d) => {
          const isSelected = activeDay === d.num;
          return (
            <button
              key={d.num}
              type="button"
              onClick={() => onSelectDay(d.num)}
              className={`flex-1 min-h-[34px] rounded-full font-headline text-[13px] font-black transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#ff6b00] text-white shadow-[0_2px_0_0_#c2410c]'
                  : 'text-on-surface-variant hover:bg-[#fff7ed]'
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Tip del día */}
      <div className="bg-white border-2 border-[#fed7aa] rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-full bg-[#fef3c7] border border-[#fde047] text-[#b45309] font-label-sm text-label-sm font-black">
            {tip.dayName || 'Día'} • Tip #{tip.day}
          </span>
          <h4 className="font-headline text-base font-black text-on-surface leading-tight">
            {tip.title}
          </h4>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant font-medium leading-relaxed mb-3">
          {tip.explanation}
        </p>

        {/* Micro-reto */}
        <div className="p-3 rounded-2xl bg-[#fff7ed] border-2 border-dashed border-[#ff6b00] flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 font-label-sm text-label-sm font-black text-[#ea580c]">
            <span className="material-symbols-outlined text-[18px]">task_alt</span>
            MICRO-RETO DEL DÍA (+{reward} XP)
          </div>
          <p className="font-body-sm text-body-sm font-bold text-on-surface leading-snug">
            "{tip.action}"
          </p>
        </div>
      </div>

      {/* Botón de acción */}
      <div className="flex justify-end">
        {isCompleted ? (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#d1fae5] border-2 border-[#10b981] text-[#065f46] font-label-md text-label-md font-black">
            <span className="material-symbols-outlined text-[20px]">verified</span>
            ¡Reto Cumplido Hoy!
          </div>
        ) : (
          <Button3D variant="success" icon="celebration" onClick={onComplete}>
            ¡Cumplí el Reto! (+{reward} XP)
          </Button3D>
        )}
      </div>
    </div>
  );
}