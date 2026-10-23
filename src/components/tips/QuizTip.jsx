import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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

export default function QuizTip({ data, isCompleted, onComplete }) {
  const { saveQuizAnswers } = useApp();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});

  const quiz = data.quiz;
  const questions = quiz?.questions || [];
  const options = quiz?.options || [];
  const total = questions.length;
  const currentQuestion = questions[currentQ];
  const isLast = currentQ === total - 1;

  const allAnswered = Object.keys(answers).length === total;
  const finished = allAnswered && currentQ >= total;

  const handleAnswer = (optionId) => {
    if (!currentQuestion) return;
    try { audioService.playPop(); } catch (e) {}

    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    if (isLast) {
      try {
        saveQuizAnswers(quiz.key, {
          answers: newAnswers,
          questions: questions.map((q) => ({ id: q.id, text: q.text })),
          options: options.map((o) => ({ id: o.id, label: o.label, color: o.color }))
        });
      } catch (e) {}
      setCurrentQ(total);
    } else {
      setTimeout(() => setCurrentQ((i) => i + 1), 250);
    }
  };

  const handleComplete = () => {
    if (isCompleted) return;
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
  // RESULTADO FINAL
  // ============================================
  if (finished) {
    const counts = { siempre: 0, aVeces: 0, casiNunca: 0 };
    Object.values(answers).forEach((a) => {
      if (counts[a] !== undefined) counts[a]++;
    });

    const positive = counts.siempre + counts.aVeces;
    const neutral = counts.casiNunca;

    let message;
    if (positive >= total * 0.6) {
      message = 'Veo que varias cosas te pasan seguido. Eso no es un problema: es el punto de partida. Y ya tenés un mapa para trabajar sobre eso.';
    } else if (neutral >= total * 0.6) {
      message = 'Estás bastante en sintonía con lo que te pasa. Eso ya es un montón. Seguí así, que esto se entrena.';
    } else {
      message = 'Gracias por ser sincero. Reconocer lo que te pasa es el primer superpoder. Nada de esto es un defecto: es cómo funciona tu cerebro.';
    }

    return (
      <div className="w-full relative">
        <div className="w-full rounded-3xl overflow-hidden relative" style={{ background: PALETTE.paper, border: `1px solid ${PALETTE.paperBorder}`, boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)' }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, ${PALETTE.paperLine} 31px, ${PALETTE.paperLine} 32px)`, opacity: 0.6 }} />
          <div className="relative z-10 p-4 flex flex-col gap-4">
            {renderTitle()}
            
            <div className="w-full bg-white rounded-2xl p-5 flex flex-col items-center text-center gap-3 border border-[#e2e8f0] shadow-sm">
              <span className="text-5xl">🎉</span>
              <h3 className="font-black text-lg" style={{ color: '#0f172a' }}>
                Terminaste tu espejo
              </h3>
              <p className="font-medium leading-snug" style={{ color: PALETTE.inkSoft, fontSize: '14px' }}>
                {message}
              </p>
              <div className="w-full mt-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                <p className="font-medium text-center text-slate-500" style={{ fontSize: '11px' }}>
                  Tus respuestas quedan guardadas para que puedas verlas con un adulto si querés.
                </p>
              </div>
            </div>

            <div className="w-full flex items-center justify-end gap-2 mt-2">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black bg-emerald-100 border border-emerald-500 text-emerald-800">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>¡Ya cumplido hoy!</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleComplete}
                  className="w-full py-4 rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 bg-gradient-to-br from-[#10b981] to-[#34d399] text-white shadow-[0_4px_0_0_#047857,0_8px_20px_rgba(16,185,129,0.25)]"
                  style={{ fontSize: '14px' }}
                >
                  <span className="material-symbols-outlined text-[22px]">check_circle</span>
                  ¡Cumplí! +{data.reward} XP
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // PREGUNTA ACTUAL
  // ============================================
  return (
    <div className="w-full relative">
      <div className="w-full rounded-3xl overflow-hidden relative" style={{ background: PALETTE.paper, border: `1px solid ${PALETTE.paperBorder}`, boxShadow: '0 6px 20px rgba(15, 23, 42, 0.06)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `repeating-linear-gradient(to bottom, transparent 0px, transparent 31px, ${PALETTE.paperLine} 31px, ${PALETTE.paperLine} 32px)`, opacity: 0.6 }} />
        <div className="relative z-10 p-4 flex flex-col gap-4">
          {renderTitle()}

          <div className="w-full bg-white rounded-2xl p-4 flex flex-col gap-4 border border-[#e2e8f0] shadow-sm">
            {/* Header de la pregunta */}
            <div className="flex items-center gap-1.5">
              <span className="font-black uppercase tracking-wider text-[#ea580c] text-[10px]">
                🧠 Sparky te pregunta
              </span>
            </div>

            {/* Texto de la pregunta */}
            <p key={currentQuestion.id} className="font-black leading-snug animate-[fadeIn_0.3s_ease-out]" style={{ color: '#0f172a', fontSize: '16px' }}>
              {currentQuestion.text}
            </p>

            {/* Opciones */}
            <div className="flex flex-col gap-2.5 mt-1">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleAnswer(opt.id)}
                  className="w-full py-3.5 rounded-2xl font-black text-sm cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_3px_0_0_rgba(0,0,0,0.2)]"
                  style={{
                    background: opt.color,
                    color: opt.id === 'aVeces' ? '#0f172a' : '#ffffff',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Progreso */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] font-black text-slate-400">
                Pregunta {currentQ + 1} de {total}
              </span>
              <div className="flex items-center gap-1.5">
                {questions.map((_, i) => (
                  <span
                    key={i}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: currentQ === i ? '16px' : '5px',
                      height: '5px',
                      backgroundColor: currentQ === i ? '#ea580c' : '#e2e8f0'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}