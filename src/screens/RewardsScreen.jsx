import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';
import ArcadeTab from '../components/rewards/ArcadeTab';
import ShopTab from '../components/rewards/ShopTab';
import CollectionTab from '../components/rewards/CollectionTab';

// ============================================
// CONFIGURACIÓN DE PESTAÑAS
// ============================================
const TABS = [
  { id: 'arcade',      label: 'Arcade',     icon: 'sports_esports' },
  { id: 'shop',        label: 'Tienda',     icon: 'shopping_bag' },
  { id: 'collection',  label: 'Colección',  icon: 'collections_bookmark' }
];

// ============================================
// COLORES ARCADE
// ============================================
const ARCADE_COLORS = {
  bg: '#09090f',
  panel: '#1a1a2e',
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

export const RewardsScreen = () => {
  const {
    xp,
    userAvatar,
    userName,
    activeTab,
    setActiveTab,
    setActiveScreen
  } = useApp();

  const [activeRewardsTab, setActiveRewardsTab] = useState('arcade');

  const handleTabClick = (tabId) => {
    try { audioService.playPop(); } catch (e) {}
    setActiveRewardsTab(tabId);
  };

  const handleNavClick = (id) => {
    try { audioService.playClick(); } catch (e) {}
    setActiveScreen('none');
    setActiveTab(id);
  };

  const navItems = [
    { id: 'today',    label: 'Inicio',   icon: 'home',           fill: true },
    { id: 'missions', label: 'Misiones', icon: 'task_alt',       fill: false },
    { id: 'schedule', label: 'Agenda',   icon: 'calendar_month', fill: false },
    { id: 'rewards',  label: 'Premios',  icon: 'trophy',         fill: false }
  ];

  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{ background: ARCADE_COLORS.bg }}
    >
      {/* ============ HEADER ARCADE ============ */}
      <header
        className="fixed top-0 w-full z-50 pt-safe"
        style={{
          background: ARCADE_COLORS.panel,
          borderBottom: '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 4px 25px rgba(0, 0, 0, 0.8)'
        }}
      >
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          {/* Esferas de energía */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full flex-shrink-0"
            style={{
              background: '#141426',
              border: '1px solid rgba(34, 211, 238, 0.4)',
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.25)'
            }}
          >
            <span className="text-xs text-cyan-300">⚡</span>
            <div className="flex items-center gap-1.5 ml-0.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: ARCADE_COLORS.limeBright,
                  boxShadow: '0 0 8px rgba(74, 222, 128, 0.9)'
                }}
              />
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: ARCADE_COLORS.cyan,
                  boxShadow: '0 0 8px rgba(6, 182, 212, 0.9)'
                }}
              />
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: ARCADE_COLORS.magenta,
                  boxShadow: '0 0 8px rgba(255, 45, 135, 0.9)'
                }}
              />
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              />
            </div>
          </div>

          {/* XP + Avatar */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: '#141426',
                border: '1px solid rgba(250, 204, 21, 0.4)',
                boxShadow: '0 0 12px rgba(250, 204, 21, 0.2)'
              }}
            >
              <span className="text-sm leading-none">⭐</span>
              <span className="text-xs font-black text-amber-300 tracking-wide">
                {xp} XP
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveScreen('profile')}
              className="relative flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
              title={`Perfil de ${userName}`}
            >
              <div
                className="p-0.5 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${ARCADE_COLORS.magenta} 0%, ${ARCADE_COLORS.cyan} 50%, ${ARCADE_COLORS.lime} 100%)`,
                  boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)'
                }}
              >
                <img
                  alt={`Avatar de ${userName}`}
                  className="w-9 h-9 rounded-full object-cover"
                  src={userAvatar}
                />
              </div>
              <span
                className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full border-2"
                style={{
                  background: ARCADE_COLORS.limeBright,
                  borderColor: ARCADE_COLORS.bg,
                  boxShadow: '0 0 6px rgba(74, 222, 128, 0.9)'
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ============ CONTENIDO ============ */}
      <main className="flex-1 flex flex-col relative w-full pt-20 pb-24 px-4 max-w-md mx-auto">

        {/* Título */}
        <div className="w-full mb-4">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Baúl de Poderes
          </h1>
          <p className="text-xs font-bold mt-0.5" style={{ color: ARCADE_COLORS.textMuted }}>
            Desbloqueá juegos, sonidos y accesorios ✨
          </p>
        </div>

        {/* ============ PESTAÑAS ============ */}
        <div
          className="w-full mb-4 p-1 rounded-2xl flex items-center gap-1"
          style={{
            background: '#131322',
            border: '1px solid rgba(6, 182, 212, 0.2)'
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeRewardsTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer"
                style={
                  isActive
                    ? {
                        background: `linear-gradient(135deg, ${ARCADE_COLORS.cyan} 0%, ${ARCADE_COLORS.cyanBright} 100%)`,
                        color: '#000',
                        boxShadow: `0 0 16px ${ARCADE_COLORS.cyan}80`
                      }
                    : {
                        color: ARCADE_COLORS.textMuted
                      }
                }
              >
                <span className="material-symbols-outlined text-[18px]">
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ============ CONTENIDO DE CADA PESTAÑA ============ */}
        <div className="w-full flex flex-col gap-3">
          {activeRewardsTab === 'arcade' && <ArcadeTab />}
          {activeRewardsTab === 'shop' && <ShopTab />}
          {activeRewardsTab === 'collection' && <CollectionTab />}
        </div>

      </main>

      {/* ============ BOTTOM NAV ARCADE ============ */}
      <nav
        className="fixed bottom-0 w-full z-50 pb-safe"
        style={{
          background: ARCADE_COLORS.panel,
          borderTop: '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 -4px 25px rgba(0, 0, 0, 0.8)'
        }}
      >
        <div className="flex items-center justify-around h-14 px-2 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="flex flex-col items-center justify-center gap-0.5 min-w-[60px] min-h-[48px] px-2 py-0.5 rounded-2xl transition-transform active:scale-95 cursor-pointer"
                type="button"
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{
                    color: isActive ? ARCADE_COLORS.limeBright : ARCADE_COLORS.textMuted,
                    fontVariationSettings: isActive && item.fill ? '"FILL" 1' : '"FILL" 0'
                  }}
                >
                  {item.icon}
                </span>
                <span
                  className="text-[10px] tracking-wide font-bold"
                  style={{
                    color: isActive ? ARCADE_COLORS.limeBright : ARCADE_COLORS.textMuted
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};