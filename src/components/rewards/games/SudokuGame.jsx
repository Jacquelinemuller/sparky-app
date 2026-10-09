import React, { useState, useCallback } from 'react';
import { audioService } from '../../../services/audioService';

// ============================================
// PALETA — Basada en el logo (violeta + papiro + números negros)
// ============================================
const P = {
  // Marco violeta exterior
  frameTop: '#d8b4fe',
  frameMid: '#a855f7',
  frameBot: '#7e22ce',
  frameDeep: '#581c87',
  frameBorder: '#3b0764',
  frameHighlight: 'rgba(255,255,255,0.7)',

  // Papiro / Scroll de las celdas — 50% transparente
  scrollLight: 'rgba(254, 243, 213, 0.5)',
  scrollMid: 'rgba(245, 230, 184, 0.5)',
  scrollDark: 'rgba(232, 213, 160, 0.5)',
  scrollDeep: 'rgba(184, 153, 104, 0.5)',
  scrollBorder: 'rgba(139, 111, 71, 0.75)',

  // Tinta (números negros serif)
  ink: '#1a1a1a',

  // Acentos
  cyan: '#06b6d4',
  cyanBright: '#38bdf8',
  limeBright: '#4ade80',
  violet: '#a855f7',
  violetBright: '#c084fc',
  amber: '#facc15',
  magenta: '#ff2d87'
};

// ============================================
// NIVELES — con colores
// ============================================
const LEVELS = {
  facil: {
    id: 'facil',
    label: 'Fácil',
    puzzles: 3,
    clues: 8,
    colorTop: '#86efac',
    colorMid: '#22c55e',
    colorBot: '#15803d',
    colorDeep: '#052e16',
    colorBorder: '#14532d'
  },
  medio: {
    id: 'medio',
    label: 'Medio',
    puzzles: 4,
    clues: 6,
    colorTop: '#fde68a',
    colorMid: '#f59e0b',
    colorBot: '#b45309',
    colorDeep: '#451a03',
    colorBorder: '#78350f'
  },
  dificil: {
    id: 'dificil',
    label: 'Difícil',
    puzzles: 5,
    clues: 5,
    colorTop: '#fca5a5',
    colorMid: '#ef4444',
    colorBot: '#991b1b',
    colorDeep: '#450a0a',
    colorBorder: '#7f1d1d'
  }
};

// ============================================
// SOLUCIONES BASE
// ============================================
const BASE_SOLUTIONS = [
  [[1,2,3,4],[3,4,1,2],[2,1,4,3],[4,3,2,1]],
  [[1,2,3,4],[4,3,2,1],[2,1,4,3],[3,4,1,2]],
  [[4,2,3,1],[3,1,4,2],[2,4,1,3],[1,3,2,4]]
];

// ============================================
// HELPERS
// ============================================
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generatePuzzle(levelId) {
  const level = LEVELS[levelId];
  if (!level) return null;

  const base = BASE_SOLUTIONS[Math.floor(Math.random() * BASE_SOLUTIONS.length)];
  const digits = shuffle([1, 2, 3, 4]);
  const map = { 1: digits[0], 2: digits[1], 3: digits[2], 4: digits[3] };
  const solution = base.map((row) => row.map((v) => map[v]));

  const allPositions = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      allPositions.push([r, c]);
    }
  }
  const shuffledPositions = shuffle(allPositions);
  const revealed = shuffledPositions.slice(0, level.clues);
  const revealedSet = new Set(revealed.map(([r, c]) => `${r}-${c}`));

  const initialGrid = solution.map((row, r) =>
    row.map((v, c) => ({
      value: revealedSet.has(`${r}-${c}`) ? v : null,
      isFixed: revealedSet.has(`${r}-${c}`),
      isWrong: false
    }))
  );

  return { solution, initialGrid };
}

function isValidPlacement(grid, row, col, value) {
  if (!value) return true;

  for (let c = 0; c < 4; c++) {
    if (c !== col && grid[row][c].value === value) return false;
  }
  for (let r = 0; r < 4; r++) {
    if (r !== row && grid[r][col].value === value) return false;
  }
  const startR = Math.floor(row / 2) * 2;
  const startC = Math.floor(col / 2) * 2;
  for (let r = startR; r < startR + 2; r++) {
    for (let c = startC; c < startC + 2; c++) {
      if ((r !== row || c !== col) && grid[r][c].value === value) return false;
    }
  }
  return true;
}

function recomputeWrong(grid) {
  return grid.map((row, r) =>
    row.map((cell, c) => {
      if (cell.isFixed || !cell.value) {
        return { ...cell, isWrong: false };
      }
      return { ...cell, isWrong: !isValidPlacement(grid, r, c, cell.value) };
    })
  );
}

function isGridCompleteAndValid(grid) {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const cell = grid[r][c];
      if (!cell.value) return false;
      if (cell.isWrong) return false;
    }
  }
  return true;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function SudokuGame({ onExit }) {
  const [difficulty, setDifficulty] = useState(null);
  const [gameState, setGameState] = useState('select');

  const [puzzle, setPuzzle] = useState(null);
  const [grid, setGrid] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [hintsLeft, setHintsLeft] = useState(1);
  const [puzzlesSolved, setPuzzlesSolved] = useState(0);
  const [puzzleIndex, setPuzzleIndex] = useState(0);

  const startGame = (levelId, skipTutorial = false) => {
    if (!LEVELS[levelId]) return;
    try { audioService.playPop(); } catch (e) {}

    setDifficulty(levelId);
    setPuzzleIndex(0);
    setPuzzlesSolved(0);
    setSelectedCell(null);

    if (skipTutorial) {
      const p = generatePuzzle(levelId);
      setPuzzle(p);
      setGrid(p.initialGrid);
      setHintsLeft(1);
      setGameState('playing');
    } else {
      setGameState('tutorial');
    }
  };

  const beginPlayAfterTutorial = () => {
    if (!difficulty || !LEVELS[difficulty]) {
      setGameState('select');
      return;
    }
    const p = generatePuzzle(difficulty);
    if (!p) {
      setGameState('select');
      return;
    }
    try { audioService.playPop(); } catch (e) {}
    setPuzzle(p);
    setGrid(p.initialGrid);
    setHintsLeft(1);
    setGameState('playing');
  };

  const handleCellClick = (row, col) => {
    if (gameState !== 'playing') return;
    const cell = grid[row][col];
    if (cell.isFixed) {
      try { audioService.playClick(); } catch (e) {}
      return;
    }
    try { audioService.playClick(); } catch (e) {}
    setSelectedCell({ row, col });
  };

  const handleNumberClick = useCallback(
    (num) => {
      if (gameState !== 'playing' || !selectedCell || !grid) return;
      const { row, col } = selectedCell;
      const cell = grid[row][col];
      if (cell.isFixed) return;

      const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
      newGrid[row][col].value = num;

      const finalGrid = recomputeWrong(newGrid);

      try {
        if (finalGrid[row][col].isWrong) {
          audioService.playError();
        } else {
          audioService.playPop();
        }
      } catch (e) {}

      setGrid(finalGrid);

      if (isGridCompleteAndValid(finalGrid)) {
        setTimeout(() => {
          try { audioService.playSuccess(); } catch (e) {}
          setPuzzlesSolved((s) => s + 1);
          setGameState('puzzleWon');
        }, 250);
      }
    },
    [gameState, selectedCell, grid]
  );

  const handleErase = () => {
    if (gameState !== 'playing' || !selectedCell || !grid) return;
    const { row, col } = selectedCell;
    const cell = grid[row][col];
    if (cell.isFixed || !cell.value) return;

    try { audioService.playClick(); } catch (e) {}
    const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
    newGrid[row][col].value = null;
    newGrid[row][col].isWrong = false;
    setGrid(recomputeWrong(newGrid));
  };

  const handleHint = () => {
    if (gameState !== 'playing' || !grid || !puzzle || hintsLeft <= 0) return;

    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!grid[r][c].value) emptyCells.push([r, c]);
      }
    }
    if (emptyCells.length === 0) return;

    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    try { audioService.playSuccess(); } catch (e) {}

    const newGrid = grid.map((r) => r.map((c) => ({ ...c })));
    newGrid[row][col].value = puzzle.solution[row][col];
    newGrid[row][col].isFixed = true;
    const finalGrid = recomputeWrong(newGrid);

    setGrid(finalGrid);
    setHintsLeft((h) => h - 1);
    setSelectedCell({ row, col });

    if (isGridCompleteAndValid(finalGrid)) {
      setTimeout(() => {
        try { audioService.playSuccess(); } catch (e) {}
        setPuzzlesSolved((s) => s + 1);
        setGameState('puzzleWon');
      }, 400);
    }
  };

  const handleNextPuzzle = () => {
    const level = LEVELS[difficulty];
    const nextIndex = puzzleIndex + 1;

    if (nextIndex >= level.puzzles) {
      setGameState('results');
      return;
    }

    try { audioService.playPop(); } catch (e) {}
    const p = generatePuzzle(difficulty);
    setPuzzle(p);
    setGrid(p.initialGrid);
    setHintsLeft(1);
    setSelectedCell(null);
    setPuzzleIndex(nextIndex);
    setGameState('playing');
  };

  const handleRetryPuzzle = () => {
    if (!puzzle) return;
    setGrid(puzzle.initialGrid.map((r) => r.map((c) => ({ ...c }))));
    setSelectedCell(null);
    setHintsLeft(1);
    setGameState('playing');
  };

  const handleChangeLevel = () => {
    try { audioService.playClick(); } catch (e) {}
    setDifficulty(null);
    setPuzzle(null);
    setGrid(null);
    setSelectedCell(null);
    setGameState('select');
  };

  // ============================================
  // SELECTOR DE NIVEL
  // ============================================
  if (gameState === 'select') {
    return (
      <div className="w-full flex flex-col gap-4 items-center py-6 px-4">
        <img
          src="/games/sudoku.png"
          alt="Sudoku"
          className="w-28 h-28 object-contain mb-2"
          draggable={false}
        />
        <h2
          className="text-3xl font-black text-white"
          style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.1em' }}
        >
          SUDOKU
        </h2>
        <p className="text-xs font-bold text-center mb-4" style={{ color: P.frameHighlight }}>
          Cada fila, columna y cuadrante<br />
          tiene 1, 2, 3 y 4. Sin repetir.
        </p>

        <div className="w-full flex flex-col gap-3">
          {Object.values(LEVELS).map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => startGame(level.id)}
              className="w-full p-4 rounded-2xl flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden"
              style={{
                backgroundImage: 'url(/memoria/fondo.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                border: `3px solid ${level.colorBorder}`,
                boxShadow: `
                  0 5px 0 ${level.colorDeep},
                  inset 0 2px 0 rgba(255,240,200,0.4),
                  inset 0 -3px 0 rgba(0,0,0,0.4)
                `
              }}
            >
              <span
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `linear-gradient(180deg, ${level.colorMid}25 0%, ${level.colorMid}10 100%)`,
                  mixBlendMode: 'overlay'
                }}
              />

              <span
                className="w-14 h-14 rounded-full relative z-10 flex-shrink-0"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${level.colorTop} 0%, ${level.colorMid} 55%, ${level.colorBot} 100%)`,
                  border: `2px solid ${level.colorBorder}`,
                  boxShadow: `
                    inset 0 -4px 8px rgba(0,0,0,0.4),
                    inset 0 4px 8px rgba(255,255,255,0.7),
                    0 3px 10px ${level.colorDeep}90
                  `
                }}
              />

              <div className="flex flex-col flex-1 items-start relative z-10">
                <span
                  className="text-base font-black"
                  style={{
                    color: '#ffffff',
                    textShadow: `0 2px 0 ${level.colorDeep}, 0 3px 8px rgba(0,0,0,0.9)`
                  }}
                >
                  {level.label}
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{
                    color: 'rgba(255,255,255,0.95)',
                    textShadow: '0 1px 3px rgba(0,0,0,0.9)'
                  }}
                >
                  {level.puzzles} puzzles · {level.clues} pistas
                </span>
              </div>

              <span
                className="relative z-10 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${level.colorTop}80 0%, ${level.colorMid}60 100%)`,
                  border: `2px solid ${level.colorBorder}`,
                  boxShadow: `inset 0 -2px 3px rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.4)`
                }}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={{ color: '#ffffff', textShadow: `0 1px 3px ${level.colorDeep}` }}
                >
                  arrow_forward
                </span>
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onExit}
          className="mt-4 px-6 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
          style={{
            background: 'rgba(148, 163, 184, 0.12)',
            color: P.frameHighlight,
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}
        >
          ← Volver al arcade
        </button>
      </div>
    );
  }

  // ============================================
  // TUTORIAL
  // ============================================
  if (gameState === 'tutorial') {
    return (
      <div className="w-full flex flex-col gap-4 items-center py-6 px-4">
        <div className="text-5xl mb-2">📜</div>
        <h2
          className="text-xl font-black text-white text-center"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          ¿Cómo se juega?
        </h2>

        <div
          className="w-full p-5 rounded-3xl flex flex-col items-center gap-4"
          style={{
            background: `linear-gradient(180deg, ${P.frameTop} 0%, ${P.frameMid} 50%, ${P.frameBot} 100%)`,
            border: `3px solid ${P.frameBorder}`,
            boxShadow: `
              0 8px 0 ${P.frameDeep},
              inset 0 3px 0 ${P.frameHighlight},
              inset 0 -4px 0 rgba(0,0,0,0.4)
            `
          }}
        >
          <div
            className="grid grid-cols-4 gap-1 p-2 rounded-xl"
            style={{
              backgroundImage: 'url(/memoria/fondo.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {[
              [1, null, 3, null],
              [null, 4, null, 2],
              [2, null, 4, null],
              [null, 3, null, 1]
            ].map((row, r) =>
              row.map((v, c) => (
                <div
                  key={`${r}-${c}`}
                  className="w-9 h-9 rounded-md flex items-center justify-center font-black text-lg"
                  style={{
                    background: v
                      ? `linear-gradient(180deg, ${P.scrollLight} 0%, ${P.scrollMid} 100%)`
                      : 'rgba(254, 243, 213, 0.4)',
                    border: `1px solid ${P.scrollBorder}`,
                    color: v ? P.ink : 'transparent',
                    fontFamily: 'Georgia, serif'
                  }}
                >
                  {v || ''}
                </div>
              ))
            )}
          </div>
        </div>

        <div
          className="w-full p-3 rounded-xl flex flex-col gap-1"
          style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${P.frameDeep}` }}
        >
          <span className="text-[11px] font-black" style={{ color: P.limeBright }}>
            ✅ Cada fila tiene 1, 2, 3, 4
          </span>
          <span className="text-[11px] font-black" style={{ color: P.limeBright }}>
            ✅ Cada columna tiene 1, 2, 3, 4
          </span>
          <span className="text-[11px] font-black" style={{ color: P.limeBright }}>
            ✅ Cada cuadrante 2×2 tiene 1, 2, 3, 4
          </span>
        </div>

        <p className="text-xs font-bold text-center" style={{ color: P.frameHighlight }}>
          Tocá una celda y elegí el número abajo.
        </p>

        <div className="flex gap-2 w-full mt-2">
          <button
            type="button"
            onClick={handleChangeLevel}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: 'rgba(148, 163, 184, 0.12)',
              color: P.frameHighlight,
              border: '1px solid rgba(148, 163, 184, 0.2)'
            }}
          >
            ← Nivel
          </button>
          <button
            type="button"
            onClick={beginPlayAfterTutorial}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: `linear-gradient(135deg, ${P.violet} 0%, ${P.violetBright} 100%)`,
              color: '#ffffff',
              border: `2px solid ${P.frameDeep}`,
              boxShadow: `0 4px 0 ${P.frameDeep}, 0 0 16px ${P.violet}80`
            }}
          >
            ¡Entendido!
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // JUEGO
  // ============================================
  const level = LEVELS[difficulty];
  if (!level || !grid || !puzzle) {
    return (
      <div className="w-full flex flex-col gap-3 items-center py-8">
        <p className="text-white font-bold">Cargando...</p>
        <button
          type="button"
          onClick={handleChangeLevel}
          className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold"
        >
          Volver
        </button>
      </div>
    );
  }

  const progress = ((puzzleIndex + (gameState === 'puzzleWon' ? 1 : 0)) / level.puzzles) * 100;

  return (
    <div className="w-full flex flex-col gap-3 select-none">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleChangeLevel}
          className="px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer active:scale-95 transition-all"
          style={{
            background: 'rgba(168, 85, 247, 0.15)',
            color: P.violetBright,
            border: '1px solid rgba(168, 85, 247, 0.5)'
          }}
        >
          ← Nivel
        </button>

        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 rounded-full text-[10px] font-black"
            style={{
              background: 'rgba(168, 85, 247, 0.15)',
              color: P.violetBright,
              border: '1px solid rgba(168, 85, 247, 0.5)'
            }}
          >
            Puzzle {puzzleIndex + 1}/{level.puzzles}
          </span>
          {hintsLeft > 0 && (
            <span
              className="px-2 py-1 rounded-full text-[10px] font-black"
              style={{
                background: 'rgba(250, 204, 21, 0.15)',
                color: '#fde047',
                border: '1px solid rgba(250, 204, 21, 0.4)'
              }}
            >
              💡 {hintsLeft}
            </span>
          )}
        </div>
      </div>

      {/* Barra progreso */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(148, 163, 184, 0.15)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${P.violet} 0%, ${P.violetBright} 100%)`,
            boxShadow: `0 0 10px ${P.violet}80`
          }}
        />
      </div>

      <p
        className="text-center text-xs font-black"
        style={{ color: P.frameHighlight, fontFamily: 'Georgia, serif' }}
      >
        Completá el Sudoku
      </p>

      {/* Marco violeta + fondo de madera + celdas de papiro */}
      <div className="w-full flex items-center justify-center">
        <div
          className="p-3 rounded-3xl"
          style={{
            background: `linear-gradient(180deg, ${P.frameTop} 0%, ${P.frameMid} 50%, ${P.frameBot} 100%)`,
            border: `3px solid ${P.frameBorder}`,
            boxShadow: `
              0 8px 0 ${P.frameDeep},
              inset 0 3px 0 ${P.frameHighlight},
              inset 0 -4px 0 rgba(0,0,0,0.4),
              0 12px 32px rgba(0,0,0,0.6),
              0 0 40px ${P.violet}60
            `,
            width: '100%',
            maxWidth: '340px',
            aspectRatio: '1 / 1'
          }}
        >
          {/* Fondo de madera */}
          <div
            className="grid grid-cols-4 rounded-2xl overflow-hidden relative"
            style={{
              backgroundImage: 'url(/memoria/fondo.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              width: '100%',
              height: '100%',
              padding: '8px',
              gap: '4px'
            }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const isSelected =
                  selectedCell && selectedCell.row === r && selectedCell.col === c;

                const isQuadrantTop = r === 2;
                const isQuadrantLeft = c === 2;

                // Colores de la celda — papiro como el logo
                let bg;
                let borderColor = P.scrollBorder;
                let shadowInside = 'inset 0 2px 3px rgba(139, 111, 71, 0.2), inset 0 -2px 3px rgba(255,255,255,0.5)';

                if (cell.isWrong) {
                  bg = `linear-gradient(180deg, #fee2e2 0%, #fca5a5 100%)`;
                  borderColor = '#b91c1c';
                  shadowInside = 'inset 0 2px 6px rgba(185, 28, 28, 0.4)';
                } else if (isSelected) {
                  bg = `linear-gradient(180deg, #dbeafe 0%, #93c5fd 100%)`;
                  borderColor = '#1d4ed8';
                  shadowInside = 'inset 0 2px 6px rgba(29, 78, 216, 0.4)';
                } else if (cell.isFixed) {
                  bg = `linear-gradient(180deg, ${P.scrollMid} 0%, ${P.scrollDark} 100%)`;
                } else {
                  bg = `linear-gradient(180deg, ${P.scrollLight} 0%, ${P.scrollMid} 100%)`;
                }

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleCellClick(r, c)}
                    disabled={cell.isFixed}
                    className="rounded-md flex items-center justify-center transition-all select-none active:scale-95"
                    style={{
                      aspectRatio: '1 / 1',
                      background: bg,
                      borderTopWidth: isQuadrantTop ? '3px' : '1.5px',
                      borderLeftWidth: isQuadrantLeft ? '3px' : '1.5px',
                      borderRightWidth: '1.5px',
                      borderBottomWidth: '1.5px',
                      borderStyle: 'solid',
                      borderColor,
                      boxShadow: shadowInside,
                      cursor: cell.isFixed ? 'default' : 'pointer'
                    }}
                  >
                    {cell.value ? (
                      <span
                        className="font-black"
                        style={{
                          fontSize: 'clamp(24px, 7vw, 34px)',
                          color: cell.isWrong ? '#991b1b' : P.ink,
                          fontFamily: 'Georgia, serif',
                          lineHeight: 1
                        }}
                      >
                        {cell.value}
                      </span>
                    ) : (
                      <span
                        className="font-black"
                        style={{
                          fontSize: 'clamp(20px, 6vw, 26px)',
                          color: P.ink,
                          opacity: 0.35,
                          fontFamily: 'Georgia, serif',
                          lineHeight: 1
                        }}
                      >
                        ?
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Botones de números — estilo papiro */}
      <div className="flex justify-center gap-3 mt-1">
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => handleNumberClick(n)}
            disabled={!selectedCell}
            className="w-16 h-16 rounded-xl flex items-center justify-center font-black transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(180deg, ${P.scrollLight} 0%, ${P.scrollMid} 100%)`,
              border: `2px solid ${P.scrollBorder}`,
              boxShadow: `
                inset 0 3px 6px rgba(255,255,255,0.7),
                inset 0 -4px 6px rgba(139, 111, 71, 0.3),
                0 4px 0 ${P.scrollDeep}
              `
            }}
          >
            <span
              style={{
                fontSize: '30px',
                color: P.ink,
                fontFamily: 'Georgia, serif',
                lineHeight: 1
              }}
            >
              {n}
            </span>
          </button>
        ))}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-center gap-2 mt-2">
        <button
          type="button"
          onClick={handleErase}
          disabled={!selectedCell}
          className="px-4 py-2 rounded-xl font-black text-xs cursor-pointer active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          style={{
            background: 'rgba(255, 45, 135, 0.15)',
            color: '#ff2d87',
            border: '1.5px solid rgba(255, 45, 135, 0.4)'
          }}
        >
          <span className="material-symbols-outlined text-[16px]">backspace</span>
          <span>Borrar</span>
        </button>

        <button
          type="button"
          onClick={handleHint}
          disabled={hintsLeft <= 0}
          className="px-4 py-2 rounded-xl font-black text-xs cursor-pointer active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          style={{
            background: 'rgba(250, 204, 21, 0.15)',
            color: '#fbbf24',
            border: '1.5px solid rgba(250, 204, 21, 0.4)'
          }}
        >
          <span className="material-symbols-outlined text-[16px]">lightbulb</span>
          <span>Pista ({hintsLeft})</span>
        </button>
      </div>

      {/* Modal puzzle ganado */}
      {gameState === 'puzzleWon' && (
        <PuzzleWonModal
          isLast={puzzleIndex + 1 >= level.puzzles}
          puzzleNumber={puzzleIndex + 1}
          totalPuzzles={level.puzzles}
          onNext={handleNextPuzzle}
          onRetry={handleRetryPuzzle}
        />
      )}

      {/* Modal resultados finales */}
      {gameState === 'results' && (
        <ResultsModal
          level={level}
          onRetry={() => startGame(difficulty, true)}
          onChangeLevel={handleChangeLevel}
          onExit={onExit}
        />
      )}
    </div>
  );
}

// ============================================
// MODAL PUZZLE GANADO
// ============================================
function PuzzleWonModal({ isLast, puzzleNumber, totalPuzzles, onNext, onRetry }) {
  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-sm p-6 rounded-3xl flex flex-col items-center text-center"
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #08081a 100%)',
          border: `2px solid ${P.violetBright}`,
          boxShadow: `0 0 40px ${P.violet}80`
        }}
      >
        <span className="text-6xl mb-3">📜</span>
        <h2
          className="text-2xl font-black text-white mb-2"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {isLast ? '¡Puzzle final resuelto!' : '¡Puzzle resuelto!'}
        </h2>
        <p className="text-sm font-bold mb-4" style={{ color: P.frameHighlight }}>
          {isLast
            ? 'Terminaste todos los puzzles. ¡Sos un crack!'
            : `Puzzle ${puzzleNumber} de ${totalPuzzles} completado`}
        </p>

        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: 'rgba(148, 163, 184, 0.12)',
              color: P.frameHighlight,
              border: '1px solid rgba(148, 163, 184, 0.2)'
            }}
          >
            Otra vez
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: `linear-gradient(135deg, ${P.violet} 0%, ${P.violetBright} 100%)`,
              color: '#ffffff',
              boxShadow: `0 0 16px ${P.violet}80`
            }}
          >
            {isLast ? 'Ver resultados →' : 'Siguiente puzzle →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MODAL RESULTADOS FINALES
// ============================================
function ResultsModal({ level, onRetry, onChangeLevel, onExit }) {
  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-sm p-6 rounded-3xl flex flex-col items-center text-center"
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #08081a 100%)',
          border: `2px solid ${P.violetBright}`,
          boxShadow: `0 0 40px ${P.violet}80`
        }}
      >
        <span className="text-6xl mb-3">🏆</span>
        <h2
          className="text-2xl font-black text-white mb-2"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          ¡Sesión completada!
        </h2>
        <p className="text-sm font-bold mb-4" style={{ color: P.frameHighlight }}>
          Resolviste los {level.puzzles} puzzles de nivel {level.label}
        </p>

        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: `linear-gradient(135deg, ${P.violet} 0%, ${P.violetBright} 100%)`,
              color: '#ffffff',
              boxShadow: `0 0 16px ${P.violet}80`
            }}
          >
            Otra sesión
          </button>
          <button
            type="button"
            onClick={onChangeLevel}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: P.cyanBright,
              border: `1.5px solid ${P.cyan}60`
            }}
          >
            Cambiar nivel
          </button>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="mt-3 text-[11px] font-black cursor-pointer active:scale-95 transition-all"
          style={{ color: P.frameHighlight }}
        >
          Salir al arcade
        </button>
      </div>
    </div>
  );
}