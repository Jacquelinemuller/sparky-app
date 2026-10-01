import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';
import AlarmSoundPicker from '../components/AlarmSoundPicker';
import VoiceInput from '../components/VoiceInput';

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

function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getNowTimeHHMM() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatDateFriendly(dateKey) {
  if (!dateKey) return '';
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const todayKey = getTodayKey();
  if (dateKey === todayKey) return `Hoy ${d} ${months[m - 1]}`;
  return `${days[dt.getDay()]} ${d} ${months[m - 1]}`;
}

export const AlarmsScreen = () => {
  const { alarms, addAlarm, removeAlarm, setActiveScreen, settings } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newTime, setNewTime] = useState(getNowTimeHHMM());
  const [newSound, setNewSound] = useState(settings?.defaultAlarmSound || 'campanita');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const goBack = () => {
    try { audioService.playClick(); } catch (e) {}
    setActiveScreen('none');
  };

  // ✅ SOLO alarmas independientes (sin blockId ni eventId)
  const independentAlarms = useMemo(() => {
    const list = (alarms || []).filter(
      (a) => !a.blockId && !a.eventId && a.enabled !== false
    );
    return list.sort((a, b) => {
      const ka = `${a.dateKey || '9999-99-99'} ${a.time || '99:99'}`;
      const kb = `${b.dateKey || '9999-99-99'} ${b.time || '99:99'}`;
      return ka.localeCompare(kb);
    });
  }, [alarms]);

  const nowKey = `${getTodayKey()} ${getNowTimeHHMM()}`;
  const futureAlarms = independentAlarms.filter(
    (a) => `${a.dateKey} ${a.time}` >= nowKey
  );
  const pastAlarms = independentAlarms.filter(
    (a) => `${a.dateKey} ${a.time}` < nowKey
  );

  const handleCreate = () => {
    if (!newLabel.trim()) return;
    try { audioService.playSuccess(); } catch (e) {}
    addAlarm({
      dateKey: getTodayKey(),
      time: newTime,
      leadMinutes: 0,
      label: newLabel.trim(),
      sound: newSound
    });
    setNewLabel('');
    setNewTime(getNowTimeHHMM());
    setNewSound(settings?.defaultAlarmSound || 'campanita');
    setShowCreate(false);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      try { audioService.playClick(); } catch (e) {}
      removeAlarm(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const renderAlarmCard = (alarm, isPast = false) => {
    const soundIcon = SOUND_ICONS[alarm.sound || 'campanita'] || '🔔';

    return (
      <div
        key={alarm.id}
        className="w-full p-3 rounded-2xl flex items-center gap-3 transition-all"
        style={{
          background: isPast ? 'rgba(255, 255, 255, 0.55)' : '#ffffff',
          border: isPast ? '1.5px solid #e2e8f0' : '2px solid #ffb3ba',
          boxShadow: isPast ? 'none' : '0 3px 0 0 #ffd6db',
          opacity: isPast ? 0.65 : 1
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: isPast ? '#f1f5f9' : '#ffeef0',
            border: `1.5px solid ${isPast ? '#e2e8f0' : '#ffd6db'}`
          }}
        >
          <span className="text-2xl">{soundIcon}</span>
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <span
            className="font-black leading-tight break-words"
            style={{ color: '#3b0764', fontSize: '14px' }}
          >
            {alarm.label || 'Alarma'}
          </span>
          <div className="flex items-center gap-2 flex-wrap mt-0.5">
            <span
              className="font-label-sm font-black flex items-center gap-1"
              style={{ color: isPast ? '#94a3b8' : '#b91c1c', fontSize: '11px' }}
            >
              <span className="material-symbols-outlined text-[13px]">schedule</span>
              {formatDateFriendly(alarm.dateKey)} · {alarm.time}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setConfirmDelete(alarm.id)}
          className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full active:scale-95 transition-all cursor-pointer"
          style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
          title="Eliminar"
        >
          <span className="material-symbols-outlined text-red-500 text-[18px]">delete</span>
        </button>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{
        background: 'linear-gradient(180deg, #fef6ff 0%, #fff1f3 50%, #ffe8eb 100%)'
      }}
    >
      <header
        className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderBottom: '1px solid rgba(255, 179, 186, 0.4)',
          boxShadow: '0 4px 16px rgba(255, 107, 107, 0.06)'
        }}
      >
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full font-label-md text-label-md font-bold active:scale-95 transition-all cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(255, 179, 186, 0.5)',
              color: '#b91c1c'
            }}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Volver</span>
          </button>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: 'rgba(255, 214, 219, 0.5)',
              border: '1px solid rgba(255, 154, 162, 0.5)'
            }}
          >
            <span className="text-lg">🔔</span>
            <span
              className="font-label-sm text-label-sm font-black uppercase tracking-wider"
              style={{ color: '#b91c1c' }}
            >
              Mis alarmas
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 pb-12 px-4 max-w-md mx-auto">

        <button
          type="button"
          onClick={() => {
            try { audioService.playPop(); } catch (e) {}
            setShowCreate(true);
          }}
          className="w-full mb-4 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
          style={{
            background: 'linear-gradient(135deg, #ffb3ba 0%, #ff9aa2 100%)',
            color: '#7f1d1d',
            boxShadow: '0 4px 0 0 #e88088'
          }}
        >
          <span className="material-symbols-outlined text-[22px]">add_alert</span>
          <span>Nueva alarma</span>
        </button>

        <div className="w-full mb-2 px-1">
          <span
            className="font-black uppercase tracking-wider"
            style={{ color: '#b91c1c', fontSize: '11px' }}
          >
            ⏰ Próximas
          </span>
        </div>

        {futureAlarms.length === 0 ? (
          <div
            className="w-full p-6 rounded-2xl text-center mb-5"
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              border: '2px dashed #ffd6db'
            }}
          >
            <span className="text-3xl">🔕</span>
            <p
              className="font-bold mt-2"
              style={{ color: '#7c6f9e', fontSize: '13px' }}
            >
              No hay alarmas todavía
            </p>
            <p
              className="mt-1"
              style={{ color: '#a89bc9', fontSize: '11px' }}
            >
              Creá tu primera alarma para que Sparky te avise.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mb-5">
            {futureAlarms.map((a) => renderAlarmCard(a, false))}
          </div>
        )}

        {pastAlarms.length > 0 && (
          <>
            <div className="w-full mb-2 px-1 mt-2">
              <span
                className="font-black uppercase tracking-wider"
                style={{ color: '#94a3b8', fontSize: '11px' }}
              >
                📜 Pasadas
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {pastAlarms.slice(0, 5).map((a) => renderAlarmCard(a, true))}
            </div>
          </>
        )}

      </main>

      {showCreate && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowCreate(false)}
        >
          <div
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col"
            style={{
              background: '#ffffff',
              borderTop: '3px solid #ff9aa2',
              boxShadow: '0 -10px 40px rgba(255, 154, 162, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid #ffeef0' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🔔</span>
                <span
                  className="font-black"
                  style={{ color: '#7f1d1d', fontSize: '17px' }}
                >
                  Nueva alarma
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full active:scale-95 transition-all cursor-pointer"
                style={{ background: '#ffeef0' }}
              >
                <span className="material-symbols-outlined text-[#b91c1c] text-[22px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div>
                <label
                  className="font-black uppercase tracking-wider block mb-1.5"
                  style={{ color: '#b91c1c', fontSize: '10px' }}
                >
                  ¿Para qué es?
                </label>
                <VoiceInput
                  value={newLabel}
                  onChange={setNewLabel}
                  placeholder="Ej: Tomar la pastilla"
                  maxLength={40}
                  color="#ff9aa2"
                  bg="#fff5f6"
                  borderColor="#ffd6db"
                  style={{ fontSize: '15px' }}
                />
              </div>

              <div>
                <label
                  className="font-black uppercase tracking-wider block mb-1.5"
                  style={{ color: '#b91c1c', fontSize: '10px' }}
                >
                  ¿A qué hora?
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full p-3 rounded-2xl text-[16px] font-bold focus:outline-none text-center"
                  style={{
                    background: '#fff5f6',
                    border: '2px solid #ffd6db',
                    color: '#7f1d1d'
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="w-full py-3 px-3 rounded-2xl flex items-center justify-between gap-2 cursor-pointer active:scale-[0.98] transition-all"
                style={{
                  background: '#fff5f6',
                  border: '2px solid #ffd6db'
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{SOUND_ICONS[newSound]}</span>
                  <div className="flex flex-col items-start">
                    <span
                      className="font-black uppercase tracking-wider"
                      style={{ color: '#b91c1c', fontSize: '9px' }}
                    >
                      Sonido
                    </span>
                    <span
                      className="font-black"
                      style={{ color: '#7f1d1d', fontSize: '13px' }}
                    >
                      {SOUND_LABELS[newSound]}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#b91c1c] text-[20px]">
                  chevron_right
                </span>
              </button>

              <p
                className="text-center"
                style={{ color: '#a89bc9', fontSize: '11px' }}
              >
                🔔 Sonará hoy a las {newTime}
              </p>

              <button
                type="button"
                onClick={handleCreate}
                disabled={!newLabel.trim()}
                className="w-full py-3.5 rounded-2xl font-black text-sm cursor-pointer active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #ffb3ba 0%, #ff9aa2 100%)',
                  color: '#7f1d1d',
                  boxShadow: '0 3px 0 0 #e88088'
                }}
              >
                <span>✓</span>
                <span>Crear alarma</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AlarmSoundPicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSave={(soundId) => {
          setNewSound(soundId);
          setPickerOpen(false);
        }}
        onDelete={null}
        initialSound={newSound}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-3xl p-6 text-center"
            style={{
              background: '#ffffff',
              border: '4px solid #ff9aa2',
              boxShadow: '0 10px 0 0 #e88088'
            }}
          >
            <span className="text-4xl block mb-3">🗑️</span>
            <h3
              className="font-black mb-2"
              style={{ color: '#7f1d1d', fontSize: '18px' }}
            >
              ¿Eliminar esta alarma?
            </h3>
            <p
              className="mb-5"
              style={{ color: '#a89bc9', fontSize: '13px' }}
            >
              No se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 h-12 rounded-2xl bg-white border-2 border-[#e2e8f0] text-on-surface font-bold active:scale-95 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 h-12 rounded-2xl bg-red-500 text-white font-black shadow-[0_4px_0_0_#991b1b] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};