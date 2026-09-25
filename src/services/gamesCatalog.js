// Catálogo compartido de juegos (Tienda, Colección y Arcade)

export const GAMES_CATALOG = [
  { id: 'memory',      label: 'Memoria',               icon: '🧠', subtitle: 'Encontrá los pares',              unlock: { type: 'free' } },
  { id: 'simon',       label: 'Simon Dice',            icon: '🎵', subtitle: 'Repetí la secuencia',             unlock: { type: 'xp', cost: 50 } },
  { id: 'minesweeper', label: 'Buscaminas',            icon: '💣', subtitle: 'Cuidado con las minas',           unlock: { type: 'xp', cost: 75 } },
  { id: 'maze',        label: 'Laberinto',             icon: '🌀', subtitle: 'Encontrá la salida',              unlock: { type: 'xp', cost: 100 } },
  { id: 'stroop',      label: 'Stroop',                icon: '🎨', subtitle: 'Decí el color, no la palabra',    unlock: { type: 'xp', cost: 125 } },
  { id: 'sequences',   label: 'Secuencias lógicas',    icon: '🔢', subtitle: 'Completá el patrón',              unlock: { type: 'xp', cost: 150 } },
  { id: 'sudoku4',     label: 'Sudoku 4x4',            icon: '🧩', subtitle: 'Números en su lugar',             unlock: { type: 'xp', cost: 175 } },
  { id: 'differences', label: 'Encontrar diferencias', icon: '🔍', subtitle: 'Mirá bien las imágenes',          unlock: { type: 'xp', cost: 200 } },
  { id: 'reaction',    label: 'Reacción',              icon: '⚡', subtitle: 'Tocá solo cuando toca',           unlock: { type: 'xp', cost: 225 } },
  { id: 'chess',       label: 'Ajedrez',               icon: '♟️', subtitle: 'El rey de los juegos',            unlock: { type: 'xp', cost: 250 } }
];