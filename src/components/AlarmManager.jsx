import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';

// Convierte "HH:MM" a minutos totales desde 00:00
function timeToMinutes(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return null;
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10));
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

// Fecha de hoy en formato YYYY-MM-DD
function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Configuración de repetición
const REPEAT_INTERVAL_MS = 15000;  // cada 15 segundos
const MAX_DURATION_MS = 60000;      // por 1 minuto total

export const AlarmManager = () => {
  const { alarms, markAlarmTriggered, settings } = useApp();
  const [activeAlarm, setActiveAlarm] = useState(null);
  const checkIntervalRef = useRef(null);
  const repeatIntervalRef = useRef(null);
  const stopTimeoutRef = useRef(null);

  // Chequeo cada 30 segundos (búsqueda de alarma que deba sonar)
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const todayKey = getTodayKey();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      const dueAlarm = (alarms || []).find((alarm) => {
        if (!alarm.enabled) return false;
        if (alarm.triggered) return false;
        if (alarm.dateKey && alarm.dateKey !== todayKey) return false;

        const targetMinutes = timeToMinutes(alarm.time);
        if (targetMinutes === null) return null;

        // Ventana de 3 minutos después de la hora objetivo
        return nowMinutes >= targetMinutes && nowMinutes <= targetMinutes + 3;
      });

      if (dueAlarm) {
        setActiveAlarm(dueAlarm);
        markAlarmTriggered(dueAlarm.id);
      }
    };

    checkAlarms();
    checkIntervalRef.current = setInterval(checkAlarms, 30000);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [alarms, markAlarmTriggered]);

  // Reproducir el sonido + repetir + detener a los 60s
  useEffect(() => {
    if (!activeAlarm) {
      if (repeatIntervalRef.current) {
        clearInterval(repeatIntervalRef.current);
        repeatIntervalRef.current = null;
      }
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
      return;
    }

    const soundId = activeAlarm.sound || settings?.defaultAlarmSound || 'campanita';

    // 1) Primer sonido inmediato
    try { audioService.playAlarm(soundId); } catch (e) {}

    // 2) Repetir cada 15 segundos
    repeatIntervalRef.current = setInterval(() => {
      try { audioService.playAlarm(soundId); } catch (e) {}
    }, REPEAT_INTERVAL_MS);

    // 3) Detener a los 60 segundos (el modal sigue visible)
    stopTimeoutRef.current = setTimeout(() => {
      if (repeatIntervalRef.current) {
        clearInterval(repeatIntervalRef.current);
        repeatIntervalRef.current = null;
      }
    }, MAX_DURATION_MS);

    return () => {
      if (repeatIntervalRef.current) {
        clearInterval(repeatIntervalRef.current);
        repeatIntervalRef.current = null;
      }
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
    };
  }, [activeAlarm, settings]);

  if (!activeAlarm) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div
        className="w-full max-w-sm rounded-3xl p-6 flex flex-col items-center gap-4 animate-[alarmPop_0.4s_ease-out]"
        style={{
          background: 'linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)',
          border: '4px solid #ea580c',
          boxShadow: '0 10px 0 0 #c2410c, 0 0 60px rgba(234, 88, 12, 0.6)'
        }}
      >
        <div className="relative">
          <div className="absolute inset-0 w-24 h-24 rounded-full bg-[#ea580c] opacity-30 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#ff6b00] to-[#ea580c] flex items-center justify-center shadow-[0_6px_0_0_#c2410c]">
            <span
              className="material-symbols-outlined text-white text-[56px]"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              notifications_active
            </span>
          </div>
        </div>

        <div className="text-center">
          <span
            className="block font-black uppercase tracking-wider mb-1"
            style={{ color: '#9a3412', fontSize: '11px' }}
          >
            ⏰ Alarma
          </span>
          <h3
            className="font-black leading-tight"
            style={{ color: '#0f172a', fontSize: '22px' }}
          >
            {activeAlarm.label || 'Es hora'}
          </h3>
          <p
            className="font-medium mt-1"
            style={{ color: '#64748b', fontSize: '13px' }}
          >
            {activeAlarm.leadMinutes
              ? `Faltan ${activeAlarm.leadMinutes} min`
              : 'Es el momento'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            try { audioService.playClick(); } catch (e) {}
            setActiveAlarm(null);
          }}
          className="w-full py-3.5 rounded-2xl font-black text-sm cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
            color: '#fff',
            boxShadow: '0 4px 0 0 #9a3412'
          }}
        >
          <span>👍</span>
          <span>¡Enterado!</span>
        </button>

        <p
          className="text-center"
          style={{ color: '#94a3b8', fontSize: '10px' }}
        >
          Suena cada 15 segundos durante 1 minuto
        </p>
      </div>

      <style>{`
        @keyframes alarmPop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};