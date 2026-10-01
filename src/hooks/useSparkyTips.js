import { useState, useMemo, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { WEEKLY_GUIDES } from '../data/weeklyGuidesData';
import { audioService } from '../services/audioService';

// Determina la semana activa según cuántas semanas pasaron desde el inicio del año.
function getWeekFromDate() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysPassed = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(daysPassed / 7) + 1;
  return Math.min(weekNumber, WEEKLY_GUIDES.length);
}

// Convierte una posición absoluta (1..total) a { week, day }
function positionToWeekDay(pos) {
  const week = Math.floor((pos - 1) / 7) + 1;
  const day = ((pos - 1) % 7) + 1;
  return { week, day };
}

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

  // Día actual (1 = Lunes, ..., 7 = Domingo)
  const currentDayOfWeek = useMemo(() => {
    const day = new Date().getDay();
    return day === 0 ? 7 : day;
  }, []);

  // Día REAL del chico (el que se usa para completar)
  const [activeDay, setActiveDay] = useState(currentDayOfWeek);

  // Semana REAL del chico
  const effectiveWeekId = activeWeek || getWeekFromDate();

  // ✅ Estado de "repaso": null significa "estoy viendo el día real"
  const [viewWeekId, setViewWeekId] = useState(null);
  const [viewDay, setViewDay] = useState(null);

  // Día y semana que se están MOSTRANDO (real o repaso)
  const displayWeekId = viewWeekId ?? effectiveWeekId;
  const displayDay = viewDay ?? activeDay;

  // ¿Estamos en modo repaso?
  const isReviewing = displayWeekId !== effectiveWeekId || displayDay !== activeDay;

  // Posiciones absolutas
  const totalWeeks = WEEKLY_GUIDES.length;
  const maxPosition = totalWeeks * 7;
  const currentPosition = (effectiveWeekId - 1) * 7 + activeDay;
  const displayPosition = (displayWeekId - 1) * 7 + displayDay;

  const canGoPrev = displayPosition > 1;
  const canGoNext = displayPosition < currentPosition;

  // Resetear el repaso cuando cambia el día real
  useEffect(() => {
    setViewWeekId(null);
    setViewDay(null);
  }, [effectiveWeekId, activeDay]);

  // Guía semanal de lo que se ve
  const currentWeekGuide = useMemo(() => {
    return (
      WEEKLY_GUIDES.find((w) => w.id === displayWeekId) || WEEKLY_GUIDES[0]
    );
  }, [displayWeekId]);

  // Tip del día (según lo que se ve)
  const currentDailyTip = useMemo(() => {
    // Si estás viendo el día real, pueden aparecer tips custom
    if (!isReviewing) {
      const customTip = (customTips || []).find((t) => t.day === displayDay);
      if (customTip) {
        return {
          ...customTip,
          dayName: getDayName(displayDay),
          isCustom: true
        };
      }
    }

    return (
      currentWeekGuide.tips.find((t) => t.day === displayDay) ||
      currentWeekGuide.tips[0]
    );
  }, [displayDay, currentWeekGuide, customTips, isReviewing]);

  // Clave del día REAL (para completar)
  const currentTipKey = `w${effectiveWeekId}-d${activeDay}`;
  const isTipCompleted = (completedTips || []).includes(currentTipKey);

  // Clave del día que se VE
  const displayTipKey = `w${displayWeekId}-d${displayDay}`;
  const isDisplayCompleted = (completedTips || []).includes(displayTipKey);

  // Completar el reto del día REAL
  const completeTipChallenge = useCallback(() => {
    if (isTipCompleted) return;

    const reward = currentDailyTip.reward || 15;

    try {
      awardStars(reward, '¡SUPERPODER DESBLOQUEADO!');
    } catch (e) {}

    addCompletedTip(currentTipKey);
  }, [isTipCompleted, awardStars, currentDailyTip, currentTipKey, addCompletedTip]);

  // Navegación
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

  // Cambiar de día (uso histórico)
  const selectDay = useCallback((day) => {
    try { audioService.playClick(); } catch (e) {}
    recordActivity();
    setActiveDay(day);
  }, [recordActivity]);

  const selectWeek = useCallback((weekId) => {
    try { audioService.playClick(); } catch (e) {}
    setActiveWeek(weekId);
    setActiveDay(1);
  }, [setActiveWeek]);

  return {
    // Datos de lo que se VE
    allWeeks: WEEKLY_GUIDES,
    currentWeekGuide,
    currentDailyTip,
    activeWeekId: displayWeekId,
    activeDay: displayDay,
    currentDayOfWeek,
    isReviewing,

    // Claves y estados de completado
    currentTipKey,           // clave del día real
    isTipCompleted,          // completado del día real
    displayTipKey,           // clave de lo que se ve
    isDisplayCompleted,      // completado de lo que se ve

    // Navegación
    canGoPrev,
    canGoNext,
    goToPrevTip,
    goToNextTip,
    goToToday,

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