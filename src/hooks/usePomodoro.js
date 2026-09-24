import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';

export const POMODORO_MODES = {
  focus: { label: 'Enfoque', minutes: 25, icon: '🎯', xp: 20 },
  short: { label: 'Corto', minutes: 5, icon: '☕', xp: 0 },
  long: { label: 'Largo', minutes: 15, icon: '🎮', xp: 5 }
};

export const QUICK_MINUTES = [5, 10, 15, 20, 25, 30, 45];

const TOMATOES_PER_DAY = 4;

export function usePomodoro() {
  const { addXp, setSparkyMessage, userName, settings, updateSettings } = useApp();

  const [currentMode, setCurrentMode] = useState('focus');
  const customMinutes = settings.customPomodoroMinutes || 25;
  const [timeLeft, setTimeLeft] = useState(customMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientSound, setAmbientSound] = useState('none');
  const [tomatoesToday, setTomatoesToday] = useState(0);

  const timerRef = useRef(null);

  const modeConfig = POMODORO_MODES[currentMode];
  const totalSeconds = (currentMode === 'focus' ? customMinutes : modeConfig.minutes) * 60;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100)
  );

  // Cambiar modo
  const changeMode = useCallback((modeKey) => {
    try { audioService.playClick(); } catch (e) {}
    setIsRunning(false);
    clearInterval(timerRef.current);
    setCurrentMode(modeKey);
    const mins = modeKey === 'focus' ? customMinutes : POMODORO_MODES[modeKey].minutes;
    setTimeLeft(mins * 60);
  }, [customMinutes]);

  // Cambiar duración personalizada (solo modo focus) y guardarla
  const changeCustomMinutes = useCallback((mins) => {
    const num = parseInt(mins, 10);
    if (isNaN(num) || num < 1 || num > 180) return;
    try { audioService.playPop(); } catch (e) {}
    setIsRunning(false);
    clearInterval(timerRef.current);
    updateSettings({ customPomodoroMinutes: num });
    setTimeLeft(num * 60);
  }, [updateSettings]);

  // Play / Pause
  const togglePlay = useCallback(() => {
    try { audioService.playClick(); } catch (e) {}
    setIsRunning((prev) => {
      const next = !prev;
      if (!next) {
        try { audioService.stopAmbient(); } catch (e) {}
      } else if (ambientSound !== 'none') {
        try { audioService.startAmbient(ambientSound); } catch (e) {}
      }
      return next;
    });
  }, [ambientSound]);

  // Reset
  const resetTimer = useCallback(() => {
    try { audioService.playClick(); } catch (e) {}
    setIsRunning(false);
    try { audioService.stopAmbient(); } catch (e) {}
    const mins = currentMode === 'focus' ? customMinutes : modeConfig.minutes;
    setTimeLeft(mins * 60);
  }, [currentMode, customMinutes, modeConfig]);

  // Cambiar sonido ambiente
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

  // Tick del timer
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
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

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, currentMode, modeConfig.xp, addXp, setSparkyMessage, userName]);

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