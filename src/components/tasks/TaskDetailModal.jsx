import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button3D from '../common/Button3D';
import EditTaskModal from '../EditTaskModal';
import TaskAlarmModal from './TaskAlarmModal';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';

const CATEGORY_CONFIG = {
  school:  { label: 'Cole',    color: '#ff6b00', icon: '📚' },
  routine: { label: 'Rutina',  color: '#5bb8fe', icon: '🎒' },
  leisure: { label: 'Ocio',    color: '#8b5cf6', icon: '🎮' },
  home:    { label: 'Casa',    color: '#f59e0b', icon: '🏠' },
  general: { label: 'General', color: '#10b981', icon: '⭐' },
};

const DIFFICULTY_CONFIG = {
  facil:   { color: '#10b981', icon: '🟢', label: 'Fácil' },
  media:   { color: '#f59e0b', icon: '🟡', label: 'Media' },
  dificil: { color: '#ef4444', icon: '🔴', label: 'Difícil' },
  epica:   { color: '#8b5cf6', icon: '⭐', label: 'Épica' }
};

export default function TaskDetailModal({ isOpen, onClose, task }) {
  const { editTask, unassignTaskFromSlot, alarms } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [isAlarmOpen, setIsAlarmOpen] = useState(false);

  if (!task) return null;

  const cfg = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.general;
  const diffCfg = DIFFICULTY_CONFIG[task.difficulty] || DIFFICULTY_CONFIG.media;
  const taskAlarm = (alarms || []).find((a) => a.taskId === task.id);
  const hasAlarm = !!taskAlarm;
  const hasSteps = (task.microSteps || []).length > 0;

  const handleEdit = () => {
    try { audioService.playPop(); } catch (e) {}
    setIsEditing(true);
  };

  const handleAlarm = () => {
    try { audioService.playPop(); } catch (e) {}
    setIsAlarmOpen(true);
  };

  const handleUnassign = () => {
    try { audioService.playClick(); } catch (e) {}
    unassignTaskFromSlot(task.id);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !isEditing && !isAlarmOpen}
        onClose={onClose}
        title="🎯 Detalle de la misión"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col gap-3">

          <div
            className="p-4 rounded-2xl flex flex-col gap-3"
            style={{
              background: '#fff7ed',
              border: '2px solid #fed7aa'
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: cfg.color + '22' }}
              >
                <span>{cfg.icon}</span>
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-black text-on-surface leading-tight break-words">
                  {task.title}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-black text-white"
                    style={{ backgroundColor: diffCfg.color }}
                  >
                    {diffCfg.icon} {diffCfg.label}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    {task.timeMinutes} min • +{task.xpReward} XP
                  </span>
                </div>
              </div>
            </div>

            {hasSteps && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-[#fed7aa]/50">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">
                  Pasos
                </span>
                {task.microSteps.map((step, idx) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-[#fed7aa]/50"
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black ${
                        step.done
                          ? 'bg-[#10b981] text-white'
                          : 'bg-[#ffedd5] text-[#ea580c]'
                      }`}
                    >
                      {step.done ? '✓' : idx + 1}
                    </span>
                    <span
                      className={`text-xs flex-1 break-words ${
                        step.done ? 'line-through text-on-surface-variant opacity-60' : 'text-on-surface'
                      }`}
                    >
                      {step.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {hasAlarm && (
              <div className="flex items-center gap-2 pt-2 border-t border-[#fed7aa]/50">
                <span
                  className="material-symbols-outlined text-[#f59e0b] text-[18px]"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  notifications_active
                </span>
                <span className="text-xs font-black text-[#b45309]">
                  Alarma a las {taskAlarm.time}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleEdit}
                className="flex-1 py-2.5 rounded-xl bg-white border-2 border-[#fed7aa] text-[#ea580c] font-black text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                <span>Editar</span>
              </button>
              <button
                type="button"
                onClick={handleAlarm}
                className="flex-1 py-2.5 rounded-xl bg-white border-2 border-[#fed7aa] text-[#ea580c] font-black text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {hasAlarm ? 'notifications_active' : 'notifications_none'}
                </span>
                <span>{hasAlarm ? 'Cambiar alarma' : 'Poner alarma'}</span>
              </button>
            </div>
            <button
              type="button"
              onClick={handleUnassign}
              className="w-full py-2.5 rounded-xl bg-red-50 border-2 border-red-200 text-red-600 font-black text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">remove_circle</span>
              <span>Quitar de este bloque</span>
            </button>
          </div>

        </div>
      </Modal>

      <EditTaskModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        task={task}
        onSave={(taskId, updates) => {
          editTask(taskId, updates);
          setIsEditing(false);
        }}
      />

      <TaskAlarmModal
        isOpen={isAlarmOpen}
        onClose={() => setIsAlarmOpen(false)}
        task={task}
      />
    </>
  );
}