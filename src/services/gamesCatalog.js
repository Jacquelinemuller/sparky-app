// Catálogo compartido de juegos (Tienda, Colección y Arcade)

export const GAMES_CATALOG = [
  { id: 'memory',      label: 'Memoria',               icon: '/games/memory.png',      subtitle: 'Encontrá los pares',              unlock: { type: 'free' } },
  { id: 'simon',       label: 'Simon Dice',            icon: '/games/simon.png',       subtitle: 'Repetí la secuencia',             unlock: { type: 'challenge', week: 1 } },
  { id: 'minesweeper', label: 'Buscaminas',            icon: '/games/buscaminas.png',  subtitle: 'Cuidado con las minas',           unlock: { type: 'challenge', week: 2 } },
  { id: 'maze',        label: 'Laberinto',             icon: '/games/laberinto.png',   subtitle: 'Encontrá la salida',              unlock: { type: 'challenge', week: 3 } },
  { id: 'stroop',      label: 'Stroop',                icon: '/games/stroop.png',      subtitle: 'Decí el color, no la palabra',    unlock: { type: 'challenge', week: 4 } },
  { id: 'sequences',   label: 'Secuencias lógicas',    icon: '/games/secuencias.png',  subtitle: 'Completá el patrón',              unlock: { type: 'challenge', week: 5 } },
  { id: 'sudoku4',     label: 'Sudoku 4x4',            icon: '/games/sudoku.png',      subtitle: 'Números en su lugar',             unlock: { type: 'challenge', week: 6 } },
  { id: 'differences', label: 'Encontrar diferencias', icon: '/games/diferencias.png', subtitle: 'Mirá bien las imágenes',          unlock: { type: 'challenge', week: 7 } },
  { id: 'reaction',    label: 'Reacción',              icon: '/games/reaction.png',    subtitle: 'Tocá solo cuando toca',           unlock: { type: 'challenge', week: 8 } },
  { id: 'chess',       label: 'Ajedrez',               icon: '/games/chess.png',       subtitle: 'El rey de los juegos',            unlock: { type: 'challenge', week: 9 } }
];