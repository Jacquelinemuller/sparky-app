import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';

const CATEGORY_CONFIG = {
  cumple: { label: 'Cumpleaños',   icon: '🎂' },
  salida: { label: 'Salida',       icon: '🚌' },
  examen: { label: 'Examen',       icon: '📝' },
  medico: { label: 'Turno médico', icon: '🏥' },
  otro:   { label: 'Evento',       icon: '⭐' }
};

const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Paleta verde suave
const GREEN = {
  primary: '#65a30d',
  dark: '#3f6212',
  deep: '#365314',
  medium: '#4d7c0f',
  light: '#ecfccb',
  lighter: '#f7fee7',
  soft: '#fafff0',        // NUEVO: más suave aún
  border: '#bef264',
  borderSoft: '#d9f99d'
};

function getDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysBetween(dateA, dateB) {
  const a = new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate());
  const b = new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate());
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export default function UpcomingEventBanner() {
  const { customEvents, setActiveScreen, setActiveTab } = useApp();

  const today = new Date();
  const todayKey = getDateKey(today);

  const [dismissedKey, setDismissedKey] = useState(() => {
    return localStorage.getItem('sparky_dismissed_event_banner') || null;
  });

  useEffect(() => {
    const saved = localStorage.getItem('sparky_dismissed_event_banner');
    if (saved && saved !== todayKey) {
      localStorage.removeItem('sparky_dismissed_event_banner');
      setDismissedKey(null);
    }
  }, [todayKey]);

  const upcomingEvents = useMemo(() => {
    if (!customEvents || customEvents.length === 0) return [];

    return customEvents
      .map((evt) => {
        const evtDate = new Date(evt.date + 'T00:00:00');
        const days = daysBetween(today, evtDate);
        return { ...evt, _days: days, _date: evtDate };
      })
      .filter((evt) => evt._days >= 0 && evt._days <= 7)
      .sort((a, b) => {
        if (a._days !== b._days) return a._days - b._days;
        return (a.time || '').localeCompare(b.time || '');
      });
  }, [customEvents, today]);

  if (upcomingEvents.length === 0) return null;
  if (dismissedKey === todayKey) return null;

  const next = upcomingEvents[0];
  const extraCount = upcomingEvents.length - 1;

  const cfg = CATEGORY_CONFIG[next.category] || CATEGORY_CONFIG.otro;
  const isToday = next._days === 0;

  const handleDismiss = (e) => {
    e.stopPropagation();
    try { audioService.playClick(); } catch (err) {}
    localStorage.setItem('sparky_dismissed_event_banner', todayKey);
    setDismissedKey(todayKey);
  };

  const handleOpen = () => {
    try { audioService.playPop(); } catch (err) {}
    setActiveTab('schedule');
    setActiveScreen('monthly');
  };

  const shortDate = isToday
    ? 'HOY'
    : `${DAY_NAMES_SHORT[next._date.getDay()]} ${next._date.getDate()}`;

  return (
    <button
      type="button"
      onClick={handleOpen}
      className={`w-full px-3 py-2.5 rounded-2xl flex items-center gap-3 text-left transition-all cursor-pointer active:scale-[0.98] relative ${
        isToday ? 'animate-[pulseSoft_2s_ease-in-out_infinite]' : ''
      }`}
      style={{
        background: `linear-gradient(135deg, ${GREEN.soft} 0%, #ffffff 100%)`,
        border: `${isToday ? '2px' : '1.5px'} solid ${GREEN.borderSoft}`,
        boxShadow: `0 2px 0 0 ${GREEN.borderSoft}60`
      }}
    >
      {/* Ícono de categoría */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xl"
        style={{ backgroundColor: GREEN.lighter, border: `1.5px solid ${GREEN.borderSoft}` }}
      >
        <span>{cfg.icon}</span>
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-1.5 py-0.5 rounded-full text-white font-label-sm text-[9px] font-black uppercase tracking-wider"
            style={{ backgroundColor: isToday ? GREEN.primary : GREEN.medium }}
          >
            {shortDate}
          </span>
          <span
            className="font-label-md text-[13px] font-black truncate flex-1"
            style={{ color: GREEN.deep }}
          >
            {next.title}
          </span>
        </div>
        {next.time && (
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className="material-symbols-outlined text-[12px]"
              style={{ color: GREEN.medium }}
            >
              schedule
            </span>
            <span
              className="font-label-sm text-[10px] font-bold"
              style={{ color: GREEN.dark }}
            >
              {next.time}
            </span>
          </div>
        )}
      </div>

      {/* Badge "+N" */}
      {extraCount > 0 && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-[11px]"
          style={{ backgroundColor: GREEN.primary }}
          title={`+${extraCount} ${extraCount === 1 ? 'evento más' : 'eventos más'}`}
        >
          +{extraCount}
        </div>
      )}

      {/* Botón X */}
      <button
        type="button"
        onClick={handleDismiss}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/60 active:scale-90 transition-all cursor-pointer flex-shrink-0"
        title="Ocultar por hoy"
      >
        <span
          className="material-symbols-outlined text-[16px]"
          style={{ color: GREEN.dark }}
        >
          close
        </span>
      </button>

      <style>{`
        @keyframes pulseSoft {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.01); }
        }
      `}</style>
    </button>
  );
}