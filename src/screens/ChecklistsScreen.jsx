import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';
import { ChecklistModal } from '../components/ChecklistModal';

export const ChecklistsScreen = () => {
  const {
    checklists,
    addChecklist,
    updateChecklist,
    deleteChecklist,
    toggleChecklistStep,
    resetChecklist,
    setActiveScreen
  } = useApp();
  console.log('🔍 CONTEXTO KEYS:', Object.keys(useApp()).filter(k => k.includes('hecklist')));
console.log('🔍 addChecklist:', typeof useApp().addChecklist);

  const [expanded, setExpanded] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const goBack = () => {
    try { audioService.playClick(); } catch (e) {}
    setActiveScreen('apoyos');
  };
  const toggleExpand = (id) => {
    try { audioService.playPop(); } catch (e) {}
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNew = () => {
    try { audioService.playClick(); } catch (e) {}
    setEditingList(null);
    setModalOpen(true);
  };

  const handleEdit = (list) => {
    try { audioService.playClick(); } catch (e) {}
    setEditingList(list);
    setModalOpen(true);
  };

  const handleSave = (data) => {
    if (editingList) {
      updateChecklist(editingList.id, data);
    } else {
      const newList = addChecklist(data);
      // Abrir automáticamente la nueva rutina
      if (newList) setExpanded((prev) => ({ ...prev, [newList.id]: true }));
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteChecklist(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const handleToggleStep = (listId, stepId) => {
    toggleChecklistStep(listId, stepId);
  };

  const handleReset = (listId) => {
    resetChecklist(listId);
  };

  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{
        background: 'radial-gradient(circle at 50% 0%, #faf5ff 0%, #ede9fe 50%, #ddd6fe 100%)'
      }}
    >
      {/* Header */}
      <header
        className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          borderBottom: '2px solid rgba(196, 181, 253, 0.5)',
          boxShadow: '0 4px 16px rgba(139, 92, 246, 0.08)'
        }}
      >
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full font-label-md text-label-md font-bold active:scale-95 transition-all cursor-pointer"
            style={{
              background: '#f5f3ff',
              border: '1px solid #ddd6fe',
              color: '#8b5cf6'
            }}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Volver</span>
          </button>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: '#ede9fe',
              border: '1px solid #c4b5fd'
            }}
          >
            <span className="material-symbols-outlined text-[16px] text-[#8b5cf6]" style={{ fontVariationSettings: '"FILL" 1' }}>
              checklist
            </span>
            <span
              className="font-label-sm text-label-sm font-black uppercase tracking-wider"
              style={{ color: '#8b5cf6' }}
            >
              Check
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 pb-28 px-4 max-w-md mx-auto">

        {/* Intro */}
        <div className="mb-4">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-black text-on-surface leading-tight">
            Mis rutinas
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Pasos claros para lo que hacés todos los días. 🐾
          </p>
        </div>

        {/* Botón nueva rutina */}
        <button
          type="button"
          onClick={handleNew}
          className="w-full mb-4 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
            color: '#fff',
            boxShadow: '0 4px 0 0 #5b21b6'
          }}
        >
          <span className="material-symbols-outlined text-[22px]">add</span>
          <span>Nueva rutina</span>
        </button>

        {/* Lista de rutinas */}
        {(!checklists || checklists.length === 0) ? (
          <div className="w-full p-6 rounded-2xl bg-white border-2 border-dashed border-[#c4b5fd] text-center">
            <span className="text-4xl block mb-2">📝</span>
            <p className="font-body-md text-body-md text-on-surface-variant font-bold">
              Todavía no tenés rutinas
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Creá la primera para tener los pasos siempre a mano.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {checklists.map((list) => {
              const isOpen = expanded[list.id];
              const total = list.steps?.length || 0;
              const done = (list.steps || []).filter((s) => s.done).length;
              const isComplete = total > 0 && done === total;

              return (
                <div
                  key={list.id}
                  className="w-full rounded-2xl overflow-hidden transition-all"
                  style={{
                    background: isComplete ? 'rgba(16, 185, 129, 0.06)' : '#ffffff',
                    border: `2px solid ${isComplete ? '#10b981' : '#ddd6fe'}`,
                    boxShadow: isComplete
                      ? '0 3px 0 0 rgba(16, 185, 129, 0.3)'
                      : '0 3px 0 0 #ddd6fe'
                  }}
                >
                  {/* Cabecera colapsable */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(list.id)}
                    className="w-full p-3.5 flex items-center gap-3 cursor-pointer"
                  >
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: isComplete ? '#d1fae5' : '#ede9fe',
                        border: `1px solid ${isComplete ? '#6ee7b7' : '#c4b5fd'}`
                      }}
                    >
                      <span className="text-2xl">{list.emoji || '📋'}</span>
                    </div>

                    <div className="flex flex-col flex-1 min-w-0 items-start text-left">
                      <span
                        className="font-black leading-tight break-words"
                        style={{
                          color: isComplete ? '#065f46' : '#0f172a',
                          fontSize: '16px',
                          textDecoration: isComplete ? 'line-through' : 'none',
                          opacity: isComplete ? 0.75 : 1
                        }}
                      >
                        {list.title}
                      </span>
                      <span
                        className="font-bold text-[11px] mt-0.5"
                        style={{ color: isComplete ? '#10b981' : '#64748b' }}
                      >
                        {total === 0
                          ? 'Sin pasos todavía'
                          : `${done}/${total} pasos`}
                        {isComplete && ' · ¡Listo! 🎉'}
                      </span>
                    </div>

                    <span
                      className="material-symbols-outlined flex-shrink-0 transition-transform duration-200"
                      style={{
                        color: isComplete ? '#10b981' : '#8b5cf6',
                        fontSize: '24px',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    >
                      expand_more
                    </span>
                  </button>

                  {/* Contenido desplegado */}
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 flex flex-col gap-2 animate-[fadeIn_0.2s_ease-out]">
                      {/* Pasos */}
                      {total === 0 ? (
                        <p className="text-center text-[12px] text-on-surface-variant py-2 italic">
                          Agregá el primer paso abajo.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {list.steps.map((step) => (
                            <button
                              key={step.id}
                              type="button"
                              onClick={() => handleToggleStep(list.id, step.id)}
                              className="w-full p-2.5 rounded-xl flex items-center gap-2.5 text-left cursor-pointer active:scale-[0.99] transition-all"
                              style={{
                                background: step.done ? '#f0fdf4' : '#f8fafc',
                                border: `1.5px solid ${step.done ? '#6ee7b7' : '#e2e8f0'}`
                              }}
                            >
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: step.done ? '#10b981' : '#ffffff',
                                  border: `2px solid ${step.done ? '#10b981' : '#c4b5fd'}`
                                }}
                              >
                                {step.done && (
                                  <span
                                    className="material-symbols-outlined text-white"
                                    style={{ fontSize: '15px', fontWeight: 'bold' }}
                                  >
                                    check
                                  </span>
                                )}
                              </span>
                              <span
                                className="font-medium flex-1 min-w-0 break-words"
                                style={{
                                  color: step.done ? '#64748b' : '#1f2937',
                                  fontSize: '13px',
                                  textDecoration: step.done ? 'line-through' : 'none',
                                  opacity: step.done ? 0.7 : 1
                                }}
                              >
                                {step.text}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Botones de acción */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleEdit(list)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full font-black text-[10px] cursor-pointer active:scale-95 transition-all"
                          style={{
                            background: '#f5f3ff',
                            color: '#8b5cf6',
                            border: '1px solid #ddd6fe'
                          }}
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          <span>Editar</span>
                        </button>

                        {done > 0 && (
                          <button
                            type="button"
                            onClick={() => handleReset(list.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full font-black text-[10px] cursor-pointer active:scale-95 transition-all"
                            style={{
                              background: '#fff7ed',
                              color: '#ea580c',
                              border: '1px solid #fed7aa'
                            }}
                          >
                            <span className="material-symbols-outlined text-[14px]">refresh</span>
                            <span>Reiniciar</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setConfirmDelete(list.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full font-black text-[10px] cursor-pointer active:scale-95 transition-all ml-auto"
                          style={{
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca'
                          }}
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal crear/editar */}
      <ChecklistModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingList(null);
        }}
        onSave={handleSave}
        editingList={editingList}
      />

      {/* Confirmación de borrado */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl border-4 border-[#8b5cf6] shadow-[0_10px_0_0_#7c3aed] p-6 text-center">
            <span className="text-4xl block mb-3">🗑️</span>
            <h3 className="font-headline-md text-headline-md font-black text-on-surface mb-2">
              ¿Eliminar esta rutina?
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-5">
              Se van a borrar también los pasos.
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
                onClick={handleDelete}
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
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};