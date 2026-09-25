import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';
import { GAMES_CATALOG } from '../../services/gamesCatalog';
import MemoriaGame from './games/MemoriaGame';

const C = {
  card: '#131322',
  lime: '#22c55e',
  limeBright: '#4ade80',
  magenta: '#ff2d87',
  cyan: '#06b6d4',
  cyanBright: '#38bdf8',
  amber: '#facc15',
  text: '#ffffff',
  textMuted: '#94a3b8'
};

export default function ArcadeTab() {
  const { unlockedGames } = useApp();
  const [feedback, setFeedback] = useState(null);
  const [activeGame, setActiveGame] = useState(null);

  const handlePlayAttempt = (game, isUnlocked) => {
    try { audioService.playClick(); } catch (e) {}

    if (!isUnlocked) {
      setFeedback(`Necesitás desbloquear "${game.label}" en la Tienda`);
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    if (game.id === 'memory') {
      setActiveGame('memory');
      return;
    }

    setFeedback(`¡${game.label} próximamente! 🎮`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExitGame = () => {
    try { audioService.playClick(); } catch (e) {}
    setActiveGame(null);
  };

  if (activeGame === 'memory') {
    return <MemoriaGame onExit={handleExitGame} />;
  }

  const totalUnlocked =
    GAMES_CATALOG.filter(
      (g) => g.unlock.type === 'free' || unlockedGames?.includes(g.id)
    ).length;

  return (
    <div className="w-full flex flex-col gap-3">

      <div
        className="w-full px-3 py-2 rounded-xl flex items-center justify-between"
        style={{
          background: 'rgba(34, 197, 94, 0.08)',
          border: '1px solid rgba(34, 197, 94, 0.3)'
        }}
      >
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: C.textMuted }}>
          🎮 Zona de juegos
        </span>
        <span className="text-xs font-black" style={{ color: C.limeBright }}>
          {totalUnlocked} / {GAMES_CATALOG.length}
        </span>
      </div>

      {feedback && (
        <div
          className="w-full px-3 py-2.5 rounded-xl flex items-center gap-2"
          style={{
            background: 'rgba(6, 182, 212, 0.15)',
            border: `1px solid ${C.cyan}`
          }}
        >
          <span className="text-base">🎮</span>
          <span className="text-[11px] font-black" style={{ color: C.cyanBright }}>
            {feedback}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        {GAMES_CATALOG.map((game) => {
          const isUnlocked =
            game.unlock.type === 'free' || unlockedGames?.includes(game.id);
          return (
            <GameCard
              key={game.id}
              game={game}
              isUnlocked={isUnlocked}
              onPlay={handlePlayAttempt}
            />
          );
        })}
      </div>
    </div>
  );
}

function GameCard({ game, isUnlocked, onPlay }) {
  const cost = game.unlock.cost || 0;
  const isFree = game.unlock.type === 'free';

  return (
    <div
      className="flex flex-col justify-between p-3 rounded-2xl transition-all"
      style={{
        background: isUnlocked ? 'rgba(34, 197, 94, 0.06)' : 'rgba(19, 19, 34, 0.55)',
        border: `1.5px solid ${
          isUnlocked ? 'rgba(34, 197, 94, 0.4)' : 'rgba(148, 163, 184, 0.15)'
        }`,
        opacity: isUnlocked ? 1 : 0.7
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl relative"
          style={{
            background: isUnlocked ? 'rgba(34, 197, 94, 0.12)' : 'rgba(148, 163, 184, 0.06)',
            filter: isUnlocked ? 'none' : 'grayscale(1)'
          }}
        >
          <span>{game.icon}</span>
          {!isUnlocked && (
            <span className="absolute inset-0 flex items-center justify-center text-lg">
              🔒
            </span>
          )}
        </div>

        {isUnlocked ? (
          <span
            className="text-[9px] font-black px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(6, 182, 212, 0.2)',
              color: C.cyanBright,
              border: '1px solid rgba(6, 182, 212, 0.4)'
            }}
          >
            Listo
          </span>
        ) : isFree ? (
          <span
            className="text-[9px] font-black px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(250, 204, 21, 0.15)',
              color: C.amber,
              border: '1px solid rgba(250, 204, 21, 0.4)'
            }}
          >
            Gratis
          </span>
        ) : (
          <span
            className="text-[9px] font-black px-2 py-0.5 rounded-full"
            style={{
              background: 'rgba(148, 163, 184, 0.15)',
              color: C.textMuted,
              border: '1px solid rgba(148, 163, 184, 0.25)'
            }}
          >
            {cost} XP
          </span>
        )}
      </div>

      <div className="mb-3">
        <h4
          className="text-sm font-black leading-tight mb-0.5"
          style={{ color: isUnlocked ? C.text : C.textMuted }}
        >
          {game.label}
        </h4>
        <p className="text-[10px] leading-tight" style={{ color: C.textMuted }}>
          {game.subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onPlay(game, isUnlocked)}
        className="w-full py-2 rounded-xl text-[10px] font-black transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
        style={{
          background: isUnlocked
            ? `linear-gradient(135deg, ${C.cyan} 0%, ${C.cyanBright} 100%)`
            : 'rgba(148, 163, 184, 0.12)',
          color: isUnlocked ? '#000' : C.textMuted,
          border: isUnlocked ? 'none' : '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: isUnlocked ? `0 0 12px ${C.cyan}60` : 'none'
        }}
      >
        {isUnlocked ? (
          <>
            <span>▶</span>
            <span>Jugar</span>
          </>
        ) : (
          <span>🔒 Bloqueado</span>
        )}
      </button>
    </div>
  );
}