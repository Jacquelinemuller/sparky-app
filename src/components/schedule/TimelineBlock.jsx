import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';
import AlarmSoundPicker from '../AlarmSoundPicker';
import VoiceInput from '../VoiceInput';
import TimeRangeInput from '../TimeRangeInput';

const ICON_OPTIONS = [
  'schedule', 'school', 'restaurant', 'sports_soccer', 'shower',
  'sports_esports', 'language', 'palette', 'music_note', 'celebration',
  'family_restroom', 'bed', 'breakfast_dining', 'movie', 'checklist',
  'self_improvement', 'menu_book', 'directions_bike', 'pool', 'pets'
];

// Convierte "HH:MM - HH:MM" a la hora de inicio "HH:MM"
function getStartTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const match = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const h = String(match[1]).padStart(2, '0');
  const m = match[2];
  return `${h}:${m}`;
}

// Resta N minutos a "HH:MM"
function subtractMinutes(hhmm, minutes) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  let total = h * 60 + m - minutes;
  if (total < 0) total += 24 * 60;
  const newH = Math.floor(total / 60);
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

const SOUND_ICONS = {
  campanita: '🔔',
  llamada: '☎️',
  ladrido: '🐶',
  urgente: '🚨',
  melodia: '🎶'
};

export default function TimelineBlock({ block, onSave, dateKey, isToday }) {
  const { alarms, addAlarm, removeAlarmByBlock } = useApp();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(block);

  if (!block) return null;

  const existingAlarm = (alarms || []).find(
    (a) => a.blockId === block.id && a.dateKey === dateKey
  );
  const hasAlarm = !!existingAlarm;

  const startTime = getStartTime(block.time);
  const alarmTime = startTime ? subtractMinutes(startTime, 15) : null;

  const currentSoundIcon = hasAlarm
    ? SOUND_ICONS[existingAlarm.sound || 'campanita'] || '🔔'
    : null;

  // ============ MODO NORMAL ============
  const handleCardClick = () => {
    try { audioService.playPop(); } catch (e) {}
    setDraft(block);
    setIsEditing(true);
  };

  const handleBellClick = (e) => {
    e.stopPropagation();
    if (!alarmTime) return;
    try { audioService.playPop(); } catch (err) {}
    setPickerOpen(true);
  };

  const handleSaveAlarm = (soundId) => {
    if (existingAlarm) {
      removeAlarmByBlock(block.id, dateKey);
    }
    addAlarm({
      blockId: block.id,
      dateKey,
      time: alarmTime,
      leadMinutes: 15,
      label: block.title,
      sound: soundId
    });
    setPickerOpen(false);
  };

  const handleDeleteAlarm = () => {
    removeAlarmByBlock(block.id, dateKey);
    setPickerOpen(false);
  };

  // ============ MODO EDICIÓN ============
  const updateDraft = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    try { audioService.playSuccess(); } catch (e) {}
    if (onSave) onSave(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    try { audioService.playClick(); } catch (e) {}
    setDraft(block);
    setIsEditing(false);
  };

  return (
    <>
      {isEditing ? (
        // ============ MODO EDICIÓN INLINE ============
        <div
          className="w-full rounded-2xl p-3 flex flex-col gap-2.5"
          style={{
            background: '#f7fee7',
            border: '2px solid #84cc16',
            boxShadow: '0 3px 0 0 #bef264'
          }}
        >
          {/* Título con mic */}
          <VoiceInput
            value={draft.title || ''}
            onChange={(v) => updateDraft('title', v)}
            placeholder="Título del bloque"
            maxLength={40}
            color="#65a30d"
            bg="#ffffff"
            borderColor="#d9f99d"
            autoFocus
            style={{ fontSize: '14px', padding: '10px 12px' }}
          />

          {/* Hora con inputs */}
          <TimeRangeInput
            value={draft.time || '08:00 - 09:00'}
            onChange={(v) => updateDraft('time', v)}
          />

          {/* Duración (solo si slot libre) */}
          {draft.type === 'free_slot' && (
            <input
              type="text"
              value={draft.duration || ''}
              onChange={(e) => updateDraft('duration', e.target.value)}
              placeholder="Duración (ej: 1h 15m)"
              maxLength={10}
              className="w-full p-2.5 rounded-xl border-2 border-[#d9f99d] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
            />
          )}

          {/* Íconos */}
          <div>
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-wide">
              Ícono
            </label>
            <div className="flex flex-wrap gap-1 mt-1">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => updateDraft('icon', icon)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                    draft.icon === icon
                      ? 'bg-[#65a30d] text-white'
                      : 'bg-white border border-[#d9f99d] text-[#65a30d] hover:bg-[#f7fee7]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tipo */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateDraft('type', 'fixed')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                draft.type === 'fixed'
                  ? 'bg-[#65a30d] text-white'
                  : 'bg-white border border-[#d9f99d] text-[#65a30d]'
              }`}
            >
              📌 Fijo
            </button>
            <button
              type="button"
              onClick={() => updateDraft('type', 'free_slot')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                draft.type === 'free_slot'
                  ? 'bg-[#65a30d] text-white'
                  : 'bg-white border border-[#d9f99d] text-[#65a30d]'
              }`}
            >
              ⭐ Slot libre
            </button>
          </div>

          {/* Botones guardar / cancelar */}
          <div className="flex gap-2 mt-0.5">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2.5 rounded-xl bg-white border-2 border-[#e2e8f0] text-[#64748b] font-black text-xs cursor-pointer active:scale-95 transition-all"
            >
              ✕ Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-[2] py-2.5 rounded-xl font-black text-xs cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #65a30d 0%, #84cc16 100%)',
                color: '#ffffff',
                boxShadow: '0 3px 0 0 #3f6212'
              }}
            >
              <span>✓</span>
              <span>Guardar</span>
            </button>
          </div>
        </div>
      ) : (
        // ============ MODO NORMAL ============
        <div
          onClick={handleCardClick}
          className="w-full bg-white rounded-2xl p-4 flex items-center justify-between gap-3 transition-all hover:translate-y-[-1px] cursor-pointer active:scale-[0.99]"
          style={{
            boxShadow: hasAlarm ? '0 3px 0 0 #fcd34d' : '0 3px 0 0 #d9f99d',
            border: hasAlarm ? '1.5px solid #fbbf24' : '1px solid #ecfccb',
            background: hasAlarm ? 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)' : '#ffffff'
          }}
          title="Tocá para editar este bloque"
        >
          {/* Contenido principal */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: hasAlarm ? '#fef3c7' : '#ecfccb',
                color: hasAlarm ? '#b45309' : '#3f6212'
              }}
            >
              <span className="material-symbols-outlined text-[26px]">
                {block.icon || 'schedule'}
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-headline text-sm font-black text-on-surface truncate leading-tight">
                {block.title}
              </span>
              <span className="font-body-sm text-xs text-on-surface-variant leading-snug">
                {block.time}
                {block.duration && ` • ${block.duration}`}
              </span>
              {hasAlarm && (
                <span
                  className="font-label-sm text-[10px] font-black mt-0.5 flex items-center gap-1"
                  style={{ color: '#b45309' }}
                >
                  <span>{currentSoundIcon}</span>
                  <span>Alarma {alarmTime}</span>
                </span>
              )}
            </div>
          </div>

          {/* Botón alarma */}
          {alarmTime && dateKey && (
            <button
              type="button"
              onClick={handleBellClick}
              className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full active:scale-95 transition-all cursor-pointer"
              style={{
                background: hasAlarm ? '#fef3c7' : 'transparent',
                border: hasAlarm ? '1.5px solid #fbbf24' : '1.5px solid transparent'
              }}
              title={hasAlarm ? 'Cambiar o quitar alarma' : 'Poner alarma 15 min antes'}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{
                  color: hasAlarm ? '#b45309' : '#94a3b8',
                  fontVariationSettings: hasAlarm ? '"FILL" 1' : '"FILL" 0'
                }}
              >
                {hasAlarm ? 'notifications_active' : 'notifications_none'}
              </span>
            </button>
          )}

          {/* Chevron indicador */}
          <span className="material-symbols-outlined text-[#65a30d] text-[20px] flex-shrink-0 opacity-40">
            edit
          </span>
        </div>
      )}

      {/* Modal selector de tono */}
      <AlarmSoundPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSave={handleSaveAlarm}
        onDelete={hasAlarm ? handleDeleteAlarm : null}
        initialSound={existingAlarm?.sound || 'campanita'}
      />
    </>
  );
}