import React, { useState, useCallback } from 'react';
import { audioService } from '../../../services/audioService';

// ============================================
// COLORES ARCADE
// ============================================
const C = {
  bg: '#09090f',
  card: '#131322',
  cardBack: '#1e1e36',
  cardBackBorder: '#2a2a4a',
  revealed: '#0f0f1e',
  lime: '#22c55e',
  limeBright: '#4ade80',
  cyan: '#06b6d4',
  cyanBright: '#38bdf8',
  magenta: '#ff2d87',
  amber: '#facc15',
  amberBright: '#fde047',
  violet: '#8b5cf6',
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
      row,
      col,
      revealed: false,
      flagged: false,
      mine: false,
      adjacent: 0
    }))
  );
}

function plantMines(board, mineCount, safeRow, safeCol) {
  const size = board.length;
  const candidates = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Excluir la celda segura y sus 8 vecinas (garantiza primer toque seguro)
      if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue;
      candidates.push({ r, c });
    }
  }

  // Fisher-Yates shuffle
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

  for (let i = 0; i < mineCount && i < candidates.length; i++) {
    newBoard[candidates[i].r][candidates[i].c].mine = true;
  }

  // Calcular adyacentes
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (newBoard[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
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
  for (const row of board) {
    for (const cell of row) {
      if (cell.flagged) count++;
    }
  }
  return count;
}

function countRevealed(board) {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.revealed) count++;
    }
  }
  return count;
}

function countSafeCells(board) {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (!cell.mine) count++;
    }
  }
  return count;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function MinesweeperGame({ onExit }) {
  const [difficulty, setDifficulty] = useState(null);
  const [board, setBoard] = useState(null);
  const [gameState, setGameState] = useState('select'); // 'select' | 'playing' | 'won' | 'lost' | 'shielded'
  const [mode, setMode] = useState('reveal'); // 'reveal' | 'flag'
  const [shields, setShields] = useState(0);
  const [firstTap, setFirstTap] = useState(true);

  // ============================================
  // INICIAR JUEGO
  // ============================================
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

  // ============================================
  // CLICK EN CELDA
  // ============================================
  const handleCellClick = useCallback(
    (row, col) => {
      if (gameState !== 'playing' || !board || !difficulty) return;

      const level = LEVELS[difficulty];
      const cell = board[row][col];

      if (cell.revealed) return;

      // MODO BANDERA
      if (mode === 'flag') {
        if (cell.revealed) return;
        try { audioService.playClick(); } catch (e) {}
        const newBoard = board.map((r) => r.map((c) => ({ ...c })));
        newBoard[row][col].flagged = !newBoard[row][col].flagged;
        setBoard(newBoard);
        return;
      }

      // MODO DESCUBRIR
      if (cell.flagged) return;

      let currentBoard = board;

      // Primer toque: plantar las minas
      if (firstTap) {
        currentBoard = plantMines(board, level.mines, row, col);
        setFirstTap(false);
      }

      // Tocar una mina
      if (currentBoard[row][col].mine) {
        if (shields > 0) {
          // Usar escudo
          try { audioService.playError(); } catch (e) {}
          try { audioService.playTone(660, 0.12); } catch (e) {}
          setTimeout(() => {
            try { audioService.playTone(440, 0.18); } catch (e) {}
          }, 100);

          const newBoard = currentBoard.map((r) => r.map((c) => ({ ...c })));
          newBoard[row][col].revealed = true;
          newBoard[row][col].mine = false; // Neutralizar esa mina
          newBoard[row][col].shielded = true;

          // Recalcular adyacentes (la mina ya no cuenta)
          const size = newBoard.length;
          for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
              if (newBoard[r][c].mine) continue;
              let count = 0;
              for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                  if (dr === 0 && dc === 0) continue;
                  const nr = r + dr;
                  const nc = c + dc;
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
          // Perder
          try { audioService.playError(); } catch (e) {}

          const newBoard = currentBoard.map((r) => r.map((c) => ({ ...c })));
          newBoard[row][col].revealed = true;

          // Revelar todas las minas restantes
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

      // Celda segura: revelar con flood fill
      const { board: newBoard, revealedCells } = floodFill(
        currentBoard,
        row,
        col
      );

      // Sonidos en cascada (cada 30ms)
      revealedCells.slice(0, 12).forEach((_, i) => {
        setTimeout(() => {
          try { audioService.playPop(); } catch (e) {}
        }, i * 30);
      });

      setBoard(newBoard);

      // Verificar victoria
      if (checkWin(newBoard)) {
        setTimeout(() => {
          try { audioService.playSuccess(); } catch (e) {}
        }, 200);
        setGameState('won');
      }
    },
    [board, difficulty, gameState, mode, firstTap, shields]
  );

  // ============================================
  // RESET / OTRA RONDA
  // ============================================
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
  // RENDER
  // ============================================
  if (gameState === 'select') {
    return (
      <LevelSelector
        onSelect={startGame}
        onExit={onExit}
      />
    );
  }

  const level = LEVELS[difficulty];
  const safeCells = countSafeCells(board);
  const revealedCount = countRevealed(board);
  const flagCount = countFlags(board);
  const progress = Math.min(100, Math.round((revealedCount / safeCells) * 100));

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header del juego */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleChangeLevel}
          className="px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer active:scale-95 transition-all"
          style={{
            background: 'rgba(148, 163, 184, 0.12)',
            color: C.textMuted,
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
                color: C.limeBright,
                border: `1px solid ${C.lime}60`
              }}
            >
              🛡️ {shields}
            </span>
          )}
          <span
            className="px-2 py-1 rounded-full text-[10px] font-black"
            style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: C.cyanBright,
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
        <span className="text-[11px] font-black" style={{ color: C.textMuted }}>
          🔍 {revealedCount}/{safeCells}
        </span>
        <span className="text-[11px] font-black" style={{ color: C.textMuted }}>
          🚩 {flagCount}
        </span>
        <span className="text-[11px] font-black" style={{ color: C.cyanBright }}>
          {progress}%
        </span>
      </div>

      {/* Barra de progreso */}
      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ background: 'rgba(148, 163, 184, 0.15)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${C.cyan} 0%, ${C.limeBright} 100%)`,
            boxShadow: `0 0 10px ${C.cyan}80`
          }}
        />
      </div>

      {/* Título */}
      <p className="text-center text-xs font-black" style={{ color: C.textMuted }}>
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
            background: C.card,
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}
        >
          <button
            type="button"
            onClick={() => {
              try { audioService.playClick(); } catch (e) {}
              setMode('reveal');
            }}
            className="flex-1 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1"
            style={
              mode === 'reveal'
                ? {
                    background: `linear-gradient(135deg, ${C.cyan} 0%, ${C.cyanBright} 100%)`,
                    color: '#000',
                    boxShadow: `0 0 12px ${C.cyan}60`
                  }
                : { color: C.textMuted }
            }
          >
            <span>🔍</span>
            <span>Descubrir</span>
          </button>
          <button
            type="button"
            onClick={() => {
              try { audioService.playClick(); } catch (e) {}
              setMode('flag');
            }}
            className="flex-1 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1"
            style={
              mode === 'flag'
                ? {
                    background: `linear-gradient(135deg, ${C.amber} 0%, ${C.amberBright} 100%)`,
                    color: '#000',
                    boxShadow: `0 0 12px ${C.amber}60`
                  }
                : { color: C.textMuted }
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
            background: C.card,
            border: '1px solid rgba(255, 45, 135, 0.4)',
            color: C.magenta
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
              border: `2px solid ${C.limeBright}`,
              boxShadow: `0 0 32px ${C.lime}80`
            }}
          >
            <span className="text-2xl">🛡️</span>
            <span className="font-black text-sm" style={{ color: C.limeBright }}>
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
      <div className="text-5xl mb-2">💣</div>
      <h2 className="text-2xl font-black text-white">Buscaminas</h2>
      <p className="text-xs font-bold text-center mb-4" style={{ color: C.textMuted }}>
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
              background: C.card,
              border: `1.5px solid ${C.cyan}40`
            }}
          >
            <span className="text-3xl">{level.emoji}</span>
            <div className="flex flex-col flex-1 items-start">
              <span className="text-sm font-black text-white">{level.label}</span>
              <span className="text-[10px] font-bold" style={{ color: C.textMuted }}>
                {level.size}×{level.size} · {level.mines} minas
                {level.shields > 0 ? ` · 🛡️ ${level.shields}` : ' · sin escudo'}
              </span>
            </div>
            <span className="material-symbols-outlined text-[20px]" style={{ color: C.cyanBright }}>
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
          color: C.textMuted,
          border: '1px solid rgba(148, 163, 184, 0.2)'
        }}
      >
        ← Volver al arcade
      </button>
    </div>
  );
}

// ============================================
// TABLERO
// ============================================
function BoardView({ board, size, mode, onCellClick, disabled }) {
  return (
    <div
      className="w-full flex items-center justify-center"
      style={{ touchAction: 'manipulation' }}
    >
      <div
        className="grid gap-1 p-2 rounded-2xl"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`,
          background: C.card,
          border: '1.5px solid rgba(6, 182, 212, 0.2)',
          width: '100%',
          maxWidth: size <= 5 ? '320px' : size <= 7 ? '360px' : '400px',
          aspectRatio: '1 / 1'
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
  );
}

// ============================================
// CELDA
// ============================================
function Cell({ cell, onPress, mode, disabled }) {
  const isRevealed = cell.revealed;
  const isFlagged = cell.flagged;
  const isMine = cell.mine;
  const isShielded = cell.shielded;

  // Color del número
  const getNumberColor = (n) => {
    if (n === 1) return C.cyanBright;
    if (n === 2) return C.amberBright;
    if (n === 3) return C.magenta;
    return C.violet;
  };

  // Contenido
  let content = null;
  if (isRevealed && isShielded) {
    content = <span className="text-lg">🛡️</span>;
  } else if (isRevealed && isMine) {
    content = <span className="text-lg">💥</span>;
  } else if (isRevealed && cell.adjacent > 0) {
    content = (
      <span
        className="text-base font-black"
        style={{ color: getNumberColor(cell.adjacent) }}
      >
        {cell.adjacent}
      </span>
    );
  } else if (isFlagged) {
    content = <span className="text-base">🚩</span>;
  }

  // Fondo
  let background = C.cardBack;
  let borderColor = C.cardBackBorder;
  if (isRevealed && isShielded) {
    background = 'rgba(34, 197, 94, 0.25)';
    borderColor = C.lime;
  } else if (isRevealed && isMine) {
    background = 'rgba(255, 45, 135, 0.25)';
    borderColor = C.magenta;
  } else if (isRevealed) {
    background = C.revealed;
    borderColor = 'rgba(148, 163, 184, 0.15)';
  } else if (isFlagged) {
    background = 'rgba(250, 204, 21, 0.15)';
    borderColor = `${C.amber}80`;
  }

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled || (isRevealed && !isMine && !isShielded)}
      className="rounded-lg flex items-center justify-center transition-all cursor-pointer active:scale-90 select-none"
      style={{
        background,
        border: `1.5px solid ${borderColor}`,
        aspectRatio: '1 / 1',
        animation: isRevealed ? 'cellReveal 0.15s ease-out' : 'none'
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
          background: `linear-gradient(180deg, ${C.card} 0%, #08081a 100%)`,
          border: `2px solid ${isWon ? C.limeBright : C.magenta}`,
          boxShadow: `0 0 40px ${isWon ? C.lime : C.magenta}80`
        }}
      >
        <span className="text-6xl mb-3">{isWon ? '🎉' : '💥'}</span>

        <h2 className="text-2xl font-black text-white mb-2">
          {isWon ? '¡Ganaste!' : '¡Boom!'}
        </h2>

        <p className="text-sm font-bold mb-4" style={{ color: C.textMuted }}>
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
            <span className="text-lg font-black" style={{ color: C.cyanBright }}>
              {stats.revealed}
            </span>
            <span className="text-[9px] font-black" style={{ color: C.textMuted }}>
              descubiertas
            </span>
          </div>
          <span className="text-xs" style={{ color: C.textMuted }}>/</span>
          <div className="flex flex-col items-center">
            <span className="text-lg font-black" style={{ color: C.limeBright }}>
              {stats.total}
            </span>
            <span className="text-[9px] font-black" style={{ color: C.textMuted }}>
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
              background: `linear-gradient(135deg, ${C.lime} 0%, ${C.limeBright} 100%)`,
              color: '#000',
              boxShadow: `0 0 16px ${C.lime}80`
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
              color: C.cyanBright,
              border: `1.5px solid ${C.cyan}60`
            }}
          >
            Cambiar nivel
          </button>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="mt-3 text-[11px] font-black cursor-pointer active:scale-95 transition-all"
          style={{ color: C.textMuted }}
        >
          Salir al arcade
        </button>
      </div>
    </div>
  );
}