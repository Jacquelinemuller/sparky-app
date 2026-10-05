import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import MiniToast from './components/MiniToast';
import PinModal from './components/PinModal';
import { TodayScreen } from './screens/TodayScreen';
import { ScheduleScreen } from './screens/ScheduleScreen';
import { MissionsScreen } from './screens/MissionsScreen';
import { RewardsScreen } from './screens/RewardsScreen';
import { PomodoroScreen } from './screens/PomodoroScreen';
import { NotesScreen } from './screens/NotesScreen';
import { StatsScreen } from './screens/StatsScreen';
import { ParentsScreen } from './screens/ParentsScreen';
import { MonthlyCalendarScreen } from './screens/MonthlyCalendarScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { TipsScreen } from './screens/TipsScreen';
import { ChecklistsScreen } from './screens/ChecklistsScreen';
import { ApoyosScreen } from './screens/ApoyosScreen';
import { AlarmsScreen } from './screens/AlarmsScreen';
import { CalmaScreen } from './screens/CalmaScreen';
import { DiarioScreen } from './screens/DiarioScreen';
import { AlarmManager } from './components/AlarmManager';

const BACKGROUNDS = {
  today: 'radial-gradient(circle at 50% 0%, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
  schedule: 'radial-gradient(circle at 50% 0%, #f7fee7 0%, #ecfccb 50%, #d9f99d 100%)',
  notes: 'radial-gradient(circle at 50% 0%, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
  missions: 'radial-gradient(circle at 50% 0%, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)'
};

export function AppContent() {
  const { activeTab, activeScreen, setActiveScreen, celebration, closeCelebration } = useApp();
  const [parentsUnlocked, setParentsUnlocked] = useState(false);

  useEffect(() => {
    if (activeScreen !== 'parents' && parentsUnlocked) {
      setParentsUnlocked(false);
    }
  }, [activeScreen, parentsUnlocked]);

  const isMiniCelebration = celebration?.type === 'mini';

  // 🆕 Función que decide qué contenido mostrar (sin return temprano)
  const renderScreen = () => {
    // Pantallas internas
    if (activeScreen === 'pomodoro') return <PomodoroScreen />;
    if (activeScreen === 'stats') return <StatsScreen />;
    if (activeScreen === 'monthly') return <MonthlyCalendarScreen />;
    if (activeScreen === 'profile') return <ProfileScreen />;
    if (activeScreen === 'tips') return <TipsScreen />;
    if (activeScreen === 'checklists') return <ChecklistsScreen />;
    if (activeScreen === 'apoyos') return <ApoyosScreen />;
    if (activeScreen === 'alarms') return <AlarmsScreen />;
    if (activeScreen === 'calma') return <CalmaScreen />;
    if (activeScreen === 'diario') return <DiarioScreen />;

    if (activeScreen === 'parents') {
      if (!parentsUnlocked) {
        return (
          <PinModal
            isOpen={true}
            onClose={() => setActiveScreen('none')}
            onSuccess={() => setParentsUnlocked(true)}
          />
        );
      }
      return (
        <ParentsScreen
          onClose={() => {
            setParentsUnlocked(false);
            setActiveScreen('none');
          }}
        />
      );
    }

    // Premios tiene su propio layout full-screen
    if (activeTab === 'rewards') {
      return <RewardsScreen />;
    }

    // Layout principal con Header + BottomNav
    return (
      <div
        className="min-h-screen bg-background font-body-md text-on-surface flex flex-col antialiased selection:bg-primary-fixed"
        style={{ background: BACKGROUNDS[activeTab] || BACKGROUNDS.today }}
      >
        <Header />
        <main className="flex-1 flex flex-col relative w-full pt-20 pb-24 px-gutter-mobile">
          {activeTab === 'today' && <TodayScreen />}
          {activeTab === 'schedule' && <ScheduleScreen />}
          {activeTab === 'notes' && <NotesScreen />}
          {activeTab === 'missions' && <MissionsScreen />}
        </main>
        <BottomNav />
      </div>
    );
  };

  return (
    <>
      {renderScreen()}

      {/* 🆕 SIEMPRE montado, en cualquier pantalla */}
      <AlarmManager />

      <MiniToast
        celebration={isMiniCelebration ? celebration : null}
        onClose={closeCelebration}
      />
    </>
  );
}