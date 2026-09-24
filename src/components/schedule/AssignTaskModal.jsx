import React from 'react';
import Modal from '../common/Modal';
import Button3D from '../common/Button3D';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';

export default function AssignTaskModal({ isOpen, onClose, slot, dateKey }) {
  const { tasks, assignTaskToSlot, unassignTaskFromSlot } = useApp();

  if (!slot) return null;

  // Tareas disponibles: no completadas
  const availableTasks = tasks.filter((t) => t.status !== 'completed');

  // Tarea asignada actualmente a este slot (para esta fecha)
  const currentlyAssigned = tasks.find(
    (t) => t.slotId === slot.id && t.slotDate === dateKey
  );

  const handleAssign = (taskId) => {
    try { audioService.playPop(); } catch (e) {}
    assignTaskToSlot(taskId, slot.id, dateKey);
    onClose();
  };

  const handleUnassign = () => {
    if (!currentlyAssigned) return;
    try { audioService.playClick(); } catch (e) {}
    unassignTaskFromSlot(currentlyAssigned.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Asignar misión a ${slot.title || 'slot'}`}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-3">

        {/* Info del slot */}
        <div className="p-3 rounded-2xl bg-[#f7fee7] border-2 border-[#d9f99d] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#65a30d] text-[22px]">
            event_available
          </span>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md font-extrabold text-[#365314]">
              {slot.time}
            </span>
            {slot.duration && (
              <span className="font-label-sm text-label-sm text-[#4d7c0f]">
                Duración: {slot.duration}
              </span>
            )}
          </div>
        </div>

        {/* Botón quitar (si ya hay una asignada) */}
        {currentlyAssigned && (
          <div className="p-3 rounded-2xl bg-[#fef3c7] border-2 border-[#fcd34d] flex items-center justify-between gap-2">
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm font-black text-amber-800 uppercase">
                Ya asignada
              </span>
              <span className="font-body-sm text-body-sm text-on-surface truncate">
                {currentlyAssigned.title}
              </span>
            </div>
            <button
              type="button"
              onClick={handleUnassign}
              className="px-3 py-1.5 rounded-full bg-white border-2 border-amber-400 text-amber-800 font-label-sm text-label-sm font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1 flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              Quitar
            </button>
          </div>
        )}

        {/* Lista de tareas */}
        <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1">
          {availableTasks.length === 0 ? (
            <div className="p-5 text-center rounded-2xl bg-[#fff7ed] border-2 border-dashed border-[#fed7aa]">
              <span className="text-3xl">🌱</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                No hay misiones disponibles. Creá una nueva desde el organizador.
              </p>
            </div>
          ) : (
            availableTasks.map((task) => {
              const isAssignedHere =
                task.slotId === slot.id && task.slotDate === dateKey;
              const isAssignedElsewhere =
                task.slotId && !isAssignedHere;

              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => handleAssign(task.id)}
                  disabled={isAssignedHere}
                  className={`w-full p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer ${
                    isAssignedHere
                      ? 'bg-[#ecfccb] border-[#84cc16] opacity-70 cursor-default'
                      : 'bg-white border-[#d9f99d] hover:border-[#84cc16] active:scale-[0.98]'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: task.color || '#ff6b00' }}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-title-md text-title-md font-bold text-on-surface truncate">
                      {task.title}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {task.timeMinutes} min • +{task.xpReward} XP
                      {isAssignedElsewhere && ' • 📅 Ya en otro slot'}
                      {isAssignedHere && ' • ✅ Aquí'}
                    </span>
                  </div>
                  {isAssignedHere ? (
                    <span className="material-symbols-outlined text-[#65a30d] text-[22px] flex-shrink-0">
                      check_circle
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[#65a30d] text-[22px] flex-shrink-0">
                      add_circle
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Botón cancelar */}
        <div className="flex justify-end pt-2 border-t-2 border-[#d9f99d]/50">
          <Button3D variant="outline" onClick={onClose}>
            Cancelar
          </Button3D>
        </div>

      </div>
    </Modal>
  );
}