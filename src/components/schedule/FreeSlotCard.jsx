import React from 'react';
import { audioService } from '../../services/audioService';

export default function FreeSlotCard({
  block,
  assignedTask,
  taskAlarm,
  onAssign,
  onViewTask,
  onEditTask,
  onAlarmTask
}) {
  if (!block) return null;

  const handleAssign = () => {
    try { audioService.playPop(); } catch (e) {}
    onAssign(block);
  };

  const handleViewTask = () => {
    try { audioService.playClick(); } catch (e) {}
    onViewTask(assignedTask);
  };

  const handleEditTask = (e) => {
    e.stopPropagation();
    try { audioService.playPop(); } catch (e) {}
    if (onEditTask) onEditTask(assignedTask);
  };

  const handleAlarmTask = (e) => {
    e.stopPropagation();
    try { audioService.playPop(); } catch (e) {}
    if (onAlarmTask) onAlarmTask(assignedTask);
  };

  const hasTask = Boolean(assignedTask);
  const isCompleted = assignedTask?.status === 'completed';
  const hasAlarm = Boolean(taskAlarm);

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
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-headline text-sm font-black text-[#1e2e05] leading-tight truncate">
                {hasTask ? assignedTask.title : block.title}
              </span>
              {hasAlarm && (
                <span
                  className="material-symbols-outlined text-[#f59e0b] text-[16px] flex-shrink-0"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                  title={`Alarma a las ${taskAlarm.time}`}
                >
                  notifications_active
                </span>
              )}
            </div>
            <span className="font-body-sm text-xs text-[#4d7c0f] leading-snug truncate">
              {block.time}
              {hasTask && ` • ${assignedTask.timeMinutes} min`}
            </span>
          </div>
        </div>

        {/* Botones */}
        <div>
          {hasTask ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleViewTask}
                className="flex-1 h-12 rounded-xl bg-white text-[#4d7c0f] font-label-md text-label-md flex items-center justify-center gap-2 border-2 border-[#84cc16] shadow-[0_2px_0_0_#bef264] active:translate-y-1 active:shadow-none transition-all hover:bg-[#f7fee7] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] text-[#65a30d]">
                  {isCompleted ? 'check_circle' : 'visibility'}
                </span>
                <span className="font-bold">
                  {isCompleted ? '¡Completada!' : 'Ver misión'}
                </span>
              </button>
              <button
                type="button"
                onClick={handleEditTask}
                className="w-12 h-12 rounded-xl bg-white border-2 border-[#84cc16] text-[#65a30d] flex items-center justify-center shadow-[0_2px_0_0_#bef264] active:translate-y-1 active:shadow-none transition-all hover:bg-[#f7fee7] cursor-pointer"
                title="Editar misión"
              >
                <span className="material-symbols-outlined text-[22px]">edit</span>
              </button>
              <button
                type="button"
                onClick={handleAlarmTask}
                className="w-12 h-12 rounded-xl bg-white border-2 border-[#84cc16] flex items-center justify-center shadow-[0_2px_0_0_#bef264] active:translate-y-1 active:shadow-none transition-all hover:bg-[#f7fee7] cursor-pointer"
                title={hasAlarm ? 'Cambiar alarma' : 'Poner alarma'}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{
                    color: hasAlarm ? '#f59e0b' : '#65a30d',
                    fontVariationSettings: hasAlarm ? '"FILL" 1' : '"FILL" 0'
                  }}
                >
                  {hasAlarm ? 'notifications_active' : 'notifications_none'}
                </span>
              </button>
            </div>
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