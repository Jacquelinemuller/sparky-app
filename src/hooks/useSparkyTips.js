import { useState, useMemo, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { WEEKLY_GUIDES } from '../data/weeklyGuidesData';
import { audioService } from '../services/audioService';

// ============================================
// 🧪 DEBUG — dejar en null para producción
// ============================================
// Si necesitás probar un día específico, cambiá por un número:
//   0  → Lunes (Semana 1, Día 1)
//   1  → Martes
//   2  → Miércoles
//   ...
//   6  → Domingo (reto)
//   7  → Lunes (Semana 2)
//   -3 → pantalla "próximamente"
//
// ⚠️ Recordá volver a null antes de subir a producción
//
const DEBUG_SIMULATE_DAY = null;

// Fecha de referencia para modo debug (un lunes cualquiera)
const DEBUG_REF_MONDAY = new Date(2026, 9, 6);

const START_KEY = 'sparky_tips_start';

// ============================================
// 📅 UTILIDADES DE FECHA
// ============================================

function getNextMonday(fromDate) {
  const d = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  const dayOfWeek = d.getDay();
  if (dayOfWeek === 1) return d;
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  d.setDate(d.getDate() + daysUntilMonday);
  return d;
}

function toKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fromKey(key) {
  if (!key) return null;
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(from, to) {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

function getToday() {
  if (DEBUG_SIMULATE_DAY !== null) {
    const fake = new Date(DEBUG_REF_MONDAY);
    fake.setDate(fake.getDate() + DEBUG_SIMULATE_DAY);
    return fake;
  }
  return new Date();
}

export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayDateKey() {
  return toDateKey(getToday());
}

function getStartMonday() {
  if (DEBUG_SIMULATE_DAY !== null) {
    return new Date(DEBUG_REF_MONDAY);
  }

  try {
    const saved = localStorage.getItem(START_KEY);
    if (saved) {
      const date = fromKey(saved);
      if (date) return date;
    }
  } catch (e) {}

  // Primera vez: guardar el próximo lunes
  const nextMonday = getNextMonday(new Date());
  try {
    localStorage.setItem(START_KEY, toKey(nextMonday));
  } catch (e) {}
  return nextMonday;
}

function positionToWeekDay(pos) {
  const week = Math.floor((pos - 1) / 7) + 1;
  const day = ((pos - 1) % 7) + 1;
  return { week, day };
}

function getDayName(day) {
  const names = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  return names[day - 1] || 'Día';
}

export function formatLongDate(date) {
  if (!date) return '';
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`;
}

// ============================================
// 🎣 HOOK PRINCIPAL
// ============================================
export function useSparkyTips() {
  const {
    completedTips,
    addCompletedTip,
    customTips,
    activeWeek,
    setActiveWeek,
    awardStars,
    recordActivity
  } = useApp();

  const [startMonday] = useState(() => getStartMonday());

  // 🧪 AUTO-COMPLETAR días anteriores (solo en modo debug)
  useEffect(() => {
    if (DEBUG_SIMULATE_DAY === null) return;
    if (DEBUG_SIMULATE_DAY <= 0) return;

    try {
      const saved = JSON.parse(localStorage.getItem('sparky_planner_v1') || '{}');
      const completed = new Set(saved.completedTips || []);

      for (let d = 0; d < DEBUG_SIMULATE_DAY; d++) {
        const week = Math.floor(d / 7) + 1;
        const day = (d % 7) + 1;
        completed.add(`w${week}-d${day}`);
      }

      const newCompleted = Array.from(completed);
      saved.completedTips = newCompleted;
      localStorage.setItem('sparky_planner_v1', JSON.stringify(saved));

      console.log('🧪 Auto-completados:', newCompleted);
    } catch (e) {}
  }, []);

  const currentDayOfWeek = useMemo(() => {
    const day = getToday().getDay();
    return day === 0 ? 7 : day;
  }, []);

  const { effectiveWeekId, activeDay, isBeforeStart, daysUntilStart } = useMemo(() => {
    const today = getToday();
    const daysSinceStart = daysBetween(startMonday, today);

    if (daysSinceStart < 0) {
      return {
        effectiveWeekId: 1,
        activeDay: 1,
        isBeforeStart: true,
        daysUntilStart: Math.abs(daysSinceStart)
      };
    }

    const week = Math.floor(daysSinceStart / 7) + 1;
    const day = (daysSinceStart % 7) + 1;

    const totalWeeks = WEEKLY_GUIDES.length;
    const cappedWeek = Math.min(week, totalWeeks);

    return {
      effectiveWeekId: cappedWeek,
      activeDay: day,
      isBeforeStart: false,
      daysUntilStart: 0
    };
  }, [startMonday]);

  const [viewWeekId, setViewWeekId] = useState(null);
  const [viewDay, setViewDay] = useState(null);

  const displayWeekId = viewWeekId ?? effectiveWeekId;
  const displayDay = viewDay ?? activeDay;

  const isReviewing = displayWeekId !== effectiveWeekId || displayDay !== activeDay;

  const totalWeeks = WEEKLY_GUIDES.length;
  const currentPosition = (effectiveWeekId - 1) * 7 + activeDay;
  const displayPosition = (displayWeekId - 1) * 7 + displayDay;

  const canGoPrev = displayPosition > 1;
  const canGoNext = displayPosition < currentPosition;

  useEffect(() => {
    setViewWeekId(null);
    setViewDay(null);
  }, [effectiveWeekId, activeDay]);

  const currentWeekGuide = useMemo(() => {
    return WEEKLY_GUIDES.find((w) => w.id === displayWeekId) || WEEKLY_GUIDES[0];
  }, [displayWeekId]);

  const currentDailyTip = useMemo(() => {
    if (!isReviewing) {
      const customTip = (customTips || []).find((t) => t.day === displayDay);
      if (customTip) {
        return { ...customTip, dayName: getDayName(displayDay), isCustom: true };
      }
    }

    return (
      currentWeekGuide.tips.find((t) => t.day === displayDay) ||
      currentWeekGuide.tips[0]
    );
  }, [displayDay, currentWeekGuide, customTips, isReviewing]);

  const currentTipKey = `w${effectiveWeekId}-d${activeDay}`;
  const isTipCompleted = (completedTips || []).includes(currentTipKey);

  const displayTipKey = `w${displayWeekId}-d${displayDay}`;
  const isDisplayCompleted = (completedTips || []).includes(displayTipKey);

  const completeTipChallenge = useCallback(() => {
    if (isTipCompleted || isBeforeStart) return;

    const reward = currentDailyTip.reward || 15;
    try { awardStars(reward, '¡SUPERPODER DESBLOQUEADO!'); } catch (e) {}
    addCompletedTip(currentTipKey);
  }, [isTipCompleted, isBeforeStart, awardStars, currentDailyTip, currentTipKey, addCompletedTip]);

  const goToPrevTip = useCallback(() => {
    if (!canGoPrev) return;
    try { audioService.playClick(); } catch (e) {}
    recordActivity();

    const newPos = displayPosition - 1;
    const { week, day } = positionToWeekDay(newPos);

    if (week === effectiveWeekId && day === activeDay) {
      setViewWeekId(null);
      setViewDay(null);
    } else {
      setViewWeekId(week);
      setViewDay(day);
    }
  }, [canGoPrev, displayPosition, effectiveWeekId, activeDay, recordActivity]);

  const goToNextTip = useCallback(() => {
    if (!canGoNext) return;
    try { audioService.playClick(); } catch (e) {}
    recordActivity();

    const newPos = displayPosition + 1;

    if (newPos >= currentPosition) {
      setViewWeekId(null);
      setViewDay(null);
      return;
    }

    const { week, day } = positionToWeekDay(newPos);
    setViewWeekId(week);
    setViewDay(day);
  }, [canGoNext, displayPosition, currentPosition, recordActivity]);

  const goToToday = useCallback(() => {
    try { audioService.playPop(); } catch (e) {}
    recordActivity();
    setViewWeekId(null);
    setViewDay(null);
  }, [recordActivity]);

  const selectDay = useCallback((day) => {
    try { audioService.playClick(); } catch (e) {}
    recordActivity();
    setViewDay(day);
  }, [recordActivity]);

  const selectWeek = useCallback((weekId) => {
    try { audioService.playClick(); } catch (e) {}
    setActiveWeek(weekId);
  }, [setActiveWeek]);

  return {
    allWeeks: WEEKLY_GUIDES,
    currentWeekGuide,
    currentDailyTip,
    activeWeekId: displayWeekId,
    activeDay: displayDay,
    currentDayOfWeek,
    isReviewing,

    isBeforeStart,
    daysUntilStart,
    startMondayDate: startMonday,

    currentTipKey,
    isTipCompleted,
    displayTipKey,
    isDisplayCompleted,

    canGoPrev,
    canGoNext,
    goToPrevTip,
    goToNextTip,
    goToToday,

    selectDay,
    selectWeek,
    completeTipChallenge
  };
}