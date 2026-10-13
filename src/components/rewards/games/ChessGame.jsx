import React, { useState, useMemo, useCallback } from 'react';
import { audioService } from '../../../services/audioService';

// ============================================
// PALETA — Madera + dorado
// ============================================
const C = {
  frameTop: '#fde68a',
  frameMid: '#f59e0b',
  frameBot: '#b45309',
  frameDeep: '#78350f',
  frameBorder: '#451a03',
  frameHighlight: 'rgba(255,255,220,0.7)',

  boardLight: '#f0d4a8',
  boardDark: '#8b5a2b',
  boardBorder: '#3d1f08',

  highlightSelected: 'rgba(56, 189, 248, 0.55)',
  highlightMove: 'rgba(74, 222, 128, 0.55)',
  highlightCapture: 'rgba(239, 68, 68, 0.55)',
  highlightCheck: 'rgba(239, 68, 68, 0.75)',
  highlightLastMove: 'rgba(251, 191, 36, 0.4)',

  white: '#fef3d5',
  whiteShade: '#c8956d',
  black: '#2e1a0a',
  blackShade: '#1a0a04',

  text: '#ffffff',
  textMuted: '#e8d5b5',
  green: '#22c55e',
  greenBright: '#4ade80',
  cyan: '#06b6d4',
  cyanBright: '#38bdf8',
  amber: '#facc15',
  red: '#ef4444',
  violet: '#a855f7'
};

// ============================================
// PIEZAS
// ============================================
// Tipos: 'K' rey, 'Q' reina, 'R' torre, 'B' alfil, 'N' caballo, 'P' peón
// Colores: 'w' blancas, 'b' negras

// ============================================
// ESTADO INICIAL DEL TABLERO
// ============================================
function createInitialBoard() {
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));

  // Piezas negras (arriba)
  board[0] = [
    { type: 'R', color: 'b' }, { type: 'N', color: 'b' },
    { type: 'B', color: 'b' }, { type: 'Q', color: 'b' },
    { type: 'K', color: 'b' }, { type: 'B', color: 'b' },
    { type: 'N', color: 'b' }, { type: 'R', color: 'b' }
  ];
  for (let c = 0; c < 8; c++) board[1][c] = { type: 'P', color: 'b' };

  // Piezas blancas (abajo)
  board[7] = [
    { type: 'R', color: 'w' }, { type: 'N', color: 'w' },
    { type: 'B', color: 'w' }, { type: 'Q', color: 'w' },
    { type: 'K', color: 'w' }, { type: 'B', color: 'w' },
    { type: 'N', color: 'w' }, { type: 'R', color: 'w' }
  ];
  for (let c = 0; c < 8; c++) board[6][c] = { type: 'P', color: 'w' };

  return board;
}

function isValidPos(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function cloneBoard(board) {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

// ============================================
// MOVIMIENTOS POR PIEZA (sin validar jaque)
// ============================================
function getPseudoMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];

  const moves = [];
  const color = piece.color;
  const enemy = color === 'w' ? 'b' : 'w';

  const addMove = (r, c) => {
    if (!isValidPos(r, c)) return false;
    const target = board[r][c];
    if (!target) {
      moves.push({ row: r, col: c, capture: false });
      return true;
    }
    if (target.color === enemy) {
      moves.push({ row: r, col: c, capture: true });
    }
    return false;
  };

  const addRay = (dr, dc) => {
    let r = row + dr;
    let c = col + dc;
    while (isValidPos(r, c)) {
      const target = board[r][c];
      if (!target) {
        moves.push({ row: r, col: c, capture: false });
      } else {
        if (target.color === enemy) {
          moves.push({ row: r, col: c, capture: true });
        }
        break;
      }
      r += dr;
      c += dc;
    }
  };

  switch (piece.type) {
    case 'P': {
      const dir = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;

      // Avance simple
      if (isValidPos(row + dir, col) && !board[row + dir][col]) {
        moves.push({ row: row + dir, col, capture: false });
        // Avance doble desde la posición inicial
        if (row === startRow && !board[row + 2 * dir][col]) {
          moves.push({ row: row + 2 * dir, col, capture: false });
        }
      }
      // Capturas diagonales
      [-1, 1].forEach((dc) => {
        const nr = row + dir;
        const nc = col + dc;
        if (isValidPos(nr, nc)) {
          const target = board[nr][nc];
          if (target && target.color === enemy) {
            moves.push({ row: nr, col: nc, capture: true });
          }
        }
      });
      break;
    }
    case 'N': {
      const jumps = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      jumps.forEach(([dr, dc]) => addMove(row + dr, col + dc));
      break;
    }
    case 'B': {
      addRay(-1, -1);
      addRay(-1, 1);
      addRay(1, -1);
      addRay(1, 1);
      break;
    }
    case 'R': {
      addRay(-1, 0);
      addRay(1, 0);
      addRay(0, -1);
      addRay(0, 1);
      break;
    }
    case 'Q': {
      addRay(-1, -1);
      addRay(-1, 1);
      addRay(1, -1);
      addRay(1, 1);
      addRay(-1, 0);
      addRay(1, 0);
      addRay(0, -1);
      addRay(0, 1);
      break;
    }
    case 'K': {
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
      ];
      dirs.forEach(([dr, dc]) => addMove(row + dr, col + dc));
      break;
    }
  }

  return moves;
}

// ============================================
// LÓGICA DE JAQUE
// ============================================
function findKing(board, color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'K' && p.color === color) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

function isSquareAttacked(board, row, col, byColor) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== byColor) continue;
      const moves = getPseudoMoves(board, r, c);
      if (moves.some((m) => m.row === row && m.col === col)) return true;
    }
  }
  return false;
}

function isInCheck(board, color) {
  const king = findKing(board, color);
  if (!king) return false;
  const enemy = color === 'w' ? 'b' : 'w';
  return isSquareAttacked(board, king.row, king.col, enemy);
}

// ============================================
// MOVIMIENTOS LEGALES (filtrando auto-jaque)
// ============================================
function getLegalMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];

  const pseudo = getPseudoMoves(board, row, col);

  return pseudo.filter((move) => {
    const testBoard = cloneBoard(board);
    testBoard[move.row][move.col] = testBoard[row][col];
    testBoard[row][col] = null;
    return !isInCheck(testBoard, piece.color);
  });
}

function hasAnyLegalMove(board, color) {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== color) continue;
      if (getLegalMoves(board, r, c).length > 0) return true;
    }
  }
  return false;
}

// ============================================
// IA BÁSICA (nivel fácil)
// ============================================
const PIECE_VALUE = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 100 };

function getAllMoves(board, color) {
  const all = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p || p.color !== color) continue;
      const moves = getLegalMoves(board, r, c);
      moves.forEach((m) => all.push({ from: { row: r, col: c }, to: m }));
    }
  }
  return all;
}

function getAIMove(board, color) {
  const all = getAllMoves(board, color);
  if (all.length === 0) return null;

  // Priorizar capturas de mayor valor
  const captures = all.filter((m) => {
    const target = board[m.to.row][m.to.col];
    return target && target.color !== color;
  });

  if (captures.length > 0) {
    // Elegir la captura de mayor valor
    let best = captures[0];
    let bestValue = 0;
    captures.forEach((m) => {
      const target = board[m.to.row][m.to.col];
      const val = PIECE_VALUE[target.type] || 0;
      if (val > bestValue) {
        bestValue = val;
        best = m;
      }
    });
    return best;
  }

  // Si no hay capturas, elegir al azar
  return all[Math.floor(Math.random() * all.length)];
}

// ============================================
// SVG DE CADA PIEZA
// ============================================
function PieceSVG({ type, color, size = 44 }) {
  const isWhite = color === 'w';
  const fill = isWhite ? C.white : C.black;
  const stroke = isWhite ? C.whiteShade : C.blackShade;
  const accent = isWhite ? C.whiteShade : '#0a0500';

  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 100 100',
    xmlns: 'http://www.w3.org/2000/svg'
  };

  const baseStroke = {
    stroke: accent,
    strokeWidth: 3,
    strokeLinejoin: 'round',
    strokeLinecap: 'round'
  };

  switch (type) {
    case 'P': // Peón
      return (
        <svg {...commonProps}>
          <circle cx="50" cy="35" r="14" fill={fill} {...baseStroke} />
          <path
            d="M 38 45 Q 50 55 62 45 L 66 78 Q 50 84 34 78 Z"
            fill={fill}
            {...baseStroke}
          />
          <rect x="28" y="80" width="44" height="10" rx="3" fill={fill} {...baseStroke} />
        </svg>
      );

    case 'R': // Torre
      return (
        <svg {...commonProps}>
          <path
            d="M 28 22 L 34 22 L 34 30 L 40 30 L 40 22 L 46 22 L 46 30 L 54 30 L 54 22 L 60 22 L 60 30 L 66 30 L 66 22 L 72 22 L 72 40 L 28 40 Z"
            fill={fill}
            {...baseStroke}
          />
          <path
            d="M 32 42 L 68 42 L 66 72 Q 50 78 34 72 Z"
            fill={fill}
            {...baseStroke}
          />
          <rect x="26" y="76" width="48" height="10" rx="3" fill={fill} {...baseStroke} />
        </svg>
      );

    case 'N': // Caballo
      return (
        <svg {...commonProps}>
          <path
            d="M 62 22 Q 72 24 74 36 Q 76 46 72 56 L 68 78 Q 50 84 34 78 L 38 60 L 30 62 Q 26 58 30 52 L 42 42 L 40 32 Q 44 26 52 24 Q 58 22 62 22 Z M 58 30 Q 56 32 56 35 Q 58 34 60 34 Z"
            fill={fill}
            {...baseStroke}
          />
          <circle cx="56" cy="33" r="2" fill={accent} />
          <rect x="26" y="80" width="48" height="8" rx="3" fill={fill} {...baseStroke} />
        </svg>
      );

    case 'B': // Alfil
      return (
        <svg {...commonProps}>
          <circle cx="50" cy="20" r="7" fill={fill} {...baseStroke} />
          <path
            d="M 50 26 Q 60 34 62 48 L 58 70 L 42 70 L 38 48 Q 40 34 50 26 Z"
            fill={fill}
            {...baseStroke}
          />
          <rect x="30" y="72" width="40" height="10" rx="3" fill={fill} {...baseStroke} />
          <line x1="46" y1="45" x2="46" y2="62" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
          <line x1="54" y1="45" x2="54" y2="62" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'Q': // Reina
      return (
        <svg {...commonProps}>
          <circle cx="50" cy="15" r="5" fill={fill} {...baseStroke} />
          <path
            d="M 22 32 L 28 24 L 36 32 L 44 22 L 50 30 L 56 22 L 64 32 L 72 24 L 78 32 L 72 62 L 28 62 Z"
            fill={fill}
            {...baseStroke}
          />
          <path
            d="M 30 64 L 70 64 L 68 78 Q 50 84 32 78 Z"
            fill={fill}
            {...baseStroke}
          />
          <rect x="24" y="80" width="52" height="9" rx="3" fill={fill} {...baseStroke} />
        </svg>
      );

    case 'K': // Rey
      return (
        <svg {...commonProps}>
          <line x1="50" y1="8" x2="50" y2="22" stroke={fill} strokeWidth="5" strokeLinecap="round" />
          <line x1="42" y1="15" x2="58" y2="15" stroke={fill} strokeWidth="5" strokeLinecap="round" />
          <path
            d="M 24 30 L 32 22 L 40 30 L 50 20 L 60 30 L 68 22 L 76 30 L 70 62 L 30 62 Z"
            fill={fill}
            {...baseStroke}
          />
          <path
            d="M 30 64 L 70 64 L 68 78 Q 50 84 32 78 Z"
            fill={fill}
            {...baseStroke}
          />
          <rect x="24" y="80" width="52" height="9" rx="3" fill={fill} {...baseStroke} />
        </svg>
      );

    default:
      return null;
  }
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function ChessGame({ onExit }) {
  const [gameState, setGameState] = useState('select');
  // 'select' | 'playing' | 'results'
  const [mode, setMode] = useState(null); // '2p' | 'ai'
  const [difficulty, setDifficulty] = useState('facil'); // por ahora siempre facil

  const [board, setBoard] = useState(createInitialBoard);
  const [turn, setTurn] = useState('w');
  const [selected, setSelected] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [checkSquare, setCheckSquare] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [winner, setWinner] = useState(null);

  const [capturedByWhite, setCapturedByWhite] = useState([]);
  const [capturedByBlack, setCapturedByBlack] = useState([]);

  const [aiThinking, setAiThinking] = useState(false);

  // ============================================
  // INICIAR PARTIDA
  // ============================================
  const startGame = (selectedMode) => {
    try { audioService.playPop(); } catch (e) {}
    setMode(selectedMode);
    setBoard(createInitialBoard());
    setTurn('w');
    setSelected(null);
    setLegalMoves([]);
    setLastMove(null);
    setCheckSquare(null);
    setStatusMessage('');
    setWinner(null);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setAiThinking(false);
    setGameState('playing');
  };

  // ============================================
  // APLICAR MOVIMIENTO
  // ============================================
  const applyMove = useCallback(
    (from, to) => {
      setBoard((prevBoard) => {
        const newBoard = cloneBoard(prevBoard);
        const piece = newBoard[from.row][from.col];
        const captured = newBoard[to.row][to.col];

        newBoard[to.row][to.col] = piece;
        newBoard[from.row][from.col] = null;

        if (captured) {
          if (piece.color === 'w') {
            setCapturedByWhite((prev) => [...prev, captured.type]);
          } else {
            setCapturedByBlack((prev) => [...prev, captured.type]);
          }
          try { audioService.playSuccess(); } catch (e) {}
        } else {
          try { audioService.playClick(); } catch (e) {}
        }

        // Verificar estado después del movimiento
        const nextTurn = piece.color === 'w' ? 'b' : 'w';
        setTurn(nextTurn);
        setSelected(null);
        setLegalMoves([]);
        setLastMove({ from, to });

        // ¿Jaque?
        const inCheck = isInCheck(newBoard, nextTurn);
        const hasMoves = hasAnyLegalMove(newBoard, nextTurn);

        if (!hasMoves) {
          if (inCheck) {
            // Jaque mate
            setWinner(piece.color);
            setTimeout(() => {
              try { audioService.playSuccess(); } catch (e) {}
              try { audioService.playBark(); } catch (e) {}
              setGameState('results');
            }, 500);
          } else {
            // Ahogado (tablas)
            setWinner('draw');
            setTimeout(() => {
              try { audioService.playSuccess(); } catch (e) {}
              setGameState('results');
            }, 500);
          }
        } else if (inCheck) {
          const king = findKing(newBoard, nextTurn);
          setCheckSquare(king);
          setStatusMessage('¡Jaque!');
        } else {
          setCheckSquare(null);
          setStatusMessage('');
        }

        return newBoard;
      });
    },
    []
  );

  // ============================================
  // TURNO DE LA IA
  // ============================================
  React.useEffect(() => {
    if (gameState !== 'playing') return;
    if (mode !== 'ai') return;
    if (turn !== 'b') return;
    if (winner) return;

    setAiThinking(true);
    const timer = setTimeout(() => {
      const move = getAIMove(board, 'b');
      if (move) {
        applyMove(move.from, move.to);
      }
      setAiThinking(false);
    }, 600 + Math.random() * 500);

    return () => clearTimeout(timer);
  }, [turn, mode, gameState, board, winner, applyMove]);

  // ============================================
  // CLICK EN CASILLA
  // ============================================
  const handleSquareClick = (row, col) => {
    if (gameState !== 'playing' || winner) return;
    if (mode === 'ai' && turn === 'b') return; // no click durante la IA
    if (aiThinking) return;

    const piece = board[row][col];

    // Si hay una pieza seleccionada y el nuevo click es un movimiento legal
    if (selected) {
      const move = legalMoves.find((m) => m.row === row && m.col === col);
      if (move) {
        applyMove(selected, { row, col });
        return;
      }
    }

    // Si clickeó una pieza propia, seleccionarla
    if (piece && piece.color === turn) {
      try { audioService.playPop(); } catch (e) {}
      setSelected({ row, col });
      setLegalMoves(getLegalMoves(board, row, col));
      return;
    }

    // Click en casilla vacía o enemiga sin selección previa
    setSelected(null);
    setLegalMoves([]);
  };

  const handleChangeMode = () => {
    try { audioService.playClick(); } catch (e) {}
    setGameState('select');
    setMode(null);
    setWinner(null);
  };

  const handleRematch = () => {
    if (!mode) return;
    startGame(mode);
  };

  // ============================================
  // SELECTOR DE MODO
  // ============================================
  if (gameState === 'select') {
    return (
      <div className="w-full flex flex-col gap-4 items-center py-6 px-4">
        <img
          src="/games/chess.png"
          alt="Ajedrez"
          className="w-28 h-28 object-contain mb-2"
          draggable={false}
        />
        <h2
          className="text-3xl font-black text-white"
          style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}
        >
          Ajedrez
        </h2>
        <p className="text-xs font-bold text-center mb-4" style={{ color: C.textMuted }}>
          El rey de los juegos.<br />
          Elegí cómo querés jugar.
        </p>

        <div className="w-full flex flex-col gap-3">
          <button
            type="button"
            onClick={() => startGame('2p')}
            className="w-full p-4 rounded-2xl flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden"
            style={{
              backgroundImage: 'url(/memoria/fondo.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: `3px solid ${C.frameBorder}`,
              boxShadow: `
                0 5px 0 ${C.frameDeep},
                inset 0 2px 0 rgba(255,240,200,0.4),
                inset 0 -3px 0 rgba(0,0,0,0.4)
              `
            }}
          >
            <span
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(180deg, ${C.amber}25 0%, ${C.amber}10 100%)`,
                mixBlendMode: 'overlay'
              }}
            />
            <span
              className="w-14 h-14 rounded-full relative z-10 flex-shrink-0 flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 30% 30%, #fef3c7 0%, #f59e0b 55%, #b45309 100%)`,
                border: `2px solid ${C.frameBorder}`,
                boxShadow: `
                  inset 0 -4px 8px rgba(0,0,0,0.4),
                  inset 0 4px 8px rgba(255,255,255,0.7),
                  0 3px 10px ${C.frameDeep}90
                `
              }}
            >
              <PieceSVG type="K" color="w" size={32} />
            </span>
            <div className="flex flex-col flex-1 items-start relative z-10">
              <span
                className="text-base font-black"
                style={{
                  color: '#ffffff',
                  textShadow: `0 2px 0 ${C.frameDeep}, 0 3px 8px rgba(0,0,0,0.9)`
                }}
              >
                2 Jugadores
              </span>
              <span
                className="text-[11px] font-bold"
                style={{
                  color: 'rgba(255,255,255,0.95)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.9)'
                }}
              >
                Se pasan el celu por turnos
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => startGame('ai')}
            className="w-full p-4 rounded-2xl flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden"
            style={{
              backgroundImage: 'url(/memoria/fondo.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: `3px solid ${C.frameBorder}`,
              boxShadow: `
                0 5px 0 ${C.frameDeep},
                inset 0 2px 0 rgba(255,240,200,0.4),
                inset 0 -3px 0 rgba(0,0,0,0.4)
              `
            }}
          >
            <span
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(180deg, ${C.violet}25 0%, ${C.violet}10 100%)`,
                mixBlendMode: 'overlay'
              }}
            />
            <span
              className="w-14 h-14 rounded-full relative z-10 flex-shrink-0 flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 30% 30%, #ede9fe 0%, #a855f7 55%, #6b21a8 100%)`,
                border: `2px solid ${C.frameBorder}`,
                boxShadow: `
                  inset 0 -4px 8px rgba(0,0,0,0.4),
                  inset 0 4px 8px rgba(255,255,255,0.7),
                  0 3px 10px ${C.frameDeep}90
                `
              }}
            >
              <span style={{ fontSize: '26px' }}>🤖</span>
            </span>
            <div className="flex flex-col flex-1 items-start relative z-10">
              <span
                className="text-base font-black"
                style={{
                  color: '#ffffff',
                  textShadow: `0 2px 0 ${C.frameDeep}, 0 3px 8px rgba(0,0,0,0.9)`
                }}
              >
                Contra Sparky
              </span>
              <span
                className="text-[11px] font-bold"
                style={{
                  color: 'rgba(255,255,255,0.95)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.9)'
                }}
              >
                Vas a jugar con las blancas
              </span>
            </div>
          </button>
        </div>

        <div
          className="w-full p-3 rounded-xl flex flex-col gap-1"
          style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${C.frameDeep}` }}
        >
          <span className="text-[11px] font-black" style={{ color: C.greenBright }}>
            📖 Nivel Fácil: sin enroque ni promoción
          </span>
          <span className="text-[11px] font-black" style={{ color: C.greenBright }}>
            🎯 Próximamente: nivel completo
          </span>
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
  // RESULTADOS
  // ============================================
  if (gameState === 'results') {
    let title = '';
    let subtitle = '';
    let emoji = '🏆';

    if (winner === 'draw') {
      title = '¡Tablas!';
      subtitle = 'Empate. Buena partida.';
      emoji = '🤝';
    } else if (winner === 'w') {
      title = mode === 'ai' ? '¡Ganaste!' : '¡Ganaron las blancas!';
      subtitle = mode === 'ai' ? '¡Le ganaste a Sparky!' : 'Felicitaciones';
    } else {
      title = mode === 'ai' ? '¡Ganó Sparky!' : '¡Ganaron las negras!';
      subtitle = mode === 'ai' ? 'La próxima sale revancha' : 'Felicitaciones';
      emoji = '🐾';
    }

    return (
      <div
        className="fixed inset-0 z-[210] flex items-center justify-center p-4"
        style={{ background: 'rgba(5,5,15,0.85)', backdropFilter: 'blur(6px)' }}
      >
        <div
          className="w-full max-w-sm p-6 rounded-3xl flex flex-col items-center text-center"
          style={{
            background: `linear-gradient(180deg, #1a1a2e 0%, #08081a 100%)`,
            border: `2px solid ${C.amber}`,
            boxShadow: `0 0 40px ${C.amber}80`
          }}
        >
          <span className="text-6xl mb-3">{emoji}</span>
          <h2
            className="text-2xl font-black text-white mb-2"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {title}
          </h2>
          <p className="text-sm font-bold mb-4" style={{ color: C.textMuted }}>
            {subtitle}
          </p>

          <div className="flex gap-2 w-full">
            <button
              type="button"
              onClick={handleRematch}
              className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
              style={{
                background: `linear-gradient(135deg, ${C.amber} 0%, #fef3c7 100%)`,
                color: C.frameBorder,
                boxShadow: `0 0 16px ${C.amber}80`
              }}
            >
              Otra partida
            </button>
            <button
              type="button"
              onClick={handleChangeMode}
              className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer active:scale-95 transition-all"
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: C.cyanBright,
                border: `1.5px solid ${C.cyan}60`
              }}
            >
              Cambiar modo
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

  // ============================================
  // TABLERO ACTIVO
  // ============================================
  const boardSize = Math.min(
    typeof window !== 'undefined' ? window.innerWidth - 40 : 340,
    420
  );
  const squareSize = Math.floor(boardSize / 8);

  return (
    <div className="w-full flex flex-col gap-2 select-none">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleChangeMode}
          className="px-3 py-1.5 rounded-xl text-[11px] font-black cursor-pointer active:scale-95 transition-all"
          style={{
            background: 'rgba(180, 83, 9, 0.15)',
            color: C.amber,
            border: `1px solid ${C.frameMid}80`
          }}
        >
          ← Modo
        </button>

        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 rounded-full text-[10px] font-black"
            style={{
              background: mode === 'ai' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(6, 182, 212, 0.15)',
              color: mode === 'ai' ? C.violet : C.cyanBright,
              border: `1px solid ${mode === 'ai' ? C.violet : C.cyan}80`
            }}
          >
            {mode === 'ai' ? '🤖 vs Sparky' : '👥 2 Jugadores'}
          </span>
        </div>
      </div>

      {/* Turno e info */}
      <div
        className="w-full px-3 py-2 rounded-2xl flex items-center justify-between"
        style={{
          background: checkSquare
            ? 'rgba(239, 68, 68, 0.15)'
            : turn === 'w'
            ? 'rgba(254, 243, 213, 0.1)'
            : 'rgba(46, 26, 10, 0.4)',
          border: `2px solid ${checkSquare ? C.red : turn === 'w' ? C.white : C.black}`
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: turn === 'w' ? C.white : C.black,
              border: `2px solid ${turn === 'w' ? C.whiteShade : C.blackShade}`
            }}
          >
            <PieceSVG type="K" color={turn} size={20} />
          </div>
          <span
            className="text-xs font-black"
            style={{ color: turn === 'w' ? C.white : C.white }}
          >
            Turno: {turn === 'w' ? 'Blancas' : 'Negras'}
            {mode === 'ai' && turn === 'b' && ' (Sparky)'}
          </span>
        </div>

        {statusMessage && (
          <span
            className="text-xs font-black animate-pulse"
            style={{ color: C.red }}
          >
            {statusMessage}
          </span>
        )}

        {aiThinking && (
          <span className="text-xs font-black" style={{ color: C.violet }}>
            🤖 Pensando...
          </span>
        )}
      </div>

      {/* Tablero con marco */}
      <div className="w-full flex items-center justify-center">
        <div
          className="p-2.5 rounded-2xl"
          style={{
            background: `linear-gradient(180deg, ${C.frameTop} 0%, ${C.frameMid} 50%, ${C.frameBot} 100%)`,
            border: `3px solid ${C.frameBorder}`,
            boxShadow: `
              0 6px 0 ${C.frameDeep},
              inset 0 3px 0 ${C.frameHighlight},
              inset 0 -4px 0 rgba(0,0,0,0.35),
              0 12px 32px rgba(0,0,0,0.6)
            `
          }}
        >
          <div
            className="rounded-lg overflow-hidden"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(8, ${squareSize}px)`,
              gridTemplateRows: `repeat(8, ${squareSize}px)`,
              border: `2px solid ${C.boardBorder}`
            }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isLight = (r + c) % 2 === 0;
                const isSelected =
                  selected && selected.row === r && selected.col === c;
                const isLegalMove = legalMoves.some(
                  (m) => m.row === r && m.col === c
                );
                const isLegalCapture =
                  isLegalMove && cell && cell.color !== turn;
                const isCheck =
                  checkSquare && checkSquare.row === r && checkSquare.col === c;
                const isLastMoveFrom =
                  lastMove && lastMove.from.row === r && lastMove.from.col === c;
                const isLastMoveTo =
                  lastMove && lastMove.to.row === r && lastMove.to.col === c;

                let bg = isLight ? C.boardLight : C.boardDark;
                let overlay = null;

                if (isLastMoveFrom || isLastMoveTo) {
                  overlay = (
                    <div
                      className="absolute inset-0"
                      style={{ background: C.highlightLastMove }}
                    />
                  );
                }

                if (isCheck) {
                  overlay = (
                    <div
                      className="absolute inset-0"
                      style={{ background: C.highlightCheck }}
                    />
                  );
                }

                if (isSelected) {
                  overlay = (
                    <div
                      className="absolute inset-0"
                      style={{ background: C.highlightSelected }}
                    />
                  );
                }

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleSquareClick(r, c)}
                    disabled={gameState !== 'playing' || !!winner}
                    className="relative flex items-center justify-center"
                    style={{
                      width: squareSize,
                      height: squareSize,
                      background: bg,
                      cursor:
                        gameState === 'playing' && !winner
                          ? 'pointer'
                          : 'default',
                      padding: 0
                    }}
                  >
                    {overlay}

                    {/* Indicador de movimiento legal */}
                    {isLegalMove && !isLegalCapture && (
                      <span
                        className="absolute"
                        style={{
                          width: squareSize * 0.3,
                          height: squareSize * 0.3,
                          borderRadius: '50%',
                          background: C.highlightMove,
                          boxShadow: `0 0 8px ${C.greenBright}`
                        }}
                      />
                    )}

                    {/* Indicador de captura legal */}
                    {isLegalCapture && (
                      <span
                        className="absolute inset-0"
                        style={{
                          border: `4px solid ${C.highlightCapture}`,
                          borderRadius: '4px',
                          boxSizing: 'border-box'
                        }}
                      />
                    )}

                    {/* Pieza */}
                    {cell && (
                      <span
                        className="relative"
                        style={{ zIndex: 2, pointerEvents: 'none' }}
                      >
                        <PieceSVG
                          type={cell.type}
                          color={cell.color}
                          size={squareSize - 6}
                        />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Piezas capturadas */}
      <div className="w-full flex items-center justify-between gap-2 px-1 mt-1">
        <div className="flex items-center gap-1 min-h-[24px]">
          <span className="text-[9px] font-black" style={{ color: C.textMuted }}>
            Comió blancas:
          </span>
          {capturedByWhite.map((t, i) => (
            <PieceSVG key={`cw-${i}`} type={t} color="b" size={16} />
          ))}
        </div>
        <div className="flex items-center gap-1 min-h-[24px]">
          <span className="text-[9px] font-black" style={{ color: C.textMuted }}>
            Comió negras:
          </span>
          {capturedByBlack.map((t, i) => (
            <PieceSVG key={`cb-${i}`} type={t} color="w" size={16} />
          ))}
        </div>
      </div>

      {/* Botón rendirse */}
      <div className="w-full flex justify-center mt-2">
        <button
          type="button"
          onClick={handleChangeMode}
          className="px-4 py-2 rounded-xl font-black text-xs cursor-pointer active:scale-95 transition-all"
          style={{
            background: 'rgba(148, 163, 184, 0.12)',
            color: C.textMuted,
            border: '1px solid rgba(148, 163, 184, 0.2)'
          }}
        >
          Reiniciar partida
        </button>
      </div>
    </div>
  );
}