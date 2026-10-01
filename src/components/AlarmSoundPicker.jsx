import React, { useState, useEffect } from 'react';
import { audioService } from '../services/audioService';

const SOUND_OPTIONS = [
  { id: 'campanita', label: 'Campanita', icon: '🔔', desc: 'Suave, como el Pomodoro' },
  { id: 'llamada',   label: 'Llamada',   icon: '☎️', desc: 'Como un timbre de teléfono' },
  { id: 'ladrido',   label: 'Ladrido',   icon: '🐶', desc: 'Sparky te llama' },
  { id: 'urgente',   label: 'Urgente',   icon: '🚨', desc: 'Fuerte, tipo despertador' },
  { id: 'melodia',   label: 'Melodía',   icon: '🎶', desc: 'Cuatro notas amables' }
];

export default function AlarmSoundPicker({ isOpen, onClose, onSave, onDelete, initialSound }) {
  const [selected, setSelected] = useState(initialSound || 'campanita');

  useEffect(() => {
    if (isOpen) {
      setSelected(initialSound || 'campanita');
    }
  }, [isOpen, initialSound]);

  if (!isOpen) return null;

  const handlePreview = (soundId) => {
    try { audioService.playAlarm(soundId); } catch (e) {}
  };

  const handleSelect = (soundId) => {
    setSelected(soundId);
    handlePreview(soundId);
  };

  const handleSave = () => {
    try { audioService.playSuccess(); } catch (e) {}
    onSave(selected);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col"
        style={{
          background: '#ffffff',
          borderTop: '3px solid #fbbf24',
          boxShadow: '0 -10px 40px rgba(251, 191, 36, 0.3)',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid #e2e8f0' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🔔</span>
            <span className="font-black" style={{ color: '#0f172a', fontSize: '17px' }}>
              Sonido de la alarma
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#fef3c7] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#b45309] text-[22px]">close</span>
          </button>
        </div>

        {/* Lista de tonos */}
        <div className="p-5 flex flex-col gap-2.5 overflow-y-auto">
          {SOUND_OPTIONS.map((sound) => {
            const isSelected = selected === sound.id;
            return (
              <div
                key={sound.id}
                onClick={() => handleSelect(sound.id)}
                role="button"
                tabIndex={0}
                className="w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer active:scale-[0.98]"
                style={{
                  background: isSelected ? '#fef3c7' : '#f8fafc',
                  border: `2px solid ${isSelected ? '#fbbf24' : '#e2e8f0'}`
                }}
              >
                {/* Ícono */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: isSelected ? '#ffffff' : '#ffffff',
                    border: `1.5px solid ${isSelected ? '#fbbf24' : '#e2e8f0'}`
                  }}
                >
                  {sound.icon}
                </div>

                {/* Texto */}
                <div className="flex flex-col flex-1 min-w-0">
                  <span
                    className="font-black leading-tight"
                    style={{ color: '#0f172a', fontSize: '14px' }}
                  >
                    {sound.label}
                  </span>
                  <span
                    className="leading-snug mt-0.5"
                    style={{ color: '#64748b', fontSize: '11px' }}
                  >
                    {sound.desc}
                  </span>
                </div>

                {/* Botón preview */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(sound.id);
                  }}
                  className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full active:scale-95 transition-all cursor-pointer"
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1'
                  }}
                  title="Escuchar"
                >
                  <span className="material-symbols-outlined text-[#475569] text-[20px]">
                    play_arrow
                  </span>
                </button>

                {/* Tilde seleccionado */}
                {isSelected && (
                  <span
                    className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ background: '#fbbf24' }}
                  >
                    <span className="material-symbols-outlined text-white text-[18px] font-black">
                      check
                    </span>
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Botones de acción */}
        <div
          className="px-5 py-4 flex gap-2"
          style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff' }}
        >
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                try { audioService.playClick(); } catch (e) {}
                onDelete();
              }}
              className="px-4 py-3 rounded-2xl font-black text-sm cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
              style={{
                background: '#fef2f2',
                color: '#dc2626',
                border: '1.5px solid #fecaca'
              }}
              title="Quitar la alarma"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl font-black text-sm cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color: '#ffffff',
              boxShadow: '0 3px 0 0 #b45309'
            }}
          >
            <span>✓</span>
            <span>Guardar alarma</span>
          </button>
        </div>
      </div>
    </div>
  );
}