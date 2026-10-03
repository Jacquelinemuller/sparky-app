// Títulos de cada semana para el índice del diario.
// Cada semana tiene un tema que resume los tips de esos 7 días.

export const DIARY_WEEK_TITLES = {
  1: 'Autonomía',
  2: 'Procrastinación',
  3: 'Manejo del tiempo',
  4: 'Emociones intensas',
  5: 'Impulsividad',
  6: 'Función ejecutiva',
  7: 'Motivación',
  8: 'Estrés y regulación',
  9: 'Organización diaria',
  10: 'Proyecto personal',
};

export function getWeekTitle(weekId) {
  return DIARY_WEEK_TITLES[weekId] || `Semana ${weekId}`;
}