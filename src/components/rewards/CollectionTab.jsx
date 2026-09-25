import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';
import { ACCESSORIES_CATALOG } from '../../services/storageService';

// ============================================
// CATÁLOGOS (mismos que ShopTab)
// TODO: unificar en un solo archivo compartido
// ============================================
const SOUNDS_CATALOG = [
  { id: 'rain',       label: 'Lluvia',           icon: '🌧️', unlock: { type: 'free' } },
  { id: 'waves',      label: 'Olas del mar',     icon: '🌊', unlock: { type: 'xp', cost: 70 } },
  { id: 'forest',     label: 'Bosque',           icon: '🌲', unlock: { type: 'xp', cost: 90 } },
  { id: 'cafe',       label: 'Cafetería',        icon: '☕', unlock: { type: 'xp', cost: 120 } },
  { id: 'spaceship',  label: 'Nave espacial',    icon: '🚀', unlock: { type: 'xp', cost: 180 } }
];

const GAMES_CATALOG = [
  { id: 'memory',      label: 'Memoria',      icon: '🧠', unlock: { type: 'xp', cost: 100 } },
  { id: 'minesweeper', label: 'Buscaminas',   icon: '💣', unlock: { type: 'xp', cost: 150 } },
  { id: 'sudoku',      label: 'Sudoku',       icon: '🔢', unlock: { type: 'xp', cost: 200 } },
  { id: 'chess',       label: 'Ajedrez',      icon: '♟️', unlock: { type: 'xp', cost: 250 } }
];

// ============================================
// COLORES ARCADE
// ============================================
const C = {
  card: '#131322',
  lime: '#22c55e',
  limeBright: '#4ade80',
  magenta: '#ff2d87',
  cyan: '#06b6d4',
  cyanBright: '#38bdf8',
  amber: '#facc15',
  text: '#ffffff',
  textMuted: '#94a3b8',
  cardBorder: 'rgba(6, 182, 212, 0.25)'
};

const SUB_TABS = [
  { id: 'accessories', label: 'Accesorios', icon: '🎨' },
  { id: 'sounds',      label: 'Sonidos',    icon: '🎵' },
  { id: 'games',       label: 'Minijuegos', icon: '🎮' }
];

export default function CollectionTab() {
  const {
    unlockedAccessories,
    unlockedSounds,
    unlockedGames
  } = useApp();

  const [subTab, setSubTab] = useState('accessories');

  const handleSubTabClick = (id) => {
    try { audioService.playPop(); } catch (e) {}
    setSubTab(id);
  };

  // ============================================
  // FILTRAR CATÁLOGOS (sin logros)
  // ============================================
  const accessoriesFiltered = ACCESSORIES_CATALOG.filter(
    (a) => a.unlock.type !== 'achievement'
  );

  const totalItems =
    accessoriesFiltered.length +
    SOUNDS_CATALOG.length +
    GAMES_CATALOG.length;

  const unlockedCount =
    accessoriesFiltered.filter((a) => unlockedAccessories?.includes(a.id)).length +
    SOUNDS_CATALOG.filter((s) => unlockedSounds?.includes(s.id)).length +
    GAMES_CATALOG.filter((g) => unlockedGames?.includes(g.id)).length;

  const progressPercent = totalItems > 0
    ? Math.round((unlockedCount / totalItems) * 100)
    : 0;

  // ============================================
  // RENDER CARD
  // ============================================
  const renderItemCard = (item, isUnlocked) => {
    const cost = item.unlock.cost || 0;
    const isFree = item.unlock.type === 'free';

    return (
      <div
        key={item.id}
        className="flex flex-col items-center p-3 rounded-2xl transition-all relative overflow-hidden"
        style={{
          background: isUnlocked ? 'rgba(34, 197, 94, 0.08)' : 'rgba(19, 19, 34, 0.5)',
          border: `1.5px solid ${
            isUnlocked
              ? 'rgba(34, 197, 94, 0.5)'
              : 'rgba(148, 163, 184, 0.15)'
          }`,
          opacity: isUnlocked ? 1 : 0.55
        }}
      >
        {/* Ícono */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-2 relative"
          style={{
            background: isUnlocked ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.06)',
            filter: isUnlocked ? 'none' : 'grayscale(1)'
          }}
        >
          <span>{item.icon}</span>
          {!isUnlocked && (
            <span className="absolute inset-0 flex items-center justify-center text-lg">
              🔒
            </span>
          )}
        </div>

        {/* Nombre */}
        <span
          className="text-[11px] font-black text-center leading-tight mb-2 min-h-[26px]"
          style={{ color: isUnlocked ? C.text : C.textMuted }}
        >
          {item.label}
        </span>

        {/* Estado */}
        {isUnlocked ? (
          <span
            className="w-full py-2 rounded-xl text-[10px] font-black text-center"
            style={{
              background: 'rgba(34, 197, 94, 0.15)',
              color: C.limeBright,
              border: '1px solid rgba(34, 197, 94, 0.4)'
            }}
          >
            ✓ DESBLOQUEADO
          </span>
        ) : (
          <span
            className="w-full py-2 rounded-xl text-[10px] font-black text-center flex items-center justify-center gap-1"
            style={{
              background: 'rgba(148, 163, 184, 0.1)',
              color: C.textMuted,
              border: '1px solid rgba(148, 163, 184, 0.2)'
            }}
          >
            {isFree ? (
              <span>PENDIENTE</span>
            ) : (
              <>
                <span>⭐</span>
                <span>{cost} XP</span>
              </>
            )}
          </span>
        )}
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="w-full flex flex-col gap-3">

      {/* Barra de progreso global */}
      <div
        className="w-full p-3 rounded-2xl"
        style={{
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.3)'
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: C.textMuted }}>
            📦 Tu colección
          </span>
          <span className="text-xs font-black" style={{ color: C.cyanBright }}>
            {unlockedCount} / {totalItems}
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(148, 163, 184, 0.15)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${C.cyan} 0%, ${C.limeBright} 100%)`,
              boxShadow: `0 0 10px ${C.cyan}80`
            }}
          />
        </div>
        <div className="text-right mt-1">
          <span className="text-[10px] font-black" style={{ color: C.limeBright }}>
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div
        className="w-full p-1 rounded-2xl flex items-center gap-1"
        style={{
          background: C.card,
          border: `1px solid ${C.cardBorder}`
        }}
      >
        {SUB_TABS.map((t) => {
          const isActive = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSubTabClick(t.id)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer"
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${C.magenta} 0%, ${C.cyan} 100%)`,
                      color: '#fff',
                      boxShadow: `0 0 12px ${C.magenta}60`
                    }
                  : { color: C.textMuted }
              }
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid de items */}
      {subTab === 'accessories' && (
        <div className="grid grid-cols-3 gap-2.5">
          {accessoriesFiltered.map((item) =>
            renderItemCard(item, unlockedAccessories?.includes(item.id))
          )}
        </div>
      )}

      {subTab === 'sounds' && (
        <div className="grid grid-cols-3 gap-2.5">
          {SOUNDS_CATALOG.map((item) =>
            renderItemCard(item, unlockedSounds?.includes(item.id))
          )}
        </div>
      )}

      {subTab === 'games' && (
        <div className="grid grid-cols-3 gap-2.5">
          {GAMES_CATALOG.map((item) =>
            renderItemCard(item, unlockedGames?.includes(item.id))
          )}
        </div>
      )}
    </div>
  );
}