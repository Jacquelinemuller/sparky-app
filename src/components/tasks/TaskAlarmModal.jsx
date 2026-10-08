import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button3D from '../common/Button3D';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';

const SOUNDS = [
  { id: 'campanita', label: 'Campanita', icon: '🔔' },
  { id: 'llamada',   label: 'Llamada',   icon: '☎️' },
  { id: 'ladrido',   label: 'Ladrido',   icon: '🐶' },
  { id: 'urgente',   label: 'Urgente',   icon: '🚨' },
  { id: 'melodia',   label: 'Melodía',   icon: '🎶' }
];

export default function TaskAlarmModal({ isOpen, onClose, task }) {
  const { alarms, setTaskAlarm, removeTaskAlarm } = useApp();
  const [hour, setHour] = useState('15:00');
  const [sound, setSound] = useState('campanita');

  const existingAlarm = task
    ? (alarms || []).find((a) => a.taskId === task.id)
    : null;

  useEffect(() => {
    if (!task) return;
    if (existingAlarm) {
      setHour(existingAlarm.time || '15:00');
      setSound(existingAlarm.sound || 'campanita');
    } else {
      const d = new Date();
      d.setMinutes(d.getMinutes() + 30);
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      setHour(`${h}:${m}`);
      setSound('campanita');
    }
  }, [task, existingAlarm]);

  if (!task) return null;

  const handleSave = () => {
    setTaskAlarm(task.id, hour, sound);
    onClose();
  };

  const handleDelete = () => {
    try { audioService.playClick(); } catch (e) {}
    removeTaskAlarm(task.id);
    onClose();
  };

  const handlePreview = (soundId) => {
    try { audioService.playAlarm(soundId); } catch (e) {}
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`🔔 Alarma para "${task.title}"`}
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-3">

        <div>
          <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
            🕐 ¿A qué hora te aviso?
          </label>
          <input
            type="time"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full p-3 rounded-2xl border-2 border-[#fed7aa] bg-white text-lg font-black text-center focus:outline-none focus:ring-2 focus:ring-[#ff6b00]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-on-surface-variant block mb-1.5">
            🔔 Sonido
          </label>
          <div className="grid grid-cols-1 gap-2">
            {SOUNDS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSound(s.id);
                  handlePreview(s.id);
                }}
                className={`p-3 rounded-xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer ${
                  sound === s.id
                    ? 'bg-[#fff7ed] border-[#ff6b00]'
                    : 'bg-white border-[#fed7aa] hover:border-[#ff6b00]'
                }`}
              >
                <span className="text-xl">{s.icon}</span>
                <span className="flex-1 font-bold text-sm">{s.label}</span>
                {sound === s.id && (
                  <span className="material-symbols-outlined text-[#ff6b00] text-[20px]">
                    check_circle
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          {existingAlarm && (
            <Button3D variant="outline" onClick={handleDelete}>
              🗑️ Quitar
            </Button3D>
          )}
          <Button3D variant="outline" onClick={onClose}>
            Cancelar
          </Button3D>
          <Button3D variant="success" onClick={handleSave} fullWidth>
            ✓ Guardar
          </Button3D>
        </div>

      </div>
    </Modal>
  );
}