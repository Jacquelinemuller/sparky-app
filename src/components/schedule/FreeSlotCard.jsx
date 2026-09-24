import React from 'react';
import { audioService } from '../../services/audioService';

export default function FreeSlotCard({ block, assignedTask, onAssign, onViewTask }) {
  if (!block) return null;

  const handleAssign = () => {
    try { audioService.playPop(); } catch (e) {}
    onAssign(block);
  };

  const handleViewTask = () => {
    try { audioService.playClick(); } catch (e) {}
    onViewTask(assignedTask);
  };

  const hasTask = Boolean(assignedTask);
  const isCompleted = assignedTask?.status === 'completed';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#f7fee7] to-white border-2 border-[#bef264] rounded-2xl p-4 shadow-[0_4px_12px_rgba(132,204,22,0.15)] transition-all">
      <div className="flex flex-col gap-3">
        {/* Header del slot */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16] animate-ping flex-shrink-0" />
            <span className="font-label-sm text-[10px] uppercase tracking-widest text-[#365314] font-black truncate">
              {hasTask ? 'Espacio asignado' : '¡Espacio Libre de Misión!'}
            </span>
          </div>
          <span className="font-label-md text-xs font-black text-amber-950 bg-gradient-to-r from-amber-300 to-yellow-300 border-2 border-amber-400 shadow-[0_2px_0_0_#d97706] px-2.5 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
            <span className="text-amber-700 animate-pulse">⚡</span>
            {block.duration || 'Libre'}
          </span>
        </div>

        {/* Contenido principal */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_2px_0_0_#3f6212] ${
              hasTask
                ? isCompleted
                  ? 'bg-[#84cc16] text-white'
                  : 'bg-[#65a30d] text-white'
                : 'bg-[#65a30d] text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[26px]">
              {hasTask ? (isCompleted ? 'check_circle' : 'stars') : 'stars'}
            </span>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-headline text-sm font-black text-[#1e2e05] leading-tight truncate">
              {hasTask ? assignedTask.title : block.title}
            </span>
            <span className="font-body-sm text-xs text-[#4d7c0f] leading-snug truncate">
              {block.time}
              {hasTask && ` • ${assignedTask.timeMinutes} min`}
            </span>
          </div>
        </div>

        {/* Botones */}
        <div>
          {hasTask ? (
            <button
              type="button"
              onClick={handleViewTask}
              className="w-full h-12 rounded-xl bg-white text-[#4d7c0f] font-label-md text-label-md flex items-center justify-center gap-2 border-2 border-[#84cc16] shadow-[0_2px_0_0_#bef264] active:translate-y-1 active:shadow-none transition-all hover:bg-[#f7fee7] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] text-[#65a30d]">
                {isCompleted ? 'check_circle' : 'visibility'}
              </span>
              <span className="font-bold">
                {isCompleted ? '¡Misión completada!' : 'Ver misión'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAssign}
              className="w-full h-12 rounded-xl bg-[#65a30d] text-white font-label-md text-label-md flex items-center justify-center gap-2 shadow-[0_3px_0_0_#3f6212] active:translate-y-1 active:shadow-none transition-all hover:bg-[#588d0b] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add_task</span>
              <span className="font-bold">Asignar Misión aquí</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}