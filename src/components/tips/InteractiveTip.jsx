import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';
import QuizTip from './QuizTip';
import ChallengeTip from './ChallengeTip';
import TipCard from './TipCard';

export default function InteractiveTip({
  data,
  isCompleted,
  onComplete,
  hasSheet,
  onOpenSheet,
  activeWeekId = 1,
  activeDay = 1
}) {
  // 🔑 Agregamos setActiveTab y setActiveScreen para la navegación a Notas
  const { getActiveChallengesOrdered, setActiveTab, setActiveScreen } = useApp();
  const [revealed, setRevealed] = useState({});

  const layout = data?.layout || 'twoColumns';
  const isQuiz = layout === 'quiz';
  const isChallenge = layout === 'challenge';
  const isChallengeClose = layout === 'challengeClose';

  const handleReveal = (pairId) => {
    if (revealed[pairId]) return;
    try { audioService.playPop(); } catch (e) {}
    setRevealed((prev) => ({ ...prev, [pairId]: true }));
  };

  const renderPrimaryChallenge = () => {
    if (activeWeekId < 2) return null;
    if (isChallenge || isChallengeClose) return null;
    const ordered = getActiveChallengesOrdered();
    if (!ordered || ordered.length === 0) return null;
    const primary = ordered.find((c) => c.displayPriority === 'primary' && c.status === 'accepted');
    if (!primary) return null;
    return <ChallengeTip key={primary.id} data={{ challenge: primary }} variant="banner" onComplete={() => {}} />;
  };

    const renderBackgroundChallenge = () => {
    if (activeWeekId < 2) return null;
    if (isChallenge || isChallengeClose) return null;

    const ordered = getActiveChallengesOrdered();
    if (!ordered || ordered.length === 0) return null;

    // 🔑 FIX: Solo mostramos el reto si está en fase 'background'
    const background = ordered.find(
      (c) => c.displayPriority === 'background' && c.status === 'accepted' && c.timeStatus === 'background'
    );
    if (!background) return null;

    return (
      <ChallengeTip
        key={background.id}
        data={{ challenge: background }}
        variant="background"
        onComplete={() => {}}
      />
    );
  };

  // 🔑 FUNCIÓN PARA IR A LAS NOTAS
  const goToNotes = () => {
    try { audioService.playClick(); } catch (e) {}
    setActiveTab('notes');
    setActiveScreen('none'); // Cierra la pantalla de Tips para ir a la pestaña Notas
  };

  if (isChallengeClose) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {data.titleImage && <img src={data.titleImage} alt="" className="w-full h-auto block rounded-2xl" draggable={false} />}
        <ChallengeTip data={data} variant="close" onComplete={onComplete} />
      </div>
    );
  }

  if (isChallenge) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {data.titleImage && <img src={data.titleImage} alt="" className="w-full h-auto block rounded-2xl" draggable={false} />}
        <ChallengeTip
          data={data}
          isCompleted={isCompleted}
          onComplete={onComplete}
          onGoToNotes={goToNotes} // 🔑 Pasamos la función corregida
        />
      </div>
    );
  }

  if (isQuiz) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {renderPrimaryChallenge()}
        {data.titleImage && <img src={data.titleImage} alt="" className="w-full h-auto block rounded-2xl" draggable={false} />}
        <QuizTip data={data} isCompleted={isCompleted} onComplete={onComplete} />
        {isCompleted && hasSheet && activeDay >= 4 && (
          <button type="button" onClick={onOpenSheet} className="w-full py-3 rounded-2xl font-black text-[12px] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all bg-white text-[#334155] border-1.5 border-[#cbd5e1] shadow-[0_3px_0_0_#e2e8f0]">
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span>Ver la lámina completa de la semana</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        )}
        {renderBackgroundChallenge()}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {renderPrimaryChallenge()}
      <TipCard
        data={data}
        revealed={revealed}
        onReveal={handleReveal}
        isCompleted={isCompleted}
        onComplete={onComplete}
        hasSheet={hasSheet}
        onOpenSheet={onOpenSheet}
        activeDay={activeDay}
      />
      {renderBackgroundChallenge()}
    </div>
  );
}