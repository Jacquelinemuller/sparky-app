import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { useSparkyTips } from '../hooks/useSparkyTips';
import SheetViewerModal from './tips/SheetViewerModal';
import { audioService } from '../services/audioService';
import sparkyVideo from '../assets/sparky.mp4';

export const SparkyCompanion = () => {
  const { sparkyMessage, setSparkyMessage, userName } = useApp();
  const {
    currentWeekGuide,
    currentDailyTip,
    currentTipKey,
    isTipCompleted,
    completeTipChallenge
  } = useSparkyTips();

  const [badgeIcon, setBadgeIcon] = useState('⚡');
  const [isBouncing, setIsBouncing] = useState(false);
  const [speechPopState, setSpeechPopState] = useState(false);
  const [mode, setMode] = useState('tip');
  const [tipView, setTipView] = useState('tip');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const videoRef = useRef(null);

  const affectionPhrases = [
    `¡Guau guau! Me alegra que me toques, ${userName}. ¡Vamos que tú puedes con todo!`,
    '¡Woof! Siento tus caricias. Recuerda: un solo problema a la vez y lo conseguirás.',
    '¡Yip! Aquí estoy contigo. Respira hondo conmigo: toma aire... y suelta.',
    '¡Guau! Eres mi héroe favorito. Con calma y buena letra derrotamos cualquier reto.',
    `¡Mover la colita me da energía! ¡Vamos ${userName}, estamos haciéndolo genial juntos!`
  ];

  useEffect(() => {
    setJustCompleted(false);
    setTipView('tip');
    if (!isTipCompleted) setMode('tip');
  }, [currentTipKey, isTipCompleted]);

  const triggerBounce = () => {
    setIsBouncing(false);
    setTimeout(() => setIsBouncing(true), 10);
  };

  const handleSparkyTouch = () => {
    if (mode === 'tip') return;

    triggerBounce();
    setBadgeIcon('❤️');
    setTimeout(() => setBadgeIcon('⚡'), 1200);

    const randomPhrase = affectionPhrases[Math.floor(Math.random() * affectionPhrases.length)];
    setSparkyMessage(randomPhrase);

    setSpeechPopState(false);
    setTimeout(() => setSpeechPopState(true), 10);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    try { audioService.playBark(); } catch (e) {}

    try {
      confetti({
        particleCount: 15,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#ff6b00', '#f59e0b', '#10b981']
      });
    } catch (e) {}
  };

  const handleBark = () => {
    try { audioService.playBark(); } catch (e) {}
    triggerBounce();
    setBadgeIcon('🐶');
    setTimeout(() => setBadgeIcon('⚡'), 800);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleSwitchToNormal = () => {
    try { audioService.playClick(); } catch (e) {}
    setMode('normal');
  };

  const handleSwitchToTip = () => {
    try { audioService.playPop(); } catch (e) {}
    setMode('tip');
    setTipView('tip');
    setJustCompleted(false);
  };

  const handleShowReto = () => {
    try { audioService.playPop(); } catch (e) {}
    setTipView('reto');
    setSpeechPopState(false);
    setTimeout(() => setSpeechPopState(true), 10);
  };

  const handleBackToTip = () => {
    try { audioService.playClick(); } catch (e) {}
    setTipView('tip');
    setSpeechPopState(false);
    setTimeout(() => setSpeechPopState(true), 10);
  };

  const handleCompleteTip = () => {
    if (isTipCompleted) return;
    try { audioService.playSuccess(); } catch (e) {}
    completeTipChallenge();
    setJustCompleted(true);
    setTimeout(() => {
      setMode('normal');
      setJustCompleted(false);
      setTipView('tip');
    }, 2500);
  };

  const openSheet = () => {
    try { audioService.playClick(); } catch (e) {}
    setIsSheetOpen(true);
  };

  const isCustomTip = currentDailyTip?.isCustom === true;
  const hasSheet = !isCustomTip && currentWeekGuide?.sheetImage;
  const tipReward = currentDailyTip?.reward || 15;

  // ==================== VISTAS ====================

  const renderTipView = () => (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="font-label-sm text-[10px] font-black uppercase tracking-wider text-[#ea580c]">
          💡 Tip de hoy
        </span>
        <span className="px-1.5 py-0.5 rounded-full bg-[#ede9fe] text-[#6d28d9] border border-[#c4b5fd] font-label-sm text-[10px] font-black">
          Semana {currentWeekGuide?.weekNumber || 1}
        </span>
        {isCustomTip && (
          <span className="px-1.5 py-0.5 rounded-full bg-[#ede9fe] text-[#6d28d9] border border-[#c4b5fd] font-label-sm text-[10px] font-black">
            👨‍👩‍👧 De casa
          </span>
        )}
      </div>
      <p className="font-body-md text-body-md text-on-surface font-black leading-tight break-words">
        {currentDailyTip?.title}
      </p>
      <p className="font-body-sm text-body-sm text-on-surface-variant font-medium leading-snug break-words">
        {currentDailyTip?.explanation}
      </p>
    </div>
  );

  const renderRetoView = () => (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="font-label-sm text-[10px] font-black uppercase tracking-wider text-[#ea580c]">
          🎯 Micro-reto del día
        </span>
      </div>
      <p className="font-body-md text-body-md text-on-surface font-black leading-tight break-words">
        ¡Tu turno, {userName}!
      </p>
      <div className="w-full p-2.5 rounded-xl bg-[#fff7ed] border border-dashed border-[#ff6b00]">
        <p className="font-body-sm text-body-sm font-bold text-on-surface leading-snug break-words whitespace-normal">
          "{currentDailyTip?.action}"
        </p>
      </div>
      <p className="font-label-sm text-[10px] text-[#ea580c] font-black">
        🎁 Recompensa: +{tipReward} XP
      </p>
    </div>
  );

  const renderCompletedView = () => (
    <div className="flex flex-col gap-1.5 w-full">
      <p className="font-body-md text-body-md text-[#10b981] font-black">
        ¡Reto cumplido! 🎉
      </p>
      <p className="font-body-sm text-body-sm text-on-surface-variant font-medium break-words">
        ¡Ese superpoder ya es tuyo, {userName}! Nos vemos mañana con otro tip 🐾
      </p>
    </div>
  );

  const renderNormalView = () => (
    <p className="font-body-md text-body-md text-on-surface font-semibold leading-relaxed break-words">
      {sparkyMessage}
    </p>
  );

  const renderMessage = () => {
    if (justCompleted) return renderCompletedView();
    if (mode === 'normal') return renderNormalView();

    if (tipView === 'reto') return renderRetoView();
    return renderTipView();
  };

  // ==================== BOTONES (SIN GUAU — ahora va debajo del video) ====================

  const renderButtons = () => {
    if (justCompleted) {
      return null;
    }

    if (mode === 'normal') {
      return (
        <button
          type="button"
          onClick={handleSparkyTouch}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-[#ffedd5] text-[#9a3412] font-label-sm text-label-sm font-bold transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[17px] text-[#ea580c]">auto_awesome</span>
          <span>Otro consejo</span>
        </button>
      );
    }

    if (tipView === 'tip') {
      return (
        <>
          {hasSheet && (
            <button
              type="button"
              onClick={openSheet}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#fff7ed] border border-[#fed7aa] text-[#ea580c] font-label-sm text-label-sm font-black shadow-[0_1px_0_0_#fed7aa] active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">image</span>
              <span>Ver lámina</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleShowReto}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff6b00] hover:bg-[#ea580c] text-white font-label-sm text-label-sm font-black shadow-[0_2px_0_0_#c2410c] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            <span>Ver el reto</span>
          </button>
        </>
      );
    }

    return (
      <>
        <button
          type="button"
          onClick={handleBackToTip}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#fff7ed] border border-[#fed7aa] text-[#ea580c] font-label-sm text-label-sm font-black shadow-[0_1px_0_0_#fed7aa] active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Volver</span>
        </button>

        {!isTipCompleted ? (
          <button
            type="button"
            onClick={handleCompleteTip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#10b981] hover:bg-[#059669] text-white font-label-sm text-label-sm font-black shadow-[0_2px_0_0_#047857] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>¡Cumplí! +{tipReward} XP</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#d1fae5] border border-[#10b981] text-[#065f46] font-label-sm text-label-sm font-black">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>¡Ya cumplido hoy!</span>
          </span>
        )}
      </>
    );
  };

  return (
    <>
      <div className="w-full p-5 rounded-2xl bg-gradient-to-b from-[#fff7ed] to-[#ffedd5] border-2 border-[#fed7aa] flex flex-col gap-4 shadow-[0_4px_0_0_#fed7aa,0_10px_20px_rgba(255,107,0,0.08)] relative overflow-visible">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-[#fed7aa]/50 pb-2.5">
          <span className="font-headline-md text-headline-md font-extrabold text-[#ea580c] leading-tight">
            Sparky
          </span>

          {mode === 'tip' ? (
            <button
              type="button"
              onClick={handleSwitchToNormal}
              className="px-2.5 py-1 rounded-full bg-white border border-[#fed7aa] text-[#ea580c] font-label-sm text-[10px] font-black active:scale-95 transition-all cursor-pointer hover:bg-[#fff7ed]"
              title="Volver a los consejos normales"
            >
              🐾 Otro consejo
            </button>
          ) : (
            !isTipCompleted && (
              <button
                type="button"
                onClick={handleSwitchToTip}
                className="px-2.5 py-1 rounded-full bg-white border border-[#fed7aa] text-[#ea580c] font-label-sm text-[10px] font-black active:scale-95 transition-all cursor-pointer hover:bg-[#fff7ed]"
                title="Ver el tip del día"
              >
                📚 Ver tip del día
              </button>
            )
          )}
        </div>

        {/* Fila superior: Avatar + Botón Guau + Burbuja */}
        <div className="flex items-start gap-3">
          {/* Columna del Avatar: video + botón Guau debajo */}
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div
              onClick={handleSparkyTouch}
              className="relative cursor-pointer group"
              role="button"
              tabIndex={0}
              title="¡Tócame para un saludo!"
            >
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-[#ff6b00] shadow-[0_6px_16px_rgba(255,107,0,0.35)] overflow-hidden bg-white transition-all duration-300 group-hover:scale-105 group-active:scale-90 ${
                  isBouncing ? 'sparky-tap-bounce' : ''
                }`}
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover bg-amber-50"
                  autoPlay
                  loop
                  muted
                  playsInline
                  src={sparkyVideo}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white border-2 border-[#fed7aa] rounded-full px-2 py-0.5 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-[15px] leading-none">{badgeIcon}</span>
              </div>
            </div>

            {/* 🐾 Botón Guau — debajo del video */}
            <button
              type="button"
              onClick={handleBark}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-[#ffedd5] border-2 border-[#fed7aa] text-[#ea580c] font-label-sm text-[11px] font-black shadow-[0_2px_0_0_#fed7aa] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              title="¡Guau guau!"
            >
              <span className="material-symbols-outlined text-[16px]">pets</span>
              <span>¡Guau!</span>
            </button>
          </div>

          {/* Burbuja de diálogo */}
          <div className="relative flex-1 min-w-0">
            <div
              className={`relative bg-white border-2 p-3.5 sm:p-4 rounded-2xl shadow-[0_2px_0_0_#fed7aa] transition-all overflow-hidden ${
                isCustomTip && mode === 'tip' ? 'border-[#c4b5fd]' : 'border-[#fed7aa]'
              } ${speechPopState ? 'speech-pop' : ''}`}
            >
              <span
                className={`absolute -left-2.5 top-6 w-0 h-0 border-y-[9px] border-y-transparent border-r-[11px] z-10 pointer-events-none ${
                  isCustomTip && mode === 'tip' ? 'border-r-[#c4b5fd]' : 'border-r-white'
                }`}
              />
              <span
                className={`absolute -left-3 top-6 w-0 h-0 border-y-[9px] border-y-transparent border-r-[11px] pointer-events-none ${
                  isCustomTip && mode === 'tip' ? 'border-r-[#c4b5fd]' : 'border-r-[#fed7aa]'
                }`}
              />
              {renderMessage()}
            </div>
          </div>
        </div>

        {/* Botones restantes */}
        <div className="flex items-center justify-center gap-2 w-full flex-wrap">
          {renderButtons()}
        </div>
      </div>

      <SheetViewerModal
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        guide={currentWeekGuide}
      />
    </>
  );
};