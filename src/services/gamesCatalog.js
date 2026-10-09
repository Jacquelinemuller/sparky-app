// Catálogo compartido de juegos (Tienda, Colección y Arcade)

// Catálogo compartido de juegos (Tienda, Colección y Arcade)

export const GAMES_CATALOG = [
  { id: 'memory',      label: 'Memoria',               icon: '/games/memory.png',      color: '#22c55e', subtitle: 'Encontrá los pares',              unlock: { type: 'free' } },
  { id: 'simon',       label: 'Simon Dice',            icon: '/games/simon.png',       color: '#ef4444', subtitle: 'Repetí la secuencia',             unlock: { type: 'challenge', week: 1 } },
  { id: 'minesweeper', label: 'Buscaminas',            icon: '/games/buscaminas.png',  color: '#94a3b8', subtitle: 'Cuidado con las minas',           unlock: { type: 'challenge', week: 2 } },
  { id: 'maze',        label: 'Laberinto',             icon: '/games/laberinto.png',   color: '#f97316', subtitle: 'Encontrá la salida',              unlock: { type: 'challenge', week: 3 } },
  { id: 'stroop',      label: 'Stroop',                icon: '/games/stroop.png',      color: '#3b82f6', subtitle: 'Decí el color, no la palabra',    unlock: { type: 'challenge', week: 4 } },
  { id: 'sequences',   label: 'Secuencias lógicas',    icon: '/games/secuencias.png',  color: '#facc15', subtitle: 'Completá el patrón',              unlock: { type: 'challenge', week: 5 } },
  { id: 'sudoku4',     label: 'Sudoku 4x4',            icon: '/games/sudoku.png',      color: '#a855f7', subtitle: 'Números en su lugar',             unlock: { type: 'challenge', week: 6 } },
  { id: 'differences', label: 'Encontrar diferencias', icon: '/games/diferencias.png', color: '#facc15', subtitle: 'Mirá bien las imágenes',          unlock: { type: 'challenge', week: 7 } },
  { id: 'reaction',    label: 'Reacción',              icon: '/games/reaction.png',    color: '#14b8a6', subtitle: 'Tocá solo cuando toca',           unlock: { type: 'challenge', week: 8 } },
  { id: 'chess',       label: 'Ajedrez',               icon: '/games/chess.png',       color: '#e2e8f0', subtitle: 'El rey de los juegos',            unlock: { type: 'challenge', week: 9 } }
];