// Catálogo compartido de juegos (Tienda, Colección y Arcade)
//
// Modelo: los juegos NO se compran. Se desbloquean por retos semanales.
// - memory: desbloqueado desde el inicio (free)
// - simon → chess: se desbloquean al cumplir el reto de la semana correspondiente

export const GAMES_CATALOG = [
  { id: 'memory',      label: 'Memoria',               icon: '🧠', subtitle: 'Encontrá los pares',              unlock: { type: 'free' } },
  { id: 'simon',       label: 'Simon Dice',            icon: '🎵', subtitle: 'Repetí la secuencia',             unlock: { type: 'challenge', week: 1 } },
  { id: 'minesweeper', label: 'Buscaminas',            icon: '💣', subtitle: 'Cuidado con las minas',           unlock: { type: 'challenge', week: 2 } },
  { id: 'maze',        label: 'Laberinto',             icon: '🌀', subtitle: 'Encontrá la salida',              unlock: { type: 'challenge', week: 3 } },
  { id: 'stroop',      label: 'Stroop',                icon: '🎨', subtitle: 'Decí el color, no la palabra',    unlock: { type: 'challenge', week: 4 } },
  { id: 'sequences',   label: 'Secuencias lógicas',    icon: '🔢', subtitle: 'Completá el patrón',              unlock: { type: 'challenge', week: 5 } },
  { id: 'sudoku4',     label: 'Sudoku 4x4',            icon: '🧩', subtitle: 'Números en su lugar',             unlock: { type: 'challenge', week: 6 } },
  { id: 'differences', label: 'Encontrar diferencias', icon: '🔍', subtitle: 'Mirá bien las imágenes',          unlock: { type: 'challenge', week: 7 } },
  { id: 'reaction',    label: 'Reacción',              icon: '⚡', subtitle: 'Tocá solo cuando toca',           unlock: { type: 'challenge', week: 8 } },
  { id: 'chess',       label: 'Ajedrez',               icon: '♟️', subtitle: 'El rey de los juegos',            unlock: { type: 'challenge', week: 9 } }
];