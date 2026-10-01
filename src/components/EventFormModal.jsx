import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import Button3D from './common/Button3D';
import VoiceInput from './VoiceInput';
import AlarmSoundPicker from './AlarmSoundPicker';
import { audioService } from '../services/audioService';

const CATEGORIES = [
  { id: 'cumple',  label: 'Cumpleaños',  icon: '🎂', color: '#ec4899' },
  { id: 'salida',  label: 'Salida',      icon: '🚌', color: '#3b82f6' },
  { id: 'examen',  label: 'Examen',      icon: '📝', color: '#ef4444' },
  { id: 'medico',  label: 'Turno médico', icon: '🏥', color: '#10b981' },
  { id: 'otro',    label: 'Otro',        icon: '⭐', color: '#f59e0b' }
];

const ALARM_LEADS = [
  { id: 15,   label: '15 min antes', icon: '⏱️' },
  { id: 60,   label: '1 hora antes', icon: '🕐' },
  { id: 1440, label: '1 día antes',  icon: '📅' }
];

const SOUND_ICONS = {
  campanita: '🔔',
  llamada: '☎️',
  ladrido: '🐶',
  urgente: '🚨',
  melodia: '🎶'
};

const SOUND_LABELS = {
  campanita: 'Campanita',
  llamada: 'Llamada',
  ladrido: 'Ladrido',
  urgente: 'Urgente',
  melodia: 'Melodía'
};

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calcula cuándo debe sonar la alarma.
 * eventDate: "YYYY-MM-DD", eventTime: "HH:MM" (opcional)
 * leadMinutes: 15, 60, 1440
 */
export function calculateAlarmDateTime(eventDate, eventTime, leadMinutes) {
  if (!eventDate) return null;

  const [y, m, d] = eventDate.split('-').map(Number);
  const timeStr = eventTime || '09:00';
  const [hh, mm] = timeStr.split(':').map(Number);

  const eventDateObj = new Date(y, m - 1, d, hh, mm);
  const alarmDateObj = new Date(eventDateObj.getTime() - leadMinutes * 60 * 1000);

  const aY = alarmDateObj.getFullYear();
  const aM = String(alarmDateObj.getMonth() + 1).padStart(2, '0');
  const aD = String(alarmDateObj.getDate()).padStart(2, '0');
  const aHh = String(alarmDateObj.getHours()).padStart(2, '0');
  const aMm = String(alarmDateObj.getMinutes()).padStart(2, '0');

  return {
    dateKey: `${aY}-${aM}-${aD}`,
    time: `${aHh}:${aMm}`
  };
}

export default function EventFormModal({ isOpen, onClose, onSave, editingEvent, defaultDate }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('otro');
  const [notes, setNotes] = useState('');
  const [hasAlarm, setHasAlarm] = useState(false);
  const [alarmLead, setAlarmLead] = useState(15);
  const [alarmSound, setAlarmSound] = useState('campanita');
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        setTitle(editingEvent.title || '');
        setDate(editingEvent.date || '');
        setTime(editingEvent.time || '');
        setCategory(editingEvent.category || 'otro');
        setNotes(editingEvent.notes || '');
        setHasAlarm(editingEvent.hasAlarm || false);
        setAlarmLead(editingEvent.alarmLead || 15);
        setAlarmSound(editingEvent.alarmSound || 'campanita');
      } else {
        setTitle('');
        const defaultD = defaultDate ? toDateKey(defaultDate) : toDateKey(new Date());
        setDate(defaultD);
        setTime('');
        setCategory('otro');
        setNotes('');
        setHasAlarm(false);
        setAlarmLead(15);
        setAlarmSound('campanita');
      }
      setPickerOpen(false);
    }
  }, [isOpen, editingEvent, defaultDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    try { audioService.playSuccess(); } catch (err) {}

    // Calcular cuándo debe sonar la alarma
    let alarmData = null;
    if (hasAlarm) {
      const calculated = calculateAlarmDateTime(date, time, alarmLead);
      if (calculated) {
        alarmData = {
          dateKey: calculated.dateKey,
          time: calculated.time,
          leadMinutes: alarmLead,
          sound: alarmSound,
          label: title.trim()
        };
      }
    }

    onSave({
      title: title.trim(),
      date,
      time: time.trim(),
      category,
      notes: notes.trim(),
      hasAlarm,
      alarmLead,
      alarmSound,
      alarmData
    });

    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={editingEvent ? 'Editar evento' : 'Nuevo evento especial'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Categoría */}
          <div>
            <label className="block font-label-md text-label-md font-extrabold text-on-surface mb-2">
              ¿Qué tipo de evento es?
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'text-white'
                        : 'bg-white text-on-surface-variant border-[#e2e8f0] hover:border-[#8b5cf6]'
                    }`}
                    style={isSelected ? { backgroundColor: c.color, borderColor: c.color } : {}}
                  >
                    <span>{c.icon}</span>
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título con mic */}
          <div>
            <label className="block font-label-md text-label-md font-extrabold text-on-surface mb-1.5">
              Título del evento
            </label>
            <VoiceInput
              value={title}
              onChange={setTitle}
              placeholder="Ej: Cumple de Juan en la casa de Sofi"
              maxLength={60}
              color="#8b5cf6"
              bg="#ffffff"
              borderColor="#e2e8f0"
              style={{ fontSize: '14px', padding: '12px' }}
            />
          </div>

          {/* Fecha y hora */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block font-label-md text-label-md font-extrabold text-on-surface mb-1.5">
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full p-3 rounded-2xl border-2 border-[#e2e8f0] bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
              />
            </div>
            <div className="w-32">
              <label className="block font-label-md text-label-md font-extrabold text-on-surface mb-1.5">
                Hora
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-3 rounded-2xl border-2 border-[#e2e8f0] bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block font-label-md text-label-md font-extrabold text-on-surface mb-1.5">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Llevar regalo y ropa cómoda"
              maxLength={150}
              rows={2}
              className="w-full p-3 rounded-2xl border-2 border-[#e2e8f0] bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] resize-none"
            />
          </div>

          {/* ============ ALARMA ============ */}
          <div
            className="p-3 rounded-2xl flex flex-col gap-3"
            style={{
              background: hasAlarm ? '#fffbeb' : '#f8fafc',
              border: `2px solid ${hasAlarm ? '#fbbf24' : '#e2e8f0'}`
            }}
          >
            {/* Check de alarma */}
            <button
              type="button"
              onClick={() => {
                try { audioService.playPop(); } catch (e) {}
                setHasAlarm((v) => !v);
              }}
              className="w-full flex items-center justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{hasAlarm ? '🔔' : '🔕'}</span>
                <div className="flex flex-col items-start">
                  <span className="font-black text-sm text-on-surface leading-tight">
                    Poner alarma
                  </span>
                  <span className="text-[11px] text-on-surface-variant">
                    Te aviso antes del evento
                  </span>
                </div>
              </div>

              {/* Toggle */}
              <div
                className="w-12 h-7 rounded-full relative transition-all flex-shrink-0"
                style={{
                  background: hasAlarm ? '#fbbf24' : '#cbd5e1'
                }}
              >
                <div
                  className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all"
                  style={{
                    left: hasAlarm ? '22px' : '2px'
                  }}
                />
              </div>
            </button>

            {/* Opciones de alarma (solo si está activa) */}
            {hasAlarm && (
              <>
                {/* Cuándo suena */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
                    ¿Cuándo te aviso?
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ALARM_LEADS.map((opt) => {
                      const isSelected = alarmLead === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            try { audioService.playPop(); } catch (e) {}
                            setAlarmLead(opt.id);
                          }}
                          className="px-3 py-1.5 rounded-full text-[11px] font-black transition-all cursor-pointer"
                          style={{
                            background: isSelected ? '#fbbf24' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#64748b',
                            border: `1.5px solid ${isSelected ? '#fbbf24' : '#e2e8f0'}`
                          }}
                        >
                          {opt.icon} {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Elegir tono */}
                <button
                  type="button"
                  onClick={() => {
                    try { audioService.playClick(); } catch (e) {}
                    setPickerOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl flex items-center justify-between gap-2 cursor-pointer active:scale-[0.98] transition-all"
                  style={{
                    background: '#ffffff',
                    border: '1.5px solid #fbbf24'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{SOUND_ICONS[alarmSound]}</span>
                    <div className="flex flex-col items-start">
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#b45309]">
                        Sonido
                      </span>
                      <span className="text-xs font-black text-on-surface">
                        {SOUND_LABELS[alarmSound]}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#b45309] text-[20px]">
                    chevron_right
                  </span>
                </button>

                {/* Preview del momento */}
                {date && (
                  (() => {
                    const preview = calculateAlarmDateTime(date, time, alarmLead);
                    if (!preview) return null;
                    return (
                      <div
                        className="w-full p-2 rounded-lg text-center"
                        style={{ background: 'rgba(251, 191, 36, 0.15)' }}
                      >
                        <span className="text-[10px] font-black text-[#b45309]">
                          🔔 Sonará el {preview.dateKey} a las {preview.time}
                        </span>
                      </div>
                    );
                  })()
                )}
              </>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-2 border-t-2 border-[#e2e8f0]">
            <Button3D variant="outline" onClick={onClose}>
              Cancelar
            </Button3D>
            <Button3D type="submit" variant="creative" icon="check">
              {editingEvent ? 'Guardar cambios' : 'Crear evento'}
            </Button3D>
          </div>

        </form>
      </Modal>

      {/* Picker de tono */}
      <AlarmSoundPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSave={(soundId) => {
          setAlarmSound(soundId);
          setPickerOpen(false);
        }}
        onDelete={null}
        initialSound={alarmSound}
      />
    </>
  );
}