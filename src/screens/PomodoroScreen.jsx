import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { usePomodoro, POMODORO_MODES, QUICK_MINUTES } from '../hooks/usePomodoro';

// Tema de colores por modo
const MODE_THEMES = {
  focus: {
    primary: '#dc2626',
    shadow: '#991b1b',
    light: '#fee2e2',
    lightShadow: '#fecaca',
    soft: '#fef2f2',
    bg: 'radial-gradient(circle at 50% 0%, #fef2f2 0%, #fee2e2 50%, #fecaca 100%)'
  },
  short: {
    primary: '#10b981',
    shadow: '#047857',
    light: '#d1fae5',
    lightShadow: '#a7f3d0',
    soft: '#ecfdf5',
    bg: 'radial-gradient(circle at 50% 0%, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)'
  },
  long: {
    primary: '#8b5cf6',
    shadow: '#5b21b6',
    light: '#ede9fe',
    lightShadow: '#ddd6fe',
    soft: '#f5f3ff',
    bg: 'radial-gradient(circle at 50% 0%, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)'
  }
};

export const PomodoroScreen = () => {
  const { activeTask, setActiveScreen, userName } = useApp();
  const {
    currentMode,
    customMinutes,
    timeLeft,
    formattedTime,
    progressPercent,
    isRunning,
    ambientSound,
    tomatoesToday,
    tomatoesGoal,
    changeMode,
    changeCustomMinutes,
    togglePlay,
    resetTimer,
    toggleAmbient
  } = usePomodoro();

  const [inputMinutes, setInputMinutes] = useState(String(customMinutes));

  useEffect(() => {
    setInputMinutes(String(customMinutes));
  }, [customMinutes]);

  const theme = MODE_THEMES[currentMode] || MODE_THEMES.focus;

  const RADIUS = 100;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progressPercent / 100);

  const goBack = () => setActiveScreen('none');

  const handleSaveMinutes = () => {
    changeCustomMinutes(inputMinutes);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveMinutes();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col antialiased transition-all duration-500"
      style={{ background: theme.bg }}
    >
      {/* Header */}
      <header
        className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.06)]"
        style={{ background: 'rgba(255,255,255,0.9)' }}
      >
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full font-label-md text-label-md font-bold active:scale-95 transition-all cursor-pointer"
            style={{
              background: theme.light,
              color: theme.primary,
              border: `1px solid ${theme.lightShadow}`
            }}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Volver</span>
          </button>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: theme.light, boxShadow: `0 2px 0 0 ${theme.lightShadow}` }}
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ color: theme.primary, fontVariationSettings: '"FILL" 1' }}
            >
              timer
            </span>
            <span
              className="font-label-sm text-label-sm font-black uppercase tracking-wider"
              style={{ color: theme.primary }}
            >
              Pomodoro
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 pb-28 px-4 max-w-md mx-auto">

        {/* ================================================ */}
        {/* Misión Actual en Foco - CON BARRA LATERAL */}
        {/* ================================================ */}
        <div className="bg-white rounded-2xl shadow-[0_4px_0_0_#efdfda] flex items-stretch overflow-hidden mb-4">
          {/* Barra lateral de color - siempre visible */}
          <div
            className="w-2 flex-shrink-0 transition-colors duration-500"
            style={{ background: theme.primary }}
          />
          {/* Contenido del card */}
          <div className="flex items-center gap-3 min-w-0 flex-1 p-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-500"
              style={{ background: theme.light, color: theme.primary }}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                target
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                Misión actual
              </span>
              <span className="font-title-md text-title-md text-on-surface truncate font-bold">
                {activeTask ? activeTask.title : 'Misión Libre'}
              </span>
            </div>
          </div>
        </div>

        {/* Selector de modos */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-white/70 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] mb-3">
          {Object.entries(POMODORO_MODES).map(([key, mode]) => {
            const isSelected = currentMode === key;
            const modeTheme = MODE_THEMES[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => changeMode(key)}
                className="flex flex-col items-center justify-center py-2 px-1 rounded-full transition-all cursor-pointer"
                style={
                  isSelected
                    ? {
                        background: modeTheme.primary,
                        color: '#ffffff',
                        boxShadow: `0 4px 0 0 ${modeTheme.shadow}`
                      }
                    : { color: '#5a4136' }
                }
              >
                <span className="font-label-md text-label-md flex items-center gap-1 font-black">
                  {mode.icon} {mode.label}
                </span>
                <span className="font-label-sm text-label-sm opacity-90">
                  {key === 'focus' ? `${customMinutes} min` : `${mode.minutes} min`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Ajuste de tiempo - solo en modo Enfoque */}
        {currentMode === 'focus' && (
          <div
            className="bg-white/80 backdrop-blur-sm border-2 border-dashed rounded-2xl p-3 mb-4"
            style={{ borderColor: theme.lightShadow }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ color: theme.primary }}
              >
                tune
              </span>
              <span
                className="font-label-sm text-label-sm font-black uppercase tracking-wider"
                style={{ color: theme.primary }}
              >
                ¿Cuántos minutos querés hoy?
              </span>
            </div>

            {/* Botones rápidos */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {QUICK_MINUTES.map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => changeCustomMinutes(mins)}
                  className="px-2.5 py-1 rounded-full font-label-sm text-label-sm font-black transition-all cursor-pointer"
                  style={
                    customMinutes === mins
                      ? {
                          background: theme.primary,
                          color: '#fff',
                          boxShadow: `0 2px 0 0 ${theme.shadow}`
                        }
                      : {
                          background: theme.soft,
                          color: theme.primary,
                          border: `1px solid ${theme.lightShadow}`
                        }
                  }
                >
                  {mins}m
                </button>
              ))}
            </div>

            {/* Input personalizado */}
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                Personalizar:
              </span>
              <input
                type="number"
                value={inputMinutes}
                onChange={(e) => setInputMinutes(e.target.value)}
                onKeyDown={handleInputKeyDown}
                min="1"
                max="180"
                className="w-20 px-3 py-1.5 rounded-xl border-2 bg-white text-center font-black text-on-surface focus:outline-none"
                style={{ borderColor: theme.lightShadow }}
              />
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                min
              </span>
              <button
                type="button"
                onClick={handleSaveMinutes}
                className="ml-auto px-3 py-1.5 rounded-full font-label-sm text-label-sm font-black text-white active:scale-95 transition-all cursor-pointer"
                style={{ background: theme.primary, boxShadow: `0 2px 0 0 ${theme.shadow}` }}
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Timer circular grande */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_6px_0_0_#efdfda] flex flex-col items-center justify-center relative mb-4">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
              <circle
                cx="120"
                cy="120"
                fill="transparent"
                r={RADIUS}
                stroke={theme.light}
                strokeWidth="16"
              />
              <circle
                className="transition-all duration-700 ease-out"
                cx="120"
                cy="120"
                fill="transparent"
                r={RADIUS}
                stroke={theme.primary}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="16"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
              <span
                className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full font-label-sm text-label-sm mb-1 font-black ${
                  isRunning ? 'animate-pulse' : ''
                }`}
                style={{ background: theme.light, color: theme.primary }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: theme.primary }} />
                {isRunning ? 'EN MARCHA' : 'LISTO'}
              </span>
              <span className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface font-black tracking-tight">
                {formattedTime}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 mt-1">
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ color: theme.primary }}
                >
                  bolt
                </span>
                {currentMode === 'focus' ? '+20 XP al terminar' : 'Descanso'}
              </span>
            </div>
          </div>

          {/* Track de tomates */}
          <div className="mt-5 flex flex-col items-center gap-2 w-full pt-3 border-t border-[#efdfda]">
            <div className="flex items-center justify-between w-full max-w-[260px] px-2">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
                Tomates de hoy:
              </span>
              <span
                className="font-label-sm text-label-sm font-black"
                style={{ color: theme.primary }}
              >
                {tomatoesToday} de {tomatoesGoal}
              </span>
            </div>
            <div className="flex items-center justify-center gap-3">
              {Array.from({ length: tomatoesGoal }).map((_, i) => {
                const isDone = i < tomatoesToday;
                const isCurrent = i === tomatoesToday && isRunning && currentMode === 'focus';
                return (
                  <div
                    key={i}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                      isDone
                        ? 'bg-[#fbeae5] shadow-[0_3px_0_0_#efdfda]'
                        : isCurrent
                        ? 'shadow-[0_3px_0_0_#fbb6a8] animate-bounce'
                        : 'bg-[#fbeae5] shadow-[0_3px_0_0_#efdfda] opacity-40'
                    }`}
                    style={isCurrent ? { background: theme.light } : {}}
                  >
                    {isDone ? '🍅' : isCurrent ? '⏳' : '⚪'}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Botones de control */}
        <div className="flex flex-col gap-3 mb-4">
          <button
            type="button"
            onClick={togglePlay}
            className="w-full min-h-[56px] rounded-full text-white font-label-lg text-label-lg font-black flex items-center justify-center gap-2 active:translate-y-1 transition-all cursor-pointer"
            style={{
              background: theme.primary,
              boxShadow: `0 6px 0 0 ${theme.shadow}`
            }}
          >
            <span
              className="material-symbols-outlined text-[28px]"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              {isRunning ? 'pause' : 'play_arrow'}
            </span>
            <span>
              {isRunning
                ? 'Pausar'
                : timeLeft === 0
                ? 'Reiniciar'
                : `¡Empezar ${
                    currentMode === 'focus' ? customMinutes : POMODORO_MODES[currentMode].minutes
                  } min!`}
            </span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={resetTimer}
              className="h-12 rounded-full bg-white text-on-surface font-label-md text-label-md font-black flex items-center justify-center gap-1.5 shadow-[0_4px_0_0_#efdfda] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                refresh
              </span>
              Reiniciar
            </button>
            <button
              type="button"
              onClick={() => changeMode(currentMode === 'focus' ? 'short' : 'focus')}
              className="h-12 rounded-full bg-white text-on-surface font-label-md text-label-md font-black flex items-center justify-center gap-1.5 shadow-[0_4px_0_0_#efdfda] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ color: theme.primary }}
              >
                skip_next
              </span>
              {currentMode === 'focus' ? 'Descanso' : 'Foco'}
            </button>
          </div>
        </div>

        {/* Sparky motivacional */}
        <div className="bg-white p-4 rounded-2xl shadow-[0_4px_0_0_#efdfda] flex items-center gap-3 mb-4">
          <div className="relative flex-shrink-0">
            <div
              className="w-16 h-16 rounded-full p-1 shadow-[0_3px_0_0_#efdfda]"
              style={{ background: theme.light }}
            >
              <img
                src="/sparky.png"
                alt="Sparky"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML =
                    '<div class="w-full h-full flex items-center justify-center text-3xl">🐶</div>';
                }}
              />
            </div>
            <span
              className="absolute -bottom-1 -right-1 text-white w-5 h-5 rounded-full flex items-center justify-center shadow-sm text-[12px]"
              style={{ background: theme.primary }}
            >
              🐾
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span
              className="font-label-md text-label-md font-black"
              style={{ color: theme.primary }}
            >
              Sparky dice:
            </span>
            <p className="font-body-sm text-body-sm text-on-surface mt-0.5 leading-snug">
              ¡Vamos {userName}! Elegí tu tiempo y yo te acompaño. ¡Tú puedes concentrarte! 🚀
            </p>
          </div>
        </div>

        {/* Ambiente sonoro */}
        <div className="bg-white/70 p-4 rounded-2xl shadow-[0_3px_0_0_#efdfda] flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[22px]"
                style={{ color: theme.primary }}
              >
                graphic_eq
              </span>
              <span className="font-title-md text-title-md text-on-surface font-black">
                Sonido de fondo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => toggleAmbient('rain')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white transition-all cursor-pointer border-2"
              style={{
                borderColor: ambientSound === 'rain' ? theme.primary : 'transparent',
                boxShadow: '0 2px 0 0 #efdfda'
              }}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ color: theme.primary }}
              >
                rainy
              </span>
              <div className="flex flex-col text-left min-w-0">
                <span
                  className="font-label-md text-label-md truncate font-bold"
                  style={{ color: ambientSound === 'rain' ? theme.primary : '#1d1b19' }}
                >
                  Lluvia
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Ruido suave
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => toggleAmbient('whitenoise')}
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white transition-all cursor-pointer border-2"
              style={{
                borderColor: ambientSound === 'whitenoise' ? theme.primary : 'transparent',
                boxShadow: '0 2px 0 0 #efdfda'
              }}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ color: theme.primary }}
              >
                blur_on
              </span>
              <div className="flex flex-col text-left min-w-0">
                <span
                  className="font-label-md text-label-md truncate font-bold"
                  style={{ color: ambientSound === 'whitenoise' ? theme.primary : '#1d1b19' }}
                >
                  Ruido blanco
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Foco puro
                </span>
              </div>
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};