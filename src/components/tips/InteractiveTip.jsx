import React, { useState } from 'react';
import { audioService } from '../../services/audioService';

export default function InteractiveTip({
  data,
  isCompleted,
  onComplete,
  hasSheet,
  onOpenSheet
}) {
  const [revealed, setRevealed] = useState({});

  const pairs = data?.pairs || [];
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

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* ============================================
          TÍTULO
          ============================================ */}
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

      {/* ============================================
          2 COLUMNAS
          ============================================ */}
      <div className="grid grid-cols-2 gap-2.5">

        {/* Columna 1: Problemas */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 px-1">
            <span className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: '#475569' }} />
            <span
              className="font-black uppercase tracking-wider leading-tight"
              style={{ color: '#475569', fontSize: '10px' }}
            >
              Qué puede pasar
            </span>
          </div>

          {pairs.map((pair) => (
            <button
              key={pair.id}
              type="button"
              onClick={() => handleReveal(pair.id)}
              className="w-full flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
              style={{
                background: revealed[pair.id] ? '#f1f5f9' : '#ffffff',
                border: `1.5px solid ${revealed[pair.id] ? '#cbd5e1' : '#e2e8f0'}`,
                boxShadow: revealed[pair.id] ? '0 2px 0 0 #cbd5e1' : '0 2px 0 0 #e2e8f0',
                opacity: revealed[pair.id] ? 0.9 : 1
              }}
            >
              <div className="w-full h-28 flex items-center justify-center">
                <img
                  src={pair.problemImage}
                  alt=""
                  className="max-w-full max-h-full object-contain"
                  draggable={false}
                />
              </div>
              {!revealed[pair.id] && (
                <span
                  className="text-[9px] font-black uppercase tracking-wider"
                  style={{ color: '#334155' }}
                >
                  👆 Tocar
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Columna 2: Soluciones */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5 px-1">
            <span className="w-1 h-4 rounded-full flex-shrink-0" style={{ background: '#10b981' }} />
            <span
              className="font-black uppercase tracking-wider leading-tight"
              style={{ color: '#10b981', fontSize: '10px' }}
            >
              Solución
            </span>
          </div>

          {pairs.map((pair) => {
            const isRevealed = revealed[pair.id];
            return (
              <div
                key={pair.id}
                className="w-full flex items-center justify-center p-2 rounded-xl transition-all"
                style={{
                  background: isRevealed ? 'rgba(16, 185, 129, 0.05)' : '#f8fafc',
                  border: `1.5px solid ${isRevealed ? 'rgba(16, 185, 129, 0.4)' : '#e2e8f0'}`,
                  boxShadow: isRevealed
                    ? '0 2px 0 0 rgba(16, 185, 129, 0.3)'
                    : '0 2px 0 0 #e2e8f0'
                }}
              >
                {isRevealed ? (
                  <div className="w-full h-28 flex items-center justify-center animate-[fadeIn_0.3s_ease-out]">
                    <img
                      src={pair.solutionImage}
                      alt=""
                      className="max-w-full max-h-full object-contain"
                      draggable={false}
                    />
                  </div>
                ) : (
                  <div className="w-full h-28 flex items-center justify-center">
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

      {/* ============================================
          PROGRESO + BOTÓN CUMPLIR
          ============================================ */}
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
            style={{
              background: '#d1fae5',
              border: '1px solid #10b981',
              color: '#065f46'
            }}
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

      {/* ============================================
          BOTÓN VER LÁMINA COMPLETA
          ============================================ */}
      {isCompleted && hasSheet && (
        <button
          type="button"
          onClick={onOpenSheet}
          className="w-full py-3 rounded-2xl font-black text-[12px] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all animate-[fadeIn_0.4s_ease-out]"
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}