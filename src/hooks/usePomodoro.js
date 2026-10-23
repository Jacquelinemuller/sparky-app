import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const POMODORO_MODES = {
  focus: { label: 'Enfoque', minutes: 25, icon: '🎯', xp: 20 },
  short: { label: 'Corto', minutes: 5, icon: '☕', xp: 0 },
  long: { label: 'Largo', minutes: 15, icon: '🎮', xp: 5 }
};

export const QUICK_MINUTES = [5, 10, 15, 20, 25, 30, 45];

const TOMATOES_PER_DAY = 4;
const POMODORO_NOTIFICATION_ID = 9900; // ID fijo para la notificación del pomodoro

export function usePomodoro() {
  const { addXp, setSparkyMessage, userName, settings, updateSettings } = useApp();

  const [currentMode, setCurrentMode] = useState('focus');
  const customMinutes = settings.customPomodoroMinutes || 25;
  const [timeLeft, setTimeLeft] = useState(customMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState('none');
  const [tomatoesToday, setTomatoesToday] = useState(0);

  // 🔑 Guardamos la hora exacta en la que debe terminar
  const targetTimeRef = useRef(null);
  const timerRef = useRef(null);

  const modeConfig = POMODORO_MODES[currentMode];
  const totalSeconds = (currentMode === 'focus' ? customMinutes : modeConfig.minutes) * 60;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100)
  );

  // ============================================
  // 🔑 FUNCIÓN PARA CANCELAR NOTIFICACIÓN
  // ============================================
  const cancelPomodoroNotification = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      await LocalNotifications.cancel({ notifications: [{ id: POMODORO_NOTIFICATION_ID }] });
    } catch (e) {}
  };

  // ============================================
  // 🔑 FUNCIÓN PARA PROGRAMAR NOTIFICACIÓN
  // ============================================
  const schedulePomodoroNotification = async (secondsToEnd) => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      // Pedimos permisos si es necesario
      let perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }

      const targetDate = new Date(Date.now() + secondsToEnd * 1000);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: POMODORO_NOTIFICATION_ID,
            title: '⏰ ¡Pomodoro Terminado!',
            body: currentMode === 'focus' ? '¡Excelente trabajo! Es hora de descansar.' : '¡Descanso terminado! ¿Listo para enfocarte?',
            schedule: { at: targetDate, allowWhileIdle: true },
            sound: 'default',
            channelId: 'alarmas' // Usa el canal que ya creaste para las alarmas
          }
        ]
      });
    } catch (e) {
      console.warn('Error al programar notificación del pomodoro:', e);
    }
  };

  // ============================================
  // CAMBIAR MODO
  // ============================================
  const changeMode = useCallback((modeKey) => {
    try { audioService.playClick(); } catch (e) {}
    setIsRunning(false);
    clearInterval(timerRef.current);
    targetTimeRef.current = null;
    cancelPomodoroNotification();
    
    setCurrentMode(modeKey);
    const mins = modeKey === 'focus' ? customMinutes : POMODORO_MODES[modeKey].minutes;
    setTimeLeft(mins * 60);
  }, [customMinutes]);

  // ============================================
  // CAMBIAR DURACIÓN PERSONALIZADA
  // ============================================
  const changeCustomMinutes = useCallback((mins) => {
    const num = parseInt(mins, 10);
    if (isNaN(num) || num < 1 || num > 180) return;
    try { audioService.playPop(); } catch (e) {}
    setIsRunning(false);
    clearInterval(timerRef.current);
    targetTimeRef.current = null;
    cancelPomodoroNotification();

    updateSettings({ customPomodoroMinutes: num });
    setTimeLeft(num * 60);
  }, [updateSettings]);

  // ============================================
  // PLAY / PAUSE
  // ============================================
  const togglePlay = useCallback(() => {
    try { audioService.playClick(); } catch (e) {}
    setIsRunning((prev) => {
      const next = !prev;
      if (!next) {
        // Al pausar, cancelamos la alarma
        cancelPomodoroNotification();
        try { audioService.stopAmbient(); } catch (e) {}
      } else {
        // Al arrancar, guardamos la hora de fin y programamos la alarma
        targetTimeRef.current = Date.now() + (timeLeft * 1000);
        schedulePomodoroNotification(timeLeft);
        
        if (ambientSound !== 'none') {
          try { audioService.startAmbient(ambientSound); } catch (e) {}
        }
      }
      return next;
    });
  }, [ambientSound, timeLeft, currentMode]);

  // ============================================
  // RESET
  // ============================================
  const resetTimer = useCallback(() => {
    try { audioService.playClick(); } catch (e) {}
    setIsRunning(false);
    try { audioService.stopAmbient(); } catch (e) {}
    targetTimeRef.current = null;
    cancelPomodoroNotification();
    
    const mins = currentMode === 'focus' ? customMinutes : modeConfig.minutes;
    setTimeLeft(mins * 60);
  }, [currentMode, customMinutes, modeConfig]);

  // ============================================
  // CAMBIAR SONIDO AMBIENTE
  // ============================================
  const toggleAmbient = useCallback((soundType) => {
    try { audioService.playPop(); } catch (e) {}
    const nextSound = ambientSound === soundType ? 'none' : soundType;
    setAmbientSound(nextSound);

    if (isRunning) {
      try {
        if (nextSound === 'none') {
          audioService.stopAmbient();
        } else {
          audioService.startAmbient(nextSound);
        }
      } catch (e) {}
    }
  }, [ambientSound, isRunning]);

  // ============================================
  // 🔑 TICK DEL TIMER (Basado en tiempo real)
  // ============================================
  useEffect(() => {
    const updateTimer = () => {
      if (!isRunning || !targetTimeRef.current) return;

      const now = Date.now();
      const remaining = Math.max(0, Math.round((targetTimeRef.current - now) / 1000));
      
      setTimeLeft(remaining);

      if (remaining === 0) {
        // 🎯 EL TIEMPO TERMINÓ
        clearInterval(timerRef.current);
        setIsRunning(false);
        targetTimeRef.current = null;
        cancelPomodoroNotification();
        
        try { audioService.stopAmbient(); } catch (e) {}
        try { audioService.playPomodoroAlarm(); } catch (e) {}

        if (currentMode === 'focus') {
          addXp(modeConfig.xp);
          setTomatoesToday((t) => Math.min(TOMATOES_PER_DAY, t + 1));
          setSparkyMessage(
            `¡Guau ${userName}! ¡Terminaste un Pomodoro completo! 🍅 +${modeConfig.xp} XP. ¡A descansar!`
          );
        } else {
          setSparkyMessage(`¡Buen descanso ${userName}! ¿Listo para el siguiente foco? 💪`);
        }
      }
    };

    if (isRunning) {
      // Si recién arrancamos, calculamos la hora de fin
      if (!targetTimeRef.current) {
        targetTimeRef.current = Date.now() + (timeLeft * 1000);
      }
      
      // Actualizamos inmediatamente y luego cada 1 segundo
      updateTimer();
      timerRef.current = setInterval(updateTimer, 1000);
      
      // 🔑 Cuando el celular vuelve de segundo plano, forzamos la actualización
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          updateTimer();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(timerRef.current);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      clearInterval(timerRef.current);
    }
  }, [isRunning, currentMode, modeConfig.xp, addXp, setSparkyMessage, userName, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTomatoes = useCallback(() => {
    setTomatoesToday(0);
  }, []);

  return {
    currentMode,
    modeConfig,
    customMinutes,
    timeLeft,
    formattedTime: formatTime(timeLeft),
    progressPercent,
    isRunning,
    ambientSound,
    tomatoesToday,
    tomatoesGoal: TOMATOES_PER_DAY,
    changeMode,
    changeCustomMinutes,
    togglePlay,
    resetTimer,
    toggleAmbient,
    resetTomatoes
  };
}