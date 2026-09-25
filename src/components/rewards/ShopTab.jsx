import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';
import { ACCESSORIES_CATALOG } from '../../services/storageService';
import { GAMES_CATALOG } from '../../services/gamesCatalog';

// ============================================
// CATÁLOGO DE SONIDOS
// ============================================
const SOUNDS_CATALOG = [
  { id: 'rain',       label: 'Lluvia',           icon: '🌧️', unlock: { type: 'free' } },
  { id: 'waves',      label: 'Olas del mar',     icon: '🌊', unlock: { type: 'xp', cost: 70 } },
  { id: 'forest',     label: 'Bosque',           icon: '🌲', unlock: { type: 'xp', cost: 90 } },
  { id: 'cafe',       label: 'Cafetería',        icon: '☕', unlock: { type: 'xp', cost: 120 } },
  { id: 'spaceship',  label: 'Nave espacial',    icon: '🚀', unlock: { type: 'xp', cost: 180 } }
];

// ============================================
// COLORES ARCADE
// ============================================
const C = {
  bg: '#09090f',
  card: '#131322',
  cardHover: '#1a1a2e',
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

export default function ShopTab() {
  const {
    xp,
    unlockedAccessories,
    unlockedSounds,
    unlockedGames,
    unlockAccessory,
    unlockSound,
    unlockGame
  } = useApp();

  const [subTab, setSubTab] = useState('accessories');
  const [confirmItem, setConfirmItem] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const handleSubTabClick = (id) => {
    try { audioService.playPop(); } catch (e) {}
    setSubTab(id);
  };

  const handleBuyAttempt = (item, catalogType) => {
    try { audioService.playClick(); } catch (e) {}

    const cost = item.unlock.cost || 0;
    const isFree = item.unlock.type === 'free';
    const isAchievement = item.unlock.type === 'achievement';

    if (isAchievement) return;

    if (isFree) {
      applyPurchase(item, catalogType, 0);
      return;
    }

    if (xp < cost) {
      setFeedback({
        type: 'error',
        message: `Te faltan ${cost - xp} XP para "${item.label}"`
      });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setConfirmItem({ item, catalogType });
  };

  const applyPurchase = (item, catalogType, cost) => {
    if (catalogType === 'accessories') {
      unlockAccessory(item.id, cost);
    } else if (catalogType === 'sounds') {
      unlockSound(item.id, cost);
    } else if (catalogType === 'games') {
      unlockGame(item.id, cost);
    }

    setFeedback({
      type: 'success',
      message: `¡Desbloqueaste "${item.label}"! ${item.icon}`
    });
    setConfirmItem(null);
    setTimeout(() => setFeedback(null), 3000);

    try { audioService.playSuccess(); } catch (e) {}
  };

  const handleConfirm = () => {
    if (!confirmItem) return;
    const { item, catalogType } = confirmItem;
    applyPurchase(item, catalogType, item.unlock.cost || 0);
  };

  const handleCancel = () => {
    try { audioService.playClick(); } catch (e) {}
    setConfirmItem(null);
  };

  const accessoriesFiltered = ACCESSORIES_CATALOG.filter(
    (a) => a.unlock.type !== 'achievement'
  );

  const renderItemCard = (item, catalogType, isUnlocked) => {
    const cost = item.unlock.cost || 0;
    const isFree = item.unlock.type === 'free';
    const canAfford = isFree || xp >= cost;

    return (
      <div
        key={item.id}
        className="flex flex-col items-center p-3 rounded-2xl transition-all"
        style={{
          background: isUnlocked ? 'rgba(34, 197, 94, 0.08)' : C.card,
          border: `1.5px solid ${
            isUnlocked
              ? 'rgba(34, 197, 94, 0.5)'
              : canAfford
              ? C.cardBorder
              : 'rgba(148, 163, 184, 0.15)'
          }`
        }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-2"
          style={{
            background: isUnlocked ? 'rgba(34, 197, 94, 0.15)' : 'rgba(6, 182, 212, 0.08)'
          }}
        >
          <span>{item.icon}</span>
        </div>

        <span className="text-[11px] font-black text-white text-center leading-tight mb-2 min-h-[26px]">
          {item.label}
        </span>

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
          <button
            type="button"
            onClick={() => handleBuyAttempt(item, catalogType)}
            className="w-full py-2 rounded-xl text-[10px] font-black text-center transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
            style={{
              background: canAfford
                ? `linear-gradient(135deg, ${C.cyan} 0%, ${C.cyanBright} 100%)`
                : 'rgba(148, 163, 184, 0.15)',
              color: canAfford ? '#000' : C.textMuted,
              border: canAfford ? 'none' : '1px solid rgba(148, 163, 184, 0.2)',
              boxShadow: canAfford ? `0 0 12px ${C.cyan}60` : 'none'
            }}
          >
            {isFree ? (
              <span>OBTENER</span>
            ) : (
              <>
                <span>⭐</span>
                <span>{cost} XP</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-3">

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

      {/* Banner de XP */}
      <div
        className="w-full px-3 py-2 rounded-xl flex items-center justify-between"
        style={{
          background: 'rgba(250, 204, 21, 0.08)',
          border: '1px solid rgba(250, 204, 21, 0.3)'
        }}
      >
        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: C.textMuted }}>
          Tu tesoro
        </span>
        <span className="text-sm font-black" style={{ color: C.amber }}>
          ⭐ {xp} XP
        </span>
      </div>

      {/* Feedback temporal */}
      {feedback && (
        <div
          className="w-full px-3 py-2.5 rounded-xl flex items-center gap-2 animate-[fadeIn_0.3s_ease-out]"
          style={{
            background:
              feedback.type === 'success'
                ? 'rgba(34, 197, 94, 0.15)'
                : 'rgba(255, 45, 135, 0.15)',
            border: `1px solid ${
              feedback.type === 'success' ? C.lime : C.magenta
            }`
          }}
        >
          <span className="text-base">{feedback.type === 'success' ? '🎉' : '⚠️'}</span>
          <span
            className="text-[11px] font-black"
            style={{ color: feedback.type === 'success' ? C.limeBright : C.magenta }}
          >
            {feedback.message}
          </span>
        </div>
      )}

      {/* Grid de items */}
      {subTab === 'accessories' && (
        <div className="grid grid-cols-3 gap-2.5">
          {accessoriesFiltered.map((item) =>
            renderItemCard(
              item,
              'accessories',
              unlockedAccessories?.includes(item.id)
            )
          )}
        </div>
      )}

      {subTab === 'sounds' && (
        <div className="grid grid-cols-3 gap-2.5">
          {SOUNDS_CATALOG.map((item) =>
            renderItemCard(item, 'sounds', unlockedSounds?.includes(item.id))
          )}
        </div>
      )}

      {subTab === 'games' && (
        <div className="grid grid-cols-3 gap-2.5">
          {GAMES_CATALOG.map((item) =>
            renderItemCard(item, 'games', unlockedGames?.includes(item.id))
          )}
        </div>
      )}

      {/* Modal de confirmación */}
      {confirmItem && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={handleCancel}
        >
          <div
            className="w-full max-w-sm p-5 rounded-3xl"
            style={{
              background: C.card,
              border: `2px solid ${C.cyan}`,
              boxShadow: `0 0 40px ${C.cyan}60`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-3"
                style={{ background: 'rgba(6, 182, 212, 0.15)' }}
              >
                <span>{confirmItem.item.icon}</span>
              </div>

              <h3 className="text-lg font-black text-white mb-1">
                ¿Desbloquear "{confirmItem.item.label}"?
              </h3>
              <p className="text-xs font-bold mb-4" style={{ color: C.textMuted }}>
                Vas a gastar{' '}
                <span style={{ color: C.amber }}>
                  ⭐ {confirmItem.item.unlock.cost} XP
                </span>
              </p>

              <div className="flex gap-2 w-full mt-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer transition-all active:scale-95"
                  style={{
                    background: 'rgba(148, 163, 184, 0.15)',
                    color: C.textMuted,
                    border: '1px solid rgba(148, 163, 184, 0.2)'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-2xl font-black text-xs cursor-pointer transition-all active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${C.lime} 0%, ${C.limeBright} 100%)`,
                    color: '#000',
                    boxShadow: `0 0 16px ${C.lime}80`
                  }}
                >
                  ¡Comprar!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}