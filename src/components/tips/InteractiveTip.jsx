import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';
import QuizTip from './QuizTip';
import ChallengeTip from './ChallengeTip';

export default function InteractiveTip({
  data,
  isCompleted,
  onComplete,
  hasSheet,
  onOpenSheet,
  activeWeekId = 1,
  activeDay = 1
}) {
  const { getActiveChallengesOrdered } = useApp();
  const [revealed, setRevealed] = useState({});

  const pairs = data?.pairs || [];
  const layout = data?.layout || 'twoColumns';
  const isSingle = layout === 'single';
  const isQuiz = layout === 'quiz';
  const isChallenge = layout === 'challenge';
  const isChallengeClose = layout === 'challengeClose';
  const revealedCount = pairs.filter((p) => revealed[p.id]).length;
  const allRevealed = revealedCount === pairs.length;

  const handleReveal = (pairId) => {
    if (revealed[pairId]) return;
    try { audioService.playPop(); } catch (e) {}
    setRevealed((prev) => ({ ...prev, [pairId]: true }));
  };

  const handleComplete = () => {
    if (!allRevealed || isCompleted) return;
    try { audioService.playSuccess(); } catch (e) {}
    onComplete();
  };

  // ============================================
  // TÍTULO (HTML o Imagen)
  // ============================================
  const renderTitle = () => {
    if (data.titleImage) {
      return (
        <img
          src={data.titleImage}
          alt={data.titleAccent || 'Título'}
          className="w-full h-auto block rounded-2xl"
          draggable={false}
        />
      );
    }
    return (
      <div
        className="w-full rounded-2xl p-4 relative overflow-hidden"
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0'
        }}
      >
        <div className="relative z-10 flex items-center gap-3">
          <span
            className="font-black leading-none flex-shrink-0"
            style={{
              fontSize: '40px',
              color: '#ea580c',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '-0.02em',
              textShadow: '2px 2px 0 rgba(234, 88, 12, 0.12)',
              display: 'inline-block',
              transform: 'scaleX(1.05)',
              transformOrigin: 'left center'
            }}
          >
            TDAH
          </span>

          <div className="flex flex-col flex-1 min-w-0">
            <span
              className="font-black leading-tight"
              style={{
                fontSize: '17px',
                color: '#1e3a8a',
                fontFamily: 'Outfit, sans-serif'
              }}
            >
              {data.titleAccent}
            </span>
            <span
              className="font-medium leading-snug mt-1"
              style={{ fontSize: '11px', color: '#64748b' }}
            >
              {data.subtitle}
            </span>
          </div>
        </div>

        <div
          className="w-full mt-3 px-3 py-2 rounded-lg"
          style={{ background: '#1e3a8a' }}
        >
          <p
            className="font-bold text-center leading-tight"
            style={{ color: '#f1f5f9', fontSize: '11px' }}
          >
            {data.disclaimer}
          </p>
        </div>
      </div>
    );
  };

  // ============================================
  // TARJETA "PLAN DE ACCIÓN"
  // ============================================
  const renderPlanCard = () => {
    const steps = data.planSteps || [];
    return (
      <div
        className="w-full rounded-2xl p-5 relative overflow-hidden animate-[fadeIn_0.4s_ease-out]"
        style={{
          background: 'linear-gradient(180deg, #fffbf5 0%, #fff7ed 100%)',
          border: '2px solid #fed7aa',
          boxShadow: '0 6px 0 0 #fed7aa, 0 10px 20px rgba(234, 88, 12, 0.08)'
        }}
      >
        <span
          className="absolute -top-1 left-1/2 w-16 h-4 rounded-sm opacity-70"
          style={{ background: '#fbbf24', transform: 'translateX(-50%) rotate(-2deg)' }}
        />

        <h3
          className="text-center font-black mb-1 mt-3"
          style={{
            fontSize: '22px',
            color: '#1e293b',
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '0.02em'
          }}
        >
          PLAN DE ACCIÓN
        </h3>

        <div className="w-full h-0.5 mb-4" style={{ background: '#ea580c', opacity: 0.5 }} />

        <div className="flex flex-col gap-3">
          {steps.map((step) => (
            <div key={step.num} className="flex items-center gap-3">
              <span
                className="font-black flex-shrink-0"
                style={{ fontSize: '16px', color: '#ea580c', width: '22px' }}
              >
                {step.num}.
              </span>
              <span className="text-xl flex-shrink-0">{step.emoji}</span>
              <div className="flex flex-col min-w-0">
                <span
                  className="font-black uppercase tracking-wider"
                  style={{ fontSize: '14px', color: '#0f172a' }}
                >
                  {step.label}
                </span>
                <span
                  className="font-medium leading-snug"
                  style={{ fontSize: '12px', color: '#64748b' }}
                >
                  {step.hint}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4">
          <span className="text-3xl">⭐</span>
        </div>
      </div>
    );
  };

  // ============================================
  // RETO PRIMARY (arriba del tip, días 1-7)
  // ============================================
  const renderPrimaryChallenge = () => {
    if (activeWeekId < 2) return null;
    if (isChallenge || isChallengeClose) return null;

    const ordered = getActiveChallengesOrdered();
    if (!ordered || ordered.length === 0) return null;

    const primary = ordered.find(
      (c) => c.displayPriority === 'primary' && c.status === 'accepted'
    );
    if (!primary) return null;

    return (
      <ChallengeTip
        key={primary.id}
        data={{ challenge: primary }}
        variant="banner"
        onComplete={() => {}}
      />
    );
  };

  // ============================================
  // RETO BACKGROUND (abajo del tip, días 8-14)
  // ============================================
  const renderBackgroundChallenge = () => {
    if (activeWeekId < 2) return null;
    if (isChallenge || isChallengeClose) return null;

    const ordered = getActiveChallengesOrdered();
    if (!ordered || ordered.length === 0) return null;

    const background = ordered.find(
      (c) => c.displayPriority === 'background' && c.status === 'accepted'
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

  // ============================================
  // MODO CHALLENGE CLOSE
  // ============================================
  if (isChallengeClose) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {renderTitle()}

        <ChallengeTip
          data={data}
          variant="close"
          onComplete={onComplete}
        />
      </div>
    );
  }

  // ============================================
  // MODO CHALLENGE
  // ============================================
  if (isChallenge) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {renderTitle()}

        <ChallengeTip
          data={data}
          isCompleted={isCompleted}
          onComplete={onComplete}
          onGoToNotes={() => {
            if (onOpenSheet) onOpenSheet();
          }}
        />
      </div>
    );
  }

  // ============================================
  // MODO QUIZ
  // ============================================
  if (isQuiz) {
    return (
      <div className="flex flex-col gap-4 w-full">
        {renderPrimaryChallenge()}

        {renderTitle()}

        <QuizTip
          data={data}
          isCompleted={isCompleted}
          onComplete={onComplete}
        />

        {isCompleted && hasSheet && activeDay >= 4 && (
          <button
            type="button"
            onClick={onOpenSheet}
            className="w-full py-3 rounded-2xl font-black text-[12px] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
            style={{
              background: '#ffffff',
              color: '#334155',
              border: '1.5px solid #cbd5e1',
              boxShadow: '0 3px 0 0 #e2e8f0'
            }}
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span>Ver la lámina completa de la semana</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        )}

        {renderBackgroundChallenge()}
      </div>
    );
  }

  // ============================================
  // MODOS NORMALES (single / twoColumns)
  // ============================================
  return (
    <div className="flex flex-col gap-4 w-full">

      {renderPrimaryChallenge()}

      {renderTitle()}

      {isSingle ? (
        <div className="w-full flex flex-col items-center gap-3">
          {pairs.map((pair) => {
            const isRevealed = revealed[pair.id];
            return (
              <div key={pair.id} className="w-full">
                {!isRevealed ? (
                  <button
                    type="button"
                    onClick={() => handleReveal(pair.id)}
                    className="w-full flex flex-col items-center gap-3 active:scale-[0.99] transition-all cursor-pointer"
                    style={{ background: 'transparent', border: 'none', padding: 0 }}
                  >
                    <img
                      src={pair.problemImage}
                      alt=""
                      className="w-full h-auto block rounded-2xl"
                      draggable={false}
                    />
                    <div className="flex flex-col items-center gap-1.5 my-2">
                      <span
                        className="text-4xl select-none"
                        style={{
                          animation: 'huellitaPulse 1.4s ease-in-out infinite',
                          filter: 'drop-shadow(0 2px 6px rgba(234, 88, 12, 0.4))'
                        }}
                      >
                        🐾
                      </span>
                      <span
                        className="text-[11px] font-black uppercase tracking-wider"
                        style={{ color: '#ea580c' }}
                      >
                        Tocá la huellita
                      </span>
                    </div>
                  </button>
                ) : data.solutionType === 'card' ? (
                  renderPlanCard()
                ) : (
                  <img
                    src={pair.solutionImage}
                    alt=""
                    className="w-full h-auto block rounded-2xl animate-[fadeIn_0.4s_ease-out]"
                    draggable={false}
                  />
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full flex" style={{ gap: '6px' }}>
          <div className="flex flex-col" style={{ width: '50%' }}>
            {pairs.map((pair) => (
              <button
                key={pair.id}
                type="button"
                onClick={() => handleReveal(pair.id)}
                className="block transition-all active:scale-[0.98] cursor-pointer"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  opacity: revealed[pair.id] ? 0.75 : 1
                }}
              >
                <img
                  src={pair.problemImage}
                  alt=""
                  className="w-full h-auto block"
                  draggable={false}
                />
              </button>
            ))}
          </div>

          <div className="flex flex-col" style={{ width: '50%' }}>
            {pairs.map((pair) => {
              const isRevealed = revealed[pair.id];
              return (
                <div key={pair.id} style={{ width: '100%' }}>
                  {isRevealed ? (
                    <img
                      src={pair.solutionImage}
                      alt=""
                      className="w-full h-auto block animate-[fadeIn_0.3s_ease-out]"
                      draggable={false}
                    />
                  ) : (
                    <div
                      className="w-full flex items-center justify-center"
                      style={{
                        background: '#f8fafc',
                        border: '1.5px dashed #e2e8f0',
                        aspectRatio: '1 / 1'
                      }}
                    >
                      <span className="text-2xl" style={{ color: '#cbd5e1' }}>
                        ?
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-1">
        <span
          className="text-[11px] font-black"
          style={{ color: allRevealed ? '#10b981' : '#94a3b8' }}
        >
          {revealedCount} / {pairs.length} revelados
        </span>

        {isCompleted ? (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black"
            style={{ background: '#d1fae5', border: '1px solid #10b981', color: '#065f46' }}
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>¡Ya cumplido hoy!</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            disabled={!allRevealed}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-black transition-all cursor-pointer active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: allRevealed ? '#0f172a' : '#94a3b8',
              color: '#fff',
              boxShadow: allRevealed ? '0 2px 0 0 #000' : '0 2px 0 0 #64748b'
            }}
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>¡Cumplí! +{data.reward} XP</span>
          </button>
        )}
      </div>

      {isCompleted && hasSheet && activeDay >= 4 && (
        <button
          type="button"
          onClick={onOpenSheet}
          className="w-full py-3 rounded-2xl font-black text-[12px] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
          style={{
            background: '#ffffff',
            color: '#334155',
            border: '1.5px solid #cbd5e1',
            boxShadow: '0 3px 0 0 #e2e8f0'
          }}
        >
          <span className="material-symbols-outlined text-[18px]">menu_book</span>
          <span>Ver la lámina completa de la semana</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      )}

      {renderBackgroundChallenge()}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes huellitaPulse {
          0%   { transform: scale(1) rotate(-8deg); opacity: 0.65; }
          50%  { transform: scale(1.25) rotate(8deg); opacity: 1; }
          100% { transform: scale(1) rotate(-8deg); opacity: 0.65; }
        }
      `}</style>
    </div>
  );
}