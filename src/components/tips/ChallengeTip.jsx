import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';

function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const CHECK_IN_OPTIONS = [
  { id: 'si',        label: 'Lo hice',    emoji: '😄', color: '#10b981' },
  { id: 'masOMenos', label: 'Más o menos', emoji: '😐', color: '#f59e0b' },
  { id: 'no',        label: 'No pude',    emoji: '😞', color: '#94a3b8' }
];

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
    try { audioService.playSuccess(); } catch (e) {}
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

  // ============================================
  // VARIANTE "CLOSE"
  // ============================================
  if (variant === 'close') {
    const closingId = data.closingChallengeId;
    const newCh = data.newChallenge;

    const closingChallenge = (activeChallenges || []).find(
      (c) => c.id === closingId
    );

    const done = closingChallenge
      ? Object.values(closingChallenge.checkIns || {}).filter(
          (v) => v === 'si' || v === 'masOMenos'
        ).length
      : 0;

    const duration = closingChallenge?.durationDays || 14;

    let closeMessage;
    if (done >= 5) {
      closeMessage = '¡Lo hiciste un montón! Esto ya empieza a ser tuyo. No es suerte: es constancia. 💪';
    } else if (done >= 3) {
      closeMessage = 'Probaste. Eso ya es más de lo que hace la mayoría. Y lo mejor: ya sabés que podés.';
    } else if (done >= 1) {
      closeMessage = 'Probaste al menos una vez. Eso no es poco. La próxima vas por más.';
    } else {
      closeMessage = 'No importa cuántas veces. Importa que la seguís teniendo presente. Se puede reintentar.';
    }

    const alreadyAccepted = (activeChallenges || []).some(
      (c) => c.id === newCh.id
    );

    const handleAcceptNew = () => {
      try { audioService.playSuccess(); } catch (e) {}

      if (alreadyAccepted) {
        if (onComplete) onComplete();
        return;
      }

      startChallenge({
        id: newCh.id,
        title: newCh.title,
        description: newCh.description,
        icon: newCh.icon,
        why: newCh.why,
        durationDays: newCh.durationDays
      });

      setTimeout(() => {
        acceptChallenge(newCh.id);
        if (onComplete) onComplete();
      }, 100);
    };

    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span className="font-black uppercase tracking-wider" style={{ color: '#ea580c', fontSize: '11px' }}>
            Cierre de la semana
          </span>
        </div>

        <div className="w-full rounded-2xl p-5 flex flex-col gap-4" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
              <span className="text-3xl">{closingChallenge?.icon || '📝'}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-black uppercase tracking-wider" style={{ color: '#64748b', fontSize: '10px' }}>
                Tu primer reto
              </span>
              <span className="font-black leading-tight" style={{ color: '#0f172a', fontSize: '17px' }}>
                {closingChallenge?.title || '3 cosas del día'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: duration }).map((_, i) => (
              <span key={i} className="flex-1 h-2 rounded-full" style={{ background: i < done ? '#10b981' : '#e2e8f0' }} />
            ))}
          </div>

          <div className="text-center">
            <span className="font-black" style={{ color: '#ea580c', fontSize: '24px' }}>
              {done}/{duration}
            </span>
            <p className="font-bold mt-1" style={{ color: '#64748b', fontSize: '11px' }}>
              días completados
            </p>
          </div>

          <div className="w-full p-3 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
            <p className="font-medium leading-snug text-center" style={{ color: '#065f46', fontSize: '13px' }}>
              {closeMessage}
            </p>
          </div>

          {done >= 3 && (
  <div
    className="w-full p-3 rounded-xl flex items-center gap-2 justify-center"
    style={{
      background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      border: '1.5px solid #fbbf24'
    }}
  >
    <span className="text-2xl">🎁</span>
    <span
      className="font-black"
      style={{ color: '#78350f', fontSize: '12px' }}
    >
      ¡Tenés un cofre esperando en el Arcade!
    </span>
  </div>
)}
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg">✨</span>
          <span className="font-black uppercase tracking-wider" style={{ color: '#10b981', fontSize: '11px' }}>
            Tu nuevo reto
          </span>
        </div>

        <div className="w-full rounded-2xl p-5 flex flex-col gap-4" style={{ background: '#ffffff', border: '2px solid #10b981', boxShadow: '0 3px 0 0 rgba(16, 185, 129, 0.3)' }}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
              <span className="text-3xl">{newCh.icon}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-black leading-tight" style={{ color: '#0f172a', fontSize: '19px' }}>
                {newCh.title}
              </span>
              <span className="font-medium leading-snug mt-0.5" style={{ color: '#64748b', fontSize: '11px' }}>
                Dura {newCh.durationDays} días · 1 vez por día
              </span>
            </div>
          </div>

          <p className="font-bold leading-snug" style={{ color: '#1e293b', fontSize: '14px' }}>
            {newCh.description}
          </p>

          <div className="w-full p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <span className="font-black uppercase tracking-wider block mb-1" style={{ color: '#475569', fontSize: '10px' }}>
              🧠 ¿Por qué este reto?
            </span>
            <p className="font-medium leading-snug" style={{ color: '#334155', fontSize: '12px' }}>
              {newCh.why}
            </p>
          </div>

          {alreadyAccepted ? (
            <span className="w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2" style={{ background: '#d1fae5', color: '#065f46', border: '1.5px solid #10b981' }}>
              <span>✅</span>
              <span>¡Ya está en curso!</span>
            </span>
          ) : (
            <button type="button" onClick={handleAcceptNew} className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all" style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', color: '#fff', boxShadow: '0 3px 0 0 #047857' }}>
              <span>✅</span>
              <span>Acepto el nuevo reto</span>
            </button>
          )}
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
    const daysLeft = activeChallenge?.startDate
      ? Math.max(0, (activeChallenge.durationDays || 14) - Math.floor(
          (new Date() - new Date(activeChallenge.startDate + 'T00:00:00')) /
          (1000 * 60 * 60 * 24)
        ))
      : 0;

    return (
      <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <button
          type="button"
          onClick={() => {
            try { audioService.playPop(); } catch (e) {}
            setIsOpen((v) => !v);
          }}
          className="w-full p-3 flex items-center gap-2 cursor-pointer"
        >
          <span className="text-lg flex-shrink-0">📌</span>
          <div className="flex-1 min-w-0 text-left">
            <span className="block text-[10px] font-black uppercase tracking-wider" style={{ color: '#64748b' }}>
              Reto anterior · {daysLeft} días
            </span>
            <span className="block text-[12px] font-bold truncate" style={{ color: '#334155' }}>
              {challenge.icon} {challenge.title}
            </span>
          </div>
          <span className="text-[11px] font-black flex-shrink-0" style={{ color: '#64748b' }}>
            {completedDays}/{challenge.durationDays}
          </span>
          <span
            className="material-symbols-outlined flex-shrink-0 transition-transform"
            style={{
              color: '#64748b',
              fontSize: '20px',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            expand_more
          </span>
        </button>

        <div className="flex items-center gap-0.5 px-3 pb-2">
          {Array.from({ length: challenge.durationDays }).map((_, i) => (
            <span key={i} className="flex-1 h-1 rounded-full" style={{ background: i < completedDays ? '#64748b' : '#e2e8f0' }} />
          ))}
        </div>

        {isOpen && (
          <div className="px-3 pb-3 flex flex-col gap-2">
            <p className="font-medium leading-snug" style={{ color: '#475569', fontSize: '12px' }}>
              {challenge.description}
            </p>

            {!canCheckInToday ? (
              <div className="w-full p-2 rounded-xl flex items-center gap-2 justify-center" style={{ background: 'rgba(148, 163, 184, 0.08)', border: '1px dashed rgba(148, 163, 184, 0.35)' }}>
                <span className="text-sm">📅</span>
                <span className="font-black text-[11px]" style={{ color: '#64748b' }}>
                  {timeStatus === 'pending' ? 'Arranca el lunes' : 'Check-in cerrado'}
                </span>
              </div>
            ) : hasCheckedToday ? (
              (() => {
                const opt = CHECK_IN_OPTIONS.find((o) => o.id === todayCheckIn);
                return (
                  <div className="w-full p-2 rounded-xl flex items-center gap-2" style={{ background: '#ffffff', border: `1.5px solid ${opt?.color || '#64748b'}` }}>
                    <span className="text-base">{opt?.emoji || '✅'}</span>
                    <span className="font-black text-[11px]" style={{ color: opt?.color || '#64748b' }}>
                      Hoy: {opt?.label || 'listo'}
                    </span>
                  </div>
                );
              })()
            ) : !showCheckIn ? (
              <button type="button" onClick={() => { try { audioService.playPop(); } catch (e) {} setShowCheckIn(true); }} className="w-full py-2 rounded-xl font-black text-[11px] cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-1.5" style={{ background: '#ffffff', color: '#475569', border: '1px solid #cbd5e1' }}>
                <span>📋</span>
                <span>Marcar hoy</span>
              </button>
            ) : (
              <div className="flex flex-col gap-1.5">
                {CHECK_IN_OPTIONS.map((opt) => (
                  <button key={opt.id} type="button" onClick={() => handleCheckIn(opt.id)} className="w-full py-2 rounded-xl font-black text-[11px] cursor-pointer active:scale-[0.98] transition-all flex items-center gap-2 px-3" style={{ background: '#ffffff', color: opt.color, border: `1.5px solid ${opt.color}` }}>
                    <span className="text-sm">{opt.emoji}</span>
                    <span>{opt.label}</span>
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
        <div className="w-full rounded-2xl overflow-hidden" style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1.5px solid rgba(16, 185, 129, 0.4)' }}>
          <div className="p-3 flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">🎯</span>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="font-black uppercase tracking-wider" style={{ color: '#065f46', fontSize: '10px' }}>
                Reto en curso
              </span>
              <span className="font-bold leading-tight" style={{ color: '#0f172a', fontSize: '13px' }}>
                {challenge.icon} {challenge.title}
              </span>
            </div>
            <span className="font-black flex-shrink-0" style={{ color: '#10b981', fontSize: '14px' }}>
              {completedDays}/{challenge.durationDays}
            </span>
          </div>

          <div className="flex items-center gap-1 px-3 pb-2">
            {Array.from({ length: challenge.durationDays }).map((_, i) => (
              <span key={i} className="flex-1 h-1.5 rounded-full" style={{ background: i < completedDays ? '#10b981' : '#d1fae5' }} />
            ))}
          </div>

          <div className="px-3 pb-3">
            {!canCheckInToday ? (
              <div className="w-full p-2 rounded-xl flex items-center gap-2 text-center justify-center" style={{ background: 'rgba(148, 163, 184, 0.08)', border: '1px dashed rgba(148, 163, 184, 0.35)' }}>
                <span className="text-sm">📅</span>
                <span className="font-black text-[11px]" style={{ color: '#64748b' }}>
                  Arranca el lunes
                </span>
              </div>
            ) : hasCheckedToday ? (
              (() => {
                const opt = CHECK_IN_OPTIONS.find((o) => o.id === todayCheckIn);
                return (
                  <div className="w-full p-2 rounded-xl flex items-center gap-2" style={{ background: '#ffffff', border: `1.5px solid ${opt?.color || '#10b981'}` }}>
                    <span className="text-lg">{opt?.emoji || '✅'}</span>
                    <span className="font-black text-[12px]" style={{ color: opt?.color || '#10b981' }}>
                      Hoy: {opt?.label || 'listo'}
                    </span>
                  </div>
                );
              })()
            ) : !showCheckIn ? (
              <button type="button" onClick={() => { try { audioService.playPop(); } catch (e) {} setShowCheckIn(true); }} className="w-full py-2 rounded-xl font-black text-[11px] cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-1.5" style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', color: '#fff', boxShadow: '0 2px 0 0 #047857' }}>
                <span>📋</span>
                <span>¿Cómo te fue hoy?</span>
              </button>
            ) : (
              <div className="flex flex-col gap-1.5 animate-[fadeIn_0.2s_ease-out]">
                {CHECK_IN_OPTIONS.map((opt) => (
                  <button key={opt.id} type="button" onClick={() => handleCheckIn(opt.id)} className="w-full py-2 rounded-xl font-black text-[11px] cursor-pointer active:scale-[0.98] transition-all flex items-center gap-2 px-3" style={{ background: '#ffffff', color: opt.color, border: `1.5px solid ${opt.color}` }}>
                    <span className="text-base">{opt.emoji}</span>
                    <span>{opt.label}</span>
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
      <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#ffffff', border: '2px solid #ea580c', boxShadow: '0 3px 0 0 rgba(234, 88, 12, 0.3)' }}>
        <button
          type="button"
          onClick={() => {
            try { audioService.playPop(); } catch (e) {}
            setIsOpen((v) => !v);
          }}
          className="w-full p-4 flex items-center gap-3 cursor-pointer transition-all"
          style={{ background: isOpen ? '#fff7ed' : '#ffffff', animation: !isOpen ? 'challengePulse 2.5s ease-in-out infinite' : 'none' }}
        >
          <span className="text-2xl flex-shrink-0">🎯</span>
          <div className="flex flex-col flex-1 min-w-0 items-start text-left">
            <span className="font-black uppercase tracking-wider" style={{ color: '#ea580c', fontSize: '10px' }}>
              Tu reto de la semana
            </span>
            <span className="font-bold leading-tight" style={{ color: '#0f172a', fontSize: '13px' }}>
              Tocá para {isOpen ? 'cerrar' : 'ver el reto'}
            </span>
          </div>
          <span className="material-symbols-outlined flex-shrink-0 transition-transform duration-200" style={{ color: '#ea580c', fontSize: '24px', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            expand_more
          </span>
        </button>

        {isOpen && (
          <div className="px-4 pb-4 flex flex-col gap-3 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                <span className="text-2xl">{challenge.icon}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-black leading-tight" style={{ color: '#0f172a', fontSize: '16px' }}>
                  {challenge.title}
                </span>
                <span className="font-medium leading-snug mt-0.5" style={{ color: '#64748b', fontSize: '11px' }}>
                  Dura {challenge.durationDays} días · 1 vez por día
                </span>
              </div>
            </div>

            <p className="font-bold leading-snug" style={{ color: '#1e293b', fontSize: '13px' }}>
              {challenge.description}
            </p>

            <div className="w-full p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <span className="font-black uppercase tracking-wider block mb-1" style={{ color: '#475569', fontSize: '10px' }}>
                🧠 ¿Por qué?
              </span>
              <p className="font-medium leading-snug" style={{ color: '#334155', fontSize: '12px' }}>
                {challenge.why}
              </p>
            </div>

            <button type="button" onClick={handleAccept} className="w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all" style={{ background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)', color: '#fff', boxShadow: '0 3px 0 0 #9a3412' }}>
              <span>✅</span>
              <span>Acepto el reto</span>
            </button>
          </div>
        )}

        <style>{`
          @keyframes challengePulse {
            0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(234, 88, 12, 0); }
            50% { transform: scale(1.015); box-shadow: 0 0 12px rgba(234, 88, 12, 0.15); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ============================================
  // VARIANTE "FULL"
  // ============================================
  if (!challenge) return null;

  if (isAccepted) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span className="font-black uppercase tracking-wider" style={{ color: '#ea580c', fontSize: '11px' }}>
            Reto en curso
          </span>
        </div>

        <div className="w-full rounded-2xl p-5 flex flex-col gap-4" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
              <span className="text-3xl">{challenge.icon}</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-black leading-tight" style={{ color: '#0f172a', fontSize: '19px' }}>
                {challenge.title}
              </span>
              <span className="font-medium leading-snug mt-0.5" style={{ color: '#64748b', fontSize: '12px' }}>
                {completedDays} de {challenge.durationDays} días completados
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: challenge.durationDays }).map((_, i) => (
              <span key={i} className="flex-1 h-2 rounded-full" style={{ background: i < completedDays ? '#10b981' : '#e2e8f0' }} />
            ))}
          </div>

          <p className="font-medium leading-snug" style={{ color: '#334155', fontSize: '13px' }}>
            {challenge.description}
          </p>

          <button type="button" onClick={handleGoToNotes} className="w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all" style={{ background: '#ffffff', color: '#334155', border: '1.5px solid #cbd5e1', boxShadow: '0 3px 0 0 #e2e8f0' }}>
            <span>📝</span>
            <span>Anotar en una nota</span>
          </button>

          <div className="w-full p-3 rounded-xl" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
            <span className="font-black uppercase tracking-wider block mb-1" style={{ color: '#ea580c', fontSize: '10px' }}>
              🐾 Sparky dice
            </span>
            <p className="font-medium leading-snug" style={{ color: '#9a3412', fontSize: '12px' }}>
              Solo 3 cosas. No importa si no las cumplís todas. Solo anotarlas ya es un montón.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2">
        <span className="text-lg">🎯</span>
        <span className="font-black uppercase tracking-wider" style={{ color: '#ea580c', fontSize: '11px' }}>
          Tu reto de la semana
        </span>
      </div>

      <div className="w-full rounded-2xl p-5 flex flex-col gap-4" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
            <span className="text-3xl">{challenge.icon}</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-black leading-tight" style={{ color: '#0f172a', fontSize: '19px' }}>
              {challenge.title}
            </span>
            <span className="font-medium leading-snug mt-0.5" style={{ color: '#64748b', fontSize: '12px' }}>
              Dura {challenge.durationDays} días · 1 vez por día
            </span>
          </div>
        </div>

        <p className="font-bold leading-snug" style={{ color: '#1e293b', fontSize: '14px' }}>
          {challenge.description}
        </p>

        <div className="w-full p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <span className="font-black uppercase tracking-wider block mb-1" style={{ color: '#475569', fontSize: '10px' }}>
            🧠 ¿Por qué este reto?
          </span>
          <p className="font-medium leading-snug" style={{ color: '#334155', fontSize: '12px' }}>
            {challenge.why}
          </p>
        </div>

        <div className="w-full p-3 rounded-xl flex items-start gap-2" style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <span className="text-base flex-shrink-0">🎁</span>
          <p className="font-medium leading-snug" style={{ color: '#065f46', fontSize: '12px' }}>
            Cada día vas a poder marcar cómo te fue. Si cumplís varios días, al final desbloqueás un cofre con un juego nuevo.
          </p>
        </div>

        <button type="button" onClick={handleAccept} className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all" style={{ background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)', color: '#fff', boxShadow: '0 3px 0 0 #9a3412' }}>
          <span>✅</span>
          <span>Acepto el reto</span>
        </button>
      </div>
    </div>
  );
}