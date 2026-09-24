import React from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';

const VIEWS = [
  { id: 'today',   label: 'Hoy',     icon: 'wb_sunny',          activeTab: 'today' },
  { id: 'weekly',  label: 'Semana',  icon: 'calendar_view_week', activeTab: 'schedule', screen: 'weekly' },
  { id: 'monthly', label: 'Mes',     icon: 'calendar_month',    activeTab: 'schedule', screen: 'monthly' }
];

export default function ViewSwitcher({ current }) {
  const { setActiveTab, setActiveScreen } = useApp();

  const handleClick = (view) => {
    try { audioService.playPop(); } catch (e) {}

    if (view.id === 'today') {
      setActiveTab('today');
      setActiveScreen('none');
    } else {
      setActiveTab(view.activeTab);
      setActiveScreen(view.screen);
    }
  };

  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-white border-2 border-[#fed7aa]/60 shadow-[0_2px_0_0_#fed7aa]/50">
      {VIEWS.map((view) => {
        const isActive = current === view.id;
        return (
          <button
            key={view.id}
            type="button"
            onClick={() => handleClick(view)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-label-sm text-label-sm font-black transition-all cursor-pointer ${
              isActive
                ? 'bg-[#ff6b00] text-white shadow-[0_2px_0_0_#c2410c]'
                : 'text-on-surface-variant hover:bg-[#fff7ed]'
            }`}
            title={view.label}
          >
            <span className="material-symbols-outlined text-[18px]">
              {view.icon}
            </span>
            <span className="hidden xs:inline">{view.label}</span>
          </button>
        );
      })}
    </div>
  );
}