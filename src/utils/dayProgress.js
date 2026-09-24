// dayProgress.js
// Calcula el progreso del día según:
// - 60% tareas completadas
// - 25% tip diario completado hoy
// - 15% racha activa (al menos 1 tarea completada hoy)

export function getDayProgress({ tasks = [], completedTips = [], todayTipKey = null }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  // 1. Progreso por tareas (máx 60%)
  const tasksProgress = totalTasks > 0
    ? (completedTasks / totalTasks) * 60
    : 0;

  // 2. Progreso por tip (máx 25%)
  const tipCompletedToday = todayTipKey
    ? completedTips.includes(todayTipKey)
    : false;
  const tipProgress = tipCompletedToday ? 25 : 0;

  // 3. Progreso por racha (máx 15%)
  // Se activa si completó al menos 1 tarea hoy
  const streakActive = completedTasks > 0;
  const streakProgress = streakActive ? 15 : 0;

  const total = Math.min(100, tasksProgress + tipProgress + streakProgress);

  return {
    total: Math.round(total),
    tasksProgress: Math.round(tasksProgress),
    tipProgress,
    streakProgress,
    completedTasks,
    totalTasks,
    tipCompletedToday,
    streakActive
  };
}

// Calcula el porcentaje de cada bolita del header
// Cada bolita representa 25% del progreso total
// (4 bolitas × 25% = 100%)
export function getHeaderDots(totalProgress) {
  const dots = [];
  for (let i = 0; i < 4; i++) {
    const start = i * 25;
    const percent = Math.min(100, Math.max(0, (totalProgress - start) * 4));
    dots.push(Math.round(percent));
  }
  return dots;
}

// Devuelve la clave del tip de hoy (ej: 'w1-d3')
export function getTodayTipKey(activeWeek, dayOfWeek) {
  if (!activeWeek || !dayOfWeek) return null;
  return `w${activeWeek}-d${dayOfWeek}`;
}