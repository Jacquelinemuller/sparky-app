import React from 'react';
import { audioService } from '../../services/audioService';

const PALETTE = {
  paper: '#fefcf6',
  paperLine: 'rgba(56, 189, 248, 0.16)',
  paperBorder: '#e8e3d5',
  orange: '#ea580c',
  inkSoft: '#334155',
  inkMuted: '#64748b',
  navy: '#1e3a8a',
  slate: '#f1f5f9',
  slateBorder: '#e2e8f0',
  yellow: '#facc15'
};

export default function TipCard({
  data,
  revealed,
  onReveal,
  isCompleted,
  onComplete,
  hasSheet,
  onOpenSheet,
  activeDay = 1,
}) {
  const cards = data?.cards;
  const isSingle = data?.layout === 'single';
  
  const isMultipleReveal = !!data?.revealCards;
  const allRevealed = isMultipleReveal 
    ? data.revealCards.every(c => revealed[c.id])
    : (revealed['main-card'] || false);

  const handleComplete = () => {
    if (!allRevealed || isCompleted) return;
    try { audioService.playSuccess(); } catch (e) {}
    onComplete();
  };

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
    if (data.titleImage) {
      return (
        <div className="w-full flex justify-center mb-4">
          <img src={data.titleImage} alt={data.titleAccent} className="w-[85%] max-h-[120px] object-contain block" draggable={false} />
        </div>
      );
    }
    return (
      <div className="w-full">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1">
            <span className="font-black leading-[0.9] flex-shrink-0" style={{ fontSize: '44px', color: PALETTE.orange, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.03em', textShadow: '2px 2px 0 rgba(234, 88, 12, 0.15)' }}>
              TDAH
            </span>
            <span className="font-black leading-[1.05] flex-1 pt-1" style={{ fontSize: '22px', color: PALETTE.navy, fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.01em' }}>
              {data.titleAccent}
            </span>
          </div>
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

  const renderCard = (cardData) => {
    if (!cardData) return null;

    return (
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.06)] flex flex-col border border-[#e2e8f0] bg-white">
        <div className="w-full py-2 px-0.5 text-center flex-shrink-0 flex items-center justify-center" style={{ background: cardData.color || PALETTE.orange }}>
          <h4 className="font-black uppercase text-white text-[9px] tracking-tighter whitespace-nowrap">
            {cardData.title}
          </h4>
        </div>

        <div className="flex flex-col flex-1 p-2 gap-3 justify-evenly">
          {cardData.rows.map((row, index) => (
            <div key={index} className="flex items-center gap-2.5">
              <div 
                className="w-12 h-12 flex-shrink-0 flex items-center justify-center animate-[iconFloat_3s_ease-in-out_infinite]"
                style={{ animationDelay: `${index * 0.4}s` }}
              >
                <img src={`/tips/icons/${row.icon}`} alt="" className="w-full h-full object-contain" draggable={false} />
              </div>
              <div className="flex items-center flex-1 min-w-0">
                <p className="font-semibold leading-[1.15] text-[11.5px]" style={{ color: PALETTE.inkSoft }}>
                  {row.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRevealButton = (id, imageSrc) => {
    return (
      <button
        type="button"
        onClick={() => onReveal(id)}
        className="w-full relative active:scale-[0.97] transition-all cursor-pointer block reveal-card-button"
        style={{ background: 'transparent', border: 'none', padding: 0 }}
      >
        <img src={imageSrc} alt="Tocá para revelar" className="w-full h-auto block" draggable={false} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)', backgroundSize: '200% 100%', animation: 'revealShine 3s ease-in-out infinite' }} />
      </button>
    );
  };

  const renderContent = () => {
    if (isMultipleReveal) {
      return (
        <div className="w-full flex flex-col items-center justify-center gap-4">
          {data.revealCards.map((card) => {
            const isCardRevealed = revealed[card.id];
            return (
              <div key={card.id} className="w-full max-w-sm">
                {!isCardRevealed ? (
                  renderRevealButton(card.id, '/tips/tarjeta2.png') 
                ) : (
                  <div className="w-full flex justify-center relative animate-[revealPop_0.4s_ease-out]">
                    <img src={card.solutionImage} alt="Solución" className="w-full h-auto block rounded-xl" draggable={false} />
                    {card.overlayIcon && (
                      <div 
                        className="absolute pointer-events-none z-10"
                        style={{
                          top: card.overlayPosition === 'left' ? '50%' : '65%',
                          left: card.overlayPosition === 'left' ? '10%' : '50%',
                          transform: 'translate(-50%, -50%)', 
                        }}
                      >
                        <div className="-translate-y-[13px]">
                          <img
                            src={card.overlayIcon}
                            alt="Ícono flotante"
                            className={`${
                              card.overlayPosition === 'left' ? 'w-[85px] h-[85px]' : 'w-[80px] h-[80px]'
                            } object-contain animate-[iconFloat_3s_ease-in-out_infinite]`}
                            draggable={false}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (data.revealImage && data.solutionImage) {
      return (
        <div className="w-full flex flex-col items-center justify-center">
          {!allRevealed ? (
            renderRevealButton('main-card', data.revealImage)
          ) : (
            <div className="w-full max-w-sm flex justify-center animate-[revealPop_0.4s_ease-out]">
              <img src={data.solutionImage} alt="Solución" className="w-full h-auto block rounded-xl animate-[iconFloat_3s_ease-in-out_infinite]" draggable={false} />
            </div>
          )}
        </div>
      );
    }

    if (!cards) return null;

    if (isSingle) {
      return (
        <div className="w-full flex flex-col gap-4">
          <div className="w-full">{renderCard(cards.problem)}</div>
          {!allRevealed ? (
            <div className="w-full">{renderRevealButton('main-card', '/tips/tarjeta2.png')}</div>
          ) : (
            <div className="w-full animate-[revealPop_0.4s_ease-out]">{renderCard(cards.solution)}</div>
          )}
        </div>
      );
    }

    return (
      <div className="w-full flex gap-2 items-stretch">
        <div className="w-1/2 flex flex-col">{renderCard(cards.problem)}</div>
        <div className="w-1/2 flex flex-col">
          {!allRevealed ? (
             renderRevealButton('main-card', '/tips/tarjeta.png')
          ) : (
            <div className="w-full h-full animate-[revealPop_0.4s_ease-out]">{renderCard(cards.solution)}</div>
          )}
        </div>
      </div>
    );
  };

  const renderFooter = () => {
    return (
      <div className="w-full flex flex-col gap-3 mt-2">
        <div className="w-full flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: PALETTE.slateBorder }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: allRevealed ? '100%' : '0%', background: allRevealed ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' : PALETTE.orange }} />
          </div>
          <span className="font-black flex-shrink-0" style={{ color: allRevealed ? '#10b981' : PALETTE.inkMuted, fontSize: '11px' }}>
            {allRevealed ? '1' : '0'}/{isMultipleReveal ? data.revealCards.length : '1'}
          </span>
        </div>

        {isCompleted ? (
          <div className="w-full py-4 rounded-xl flex items-center justify-center gap-2 bg-[#d1fae5] border-2 border-[#10b981] shadow-[0_3px_0_0_#059669]">
            <span className="material-symbols-outlined text-[22px] text-[#065f46]">verified</span>
            <span className="font-black uppercase tracking-wider text-[#065f46] text-[13px]">¡Ya cumplido hoy!</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            disabled={!allRevealed}
            className="w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-[#f1f5f9] disabled:text-[#64748b] disabled:border disabled:border-[#e2e8f0] disabled:shadow-[0_3px_0_0_#e2e8f0] bg-gradient-to-br from-[#10b981] to-[#34d399] text-white shadow-[0_4px_0_0_#047857,0_8px_20px_rgba(16,185,129,0.25)]"
          >
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
            <span className="font-black uppercase tracking-wider text-[14px]">¡Cumplí! +{data.reward} XP</span>
          </button>
        )}

        {isCompleted && hasSheet && activeDay >= 4 && (
          <button type="button" onClick={onOpenSheet} className="w-full py-3 rounded-xl font-black text-[12px] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all bg-white text-[#334155] border border-[#cbd5e1] shadow-[0_3px_0_0_#e2e8f0]">
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span>Ver la lámina completa</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full relative">
      <div className="w-full rounded-2xl overflow-hidden relative" style={{ background: PALETTE.paper, border: `1px solid ${PALETTE.paperBorder}`, boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, ${PALETTE.paperLine} 31px, ${PALETTE.paperLine} 32px)`, opacity: 0.6 }} />
        <div className="relative z-10 p-4 flex flex-col gap-4">
          {renderTitle()}
          {renderContent()}
          {renderFooter()}
        </div>
      </div>

      <style>{`
        @keyframes revealShine {
          0%   { background-position: 200% 0; }
          50%  { background-position: -100% 0; }
          100% { background-position: -100% 0; }
        }
        @keyframes revealPop {
          0%   { transform: scale(0.94); opacity: 0; }
          60%  { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .reveal-card-button {
          animation: revealBreathe 2.4s ease-in-out infinite;
        }
        @keyframes revealBreathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.02); }
        }
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-4px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}