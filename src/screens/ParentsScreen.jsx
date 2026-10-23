import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import TipFormModal from '../components/TipFormModal';
import { audioService } from '../services/audioService';
import { WEEKLY_GUIDES } from '../data/weeklyGuidesData';

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
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  } catch (e) {
    return '';
  }
}

function groupByWeek(quizzes) {
  const groups = {};
  quizzes.forEach((quiz) => {
    const weekKey = quiz.key.split('-')[0];
    if (!groups[weekKey]) groups[weekKey] = [];
    groups[weekKey].push(quiz);
  });
  return Object.entries(groups)
    .map(([weekKey, items]) => ({
      weekKey,
      weekNumber: parseInt(weekKey.replace('w', '')) || 0,
      items: items.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0))
    }))
    .sort((a, b) => b.weekNumber - a.weekNumber);
}

export const ParentsScreen = ({ onClose }) => {
  const {
    customTips, addCustomTip, updateCustomTip, deleteCustomTip,
    setActiveScreen, quizAnswers,
    parentReportEnabled, toggleParentReport, parentEmail, setParentEmail, sendDailyReport,resetTipsToWeek
  } = useApp();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTip, setEditingTip] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [emailInput, setEmailInput] = useState(parentEmail || '');

  const [expandedWeeks, setExpandedWeeks] = useState(() => {
    const quizzes = Object.entries(quizAnswers || {}).map(([key, data]) => ({ key, ...data }));
    const grouped = groupByWeek(quizzes);
    return grouped.length > 0 ? new Set([grouped[0].weekKey]) : new Set();
  });

  const goBack = () => { if (onClose) onClose(); else setActiveScreen('none'); };
  const openStats = () => { try { audioService.playClick(); } catch (e) {} setActiveScreen('stats'); };
  const handleNew = () => { try { audioService.playClick(); } catch (e) {} setEditingTip(null); setIsFormOpen(true); };
  const handleEdit = (tip) => { try { audioService.playClick(); } catch (e) {} setEditingTip(tip); setIsFormOpen(true); };
  const handleSave = (data) => { if (editingTip) updateCustomTip(editingTip.id, data); else addCustomTip(data); };
  
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
      if (next.has(weekKey)) next.delete(weekKey);
      else next.add(weekKey);
      return next;
    });
  };

  const tipsByDay = {};
  for (let i = 1; i <= 7; i++) tipsByDay[i] = customTips.filter((t) => t.day === i);

  const totalTips = customTips.length;
  const allQuizzes = Object.entries(quizAnswers || {}).map(([key, data]) => ({ key, ...data }));
  const weekGroups = groupByWeek(allQuizzes);

  return (
    <div className="min-h-screen flex flex-col antialiased" style={{ background: 'radial-gradient(circle at 50% 0%, #faf5ff 0%, #f3e8ff 50%, #e9d5ff 100%)' }}>
      {/* Header */}
      <header className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl shadow-[0_1px_8px_rgba(139,92,246,0.08)]" style={{ background: 'rgba(255,255,255,0.92)', borderBottom: '2px solid rgba(196,181,253,0.5)' }}>
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button type="button" onClick={goBack} className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full bg-[#f5f3ff] border border-[#ddd6fe] text-[#8b5cf6] font-bold active:scale-95 transition-all cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Volver</span>
          </button>
          <div className="inline-flex items-center gap-2 bg-[#ede9fe] px-3 py-1.5 rounded-full shadow-[0_2px_0_0_#ddd6fe]">
            <span className="material-symbols-outlined text-[16px] text-[#8b5cf6]" style={{ fontVariationSettings: '"FILL" 1' }}>admin_panel_settings</span>
            <span className="font-black text-[#8b5cf6] uppercase tracking-wider text-[11px]">Padres</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 pb-28 px-4 max-w-md mx-auto">
        <div className="mb-4">
          <h1 className="font-black text-on-surface leading-tight text-2xl">Panel de Padres</h1>
          <p className="text-sm text-on-surface-variant mt-1">Seguimiento del progreso y tips personalizados.</p>
        </div>

        {/* Ver progreso semanal */}
        <button type="button" onClick={openStats} className="w-full mb-4 p-4 rounded-2xl bg-white border-2 border-[#c4b5fd] shadow-[0_4px_0_0_#ddd6fe] active:translate-y-0.5 active:shadow-[0_2px_0_0_#ddd6fe] transition-all cursor-pointer flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#ede9fe] flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[#8b5cf6] text-[26px]" style={{ fontVariationSettings: '"FILL" 1' }}>insights</span>
          </div>
          <div className="flex flex-col items-start flex-1 min-w-0 text-left">
            <span className="font-bold text-on-surface">Ver progreso semanal</span>
            <span className="text-xs text-on-surface-variant">Tareas, XP ganados y días activos</span>
          </div>
          <span className="material-symbols-outlined text-[#8b5cf6] text-[22px] flex-shrink-0">arrow_forward</span>
        </button>

        {/* Reporte Diario */}
        <div className="w-full p-4 rounded-2xl bg-white border-2 border-[#c4b5fd] shadow-[0_4px_0_0_#ddd6fe] mb-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col flex-1 pr-2">
              <span className="font-black text-[15px] text-on-surface">Reporte diario por email</span>
              <span className="text-xs text-on-surface-variant font-medium mt-0.5">
                Enviá un resumen de las misiones, tips y el diario a tu correo.
              </span>
            </div>
            <button
              type="button"
              onClick={toggleParentReport}
              className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 cursor-pointer ${parentReportEnabled ? 'bg-[#10b981]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${parentReportEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          {parentReportEnabled && (
            <div className="flex flex-col gap-2 mt-1 pt-3 border-t border-[#e2e8f0]">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full p-2.5 rounded-xl border-2 border-[#e2e8f0] bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] font-medium"
              />
              <div className="flex gap-2 mt-1">
                 <button
                  onClick={() => {
                    if (!emailInput.trim()) return alert('Por favor, escribí un correo primero');
                    setParentEmail(emailInput);
                    try { audioService.playPop(); } catch(e){}
                    alert('¡Email guardado!');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#8b5cf6] text-white text-xs font-bold shadow-[0_3px_0_0_#5b21b6] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  Guardar Email
                </button>
                <button
                  onClick={() => {
                    if (!emailInput.trim()) return alert('Escribí un correo primero');
                    setParentEmail(emailInput);
                    sendDailyReport(emailInput);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#ea580c] text-white text-xs font-bold shadow-[0_3px_0_0_#9a3412] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  Enviar prueba
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* CONTROL DE SEMANA DE TIPS                    */}
        {/* ============================================ */}
        <div className="w-full p-4 rounded-2xl bg-white border-2 border-[#c4b5fd] shadow-[0_4px_0_0_#ddd6fe] mb-5 flex flex-col gap-3">
          <div className="flex flex-col">
            <span className="font-black text-[15px] text-on-surface">Reiniciar Semana de Tips</span>
            <span className="text-xs text-on-surface-variant font-medium mt-0.5">
              Elegí en qué semana querés empezar. La app siempre iniciará un Lunes.
            </span>
          </div>

          {/* 🔑 ACÁ SE GENERAN DINÁMICAMENTE LAS SEMANAS */}
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {Array.from({ length: WEEKLY_GUIDES.length }, (_, i) => i + 1).map((week) => (
              <button
                key={week}
                onClick={() => {
                  if (window.confirm(`¿Querés reiniciar los tips en la Semana ${week}?`)) {
                    resetTipsToWeek(week);
                  }
                }}
                className="w-12 h-12 rounded-xl bg-[#f5f3ff] text-[#8b5cf6] font-black border-2 border-[#ddd6fe] active:scale-95 transition-all hover:bg-[#ede9fe] cursor-pointer flex items-center justify-center text-sm"
              >
                S{week}
              </button>
            ))}
          </div>

          <div className="w-full h-px bg-slate-100 my-1"></div>

          <button
            onClick={() => {
              if (window.confirm('¿Querés reiniciar el progreso desde el Día 1 de la Semana 1?')) {
                resetTipsToWeek(1);
              }
            }}
            className="w-full py-2.5 rounded-xl bg-orange-100 text-orange-700 text-sm font-bold border-2 border-orange-200 active:scale-[0.98] transition-all cursor-pointer flex justify-center items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            Reiniciar desde el principio (Semana 1)
          </button>
        </div>
        
        {/* Espejo de la semana — acordeón */}
        <div className="mb-5">
          <h2 className="text-lg font-black text-on-surface leading-tight mb-3">Mi espejo de la semana</h2>
          {weekGroups.length === 0 ? (
            <div className="w-full p-4 rounded-2xl bg-white border-2 border-dashed border-[#c4b5fd] text-center">
              <span className="text-3xl">🪞</span>
              <p className="text-sm text-on-surface-variant mt-2 font-bold">Todavía no hay autoevaluaciones completadas.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {weekGroups.map((group) => {
                const isOpen = expandedWeeks.has(group.weekKey);
                const latest = group.items[0];
                const counts = { siempre: 0, aVeces: 0, casiNunca: 0 };
                Object.values(latest.answers || {}).forEach((a) => { if (counts[a] !== undefined) counts[a]++; });

                return (
                  <div key={group.weekKey} className="w-full">
                    <button type="button" onClick={() => toggleWeek(group.weekKey)} className="w-full p-3.5 rounded-2xl bg-white border-2 border-[#c4b5fd] shadow-[0_3px_0_0_#ddd6fe] active:translate-y-0.5 active:shadow-[0_1px_0_0_#ddd6fe] transition-all cursor-pointer flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#ede9fe] flex items-center justify-center flex-shrink-0"><span className="text-lg">🪞</span></div>
                      <div className="flex flex-col items-start flex-1 min-w-0 text-left">
                        <span className="font-bold text-on-surface leading-tight">Semana {group.weekNumber}</span>
                        <span className="text-[11px] font-bold text-on-surface-variant">{formatDate(latest.completedAt)} · {group.items.length} autoevaluación</span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {counts.siempre > 0 && <span className="w-2.5 h-2.5 rounded-full" style={{ background: OPTION_COLORS.siempre }} />}
                        {counts.aVeces > 0 && <span className="w-2.5 h-2.5 rounded-full" style={{ background: OPTION_COLORS.aVeces }} />}
                        {counts.casiNunca > 0 && <span className="w-2.5 h-2.5 rounded-full" style={{ background: OPTION_COLORS.casiNunca }} />}
                      </div>
                      <span className="material-symbols-outlined text-[#8b5cf6] text-[22px] flex-shrink-0 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
                    </button>

                    {isOpen && (
                      <div className="mt-2.5 flex flex-col gap-3 animate-[fadeIn_0.2s_ease-out]">
                        {group.items.map((quiz) => (
                          <div key={quiz.key} className="w-full p-4 rounded-2xl bg-white border-2 border-[#ddd6fe] shadow-[0_3px_0_0_#ddd6fe]">
                            <div className="flex flex-col gap-2">
                              {(quiz.questions || []).map((q) => {
                                const answerId = quiz.answers?.[q.id];
                                const answerColor = OPTION_COLORS[answerId] || '#cbd5e1';
                                return (
                                  <div key={q.id} className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                                    <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: answerColor }} />
                                    <div className="flex flex-col flex-1 min-w-0">
                                      <p className="font-medium leading-tight text-slate-700 text-xs">{q.text}</p>
                                      <span className="font-black text-[10px] uppercase tracking-wider mt-0.5" style={{ color: answerColor }}>{OPTION_LABELS[answerId] || '—'}</span>
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
          <h2 className="text-lg font-black text-on-surface leading-tight">Tips personalizados</h2>
          <p className="text-sm text-on-surface-variant mt-1">Cargá consejos o desafíos propios que aparecerán cada semana en la sección de tips.</p>
        </div>

        <button type="button" onClick={handleNew} className="w-full mb-4 py-3 rounded-2xl bg-[#8b5cf6] text-white font-black flex items-center justify-center gap-2 shadow-[0_4px_0_0_#5b21b6] active:translate-y-1 active:shadow-none transition-all cursor-pointer">
          <span className="material-symbols-outlined text-[22px]">add</span>
          <span>Crear nuevo tip</span>
        </button>

        <div className="w-full mb-4 p-3 rounded-2xl bg-white border border-[#ddd6fe]/50 shadow-[0_2px_0_0_#ddd6fe]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-on-surface">Total de tips</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ede9fe] text-[#8b5cf6] border border-[#c4b5fd] font-black text-sm">{totalTips}</span>
          </div>
        </div>

        {totalTips === 0 ? (
          <div className="w-full p-6 rounded-2xl bg-white border-2 border-dashed border-[#c4b5fd] text-center">
            <span className="text-4xl">📝</span>
            <p className="text-on-surface-variant mt-2 font-bold">Todavía no cargaste ningún tip</p>
            <p className="text-sm text-on-surface-variant mt-1">Creá el primero para ver cómo aparece en la sección de tips del día.</p>
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
                    <span className="font-black text-[#8b5cf6] uppercase tracking-wider text-sm">{dayName}</span>
                    <span className="text-sm text-on-surface-variant">({dayTips.length})</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {dayTips.map((tip) => (
                      <div key={tip.id} className="w-full p-3.5 rounded-2xl bg-white border-2 border-[#ddd6fe] shadow-[0_3px_0_0_#ddd6fe]">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="font-bold text-on-surface">{tip.title}</span>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button type="button" onClick={() => handleEdit(tip)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f3ff] active:scale-95 transition-all cursor-pointer">
                              <span className="material-symbols-outlined text-[#8b5cf6] text-[18px]">edit</span>
                            </button>
                            <button type="button" onClick={() => setConfirmDelete(tip.id)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 active:scale-95 transition-all cursor-pointer">
                              <span className="material-symbols-outlined text-red-500 text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-on-surface-variant mb-2">{tip.explanation}</p>
                        <div className="p-2 rounded-xl bg-[#f5f3ff] border border-dashed border-[#a78bfa] mb-2">
                          <span className="text-[11px] font-black text-[#7c3aed] block mb-0.5">MICRO-RETO (+{tip.reward} XP)</span>
                          <p className="text-sm text-on-surface font-medium">"{tip.action}"</p>
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

      <TipFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingTip(null); }}
        onSave={handleSave}
        editingTip={editingTip}
      />

      {confirmDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl border-4 border-[#8b5cf6] shadow-[0_10px_0_0_#7c3aed] p-6 text-center">
            <span className="text-4xl block mb-3">🗑️</span>
            <h3 className="text-xl font-black text-on-surface mb-2">¿Eliminar este tip?</h3>
            <p className="text-sm text-on-surface-variant mb-5">No se puede deshacer.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmDelete(null)} className="flex-1 h-12 rounded-2xl bg-white border-2 border-[#e2e8f0] text-on-surface font-bold active:scale-95 transition-all cursor-pointer">Cancelar</button>
              <button type="button" onClick={handleConfirmDelete} className="flex-1 h-12 rounded-2xl bg-red-500 text-white font-black shadow-[0_4px_0_0_#991b1b] active:translate-y-1 active:shadow-none transition-all cursor-pointer">Eliminar</button>
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