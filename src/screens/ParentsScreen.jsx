import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import TipFormModal from '../components/TipFormModal';
import { audioService } from '../services/audioService';

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const OPTION_LABELS = {
  siempre: 'Siempre',
  aVeces: 'A veces',
  casiNunca: 'Casi nunca'
};

const OPTION_COLORS = {
  siempre: '#ea580c',
  aVeces: '#facc15',
  casiNunca: '#94a3b8'
};

function formatDate(ts) {
  try {
    const d = new Date(ts);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return '';
  }
}

// Agrupa las autoevaluaciones por semana ('w1', 'w2', ...)
function groupByWeek(quizzes) {
  const groups = {};
  quizzes.forEach((quiz) => {
    const weekKey = quiz.key.split('-')[0]; // 'w1'
    if (!groups[weekKey]) groups[weekKey] = [];
    groups[weekKey].push(quiz);
  });
  // Ordenar semanas por número descendente (más reciente primero)
  const sorted = Object.entries(groups)
    .map(([weekKey, items]) => ({
      weekKey,
      weekNumber: parseInt(weekKey.replace('w', '')) || 0,
      items: items.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
    }))
    .sort((a, b) => b.weekNumber - a.weekNumber);
  return sorted;
}

export const ParentsScreen = ({ onClose }) => {
  const {
    customTips,
    addCustomTip,
    updateCustomTip,
    deleteCustomTip,
    setActiveScreen,
    quizAnswers
  } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTip, setEditingTip] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Semanas desplegadas (Set de weekKey)
  const [expandedWeeks, setExpandedWeeks] = useState(() => {
    // Por defecto, abrimos la más reciente
    const quizzes = Object.entries(quizAnswers || {})
      .map(([key, data]) => ({ key, ...data }));
    const grouped = groupByWeek(quizzes);
    return grouped.length > 0 ? new Set([grouped[0].weekKey]) : new Set();
  });

  const goBack = () => {
    if (onClose) onClose();
    else setActiveScreen('none');
  };

  const openStats = () => {
    try { audioService.playClick(); } catch (e) {}
    setActiveScreen('stats');
  };

  const handleNew = () => {
    try { audioService.playClick(); } catch (e) {}
    setEditingTip(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tip) => {
    try { audioService.playClick(); } catch (e) {}
    setEditingTip(tip);
    setIsFormOpen(true);
  };

  const handleSave = (data) => {
    if (editingTip) {
      updateCustomTip(editingTip.id, data);
    } else {
      addCustomTip(data);
    }
  };

  const handleConfirmDelete = () => {
    if (confirmDelete) {
      try { audioService.playClick(); } catch (e) {}
      deleteCustomTip(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const toggleWeek = (weekKey) => {
    try { audioService.playPop(); } catch (e) {}
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekKey)) {
        next.delete(weekKey);
      } else {
        next.add(weekKey);
      }
      return next;
    });
  };

  const tipsByDay = {};
  for (let i = 1; i <= 7; i++) {
    tipsByDay[i] = customTips.filter((t) => t.day === i);
  }

  const totalTips = customTips.length;

  const allQuizzes = Object.entries(quizAnswers || {})
    .map(([key, data]) => ({ key, ...data }));

  const weekGroups = groupByWeek(allQuizzes);

  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)'
      }}
    >
      {/* Header */}
      <header
        className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl shadow-[0_1px_8px_rgba(139,92,246,0.08)]"
        style={{ background: 'rgba(255,255,255,0.92)', borderBottom: '2px solid rgba(196,181,253,0.5)' }}
      >
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full bg-[#f5f3ff] border border-[#ddd6fe] text-[#8b5cf6] font-label-md text-label-md font-bold active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Volver</span>
          </button>

          <div className="inline-flex items-center gap-2 bg-[#ede9fe] px-3 py-1.5 rounded-full shadow-[0_2px_0_0_#ddd6fe]">
            <span className="material-symbols-outlined text-[16px] text-[#8b5cf6]" style={{ fontVariationSettings: '"FILL" 1' }}>
              admin_panel_settings
            </span>
            <span className="font-label-sm text-label-sm font-black text-[#8b5cf6] uppercase tracking-wider">
              Padres
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 pb-28 px-4 max-w-md mx-auto">

        {/* Intro */}
        <div className="mb-4">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-black text-on-surface leading-tight">
            Panel de Padres
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Seguimiento del progreso y tips personalizados.
          </p>
        </div>

        {/* Ver progreso semanal */}
        <button
          type="button"
          onClick={openStats}
          className="w-full mb-5 p-4 rounded-2xl bg-white border-2 border-[#c4b5fd] shadow-[0_4px_0_0_#ddd6fe] active:translate-y-0.5 active:shadow-[0_2px_0_0_#ddd6fe] transition-all cursor-pointer flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#ede9fe] flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[#8b5cf6] text-[26px]" style={{ fontVariationSettings: '"FILL" 1' }}>
              insights
            </span>
          </div>
          <div className="flex flex-col items-start flex-1 min-w-0 text-left">
            <span className="font-title-md text-title-md font-black text-on-surface">
              Ver progreso semanal
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Tareas, XP ganados y días activos
            </span>
          </div>
          <span className="material-symbols-outlined text-[#8b5cf6] text-[22px] flex-shrink-0">
            arrow_forward
          </span>
        </button>

        {/* Espejo de la semana — acordeón */}
        <div className="mb-5">
          <h2 className="font-title-lg text-title-lg font-black text-on-surface leading-tight mb-3">
            Mi espejo de la semana
          </h2>

          {weekGroups.length === 0 ? (
            <div className="w-full p-4 rounded-2xl bg-white border-2 border-dashed border-[#c4b5fd] text-center">
              <span className="text-3xl">🪞</span>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 font-bold">
                Todavía no hay autoevaluaciones completadas.
              </p>
              <p className="font-label-sm text-[11px] text-on-surface-variant mt-1">
                Aparecerán acá cuando el chico responda el día 6.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {weekGroups.map((group) => {
                const isOpen = expandedWeeks.has(group.weekKey);
                const latest = group.items[0];

                // Conteo total de la semana (si hay múltiples quizzes, usa el más reciente)
                const counts = { siempre: 0, aVeces: 0, casiNunca: 0 };
                Object.values(latest.answers || {}).forEach((a) => {
                  if (counts[a] !== undefined) counts[a]++;
                });

                return (
                  <div key={group.weekKey} className="w-full">
                    {/* Botón colapsable */}
                    <button
                      type="button"
                      onClick={() => toggleWeek(group.weekKey)}
                      className="w-full p-3.5 rounded-2xl bg-white border-2 border-[#c4b5fd] shadow-[0_3px_0_0_#ddd6fe] active:translate-y-0.5 active:shadow-[0_1px_0_0_#ddd6fe] transition-all cursor-pointer flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-[#ede9fe] flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">🪞</span>
                      </div>

                      <div className="flex flex-col items-start flex-1 min-w-0 text-left">
                        <span className="font-title-md text-title-md font-black text-on-surface leading-tight">
                          Semana {group.weekNumber}
                        </span>
                        <span className="font-label-sm text-[11px] font-bold text-on-surface-variant">
                          {formatDate(latest.completedAt)} · {group.items.length} {group.items.length === 1 ? 'autoevaluación' : 'autoevaluaciones'}
                        </span>
                      </div>

                      {/* Puntitos de resumen */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {counts.siempre > 0 && (
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: OPTION_COLORS.siempre }}
                            title={`${counts.siempre} Siempre`}
                          />
                        )}
                        {counts.aVeces > 0 && (
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: OPTION_COLORS.aVeces }}
                            title={`${counts.aVeces} A veces`}
                          />
                        )}
                        {counts.casiNunca > 0 && (
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: OPTION_COLORS.casiNunca }}
                            title={`${counts.casiNunca} Casi nunca`}
                          />
                        )}
                      </div>

                      <span
                        className="material-symbols-outlined text-[#8b5cf6] text-[22px] flex-shrink-0 transition-transform duration-200"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >
                        expand_more
                      </span>
                    </button>

                    {/* Contenido desplegable */}
                    {isOpen && (
                      <div className="mt-2.5 flex flex-col gap-3 animate-[fadeIn_0.2s_ease-out]">
                        {group.items.map((quiz) => (
                          <div
                            key={quiz.key}
                            className="w-full p-4 rounded-2xl bg-white border-2 border-[#ddd6fe] shadow-[0_3px_0_0_#ddd6fe]"
                          >
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className="px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#8b5cf6] border border-[#c4b5fd] font-label-sm text-[10px] font-black uppercase tracking-wider">
                                {quiz.key.toUpperCase()}
                              </span>
                              <span className="font-label-sm text-[11px] font-bold text-on-surface-variant">
                                {formatDate(quiz.completedAt)}
                              </span>
                            </div>

                            {/* Resumen por color */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              {['siempre', 'aVeces', 'casiNunca'].map((optId) => {
                                const count = Object.values(quiz.answers || {}).filter((a) => a === optId).length;
                                return (
                                  <div
                                    key={optId}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-full"
                                    style={{
                                      background: `${OPTION_COLORS[optId]}20`,
                                      border: `1px solid ${OPTION_COLORS[optId]}80`
                                    }}
                                  >
                                    <span
                                      className="w-2 h-2 rounded-full"
                                      style={{ background: OPTION_COLORS[optId] }}
                                    />
                                    <span
                                      className="font-label-sm text-[10px] font-black"
                                      style={{ color: '#334155' }}
                                    >
                                      {count} {OPTION_LABELS[optId]}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Detalle */}
                            <div className="flex flex-col gap-2">
                              {(quiz.questions || []).map((q) => {
                                const answerId = quiz.answers?.[q.id];
                                const answerColor = OPTION_COLORS[answerId] || '#cbd5e1';
                                return (
                                  <div
                                    key={q.id}
                                    className="flex items-start gap-2 p-2 rounded-xl"
                                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                                  >
                                    <span
                                      className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                                      style={{ background: answerColor }}
                                    />
                                    <div className="flex flex-col flex-1 min-w-0">
                                      <p
                                        className="font-medium leading-tight break-words"
                                        style={{ color: '#334155', fontSize: '12px' }}
                                      >
                                        {q.text}
                                      </p>
                                      <span
                                        className="font-black text-[10px] uppercase tracking-wider mt-0.5"
                                        style={{ color: answerColor }}
                                      >
                                        {OPTION_LABELS[answerId] || '—'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips personalizados */}
        <div className="mb-3 mt-1">
          <h2 className="font-title-lg text-title-lg font-black text-on-surface leading-tight">
            Tips personalizados
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Cargá consejos o desafíos propios que aparecerán cada semana en la sección de tips.
          </p>
        </div>

        <button
          type="button"
          onClick={handleNew}
          className="w-full mb-4 py-3 rounded-2xl bg-[#8b5cf6] text-white font-label-md text-label-md font-black flex items-center justify-center gap-2 shadow-[0_4px_0_0_#5b21b6] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[22px]">add</span>
          <span>Crear nuevo tip</span>
        </button>

        <div className="w-full mb-4 p-3 rounded-2xl bg-white border border-[#ddd6fe]/50 shadow-[0_2px_0_0_#ddd6fe]">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-bold text-on-surface">
              Total de tips
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ede9fe] text-[#8b5cf6] border border-[#c4b5fd] font-label-sm text-label-sm font-black">
              {totalTips}
            </span>
          </div>
        </div>

        {totalTips === 0 ? (
          <div className="w-full p-6 rounded-2xl bg-white border-2 border-dashed border-[#c4b5fd] text-center">
            <span className="text-4xl">📝</span>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 font-bold">
              Todavía no cargaste ningún tip
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Creá el primero para ver cómo aparece en la sección de tips del día.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {DAY_NAMES.map((dayName, idx) => {
              const dayNum = idx + 1;
              const dayTips = tipsByDay[dayNum];
              if (dayTips.length === 0) return null;

              return (
                <div key={dayNum} className="w-full">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
                    <span className="font-label-md text-label-md font-black text-[#8b5cf6] uppercase tracking-wider">
                      {dayName}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      ({dayTips.length})
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {dayTips.map((tip) => (
                      <div
                        key={tip.id}
                        className="w-full p-3.5 rounded-2xl bg-white border-2 border-[#ddd6fe] shadow-[0_3px_0_0_#ddd6fe]"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="font-title-md text-title-md font-black text-on-surface">
                            {tip.title}
                          </span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEdit(tip)}
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f3ff] active:scale-95 transition-all cursor-pointer"
                              title="Editar"
                            >
                              <span className="material-symbols-outlined text-[#8b5cf6] text-[18px]">edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(tip.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 active:scale-95 transition-all cursor-pointer"
                              title="Eliminar"
                            >
                              <span className="material-symbols-outlined text-red-500 text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>

                        <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">
                          {tip.explanation}
                        </p>

                        <div className="p-2 rounded-xl bg-[#f5f3ff] border border-dashed border-[#a78bfa] mb-2">
                          <span className="font-label-sm text-label-sm font-black text-[#7c3aed] block mb-0.5">
                            MICRO-RETO (+{tip.reward} XP)
                          </span>
                          <p className="font-body-sm text-body-sm text-on-surface font-medium">
                            "{tip.action}"
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {tip.isReplacing && (
                            <span className="px-2 py-0.5 rounded-full bg-[#fef3c7] border border-[#fcd34d] text-[#92400e] font-label-sm text-[10px] font-black uppercase">
                              🔄 Reemplaza al oficial
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Modal de formulario */}
      <TipFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTip(null);
        }}
        onSave={handleSave}
        editingTip={editingTip}
      />

      {/* Confirmación de borrado */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl border-4 border-[#8b5cf6] shadow-[0_10px_0_0_#7c3aed] p-6 text-center">
            <span className="text-4xl block mb-3">🗑️</span>
            <h3 className="font-headline-md text-headline-md font-black text-on-surface mb-2">
              ¿Eliminar este tip?
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-5">
              No se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 h-12 rounded-2xl bg-white border-2 border-[#e2e8f0] text-on-surface font-bold active:scale-95 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 h-12 rounded-2xl bg-red-500 text-white font-black shadow-[0_4px_0_0_#991b1b] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
};