import React from 'react';
import { useApp } from '../context/AppContext';

export const BottomNav = () => {
  const { activeTab, setActiveTab, setActiveScreen } = useApp();

  const navItems = [
    { id: 'today',    label: 'Inicio',   icon: 'home',           fill: true },
    { id: 'missions', label: 'Misiones', icon: 'task_alt',       fill: false },
    { id: 'schedule', label: 'Agenda',   icon: 'calendar_month', fill: false },
    { id: 'rewards',  label: 'Premios',  icon: 'trophy',         fill: false },
  ];

  const handleNavClick = (id) => {
    setActiveScreen('none');
    setActiveTab(id);
  };

  return (
    <nav
      className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/90 backdrop-blur-xl border-t border-[#fed7aa]/50 shadow-[0_-2px_12px_rgba(255,107,0,0.06)]"
      style={{
        background: 'rgba(255, 255, 255, 0.94)',
        borderTop: '2px solid rgba(254, 215, 170, 0.85)',
        boxShadow: 'rgba(255, 107, 0, 0.1) 0px -4px 20px'
      }}
    >
      <div className="flex items-center justify-around h-14 px-space-xs max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[60px] min-h-[48px] px-2 py-0.5 rounded-2xl transition-transform active:scale-95 cursor-pointer ${
                isActive
                  ? 'text-[#ea580c] font-black'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={isActive && item.fill ? { fontVariationSettings: '"FILL" 1' } : {}}
              >
                {item.icon}
              </span>
              <span className="font-label-sm text-[10px] tracking-wide">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};