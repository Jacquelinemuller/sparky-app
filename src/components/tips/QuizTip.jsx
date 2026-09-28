import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { audioService } from '../../services/audioService';

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

  // Todas las preguntas respondidas
  const allAnswered = Object.keys(answers).length === total;
  const finished = allAnswered && currentQ >= total;

  const handleAnswer = (optionId) => {
    if (!currentQuestion) return;
    try { audioService.playPop(); } catch (e) {}

    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    if (isLast) {
      // Guardar respuestas en el AppContext
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
      message =
        'Veo que varias cosas te pasan seguido. Eso no es un problema: es el punto de partida. Y ya tenés un mapa para trabajar sobre eso.';
    } else if (neutral >= total * 0.6) {
      message =
        'Estás bastante en sintonía con lo que te pasa. Eso ya es un montón. Seguí así, que esto se entrena.';
    } else {
      message =
        'Gracias por ser sincero. Reconocer lo que te pasa es el primer superpoder. Nada de esto es un defecto: es cómo funciona tu cerebro.';
    }

    return (
      <div className="flex flex-col gap-4 w-full">
        {/* Card de cierre */}
        <div
          className="w-full rounded-2xl p-5 flex flex-col items-center text-center gap-3"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0'
          }}
        >
          <span className="text-5xl">🎉</span>
          <h3 className="font-black text-lg" style={{ color: '#0f172a' }}>
            Terminaste tu espejo
          </h3>
          <p
            className="font-medium leading-snug"
            style={{ color: '#334155', fontSize: '14px' }}
          >
            {message}
          </p>

          <div
            className="w-full mt-2 px-3 py-2 rounded-lg"
            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}
          >
            <p
              className="font-medium text-center"
              style={{ color: '#64748b', fontSize: '11px' }}
            >
              Tus respuestas quedan guardadas para que puedas verlas con un adulto si querés.
            </p>
          </div>
        </div>

        {/* Botón cumplir */}
        <div className="flex items-center justify-end gap-2">
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-black transition-all cursor-pointer active:scale-95"
              style={{
                background: '#0f172a',
                color: '#fff',
                boxShadow: '0 2px 0 0 #000'
              }}
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>¡Cumplí! +{data.reward} XP</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // PREGUNTA ACTUAL
  // ============================================
  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Card de pregunta */}
      <div
        className="w-full rounded-2xl p-5 flex flex-col gap-4"
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Encabezado */}
        <div className="flex items-center gap-1.5">
          <span className="font-black uppercase tracking-wider" style={{ color: '#ea580c', fontSize: '10px' }}>
            🧠 Sparky te pregunta
          </span>
        </div>

        {/* Pregunta */}
        <p
          key={currentQuestion.id}
          className="font-black leading-snug animate-[fadeIn_0.3s_ease-out]"
          style={{ color: '#0f172a', fontSize: '17px' }}
        >
          {currentQuestion.text}
        </p>

        {/* Opciones */}
        <div className="flex flex-col gap-2.5 mt-1">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleAnswer(opt.id)}
              className="w-full py-3.5 rounded-2xl font-black text-sm cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              style={{
                background: opt.color,
                color: opt.id === 'aVeces' ? '#0f172a' : '#ffffff',
                boxShadow: `0 3px 0 0 rgba(0,0,0,0.2)`
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Progreso */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] font-black" style={{ color: '#94a3b8' }}>
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}