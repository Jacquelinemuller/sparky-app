import React, { useState, useRef, useCallback } from 'react';
import { useApp } from '../../../context/AppContext';
import { audioService } from '../../../services/audioService';

// ============================================
// COLORES ARCADE
// ============================================
const C = {
  bg: '#09090f',
  card: '#131322',
  wall: '#38bdf8',
  wallBright: '#7dd3fc',
  path: 'rgba(6, 182, 212, 0.06)',
  fog: 'rgba(0, 0, 0, 0.88)',
  player: '#facc15',
  sparky: '#22c55e',
  limeBright: '#4ade80',
  cyan: '#06b6d4',
  cyanBright: '#38bdf8',
  magenta: '#ff2d87',
  amber: '#facc15',
  amberBright: '#fde047',
  text: '#ffffff',
  textMuted: '#94a3b8'
};

// ============================================
// NIVELES
// ============================================
const LEVELS = {
  facil:   { size: 7,  label: 'Fácil',   emoji: '🟢', visionRadius: 3 },
  medio:   { size: 10, label: 'Medio',   emoji: '🟡', visionRadius: 3 },
  dificil: { size: 13, label: 'Difícil', emoji: '🔴', visionRadius: 2 }
};

// ============================================
// GENERACIÓN DEL LABERINTO (DFS)
// ============================================
function generateMaze(size) {
  const grid = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({
      top: true,
      right: true,
      bottom: true,
      left: true,
      visited: false
    }))
  );

  const stack = [[0, 0]];
  grid[0][0].visited = true;

  const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1];
    const neighbors = [];

    if (r > 0 && !grid[r - 1][c].visited) neighbors.push([r - 1, c, 'top']);
    if (r < size - 1 && !grid[r + 1][c].visited) neighbors.push([r + 1, c, 'bottom']);
    if (c > 0 && !grid[r][c - 1].visited) neighbors.push([r, c - 1, 'left']);
    if (c < size - 1 && !grid[r][c + 1].visited) neighbors.push([r, c + 1, 'right']);

    if (neighbors.length === 0) {
      stack.pop();
      continue;
    }

    const [nr, nc, dir] = neighbors[Math.floor(Math.random() * neighbors.length)];
    grid[r][c][dir] = false;
    grid[nr][nc][opposite[dir]] = false;
    grid[nr][nc].visited = true;
    stack.push([nr, nc]);
  }

  grid.forEach((row) => row.forEach((cell) => { delete cell.visited; }));
  return grid;
}

// ============================================
// HELPERS DE MOVIMIENTO
// ============================================
function canMove(grid, row, col, direction) {
  const size = grid.length;
  if (row < 0 || row >= size || col < 0 || col >= size) return false;
  const cell = grid[row][col];
  if (cell[direction]) return false;

  let nr = row, nc = col;
  if (direction === 'top') nr--;
  if (direction === 'bottom') nr++;
  if (direction === 'left') nc--;
  if (direction === 'right') nc++;

  return nr >= 0 && nr < size && nc >= 0 && nc < size;
}

function movePosition(row, col, direction) {
  if (direction === 'top') return [row - 1, col];
  if (direction === 'bottom') return [row + 1, col];
  if (direction === 'left') return [row, col - 1];
  if (direction === 'right') return [row, col + 1];
  return [row, col];
}

function manhattan(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function MazeGame({ onExit }) {
  const [difficulty, setDifficulty] = useState(null);
  const [grid, setGrid] = useState(null);
  const [playerPos, setPlayerPos] = useState([0, 0]);
  const [gameState, setGameState] = useState('select');
  const [fogEnabled, setFogEnabled] = useState(false);
  const [steps, setSteps] = useState(0);

  const touchStartRef = useRef(null);
  const exitPos = useRef(null);

  const startGame = (levelKey, keepFog = null) => {
    try { audioService.playPop(); } catch (e) {}

    const level = LEVELS[levelKey];
    const newGrid = generateMaze(level.size);
    const exit = [level.size - 1, level.size - 1];

    setDifficulty(levelKey);
    setGrid(newGrid);
    setPlayerPos([0, 0]);
    setSteps(0);
    exitPos.current = exit;
    if (keepFog !== null) setFogEnabled(keepFog);
    setGameState('playing');
  };

  const tryMove = useCallback(
    (direction) => {
      if (gameState !== 'playing' || !grid) return;

      const [r, c] = playerPos;

      if (!canMove(grid, r, c, direction)) {
        try { audioService.playError(); } catch (e) {}
        return;
      }

      const [nr, nc] = movePosition(r, c, direction);

      try { audioService.playClick(); } catch (e) {}
      setPlayerPos([nr, nc]);
      setSteps((s) => s + 1);

      const exit = exitPos.current;
      if (nr === exit[0] && nc === exit[1]) {
        setTimeout(() => {
          try { audioService.playSuccess(); } catch (e) {}
          try { audioService.playBark(); } catch (e) {}
        }, 150);
        setGameState('won');
      }
    },
    [gameState, grid, playerPos]
  );

  const handleTouchStart = (e) => {
    if (gameState !== 'playing') return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  };

  const handleTouchEnd = (e) => {
    if (gameState !== 'playing') return;
    const start = touchStartRef.current;
    if (!start) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    const minDist = 25;
    if (Math.abs(dx) < minDist && Math.abs(dy) < minDist) {
      touchStartRef.current = null;
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      tryMove(dx > 0 ? 'right' : 'left');
    } else {
      tryMove(dy > 0 ? 'bottom' : 'top');
    }

    touchStartRef.current = null;
  };

  const handleCellTap = (row, col) => {
    if (gameState !== 'playing') return;

    const [pr, pc] = playerPos;
    const dr = row - pr;
    const dc = col - pc;
    const isAdjacent = Math.abs(dr) + Math.abs(dc) === 1;
    if (!isAdjacent) return;

    if (dr === -1 && dc === 0) tryMove('top');
    else if (dr === 1 && dc === 0) tryMove('bottom');
    else if (dr === 0 && dc === -1) tryMove('left');
    else if (dr === 0 && dc === 1) tryMove('right');
  };

  const handleRetry = () => {
    if (!difficulty) return;
    startGame(difficulty, fogEnabled);
  };

  const handleChangeLevel = () => {
    try { audioService.playClick(); } catch (e) {}
    setDifficulty(null);
    setGrid(null);
    setGameState('select');
  };

  // ============================================
  // SELECTOR DE NIVEL
  // ============================================
  if (gameState === 'select') {
    return (
      <div className="w-full flex flex-col gap-4 items-center py-6 px-4">
        <div className="text-5xl mb-2">🌀</div>
        <h2 className="text-2xl font-black text-white">Laberinto</h2>
        <p className="text-xs font-bold text-center mb-4" style={{ color: C.textMuted }}>
          Sparky se perdió. Encontralo.<br />
          Tocá o deslizá para moverte.
        </p>

        <div className="w-full flex flex-col gap-2.5">
          {Object.entries(LEVELS).map(([key, level]) => (
            <button
              key={key}
              type="button"
              onClick={() => startGame(key)}
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
                  {level.size}×{level.size} casillas
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
  // JUEGO
  // ============================================
  const level = LEVELS[difficulty];
  const size = level.size;
  const exit = exitPos.current;
  const distanceToExit = manhattan(playerPos, exit);

  return (
    <div className="w-full flex flex-col gap-3 select-none">
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
          <button
            type="button"
            onClick={() => {
              try { audioService.playPop(); } catch (e) {}
              setFogEnabled((v) => !v);
            }}
            className="px-3 py-1.5 rounded-xl text-[10px] font-black cursor-pointer active:scale-95 transition-all flex items-center gap-1"
            style={{
              background: fogEnabled ? `${C.magenta}22` : 'rgba(148, 163, 184, 0.12)',
              color: fogEnabled ? C.magenta : C.textMuted,
              border: `1px solid ${fogEnabled ? C.magenta + '80' : 'rgba(148, 163, 184, 0.2)'}`
            }}
          >
            <span>{fogEnabled ? '🌫️' : '👁️'}</span>
            <span>{fogEnabled ? 'Niebla' : 'Sin niebla'}</span>
          </button>

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

      <div
        className="w-full px-3 py-2 rounded-xl flex items-center justify-between"
        style={{
          background: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.25)'
        }}
      >
        <span className="text-[11px] font-black" style={{ color: C.limeBright }}>
          🐶 Ayudá a Sparky a salir
        </span>
        <span className="text-[10px] font-black" style={{ color: C.textMuted }}>
          A {distanceToExit} pasos
        </span>
      </div>

      <div
        className="w-full flex items-center justify-center touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <MazeView
          grid={grid}
          size={size}
          playerPos={playerPos}
          exitPos={exit}
          fogEnabled={fogEnabled}
          visionRadius={level.visionRadius}
          onCellTap={handleCellTap}
          gameState={gameState}
        />
      </div>

      <div className="flex items-center justify-center gap-2 mt-2">
        <button
          type="button"
          onClick={handleRetry}
          className="px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
          style={{
            background: C.card,
            border: '1px solid rgba(255, 45, 135, 0.4)',
            color: C.magenta
          }}
        >
          <span>🔄</span>
          <span>Reiniciar</span>
        </button>
      </div>

      <p className="text-center text-[10px] font-bold" style={{ color: C.textMuted }}>
        👆 Tocá la celda de al lado o deslizá el dedo
      </p>

      {gameState === 'won' && (
        <VictoryModal
          steps={steps}
          onRetry={handleRetry}
          onChangeLevel={handleChangeLevel}
          onExit={onExit}
        />
      )}
    </div>
  );
}

// ============================================
// VISTA DEL LABERINTO
// ============================================
function MazeView({
  grid,
  size,
  playerPos,
  exitPos,
  fogEnabled,
  visionRadius,
  onCellTap,
  gameState
}) {
  const { userAvatar } = useApp();
  const [pr, pc] = playerPos;
  const [er, ec] = exitPos;

  const isCellVisible = (r, c) => {
    if (!fogEnabled) return true;
    return manhattan([r, c], playerPos) <= visionRadius;
  };

  const wallSize = size <= 7 ? '3px' : size <= 10 ? '2.5px' : '2px';
  const avatarSize = size <= 7 ? '26px' : size <= 10 ? '20px' : '16px';

  return (
    <div
      className="grid p-2 rounded-2xl"
      style={{
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        background: C.card,
        border: '1.5px solid rgba(6, 182, 212, 0.25)',
        width: '100%',
        maxWidth: size <= 7 ? '340px' : size <= 10 ? '370px' : '400px',
        aspectRatio: '1 / 1',
        gap: 0
      }}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const isPlayer = pr === r && pc === c;
          const isExit = er === r && ec === c;
          const visible = isCellVisible(r, c);
          const isAdjacent =
            gameState === 'playing' &&
            Math.abs(r - pr) + Math.abs(c - pc) === 1;

          return (
            <button
              key={`${r}-${c}`}
              type="button"
              onClick={() => onCellTap(r, c)}
              disabled={gameState !== 'playing' || !isAdjacent}
              className="relative flex items-center justify-center transition-all"
              style={{
                aspectRatio: '1 / 1',
                background: isPlayer
                  ? 'rgba(250, 204, 21, 0.18)'
                  : isExit
                  ? 'rgba(34, 197, 94, 0.18)'
                  : visible
                  ? C.path
                  : C.fog,
                borderTop: cell.top ? `${wallSize} solid ${C.wall}` : `${wallSize} solid transparent`,
                borderRight: cell.right ? `${wallSize} solid ${C.wall}` : `${wallSize} solid transparent`,
                borderBottom: cell.bottom ? `${wallSize} solid ${C.wall}` : `${wallSize} solid transparent`,
                borderLeft: cell.left ? `${wallSize} solid ${C.wall}` : `${wallSize} solid transparent`,
                cursor: isAdjacent ? 'pointer' : 'default',
                opacity: visible ? 1 : 0.35,
                transition: 'background 0.15s, opacity 0.2s'
              }}
            >
              {isPlayer && (
                <img
                  src={userAvatar}
                  alt="Vos"
                  onError={(e) => { e.target.src = '/favicon.png'; }}
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: `2px solid ${C.amber}`,
                    boxShadow: `0 0 10px ${C.amber}`,
                    animation: 'playerBob 1s ease-in-out infinite',
                    pointerEvents: 'none'
                  }}
                  draggable={false}
                />
              )}
              {isExit && !isPlayer && (
                <img
                  src="/favicon.png"
                  alt="Sparky"
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    objectFit: 'cover',
                    borderRadius: '50%',
                    border: `2px solid ${C.limeBright}`,
                    boxShadow: `0 0 10px ${C.limeBright}`,
                    animation: 'sparkyBounce 1.2s ease-in-out infinite',
                    pointerEvents: 'none'
                  }}
                  draggable={false}
                />
              )}
              {isAdjacent && !isPlayer && !isExit && (
                <span
                  className="absolute inset-0"
                  style={{
                    background: 'rgba(250, 204, 21, 0.08)',
                    pointerEvents: 'none'
                  }}
                />
              )}
            </button>
          );
        })
      )}

      <style>{`
        @keyframes playerBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes sparkyBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}

// ============================================
// MODAL DE VICTORIA
// ============================================
function VictoryModal({ steps, onRetry, onChangeLevel, onExit }) {
  React.useEffect(() => {
    let mounted = true;
    import('canvas-confetti').then((mod) => {
      if (!mounted) return;
      try {
        mod.default({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#facc15', '#22c55e', '#38bdf8', '#ff2d87']
        });
      } catch (e) {}
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-sm p-6 rounded-3xl flex flex-col items-center text-center"
        style={{
          background: `linear-gradient(180deg, ${C.card} 0%, #08081a 100%)`,
          border: `2px solid ${C.limeBright}`,
          boxShadow: `0 0 40px ${C.limeBright}80`
        }}
      >
        <img
          src="/favicon.png"
          alt="Sparky"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: `3px solid ${C.limeBright}`,
            boxShadow: `0 0 24px ${C.limeBright}`,
            marginBottom: 12,
            objectFit: 'cover'
          }}
        />

        <h2 className="text-2xl font-black text-white mb-2">
          ¡Encontraste a Sparky!
        </h2>

        <p className="text-sm font-bold mb-4" style={{ color: C.textMuted }}>
          Lo lograste en <span style={{ color: C.limeBright }}>{steps}</span> pasos
        </p>

        <div
          className="w-full p-3 rounded-2xl mb-4 flex items-center gap-2 justify-center"
          style={{
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}
        >
          <span className="text-base">🐾</span>
          <span className="text-[11px] font-black" style={{ color: C.limeBright }}>
            ¡Guau! ¡Me salvaste!
          </span>
        </div>

        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
            style={{
              background: `linear-gradient(135deg, ${C.limeBright} 0%, ${C.cyanBright} 100%)`,
              color: '#000',
              boxShadow: `0 0 16px ${C.limeBright}80`
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