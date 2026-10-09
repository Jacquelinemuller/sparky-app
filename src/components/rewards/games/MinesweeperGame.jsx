import React, { useState, useCallback } from 'react';
import { audioService } from '../../../services/audioService';

// ============================================
// PALETA METÁLICA
// ============================================
const M = {
  frameTop: '#e5e7eb',
  frameMid: '#9ca3af',
  frameBot: '#4b5563',
  frameBorder: '#1f2937',
  frameHighlight: 'rgba(255,255,255,0.6)',

  tileTop: '#e5e7eb',
  tileMid: '#b8bcc2',
  tileBot: '#7a7e85',
  tileHighlight: 'rgba(255,255,255,0.8)',

  revealedBg: '#2a2d33',
  revealedBgDeep: '#14161a',
  revealedBorder: '#0a0a0d',

  num1: '#3b82f6',
  num2: '#22c55e',
  num3: '#f97316',
  num4: '#ef4444',

  bg: '#09090f',
  card: '#131322',
  cyan: '#06b6d4',
  cyanBright: '#38bdf8',
  limeBright: '#4ade80',
  text: '#ffffff',
  textMuted: '#94a3b8'
};

// ============================================
// NIVELES
// ============================================
const LEVELS = {
  facil:   { size: 5, mines: 3,  shields: 1, label: 'Fácil',   emoji: '🟢' },
  medio:   { size: 7, mines: 6,  shields: 1, label: 'Medio',   emoji: '🟡' },
  dificil: { size: 9, mines: 12, shields: 0, label: 'Difícil', emoji: '🔴' }
};

// ============================================
// HELPERS
// ============================================
function createEmptyBoard(size) {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => ({
      row, col, revealed: false, flagged: false, mine: false, adjacent: 0
    }))
  );
}

function plantMines(board, mineCount, safeRow, safeCol) {
  const size = board.length;
  const candidates = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue;
      candidates.push({ r, c });
    }
  }
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  for (let i = 0; i < mineCount && i < candidates.length; i++) {
    newBoard[candidates[i].r][candidates[i].c].mine = true;
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (newBoard[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
          if (newBoard[nr][nc].mine) count++;
        }
      }
      newBoard[r][c].adjacent = count;
    }
  }
  return newBoard;
}

function floodFill(board, row, col) {
  const size = board.length;
  const newBoard = board.map((r) => r.map((c) => ({ ...c })));
  const stack = [[row, col]];
  const revealedCells = [];
  while (stack.length > 0) {
    const [r, c] = stack.pop();
    if (r < 0 || r >= size || c < 0 || c >= size) continue;
    const cell = newBoard[r][c];
    if (cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    revealedCells.push({ r, c });
    if (cell.adjacent === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          stack.push([r + dr, c + dc]);
        }
      }
    }
  }
  return { board: newBoard, revealedCells };
}

function checkWin(board) {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.mine && !cell.revealed) return false;
    }
  }
  return true;
}

function countFlags(board) {
  let count = 0;
  for (const row of board) for (const cell of row) if (cell.flagged) count++;
  return count;
}

function countRevealed(board) {
  let count = 0;
  for (const row of board) for (const cell of row) if (cell.revealed) count++;
  return count;
}

function countSafeCells(board) {
  let count = 0;
  for (const row of board) for (const cell of row) if (!cell.mine) count++;
  return count;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function MinesweeperGame({ onExit }) {
  const [difficulty, setDifficulty] = useState(null);
  const [board, setBoard] = useState(null);
  const [gameState, setGameState] = useState('select');
  const [mode, setMode] = useState('reveal');
  const [shields, setShields] = useState(0);
  const [firstTap, setFirstTap] = useState(true);

  const startGame = (levelKey) => {
    try { audioService.playPop(); } catch (e) {}
    const level = LEVELS[levelKey];
    setDifficulty(levelKey);
    setBoard(createEmptyBoard(level.size));
    setShields(level.shields);
    setFirstTap(true);
    setMode('reveal');
    setGameState('playing');
  };

  const handleCellClick = useCallback(
    (row, col) => {
      if (gameState !== 'playing' || !board || !difficulty) return;
      const level = LEVELS[difficulty];
      const cell = board[row][col];
      if (cell.revealed) return;

      if (mode === 'flag') {
        if (cell.revealed) return;
        try { audioService.playClick(); } catch (e) {}
        const newBoard = board.map((r) => r.map((c) => ({ ...c })));
        newBoard[row][col].flagged = !newBoard[row][col].flagged;
        setBoard(newBoard);
        return;
      }

      if (cell.flagged) return;

      let currentBoard = board;
      if (firstTap) {
        currentBoard = plantMines(board, level.mines, row, col);
        setFirstTap(false);
      }

      if (currentBoard[row][col].mine) {
        if (shields > 0) {
          try { audioService.playError(); } catch (e) {}
          try { audioService.playTone(660, 0.12); } catch (e) {}
          setTimeout(() => { try { audioService.playTone(440, 0.18); } catch (e) {} }, 100);
          const newBoard = currentBoard.map((r) => r.map((c) => ({ ...c })));
          newBoard[row][col].revealed = true;
          newBoard[row][col].mine = false;
          newBoard[row][col].shielded = true;
          const size = newBoard.length;
          for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
              if (newBoard[r][c].mine) continue;
              let count = 0;
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  if (dr === 0 && dc === 0) continue;
                  const nr = r + dr, nc = c + dc;
                  if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
                  if (newBoard[nr][nc].mine) count++;
                }
              }
              newBoard[r][c].adjacent = count;
            }
          }
          setShields(shields - 1);
          setBoard(newBoard);
          setGameState('shielded');
          setTimeout(() => setGameState('playing'), 1200);
          return;
        } else {
          try { audioService.playError(); } catch (e) {}
          const newBoard = currentBoard.map((r) => r.map((c) => ({ ...c })));
          newBoard[row][col].revealed = true;
          for (let r = 0; r < newBoard.length; r++) {
            for (let c = 0; c < newBoard.length; c++) {
              if (newBoard[r][c].mine) newBoard[r][c].revealed = true;
            }
          }
          setBoard(newBoard);
          setGameState('lost');
          return;
        }
      }

      const { board: newBoard, revealedCells } = floodFill(currentBoard, row, col);
      revealedCells.slice(0, 12).forEach((_, i) => {
        setTimeout(() => { try { audioService.playPop(); } catch (e) {} }, i * 30);
      });
      setBoard(newBoard);
      if (checkWin(newBoard)) {
        setTimeout(() => { try { audioService.playSuccess(); } catch (e) {} }, 200);
        setGameState('won');
      }
    },
    [board, difficulty, gameState, mode, firstTap, shields]
  );

  const handleRetry = () => {
    if (!difficulty) return;
    startGame(difficulty);
  };

  const handleChangeLevel = () => {
    try { audioService.playClick(); } catch (e) {}
    setDifficulty(null);
    setBoard(null);
    setGameState('select');
  };

  // ============================================
  // SELECTOR DE NIVEL
  // ============================================
  if (gameState === 'select') {
    return <LevelSelector onSelect={startGame} onExit={onExit} />;
  }

  const level = LEVELS[difficulty];
  const safeCells = countSafeCells(board);
  const revealedCount = countRevealed(board);
  const flagCount = countFlags(board);
  const progress = Math.min(100, Math.round((revealedCount / safeCells) * 100));

  // ============================================
  // JUEGO
  // ============================================
  return (
    <div className="w-full flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleChangeLevel}
          className="px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer active:scale-95 transition-all"
          style={{
            background: 'rgba(148, 163, 184, 0.12)',
            color: M.textMuted,
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}
        >
          ← Nivel
        </button>

        <div className="flex items-center gap-2">
          {shields > 0 && (
            <span
              className="px-2 py-1 rounded-full text-[10px] font-black flex items-center gap-1"
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                color: M.limeBright,
                border: `1px solid ${M.limeBright}60`
              }}
            >
              🛡️ {shields}
            </span>
          )}
          <span
            className="px-2 py-1 rounded-full text-[10px] font-black"
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: M.cyanBright,
              border: '1px solid rgba(6, 182, 212, 0.4)'
            }}
          >
            {level.emoji} {level.label}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div
        className="w-full px-3 py-2 rounded-xl flex items-center justify-between"
        style={{
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.25)'
        }}
      >
        <span className="text-[11px] font-black" style={{ color: M.textMuted }}>
          🔍 {revealedCount}/{safeCells}
        </span>
        <span className="text-[11px] font-black" style={{ color: M.textMuted }}>
          🚩 {flagCount}
        </span>
        <span className="text-[11px] font-black" style={{ color: M.cyanBright }}>
          {progress}%
        </span>
      </div>

      {/* Barra progreso */}
      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(148, 163, 184, 0.15)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${M.cyan} 0%, ${M.limeBright} 100%)`,
            boxShadow: `0 0 10px ${M.cyan}80`
          }}
        />
      </div>

      <p className="text-center text-xs font-black" style={{ color: M.textMuted }}>
        Encontrá las minas sin pisarlas
      </p>

      {/* Tablero */}
      <BoardView
        board={board}
        size={level.size}
        mode={mode}
        onCellClick={handleCellClick}
        disabled={gameState !== 'playing'}
      />

      {/* Toggle modo + reset */}
      <div className="flex items-center justify-between gap-2 mt-2">
        <div
          className="flex-1 p-1 rounded-2xl flex items-center gap-1"
          style={{
            background: M.card,
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}
        >
          <button
            type="button"
            onClick={() => { try { audioService.playClick(); } catch (e) {} setMode('reveal'); }}
            className="flex-1 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1"
            style={
              mode === 'reveal'
                ? {
                    background: `linear-gradient(135deg, ${M.cyan} 0%, ${M.cyanBright} 100%)`,
                    color: '#000',
                    boxShadow: `0 0 12px ${M.cyan}60`
                  }
                : { color: M.textMuted }
            }
          >
            <span>🔍</span>
            <span>Descubrir</span>
          </button>
          <button
            type="button"
            onClick={() => { try { audioService.playClick(); } catch (e) {} setMode('flag'); }}
            className="flex-1 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1"
            style={
              mode === 'flag'
                ? {
                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                    color: '#fff',
                    boxShadow: '0 0 12px rgba(239, 68, 68, 0.6)'
                  }
                : { color: M.textMuted }
            }
          >
            <span>🚩</span>
            <span>Marcar</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleRetry}
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl cursor-pointer active:scale-95 transition-all"
          style={{
            background: M.card,
            border: '1px solid rgba(255, 45, 135, 0.4)',
            color: '#ff2d87'
          }}
          title="Reiniciar ronda"
        >
          🔄
        </button>
      </div>

      {/* Modales de estado */}
      {gameState === 'shielded' && (
        <div
          className="fixed inset-0 z-[220] flex items-center justify-center p-4 pointer-events-none"
          style={{ background: 'rgba(16, 185, 129, 0.15)' }}
        >
          <div
            className="px-5 py-3 rounded-2xl flex items-center gap-3"
            style={{
              background: 'rgba(19, 19, 34, 0.95)',
              border: `2px solid ${M.limeBright}`,
              boxShadow: `0 0 32px ${M.limeBright}80`
            }}
          >
            <span className="text-2xl">🛡️</span>
            <span className="font-black text-sm" style={{ color: M.limeBright }}>
              ¡Sparky te cubrió!
            </span>
          </div>
        </div>
      )}

      {gameState === 'won' && (
        <ResultModal
          type="won"
          stats={{ revealed: revealedCount, total: safeCells }}
          onRetry={handleRetry}
          onChangeLevel={handleChangeLevel}
          onExit={onExit}
        />
      )}

      {gameState === 'lost' && (
        <ResultModal
          type="lost"
          stats={{ revealed: revealedCount, total: safeCells }}
          onRetry={handleRetry}
          onChangeLevel={handleChangeLevel}
          onExit={onExit}
        />
      )}
    </div>
  );
}

// ============================================
// SELECTOR DE NIVEL
// ============================================
function LevelSelector({ onSelect, onExit }) {
  return (
    <div className="w-full flex flex-col gap-4 items-center py-6 px-4">
      <img
        src="/games/buscaminas.png"
        alt="Buscaminas"
        className="w-24 h-24 object-contain mb-2"
        draggable={false}
      />
      <h2 className="text-2xl font-black text-white">Buscaminas</h2>
      <p className="text-xs font-bold text-center mb-4" style={{ color: M.textMuted }}>
        Tocá las casillas para descubrir el campo.<br />
        Cuidado con las minas 💣
      </p>

      <div className="w-full flex flex-col gap-2.5">
        {Object.entries(LEVELS).map(([key, level]) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className="w-full p-4 rounded-2xl flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
            style={{
              background: `linear-gradient(180deg, ${M.frameTop} 0%, ${M.frameMid} 60%, ${M.frameBot} 100%)`,
              border: `2px solid ${M.frameBorder}`,
              boxShadow: `
                0 4px 0 ${M.frameBorder},
                inset 0 2px 0 ${M.frameHighlight},
                inset 0 -3px 0 rgba(0,0,0,0.3)
              `
            }}
          >
            <span
              className="text-3xl w-12 h-12 flex items-center justify-center rounded-full"
              style={{
                background: 'rgba(255,255,255,0.4)',
                border: '2px solid rgba(0,0,0,0.15)',
                boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.8)'
              }}
            >
              {level.emoji}
            </span>
            <div className="flex flex-col flex-1 items-start">
              <span className="text-sm font-black" style={{ color: '#1f2937' }}>
                {level.label}
              </span>
              <span className="text-[10px] font-bold" style={{ color: '#374151' }}>
                {level.size}×{level.size} · {level.mines} minas
                {level.shields > 0 ? ` · 🛡️ ${level.shields}` : ' · sin escudo'}
              </span>
            </div>
            <span className="material-symbols-outlined text-[20px]" style={{ color: '#1f2937' }}>
              arrow_forward
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
          color: M.textMuted,
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}
      >
        ← Volver al arcade
      </button>
    </div>
  );
}

// ============================================
// TABLERO CON MADERA INTERIOR — MARCO CUADRADO
// ============================================
function BoardView({ board, size, mode, onCellClick, disabled }) {
  return (
    <div className="w-full flex items-center justify-center">
      <div
        className="p-3 rounded-none"
        style={{
          background: `linear-gradient(180deg, ${M.frameTop} 0%, ${M.frameMid} 50%, ${M.frameBot} 100%)`,
          border: `3px solid ${M.frameBorder}`,
          boxShadow: `
            0 8px 0 ${M.frameBorder},
            inset 0 3px 0 ${M.frameHighlight},
            inset 0 -4px 0 rgba(0,0,0,0.35),
            0 12px 32px rgba(0,0,0,0.6)
          `,
          width: '100%',
          maxWidth: size <= 5 ? '320px' : size <= 7 ? '360px' : '400px',
          aspectRatio: '1 / 1'
        }}
      >
        <div
          className="grid rounded-none overflow-hidden relative"
          style={{
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            background: '#1a1d22',
            width: '100%',
            height: '100%',
            boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.85)',
            padding: '6px',
            gap: '3px',
            border: '1px solid #0a0a0d'
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <Cell
                key={`${r}-${c}`}
                cell={cell}
                onPress={() => onCellClick(r, c)}
                mode={mode}
                disabled={disabled}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
// ============================================
// CELDA — Ficha metálica cuadrada
// ============================================
function Cell({ cell, onPress, mode, disabled }) {
  const isRevealed = cell.revealed;
  const isFlagged = cell.flagged;
  const isMine = cell.mine;
  const isShielded = cell.shielded;

  const getNumberColor = (n) => {
    if (n === 1) return M.num1;
    if (n === 2) return M.num2;
    if (n === 3) return M.num3;
    return M.num4;
  };

  let content = null;
  if (isRevealed && isShielded) {
    content = <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>🛡️</span>;
  } else if (isRevealed && isMine) {
    content = (
      <span
        style={{
          fontSize: '1.4rem',
          lineHeight: 1,
          filter: 'drop-shadow(0 2px 4px rgba(255, 45, 135, 0.8)) drop-shadow(0 0 12px rgba(255, 45, 135, 0.6))'
        }}
      >
        💣
      </span>
    );
  } else if (isRevealed && cell.adjacent > 0) {
    content = (
      <span
        className="font-black"
        style={{
          fontSize: 'clamp(14px, 4vw, 22px)',
          color: getNumberColor(cell.adjacent),
          textShadow: `0 1px 0 rgba(255,255,255,0.6), 0 2px 4px rgba(0,0,0,0.4)`,
          fontWeight: 900,
          letterSpacing: '-0.02em'
        }}
      >
        {cell.adjacent}
      </span>
    );
  } else if (isFlagged) {
    content = (
      <span
        style={{
          fontSize: '1.3rem',
          lineHeight: 1,
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.5))'
        }}
      >
        🚩
      </span>
    );
  }

  let background, border, boxShadow, opacity;

  if (isRevealed && isShielded) {
    background = 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)';
    border = '2px solid #052e16';
    boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.4)';
    opacity = 1;
  } else if (isRevealed && isMine) {
    background = 'linear-gradient(180deg, #dc2626 0%, #7f1d1d 100%)';
    border = '2px solid #450a0a';
    boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.7), 0 0 12px rgba(239, 68, 68, 0.8)';
    opacity = 1;
  } else if (isRevealed) {
    background = `radial-gradient(circle at 50% 50%, ${M.revealedBg} 0%, ${M.revealedBgDeep} 100%)`;
    border = `2px solid ${M.revealedBorder}`;
    boxShadow = 'inset 0 2px 6px rgba(0,0,0,0.9)';
    opacity = 1;
  } else if (isFlagged) {
    background = 'linear-gradient(180deg, #fca5a5 0%, #b91c1c 100%)';
    border = `2px solid ${M.frameBorder}`;
    boxShadow = `
      inset 0 2px 0 rgba(255,255,255,0.5),
      inset 0 -3px 0 rgba(0,0,0,0.3),
      0 3px 0 ${M.frameBorder}
    `;
    opacity = 1;
  } else {
    background = `linear-gradient(180deg, ${M.tileTop} 0%, ${M.tileMid} 50%, ${M.tileBot} 100%)`;
    border = `2px solid ${M.frameBorder}`;
    boxShadow = `
      inset 0 2px 0 ${M.tileHighlight},
      inset 0 -3px 0 rgba(0,0,0,0.3),
      0 3px 0 ${M.frameBorder}
    `;
    opacity = 1;
  }

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled || (isRevealed && !isMine && !isShielded)}
      className="rounded-none flex items-center justify-center transition-all select-none"
      style={{
        background,
        border,
        boxShadow,
        opacity,
        aspectRatio: '1 / 1',
        cursor: disabled || (isRevealed && !isMine && !isShielded) ? 'default' : 'pointer',
        padding: 0,
        animation: isRevealed ? 'cellReveal 0.2s ease-out' : 'none',
        transform: 'translateY(0)',
        transition: 'all 0.08s ease-out'
      }}
      onMouseDown={(e) => {
        if (disabled || isRevealed) return;
        e.currentTarget.style.transform = 'translateY(2px)';
        e.currentTarget.style.boxShadow = `
          inset 0 2px 0 rgba(255,255,255,0.2),
          inset 0 -1px 0 rgba(0,0,0,0.4),
          0 1px 0 ${M.frameBorder}
        `;
      }}
      onMouseUp={(e) => {
        if (disabled || isRevealed) return;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isFlagged
          ? `inset 0 2px 0 rgba(255,255,255,0.5), inset 0 -3px 0 rgba(0,0,0,0.3), 0 3px 0 ${M.frameBorder}`
          : `inset 0 2px 0 ${M.tileHighlight}, inset 0 -3px 0 rgba(0,0,0,0.3), 0 3px 0 ${M.frameBorder}`;
      }}
      onMouseLeave={(e) => {
        if (disabled || isRevealed) return;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {content}
      <style>{`
        @keyframes cellReveal {
          from { transform: scale(0.85); opacity: 0.6; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </button>
  );
}

// ============================================
// MODAL DE RESULTADO
// ============================================
function ResultModal({ type, stats, onRetry, onChangeLevel, onExit }) {
  const isWon = type === 'won';

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-sm p-6 rounded-3xl flex flex-col items-center text-center"
        style={{
          background: `linear-gradient(180deg, ${M.card} 0%, #08081a 100%)`,
          border: `2px solid ${isWon ? M.limeBright : '#ff2d87'}`,
          boxShadow: `0 0 40px ${isWon ? M.limeBright : '#ff2d87'}80`
        }}
      >
        <span className="text-6xl mb-3">{isWon ? '🎉' : '💥'}</span>

        <h2 className="text-2xl font-black text-white mb-2">
          {isWon ? '¡Ganaste!' : '¡Boom!'}
        </h2>

        <p className="text-sm font-bold mb-4" style={{ color: M.textMuted }}>
          {isWon
            ? 'Encontraste todas las casillas seguras'
            : 'Pisaste una mina. Otra ronda y la próxima sale'}
        </p>

        <div
          className="w-full p-3 rounded-2xl mb-4 flex items-center justify-center gap-3"
          style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)'
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-lg font-black" style={{ color: M.cyanBright }}>
              {stats.revealed}
            </span>
            <span className="text-[9px] font-black" style={{ color: M.textMuted }}>
              descubiertas
            </span>
          </div>
          <span className="text-xs" style={{ color: M.textMuted }}>/</span>
          <div className="flex flex-col items-center">
            <span className="text-lg font-black" style={{ color: M.limeBright }}>
              {stats.total}
            </span>
            <span className="text-[9px] font-black" style={{ color: M.textMuted }}>
              seguras
            </span>
          </div>
        </div>

        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: `linear-gradient(135deg, #22c55e 0%, ${M.limeBright} 100%)`,
              color: '#000',
              boxShadow: `0 0 16px #22c55e80`
            }}
          >
            Otra ronda
          </button>
          <button
            type="button"
            onClick={onChangeLevel}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: M.cyanBright,
              border: `1.5px solid ${M.cyan}60`
            }}
          >
            Cambiar nivel
          </button>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="mt-3 text-[11px] font-black cursor-pointer active:scale-95 transition-all"
          style={{ color: M.textMuted }}
        >
          Salir al arcade
        </button>
      </div>
    </div>
  );
}