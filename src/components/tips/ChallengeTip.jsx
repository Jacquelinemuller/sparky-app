import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';
import confetti from 'canvas-confetti';

function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Sonido motivador
const playMotivationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const t = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do
    
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.1);
      gain.gain.setValueAtTime(0, t + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.15, t + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.6);
    });
  } catch (e) {}
};

const CHECK_IN_OPTIONS = [
  { id: 'si',        label: 'Lo hice',    emoji: '😄', color: '#10b981' },
  { id: 'masOMenos', label: 'Más o menos', emoji: '😐', color: '#f59e0b' },
  { id: 'no',        label: 'No pude',    emoji: '😞', color: '#94a3b8' }
];

const PALETTE = {
  paper: '#fefcf6',
  paperLine: 'rgba(56, 189, 248, 0.16)',
  paperBorder: '#e8e3d5',
  orange: '#ea580c',
  inkSoft: '#334155',
  inkMuted: '#64748b',
  navy: '#1e3a8a',
  yellow: '#facc15'
};

export default function ChallengeTip({
  data,
  variant = 'full',
  isCompleted,
  onComplete,
  onGoToNotes
}) {
  const {
    activeChallenges,
    startChallenge,
    acceptChallenge,
    setChallengeCheckIn,
    isChallengeActive,
    getChallengeStatus
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);

  const challenge = data?.challenge;
  const activeChallenge = challenge
    ? (activeChallenges || []).find((c) => c.id === challenge.id)
    : null;
  const isPending = activeChallenge?.status === 'pending';
  
  // 🔑 FIX: Ahora lee el estado real. Si el usuario ya lo aceptó, pasa a la siguiente pantalla.
  const isAccepted = activeChallenge?.status === 'accepted'; 

  const todayKey = getTodayKey();
  const todayCheckIn = activeChallenge?.checkIns?.[todayKey];
  const hasCheckedToday = !!todayCheckIn;
  const canCheckInToday = activeChallenge ? isChallengeActive(activeChallenge) : false;

  useEffect(() => {
    if (variant === 'full' && !activeChallenge && challenge) {
      startChallenge({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        icon: challenge.icon,
        why: challenge.why,
        durationDays: challenge.durationDays
      });
    }
  }, [variant, activeChallenge, challenge, startChallenge]);

  const handleAccept = () => {
    playMotivationSound();
    try { audioService.playSuccess(); } catch (e) {}
    
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ea580c', '#f97316', '#10b981', '#3b82f6', '#facc15']
      });
    } catch (e) {}

    if (isPending) {
      acceptChallenge(challenge.id);
    } else if (challenge) {
      startChallenge({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        icon: challenge.icon,
        why: challenge.why,
        durationDays: challenge.durationDays
      });
    }
    if (onComplete) onComplete();
  };

  const handleAcceptNew = () => {
    playMotivationSound();
    try { audioService.playSuccess(); } catch (e) {}

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#ea580c', '#facc15']
      });
    } catch (e) {}

    const alreadyAccepted = (activeChallenges || []).some((c) => c.id === data.newChallenge.id);
    if (alreadyAccepted) {
      if (onComplete) onComplete();
      return;
    }

    startChallenge({
      id: data.newChallenge.id,
      title: data.newChallenge.title,
      description: data.newChallenge.description,
      icon: data.newChallenge.icon,
      why: data.newChallenge.why,
      durationDays: data.newChallenge.durationDays
    });

    setTimeout(() => {
      acceptChallenge(data.newChallenge.id);
      if (onComplete) onComplete();
    }, 100);
  };

  const handleGoToNotes = () => {
    try { audioService.playClick(); } catch (e) {}
    if (onGoToNotes) onGoToNotes();
  };

  const handleCheckIn = (optionId) => {
    try { audioService.playSuccess(); } catch (e) {}
    setChallengeCheckIn(challenge.id, todayKey, optionId);
    setShowCheckIn(false);
  };

  const completedDays = activeChallenge
    ? Object.values(activeChallenge.checkIns || {}).filter(
        (v) => v === 'si' || v === 'masOMenos'
      ).length
    : 0;

  const renderHighlightedText = (text) => {
    if (!text) return null;
    const parts = text.split('*');
    return parts.map((part, index) => {
      if (index % 2 !== 0) {
        return (
          <span key={index} style={{ color: PALETTE.yellow, fontWeight: 900, textShadow: 'none' }}>
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const renderTitle = () => {
    return (
      <div className="w-full mb-4">
        <div className="flex items-start gap-3 mb-3">
          <span className="font-black leading-[0.9] flex-shrink-0" style={{ fontSize: '44px', color: PALETTE.orange, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em', textShadow: '2px 2px 0 rgba(234, 88, 12, 0.15)' }}>
            TDAH
          </span>
          <span className="font-black leading-[1.05] flex-1 pt-1" style={{ fontSize: '22px', color: PALETTE.navy, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.01em' }}>
            {data.titleAccent}
          </span>
        </div>
        <p className="font-medium leading-snug mb-4" style={{ fontSize: '13px', color: PALETTE.inkMuted }}>
          {data.subtitle}
        </p>
        
        <div className="relative w-full mb-1">
          <img src="/tips/banner.png" alt="" className="w-full h-auto block" draggable={false} />
          <div className="absolute inset-0 flex items-center justify-center" style={{ padding: '0 24px' }}>
            <p className="font-bold text-center leading-[1.15]" style={{ color: '#f1f5f9', fontSize: '11.5px', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
              {renderHighlightedText(data.disclaimer)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // ============================================
  // VARIANTE "CLOSE"
  // ============================================
  if (variant === 'close') {
    const closingId = data.closingChallengeId;
    const newCh = data.newChallenge;
    const closingChallenge = (activeChallenges || []).find((c) => c.id === closingId);
    const done = closingChallenge ? Object.values(closingChallenge.checkIns || {}).filter((v) => v === 'si' || v === 'masOMenos').length : 0;
    const duration = closingChallenge?.durationDays || 14;

    let closeMessage = '';
    if (done >= 5) closeMessage = '¡Lo hiciste un montón! Esto ya empieza a ser tuyo. No es suerte: es constancia. 💪';
    else if (done >= 3) closeMessage = 'Probaste. Eso ya es más de lo que hace la mayoría. Y lo mejor: ya sabés que podés.';
    else if (done >= 1) closeMessage = 'Probaste al menos una vez. Eso no es poco. La próxima vas por más.';
    else closeMessage = 'No importa cuántas veces. Importa que la seguís teniendo presente. Se puede reintentar.';

    const alreadyAccepted = (activeChallenges || []).some((c) => c.id === newCh.id);

    return (
      <div className="w-full relative">
        <div className="w-full rounded-xl overflow-hidden relative" style={{ background: PALETTE.paper, border: `1px solid ${PALETTE.paperBorder}`, boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, ${PALETTE.paperLine} 31px, ${PALETTE.paperLine} 32px)`, opacity: 0.6 }} />
          <div className="relative z-10 p-4 flex flex-col gap-4">
            {renderTitle()}

            <div className="w-full bg-white rounded-lg p-4 flex flex-col gap-4 border border-[#e2e8f0] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <img src="/tips/icons/revision.png" alt="" className="w-12 h-12 object-contain animate-[iconFloat_3s_ease-in-out_infinite]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-black uppercase tracking-wider text-[10px] text-slate-500">Tu primer reto</span>
                  <span className="font-black leading-tight text-[17px] text-slate-800">{closingChallenge?.title || '3 cosas del día'}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: duration }).map((_, i) => (
                  <span key={i} className="flex-1 h-2 rounded-sm" style={{ background: i < done ? '#10b981' : '#e2e8f0' }} />
                ))}
              </div>
              <div className="text-center">
                <span className="font-black text-[24px] text-orange-600">{done}/{duration}</span>
                <p className="font-bold mt-1 text-[11px] text-slate-500">días completados</p>
              </div>
              <div className="w-full p-3 rounded-md bg-[#f0fdf4] border border-[#a7f3d0]">
                <p className="font-medium leading-snug text-center text-[13px] text-emerald-800">{closeMessage}</p>
              </div>
              {done >= 3 && (
                <div className="w-full p-3 rounded-md flex items-center gap-2 justify-center bg-gradient-to-r from-[#fef3c7] to-[#fde68a] border border-[#fbbf24]">
                  <img src="/tips/icons/esfuerzo.png" alt="" className="w-10 h-10 object-contain animate-[iconFloat_3s_ease-in-out_infinite]" />
                  <span className="font-black text-[12px] text-amber-900">¡Tenés un cofre esperando en el Arcade!</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg">✨</span>
              <span className="font-black uppercase tracking-wider text-[11px] text-emerald-600">Tu nuevo reto</span>
            </div>

            <div className="w-full bg-white rounded-lg p-4 flex flex-col gap-4 border-2 border-emerald-500 shadow-[0_4px_0_0_rgba(16,185,129,0.3)]">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#f0fdf4] border border-[#a7f3d0]">
                  <span className="text-3xl">{newCh.icon}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-black leading-tight text-[17px] text-slate-800">{newCh.title}</span>
                  <span className="font-medium text-[11px] text-slate-500 mt-0.5">Dura {newCh.durationDays} días · 1 vez por día</span>
                </div>
              </div>
              <p className="font-semibold leading-snug text-[14px] text-slate-700">{newCh.description}</p>
              <div className="w-full p-3 rounded-md bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <img src="/tips/icons/rutina.png" alt="" className="w-9 h-9 object-contain animate-[iconFloat_3s_ease-in-out_infinite]" />
                  <span className="font-black uppercase tracking-wider text-[10px] text-slate-600">¿Por qué este reto?</span>
                </div>
                <p className="font-medium leading-snug text-[12px] text-slate-600">{newCh.why}</p>
              </div>
              {alreadyAccepted ? (
                <span className="w-full py-3 rounded-lg font-black text-sm flex items-center justify-center gap-2 bg-[#d1fae5] text-emerald-800 border border-[#10b981]">
                  <span>✅</span> ¡Ya está en curso!
                </span>
              ) : (
                <button type="button" onClick={handleAcceptNew} className="w-full py-3.5 rounded-xl font-black text-[15px] flex items-center justify-center gap-2 cursor-pointer active:translate-y-1 active:shadow-none transition-all bg-[#ea580c] text-white shadow-[0_4px_0_0_#9a3412]">
                  <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
                  Acepto el nuevo reto
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // VARIANTE "BACKGROUND"
  // ============================================
  if (variant === 'background') {
    if (!challenge) return null;
    if (!isAccepted && !isPending) return null;
    const timeStatus = activeChallenge ? getChallengeStatus(activeChallenge) : 'pending';
    const daysLeft = activeChallenge?.startDate ? Math.max(0, (activeChallenge.durationDays || 14) - Math.floor((new Date() - new Date(activeChallenge.startDate + 'T00:00:00')) / (1000 * 60 * 60 * 24))) : 0;

    return (
      <div className="w-full rounded-lg overflow-hidden bg-white border border-slate-200 shadow-sm">
        <button type="button" onClick={() => { try { audioService.playPop(); } catch (e) {} setIsOpen((v) => !v); }} className="w-full p-3 flex items-center gap-2 cursor-pointer">
          <span className="text-lg flex-shrink-0">📌</span>
          <div className="flex-1 min-w-0 text-left">
            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Reto anterior · {daysLeft} días</span>
            <span className="block text-[12px] font-bold truncate text-slate-700">{challenge.title}</span>
          </div>
          <span className="text-[11px] font-black flex-shrink-0 text-slate-500">{completedDays}/{challenge.durationDays}</span>
          <span className="material-symbols-outlined flex-shrink-0 transition-transform text-slate-500 text-[20px]" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
        </button>
        <div className="flex items-center gap-0.5 px-3 pb-2">
          {Array.from({ length: challenge.durationDays }).map((_, i) => (
            <span key={i} className="flex-1 h-1 rounded-sm" style={{ background: i < completedDays ? '#64748b' : '#e2e8f0' }} />
          ))}
        </div>
        {isOpen && (
          <div className="px-3 pb-3 flex flex-col gap-2">
            <p className="font-medium leading-snug text-[12px] text-slate-600">{challenge.description}</p>
            {!canCheckInToday ? (
              <div className="w-full p-2 rounded-md flex items-center gap-2 justify-center bg-slate-50 border border-dashed border-slate-300">
                <span className="text-sm">📅</span>
                <span className="font-black text-[11px] text-slate-500">{timeStatus === 'pending' ? 'Arranca el lunes' : 'Check-in cerrado'}</span>
              </div>
            ) : hasCheckedToday ? (
              (() => {
                const opt = CHECK_IN_OPTIONS.find((o) => o.id === todayCheckIn);
                return (
                  <div className="w-full p-2 rounded-md flex items-center gap-2 bg-white" style={{ border: `1.5px solid ${opt?.color || '#64748b'}` }}>
                    <span className="text-base">{opt?.emoji || '✅'}</span>
                    <span className="font-black text-[11px]" style={{ color: opt?.color || '#64748b' }}>Hoy: {opt?.label || 'listo'}</span>
                  </div>
                );
              })()
            ) : !showCheckIn ? (
              <button type="button" onClick={() => { try { audioService.playPop(); } catch (e) {} setShowCheckIn(true); }} className="w-full py-2 rounded-md font-black text-[11px] cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 bg-white text-slate-600 border border-slate-300">
                <span>📋</span> Marcar hoy
              </button>
            ) : (
              <div className="flex flex-col gap-1.5">
                {CHECK_IN_OPTIONS.map((opt) => (
                  <button key={opt.id} type="button" onClick={() => handleCheckIn(opt.id)} className="w-full py-2 rounded-md font-black text-[11px] cursor-pointer active:scale-[0.98] transition-all flex items-center gap-2 px-3 bg-white" style={{ color: opt.color, border: `1.5px solid ${opt.color}` }}>
                    <span className="text-sm">{opt.emoji}</span> {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ============================================
  // VARIANTE "BANNER"
  // ============================================
  if (variant === 'banner') {
    if (!challenge) return null;
    if (isAccepted) {
      return (
        <div className="w-full rounded-lg overflow-hidden bg-[#f0fdf4] border border-emerald-500 shadow-sm">
          <div className="p-3 flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">🎯</span>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-black uppercase tracking-wider text-[10px] text-emerald-800">Reto en curso</span>
              <span className="font-bold leading-tight text-[13px] text-slate-800">{challenge.title}</span>
            </div>
            <span className="font-black flex-shrink-0 text-[14px] text-emerald-600">{completedDays}/{challenge.durationDays}</span>
          </div>
          <div className="flex items-center gap-1 px-3 pb-2">
            {Array.from({ length: challenge.durationDays }).map((_, i) => (
              <span key={i} className="flex-1 h-1.5 rounded-sm" style={{ background: i < completedDays ? '#10b981' : '#d1fae5' }} />
            ))}
          </div>
          <div className="px-3 pb-3">
            {!canCheckInToday ? (
              <div className="w-full p-2 rounded-md flex items-center gap-2 text-center justify-center bg-slate-100/50 border border-dashed border-slate-300">
                <span className="text-sm">📅</span>
                <span className="font-black text-[11px] text-slate-500">Arranca el lunes</span>
              </div>
            ) : hasCheckedToday ? (
              (() => {
                const opt = CHECK_IN_OPTIONS.find((o) => o.id === todayCheckIn);
                return (
                  <div className="w-full p-2 rounded-md flex items-center gap-2 bg-white border border-emerald-500">
                    <span className="text-lg">{opt?.emoji || '✅'}</span>
                    <span className="font-black text-[12px] text-emerald-600">Hoy: {opt?.label || 'listo'}</span>
                  </div>
                );
              })()
            ) : !showCheckIn ? (
              <button type="button" onClick={() => { try { audioService.playPop(); } catch (e) {} setShowCheckIn(true); }} className="w-full py-2 rounded-md font-black text-[11px] cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-[0_2px_0_0_#047857]">
                <span>📋</span> ¿Cómo te fue hoy?
              </button>
            ) : (
              <div className="flex flex-col gap-1.5 animate-[fadeIn_0.2s_ease-out]">
                {CHECK_IN_OPTIONS.map((opt) => (
                  <button key={opt.id} type="button" onClick={() => handleCheckIn(opt.id)} className="w-full py-2 rounded-md font-black text-[11px] cursor-pointer active:scale-[0.98] transition-all flex items-center gap-2 px-3 bg-white" style={{ color: opt.color, border: `1.5px solid ${opt.color}` }}>
                    <span className="text-base">{opt.emoji}</span> {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }
    if (!isPending) return null;
    return (
      <div className="w-full rounded-lg overflow-hidden bg-white border-2 border-orange-500 shadow-[0_3px_0_0_rgba(234,88,12,0.3)]">
        <button type="button" onClick={() => { try { audioService.playPop(); } catch (e) {} setIsOpen((v) => !v); }} className="w-full p-4 flex items-center gap-3 cursor-pointer transition-all" style={{ background: isOpen ? '#fff7ed' : '#ffffff', animation: !isOpen ? 'challengePulse 2.5s ease-in-out infinite' : 'none' }}>
          <span className="text-2xl flex-shrink-0">🎯</span>
          <div className="flex flex-col flex-1 min-w-0 items-start text-left">
            <span className="font-black uppercase tracking-wider text-[10px] text-orange-600">Tu reto de la semana</span>
            <span className="font-bold leading-tight text-[13px] text-slate-800">Tocá para {isOpen ? 'cerrar' : 'ver el reto'}</span>
          </div>
          <span className="material-symbols-outlined flex-shrink-0 transition-transform duration-200 text-orange-600 text-[24px]" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
        </button>
        {isOpen && (
          <div className="px-4 pb-4 flex flex-col gap-3 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 bg-orange-50 border border-orange-200">
                <img src="/tips/icons/revision.png" alt="" className="w-12 h-12 object-contain animate-[iconFloat_3s_ease-in-out_infinite]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black leading-tight text-[16px] text-slate-800">{challenge.title}</span>
                <span className="font-medium leading-snug mt-0.5 text-[11px] text-slate-500">Dura {challenge.durationDays} días · 1 vez por día</span>
              </div>
            </div>
            <p className="font-semibold leading-snug text-[13px] text-slate-700">{challenge.description}</p>
            <div className="w-full p-3 rounded-md bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 mb-1">
                <img src="/tips/icons/rutina.png" alt="" className="w-9 h-9 object-contain animate-[iconFloat_3s_ease-in-out_infinite]" />
                <span className="font-black uppercase tracking-wider text-[10px] text-slate-600">¿Por qué?</span>
              </div>
              <p className="font-medium leading-snug text-[12px] text-slate-600">{challenge.why}</p>
            </div>
            <button type="button" onClick={handleAccept} className="w-full py-3.5 rounded-xl font-black text-[15px] flex items-center justify-center gap-2 cursor-pointer active:translate-y-1 active:shadow-none transition-all bg-[#ea580c] text-white shadow-[0_4px_0_0_#9a3412]">
              <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
              Acepto el reto
            </button>
          </div>
        )}
        <style>{`
          @keyframes challengePulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(234, 88, 12, 0); } 50% { transform: scale(1.015); box-shadow: 0 0 12px rgba(234, 88, 12, 0.15); } }
        `}</style>
      </div>
    );
  }

  // ============================================
  // VARIANTE "FULL" (DÍA 7)
  // ============================================
  if (!challenge) return null;

  if (isAccepted) {
    return (
      <div className="w-full relative">
        <div className="w-full rounded-xl overflow-hidden relative" style={{ background: PALETTE.paper, border: `1px solid ${PALETTE.paperBorder}`, boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, ${PALETTE.paperLine} 31px, ${PALETTE.paperLine} 32px)`, opacity: 0.6 }} />
          <div className="relative z-10 p-4 flex flex-col gap-4">
            {renderTitle()}
            
            <div className="w-full bg-white rounded-lg p-4 flex flex-col gap-4 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 bg-orange-50 border border-orange-200">
                  <img src="/tips/icons/revision.png" alt="" className="w-12 h-12 object-contain animate-[iconFloat_3s_ease-in-out_infinite]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-black leading-tight text-[19px] text-slate-800">{challenge.title}</span>
                  <span className="font-medium leading-snug mt-0.5 text-[12px] text-slate-500">{completedDays} de {challenge.durationDays} días completados</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: challenge.durationDays }).map((_, i) => (
                  <span key={i} className="flex-1 h-2 rounded-sm" style={{ background: i < completedDays ? '#10b981' : '#e2e8f0' }} />
                ))}
              </div>

              <p className="font-semibold leading-snug text-[13px] text-slate-700">{challenge.description}</p>

              <button type="button" onClick={handleGoToNotes} className="w-full py-3 rounded-lg font-black text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all bg-white text-slate-700 border border-slate-300 shadow-[0_3px_0_0_#e2e8f0]">
                <img src="/tips/icons/revision.png" alt="" className="w-12 h-12 object-contain animate-[iconFloat_3s_ease-in-out_infinite]" />
                Anotar en una nota
              </button>

              <div className="w-full p-3 rounded-md bg-orange-50 border border-orange-200">
                <span className="font-black uppercase tracking-wider block mb-1 text-[10px] text-orange-600">🐾 Sparky dice</span>
                <p className="font-medium leading-snug text-[12px] text-orange-800">Solo 3 cosas. No importa si no las cumplís todas. Solo anotarlas ya es un montón.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div className="w-full rounded-xl overflow-hidden relative" style={{ background: PALETTE.paper, border: `1px solid ${PALETTE.paperBorder}`, boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, ${PALETTE.paperLine} 31px, ${PALETTE.paperLine} 32px)`, opacity: 0.6 }} />
        <div className="relative z-10 p-4 flex flex-col gap-4">
          {renderTitle()}

          <div className="w-full bg-white rounded-lg p-4 flex flex-col gap-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 bg-orange-50 border border-orange-200">
                <img src="/tips/icons/revision.png" alt="" className="w-12 h-12 object-contain animate-[iconFloat_3s_ease-in-out_infinite]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black leading-tight text-[19px] text-slate-800">{challenge.title}</span>
                <span className="font-medium leading-snug mt-0.5 text-[12px] text-slate-500">Dura {challenge.durationDays} días · 1 vez por día</span>
              </div>
            </div>

            <p className="font-semibold leading-snug text-[14px] text-slate-700">{challenge.description}</p>

            <div className="w-full p-3 rounded-md bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 mb-1">
                <img src="/tips/icons/rutina.png" alt="" className="w-9 h-9 object-contain animate-[iconFloat_3s_ease-in-out_infinite]" />
                <span className="font-black uppercase tracking-wider text-[10px] text-slate-600">¿Por qué este reto?</span>
              </div>
              <p className="font-medium leading-snug text-[12px] text-slate-600">{challenge.why}</p>
            </div>

            <div className="w-full p-3 rounded-md flex items-start gap-2 bg-[#ecfdf5] border border-[#a7f3d0]">
              <img src="/tips/icons/esfuerzo.png" alt="" className="w-10 h-10 flex-shrink-0 object-contain mt-0.5 animate-[iconFloat_3s_ease-in-out_infinite]" />
              <p className="font-medium leading-snug text-[12px] text-emerald-800">Cada día vas a poder marcar cómo te fue. Si cumplís varios días, al final desbloqueás un cofre con un juego nuevo.</p>
            </div>

            <button 
              type="button" 
              onClick={handleAccept} 
              className="w-full py-3.5 rounded-xl font-black text-[15px] flex items-center justify-center gap-2 cursor-pointer active:translate-y-1 active:shadow-none transition-all bg-[#ea580c] text-white shadow-[0_4px_0_0_#9a3412]"
            >
              <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
              Acepto el reto
            </button>
            
          </div>
        </div>
      </div>

      <style>{`
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-4px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}