import { useState, useMemo, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { WEEKLY_GUIDES } from '../data/weeklyGuidesData';
import { audioService } from '../services/audioService';

// Determina la semana activa según cuántas semanas pasaron desde el inicio del año.
// Si no hay una semana custom, usa la semana 1.
function getWeekFromDate() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysPassed = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(daysPassed / 7) + 1;
  // Limitamos a la cantidad de semanas disponibles
  return Math.min(weekNumber, WEEKLY_GUIDES.length);
}

export function useSparkyTips() {
  const { completedTips, addCompletedTip, customTips, activeWeek, setActiveWeek, awardStars, recordActivity } = useApp();

  // Día actual (1 = Lunes, ..., 7 = Domingo)
  const currentDayOfWeek = useMemo(() => {
    const day = new Date().getDay();
    return day === 0 ? 7 : day;
  }, []);

  const [activeDay, setActiveDay] = useState(currentDayOfWeek);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);

  // Semana activa persistida en el AppContext
  const effectiveWeekId = activeWeek || getWeekFromDate();

  // Guía semanal activa
  const currentWeekGuide = useMemo(() => {
    return WEEKLY_GUIDES.find((w) => w.id === effectiveWeekId) || WEEKLY_GUIDES[0];
  }, [effectiveWeekId]);

  // Tip del día: prioridad a los tips personalizados de padres
  const currentDailyTip = useMemo(() => {
    const customTip = (customTips || []).find((t) => t.day === activeDay);
    if (customTip) {
      return {
        ...customTip,
        dayName: getDayName(activeDay),
        isCustom: true
      };
    }
    return (
      currentWeekGuide.tips.find((t) => t.day === activeDay) ||
      currentWeekGuide.tips[0]
    );
  }, [activeDay, currentWeekGuide, customTips]);

  // Clave única del tip actual (ej: 'w1-d3')
  const currentTipKey = `w${effectiveWeekId}-d${activeDay}`;
  const isTipCompleted = (completedTips || []).includes(currentTipKey);

  // Completar el reto del día
  const completeTipChallenge = useCallback(() => {
    if (isTipCompleted) return;

    const reward = currentDailyTip.reward || 15;

    try {
      awardStars(reward, '¡SUPERPODER DESBLOQUEADO!');
    } catch (e) {}

    addCompletedTip(currentTipKey);
  }, [isTipCompleted, awardStars, currentDailyTip, currentTipKey, addCompletedTip]);

  // Cambiar de día
  const selectDay = useCallback((day) => {
    try { audioService.playClick(); } catch (e) {}
    recordActivity();
    setActiveDay(day);
  }, [recordActivity]);

  // Cambiar de semana
  const selectWeek = useCallback((weekId) => {
    try { audioService.playClick(); } catch (e) {}
    setActiveWeek(weekId);
    setActiveDay(1);
  }, [setActiveWeek]);

  return {
    // Datos
    allWeeks: WEEKLY_GUIDES,
    currentWeekGuide,
    currentDailyTip,
    activeWeekId: effectiveWeekId,
    activeDay,
    currentDayOfWeek,
    currentTipKey,
    isTipCompleted,

    // Estado del modal
    isSheetModalOpen,
    setIsSheetModalOpen,

    // Acciones
    selectDay,
    selectWeek,
    completeTipChallenge
  };
}

function getDayName(day) {
  const names = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  return names[day - 1] || 'Día';
}