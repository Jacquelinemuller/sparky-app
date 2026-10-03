import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';
import { ChecklistModal } from '../components/ChecklistModal';

const TABS_KEY = 'sparky_checklist_tabs_v4';
const FONT = '"Fredoka", "Nunito", system-ui, sans-serif';

const DEFAULT_TABS = [
  { id: 'todas',   label: 'Todas',  emoji: '📋', locked: true, color: '#a78bfa', bg: '#ede9fe' },
  { id: 'manana',  label: 'Mañana', emoji: '☀️', color: '#f59e0b', bg: '#fef3c7' },
  { id: 'tarde',   label: 'Tarde',  emoji: '🌙', color: '#60a5fa', bg: '#dbeafe' },
  { id: 'noche',   label: 'Noche',  emoji: '🌙', color: '#818cf8', bg: '#e0e7ff' },
];

// 🎨 Paleta de colores de cuaderno
const NOTEBOOK_COLORS = [
  { id: 'yellow', label: 'Amarillo', bg1: '#fffef7', bg2: '#fef9e7', line: 'rgba(196, 181, 253, 0.28)', swatch: '#fef9e7' },
  { id: 'blue',   label: 'Celeste',  bg1: '#f5faff', bg2: '#dbeafe', line: 'rgba(147, 197, 253, 0.35)', swatch: '#dbeafe' },
  { id: 'mint',   label: 'Menta',    bg1: '#f5fdfa', bg2: '#d1fae5', line: 'rgba(110, 231, 183, 0.35)', swatch: '#d1fae5' },
  { id: 'pink',   label: 'Rosa',     bg1: '#fff7fa', bg2: '#fce7f3', line: 'rgba(249, 168, 212, 0.35)', swatch: '#fce7f3' },
  { id: 'purple', label: 'Lila',     bg1: '#faf7ff', bg2: '#ede9fe', line: 'rgba(196, 181, 253, 0.35)', swatch: '#ede9fe' },
  { id: 'peach',  label: 'Durazno',  bg1: '#fffaf5', bg2: '#fed7aa', line: 'rgba(251, 146, 60, 0.28)',  swatch: '#fed7aa' },
];

const uid = () => 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

function getColorDef(colorId) {
  return NOTEBOOK_COLORS.find((c) => c.id === colorId) || NOTEBOOK_COLORS[0];
}

function mergeTabsWithDefaults(saved) {
  if (!Array.isArray(saved)) return DEFAULT_TABS;
  return saved.map((t) => {
    const def = DEFAULT_TABS.find((d) => d.id === t.id);
    return {
      ...t,
      color: t.color || def?.color || '#a78bfa',
      bg: t.bg || def?.bg || '#ede9fe',
    };
  });
}

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

  const [tabs, setTabs] = useState(() => {
    try {
      const saved = localStorage.getItem(TABS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const defaultIds = DEFAULT_TABS.map((d) => d.id);
          const cleaned = parsed.filter((t) => {
            if (t.locked) return true;
            if (t.id.startsWith('tab_')) return true;
            return defaultIds.includes(t.id);
          });
          return mergeTabsWithDefaults(cleaned);
        }
      }
    } catch (e) {}
    return DEFAULT_TABS;
  });
  const [activeTab, setActiveTab] = useState('todas');

  useEffect(() => {
    try { localStorage.setItem(TABS_KEY, JSON.stringify(tabs)); } catch (e) {}
  }, [tabs]);

  const [expanded, setExpanded] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tabsEditorOpen, setTabsEditorOpen] = useState(false);

  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [movingList, setMovingList] = useState(null);
  const [pendingCategory, setPendingCategory] = useState(null);

  // 🆕 Picker de color
  const [colorPickerList, setColorPickerList] = useState(null);

  const [editingStep, setEditingStep] = useState(null);
  const [addingStepToList, setAddingStepToList] = useState(null);
  const [newStepText, setNewStepText] = useState('');
  const [newStepTime, setNewStepTime] = useState('');

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
    if (activeTab === 'todas') {
      setMovingList(null);
      setPendingCategory(null);
      setCategoryPickerOpen(true);
    } else {
      setPendingCategory(activeTab);
      setEditingList(null);
      setModalOpen(true);
    }
  };
  const handleEdit = (list) => {
    try { audioService.playClick(); } catch (e) {}
    setEditingList(list);
    setModalOpen(true);
  };

  const handleSave = (data) => {
    const payload = { ...data };

    if (editingList) {
      const originalCat = editingList.category || 'manana';
      payload.category = originalCat;
    } else {
      let cat;
      if (pendingCategory) {
        cat = pendingCategory;
      } else if (activeTab && activeTab !== 'todas') {
        cat = activeTab;
      } else {
        cat = 'manana';
      }
      payload.category = cat;
    }

    if (editingList) {
      updateChecklist(editingList.id, payload);
    } else {
      const newList = addChecklist(payload);
      if (newList) setExpanded((prev) => ({ ...prev, [newList.id]: true }));
    }
    setPendingCategory(null);
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteChecklist(confirmDelete);
      setConfirmDelete(null);
    }
  };
  const handleToggleStep = (listId, stepId) => toggleChecklistStep(listId, stepId);
  const handleReset = (listId) => resetChecklist(listId);

  const startEditStep = (listId, step, field) => {
    try { audioService.playClick(); } catch (e) {}
    setEditingStep({
      listId,
      stepId: step.id,
      field,
      value: field === 'text' ? (step.text || '') : (step.time || '')
    });
  };
  const cancelEditStep = () => setEditingStep(null);
  const saveEditStep = (list) => {
    if (!editingStep) return;
    const newSteps = (list.steps || []).map((s) => {
      if (s.id !== editingStep.stepId) return s;
      if (editingStep.field === 'text') return { ...s, text: editingStep.value };
      if (editingStep.field === 'time') return { ...s, time: editingStep.value };
      return s;
    });
    updateChecklist(list.id, { steps: newSteps });
    setEditingStep(null);
  };

  const deleteStep = (list, stepId) => {
    try { audioService.playClick(); } catch (e) {}
    const newSteps = (list.steps || []).filter((s) => s.id !== stepId);
    updateChecklist(list.id, { steps: newSteps });
  };

  const startAddStep = (listId) => {
    try { audioService.playClick(); } catch (e) {}
    setAddingStepToList(listId);
    setNewStepText('');
    setNewStepTime('');
  };
  const saveNewStep = (list) => {
    const text = newStepText.trim();
    if (!text) { setAddingStepToList(null); return; }
    const newStep = {
      id: uid(),
      text,
      done: false,
      time: newStepTime.trim() || ''
    };
    updateChecklist(list.id, { steps: [...(list.steps || []), newStep] });
    try { audioService.playSuccess(); } catch (e) {}
    setAddingStepToList(null);
    setNewStepText('');
    setNewStepTime('');
  };

  const filteredChecklists = useMemo(() => {
    if (!checklists) return [];
    if (activeTab === 'todas') return checklists;
    return checklists.filter((c) => (c.category || 'manana') === activeTab);
  }, [checklists, activeTab]);

  const handleResetAll = () => {
    if (!checklists) return;
    checklists.forEach((c) => resetChecklist(c.id));
    setMenuOpen(false);
  };

  const openTabsEditor = () => {
    setMenuOpen(false);
    setTabsEditorOpen(true);
  };
  const updateTabField = (id, field, value) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };
  const addTab = () => {
    const newTab = {
      id: 'tab_' + Date.now(),
      label: 'Nueva',
      emoji: '🏷️',
      color: '#a78bfa',
      bg: '#ede9fe'
    };
    setTabs((prev) => [...prev, newTab]);
  };
  const removeTab = (id) => {
    setTabs((prev) => prev.filter((t) => t.id !== id || t.locked));
    if (activeTab === id) setActiveTab('todas');
  };
  const resetTabs = () => {
    setTabs(DEFAULT_TABS);
    setActiveTab('todas');
  };

  const activeTabData = tabs.find((t) => t.id === activeTab) || tabs[0];
  const categoryOptions = tabs.filter((t) => !t.locked);

  // ============ RENDER ============
  return (
    <div
      className="min-h-screen flex flex-col antialiased"
      style={{
        fontFamily: FONT,
        background: 'linear-gradient(180deg, #fef6ff 0%, #f0f7ff 50%, #f0fff4 100%)'
      }}
    >
      {/* HEADER */}
      <header
        className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderBottom: '1px solid rgba(196, 181, 253, 0.3)',
          boxShadow: '0 4px 16px rgba(139, 92, 246, 0.06)'
        }}
      >
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full active:scale-95 transition-all cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1.5px solid rgba(196, 181, 253, 0.5)',
              color: '#7c3aed',
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: '14px'
            }}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Volver</span>
          </button>

          <button
            type="button"
            onClick={() => {
              try { audioService.playClick(); } catch (e) {}
              setMenuOpen(true);
            }}
            className="w-11 h-11 flex items-center justify-center rounded-full active:scale-95 transition-all cursor-pointer"
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1.5px solid rgba(196, 181, 253, 0.5)',
              color: '#7c3aed'
            }}
          >
            <span className="material-symbols-outlined text-[20px]">more_vert</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-24 pb-32 px-4 max-w-md mx-auto">

        {/* TABS */}
        <div
          className="flex items-end gap-1 mb-0 overflow-x-auto relative z-10"
          style={{ scrollbarWidth: 'none', paddingBottom: 0 }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const tabColor = tab.color || '#a78bfa';
            const tabBg = tab.bg || '#ede9fe';

            if (isActive) {
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    try { audioService.playPop(); } catch (e) {}
                    setActiveTab(tab.id);
                  }}
                  className="flex-shrink-0 relative active:scale-95 transition-all cursor-pointer"
                  style={{
                    padding: '7px 10px 18px 10px',
                    borderRadius: '12px 12px 0 0',
                    background: tabBg,
                    borderTop: `2px solid ${tabColor}`,
                    borderLeft: `2px solid ${tabColor}`,
                    borderRight: `2px solid ${tabColor}`,
                    color: tabColor,
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: '11px',
                    marginBottom: '-2px',
                    zIndex: 5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{ fontSize: '12px' }}>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      bottom: '5px',
                      left: '8px',
                      right: '8px',
                      height: 0,
                      borderTop: `1.5px dashed ${tabColor}`,
                      opacity: 0.5,
                      pointerEvents: 'none'
                    }}
                  />
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  try { audioService.playPop(); } catch (e) {}
                  setActiveTab(tab.id);
                }}
                className="flex-shrink-0 active:scale-95 transition-all cursor-pointer"
                style={{
                  padding: '5px 10px',
                  borderRadius: '999px',
                  background: tabBg,
                  border: `2px solid ${tabColor}`,
                  color: tabColor,
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: '11px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  marginBottom: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ fontSize: '12px' }}>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CUADERNOS */}
        {filteredChecklists.length === 0 ? (
          <div
            className="w-full p-8 rounded-3xl text-center"
            style={{
              marginTop: '-2px',
              background: 'linear-gradient(180deg, #fffef7 0%, #fef9e7 100%)',
              border: `2px solid ${activeTabData.color || '#a78bfa'}`,
              boxShadow: `0 6px 0 0 ${activeTabData.color || '#a78bfa'}, 0 10px 20px rgba(0, 0, 0, 0.06)`
            }}
          >
            <span className="text-4xl block mb-2">📝</span>
            <p style={{ color: '#3b0764', fontSize: '16px', fontWeight: 700, fontFamily: FONT }}>
              No hay rutinas en "{activeTabData.label}"
            </p>
            <p style={{ color: '#8a7a5c', fontSize: '13px', marginTop: '4px', fontFamily: FONT }}>
              Tocá el botón verde de abajo 👇
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3" style={{ marginTop: '-2px' }}>
            {filteredChecklists.map((list) => {
              const total = list.steps?.length || 0;
              const done = (list.steps || []).filter((s) => s.done).length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const isOpen = expanded[list.id] === true;
              const catData = tabs.find((t) => t.id === (list.category || 'manana')) || tabs[1];

              // 🎨 Color del cuaderno
              const colorDef = getColorDef(list.color);

              const notebookLines = `repeating-linear-gradient(
                to bottom,
                transparent 0px,
                transparent 27px,
                ${colorDef.line} 27px,
                ${colorDef.line} 28px
              )`;

              return (
                <div
                  key={list.id}
                  className="w-full rounded-3xl overflow-hidden"
                  style={{
                    background: `${notebookLines}, linear-gradient(180deg, ${colorDef.bg1} 0%, ${colorDef.bg2} 100%)`,
                    border: `2px solid ${activeTabData.color || '#a78bfa'}`,
                    boxShadow: `0 6px 0 0 ${activeTabData.color || '#a78bfa'}, 0 10px 20px rgba(0, 0, 0, 0.06)`
                  }}
                >
                  {/* CABECERA */}
                  <button
                    type="button"
                    onClick={() => toggleExpand(list.id)}
                    className="w-full p-4 flex items-center gap-3 cursor-pointer text-left"
                    style={{ background: 'transparent' }}
                  >
                    <div
                      className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-2xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: '1.5px solid rgba(196, 181, 253, 0.6)',
                        fontSize: '22px'
                      }}
                    >
                      {list.emoji || '📋'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2
                        className="leading-tight break-words"
                        style={{
                          color: '#1e1b4b',
                          fontSize: '18px',
                          fontFamily: FONT,
                          fontWeight: 700,
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {list.title}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <p
                          style={{
                            color: '#8a7a5c',
                            fontSize: '11px',
                            fontFamily: FONT,
                            fontWeight: 600,
                            background: 'rgba(255, 254, 247, 0.75)',
                            padding: '0 4px',
                            borderRadius: '4px'
                          }}
                        >
                          {total === 0
                            ? 'Sin pasos todavía'
                            : `${done}/${total} pasos · ${pct}%`}
                        </p>
                        {activeTab === 'todas' && catData && (
                          <span
                            className="px-1.5 py-0.5 rounded-full"
                            style={{
                              background: catData.bg,
                              color: catData.color,
                              fontSize: '9.5px',
                              fontFamily: FONT,
                              fontWeight: 700,
                              border: `1px solid ${catData.color}`
                            }}
                          >
                            {catData.emoji} {catData.label}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className="material-symbols-outlined flex-shrink-0"
                      style={{
                        color: activeTabData.color || '#a78bfa',
                        fontSize: '26px',
                        transition: 'transform 0.2s',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    >
                      expand_more
                    </span>
                  </button>

                  {/* CONTENIDO DESPLEGADO */}
                  {isOpen && (
                    <>
                      <div className="px-4 pb-3" style={{ background: 'transparent' }}>
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src="/rutina/icono-checklist.png"
                            alt="Checklist"
                            draggable={false}
                            style={{
                              width: '28px',
                              height: '28px',
                              objectFit: 'contain',
                              pointerEvents: 'none'
                            }}
                          />
                          <p
                            style={{
                              color: '#8a7a5c',
                              fontSize: '12px',
                              fontFamily: FONT,
                              fontWeight: 600
                            }}
                          >
                            Marca tus hábitos paso a paso
                          </p>
                        </div>

                        <div
                          className="mt-2 mb-3"
                          style={{ borderTop: '1.5px dashed rgba(196, 181, 253, 0.55)' }}
                        />

                        <div
                          className="p-3 rounded-2xl flex items-center gap-3"
                          style={{
                            background: 'rgba(255, 255, 255, 0.92)',
                            border: '1.5px solid rgba(196, 181, 253, 0.5)',
                            boxShadow: '0 2px 0 0 rgba(196, 181, 253, 0.2)'
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <p
                              style={{
                                color: '#1e1b4b',
                                fontSize: '12px',
                                fontFamily: FONT,
                                fontWeight: 600
                              }}
                            >
                              Progreso de hoy: <span style={{ fontWeight: 700 }}>{done} de {total}</span> completadas
                            </p>
                            <div
                              className="mt-2 h-3 rounded-full overflow-visible relative"
                              style={{
                                background: 'rgba(196, 181, 253, 0.25)',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                              }}
                            >
                              <div
                                style={{
                                  width: `${pct}%`,
                                  height: '100%',
                                  borderRadius: '999px',
                                  background: 'linear-gradient(90deg, #a78bfa 0%, #8b5cf6 60%, #7c3aed 100%)',
                                  transition: 'width 0.35s ease',
                                  position: 'relative',
                                  boxShadow: '0 1px 3px rgba(124, 58, 237, 0.4)'
                                }}
                              >
                                {pct > 0 && (
                                  <span
                                    style={{
                                      position: 'absolute',
                                      right: '-2px',
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      width: '12px',
                                      height: '12px',
                                      borderRadius: '50%',
                                      background: '#ffffff',
                                      border: '2px solid #7c3aed',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.15)'
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>

                          <span
                            className="flex-shrink-0 px-3 py-1.5 rounded-full"
                            style={{
                              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                              color: '#ffffff',
                              fontSize: '12px',
                              fontFamily: FONT,
                              fontWeight: 700,
                              minWidth: '52px',
                              textAlign: 'center',
                              boxShadow: '0 2px 0 0 #4c1d95'
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>

                      {/* PASOS */}
                      <div className="px-4 pb-2" style={{ background: 'transparent' }}>
                        {(list.steps || []).map((step) => {
                          const isEditingText = editingStep?.listId === list.id && editingStep?.stepId === step.id && editingStep?.field === 'text';
                          const isEditingTime = editingStep?.listId === list.id && editingStep?.stepId === step.id && editingStep?.field === 'time';

                          return (
                            <div
                              key={step.id}
                              className="flex items-center gap-2.5 py-2"
                              style={{ minHeight: '52px' }}
                            >
                              <button
                                type="button"
                                onClick={() => handleToggleStep(list.id, step.id)}
                                className="flex-shrink-0 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '10px',
                                  background: step.done ? '#10b981' : '#ffffff',
                                  border: `2.5px solid ${step.done ? '#10b981' : '#1e1b4b'}`,
                                  boxShadow: '0 2px 0 0 rgba(0,0,0,0.12)'
                                }}
                              >
                                {step.done && (
                                  <span
                                    className="material-symbols-outlined text-white"
                                    style={{ fontSize: '20px', fontWeight: 'bold' }}
                                  >
                                    check
                                  </span>
                                )}
                              </button>

                              {isEditingText ? (
                                <input
                                  autoFocus
                                  type="text"
                                  value={editingStep.value}
                                  onChange={(e) => setEditingStep((s) => ({ ...s, value: e.target.value }))}
                                  onBlur={() => saveEditStep(list)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditStep(list);
                                    if (e.key === 'Escape') cancelEditStep();
                                  }}
                                  className="flex-1 min-w-0 px-2 py-1 outline-none"
                                  style={{
                                    fontSize: '15px',
                                    fontFamily: FONT,
                                    fontWeight: 600,
                                    color: '#1e1b4b',
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '8px',
                                    border: '2px solid #a78bfa'
                                  }}
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => startEditStep(list.id, step, 'text')}
                                  className="flex-1 min-w-0 text-left cursor-pointer"
                                >
                                  <span
                                    className="break-words"
                                    style={{
                                      color: step.done ? '#8b7d5e' : '#1e1b4b',
                                      fontSize: '15px',
                                      fontFamily: FONT,
                                      fontWeight: step.done ? 500 : 600,
                                      textDecoration: step.done ? 'line-through' : 'none',
                                      opacity: step.done ? 0.65 : 1,
                                      background: 'rgba(255, 254, 247, 0.65)',
                                      padding: '0 4px',
                                      borderRadius: '4px'
                                    }}
                                  >
                                    {step.text}
                                  </span>
                                </button>
                              )}

                              {isEditingTime ? (
                                <input
                                  autoFocus
                                  type="text"
                                  value={editingStep.value}
                                  onChange={(e) => setEditingStep((s) => ({ ...s, value: e.target.value }))}
                                  onBlur={() => saveEditStep(list)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditStep(list);
                                    if (e.key === 'Escape') cancelEditStep();
                                  }}
                                  placeholder="07:30 AM"
                                  className="w-24 px-2 py-1 outline-none"
                                  style={{
                                    fontSize: '11px',
                                    fontFamily: FONT,
                                    fontWeight: 600,
                                    color: '#1e1b4b',
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    borderRadius: '999px',
                                    border: '2px solid #a78bfa',
                                    textAlign: 'center'
                                  }}
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => startEditStep(list.id, step, 'time')}
                                  className="flex-shrink-0 px-2.5 py-1 rounded-full active:scale-95 transition-all cursor-pointer"
                                  style={{
                                    background: step.time
                                      ? 'rgba(237, 233, 254, 0.95)'
                                      : step.done
                                      ? 'rgba(209, 250, 229, 0.95)'
                                      : 'rgba(254, 243, 199, 0.95)',
                                    color: step.time
                                      ? '#6d28d9'
                                      : step.done
                                      ? '#065f46'
                                      : '#92400e',
                                    fontSize: '10.5px',
                                    fontFamily: FONT,
                                    fontWeight: 700,
                                    minWidth: '66px',
                                    textAlign: 'center'
                                  }}
                                >
                                  {step.time ? step.time : step.done ? 'Hecho' : 'Pendiente'}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => deleteStep(list, step.id)}
                                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full active:scale-90 transition-all cursor-pointer opacity-40 hover:opacity-100"
                                style={{ color: '#dc2626' }}
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Input agregar paso */}
                      {addingStepToList === list.id && (
                        <div className="px-4 py-2 flex flex-col gap-2">
                          <input
                            autoFocus
                            type="text"
                            value={newStepText}
                            onChange={(e) => setNewStepText(e.target.value)}
                            placeholder="Escribí el paso..."
                            className="w-full px-3 py-2 outline-none"
                            style={{
                              fontSize: '14px',
                              fontFamily: FONT,
                              fontWeight: 600,
                              color: '#1e1b4b',
                              background: 'rgba(255, 255, 255, 0.95)',
                              borderRadius: '12px',
                              border: '2px solid #a78bfa'
                            }}
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newStepTime}
                              onChange={(e) => setNewStepTime(e.target.value)}
                              placeholder="07:30 AM (opcional)"
                              className="flex-1 px-3 py-1.5 outline-none"
                              style={{
                                fontSize: '12px',
                                fontFamily: FONT,
                                fontWeight: 600,
                                color: '#6d28d9',
                                background: 'rgba(255, 255, 255, 0.95)',
                                borderRadius: '999px',
                                border: '1.5px solid rgba(196, 181, 253, 0.8)'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => saveNewStep(list)}
                              className="px-3 py-1.5 rounded-full active:scale-95 transition-all cursor-pointer"
                              style={{
                                background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                                color: '#fff',
                                fontSize: '12px',
                                fontFamily: FONT,
                                fontWeight: 700,
                                boxShadow: '0 3px 0 0 #5b21b6'
                              }}
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddingStepToList(null)}
                              className="px-3 py-1.5 rounded-full active:scale-95 transition-all cursor-pointer"
                              style={{
                                background: 'rgba(255,255,255,0.95)',
                                color: '#7c3aed',
                                fontSize: '12px',
                                fontFamily: FONT,
                                fontWeight: 700,
                                border: '1.5px solid rgba(196, 181, 253, 0.7)'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ACCIONES */}
                      <div className="px-4 pb-3 pt-2 flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => startAddStep(list.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full active:scale-95 transition-all cursor-pointer"
                          style={{
                            background: 'rgba(209, 250, 229, 0.95)',
                            color: '#065f46',
                            border: '1.5px solid rgba(110, 231, 183, 0.8)',
                            fontSize: '11px',
                            fontFamily: FONT,
                            fontWeight: 600
                          }}
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          Paso nuevo
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(list)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full active:scale-95 transition-all cursor-pointer"
                          style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            color: '#7c3aed',
                            border: '1.5px solid rgba(196, 181, 253, 0.6)',
                            fontSize: '11px',
                            fontFamily: FONT,
                            fontWeight: 600
                          }}
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          Editar
                        </button>

                        {/* 🆕 BOTÓN COLOR */}
                        <button
                          type="button"
                          onClick={() => {
                            try { audioService.playClick(); } catch (e) {}
                            setColorPickerList(list);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full active:scale-95 transition-all cursor-pointer"
                          style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            color: '#7c3aed',
                            border: '1.5px solid rgba(196, 181, 253, 0.6)',
                            fontSize: '11px',
                            fontFamily: FONT,
                            fontWeight: 600
                          }}
                        >
                          <span
                            className="material-symbols-outlined text-[14px]"
                            style={{ color: colorDef.swatch }}
                          >
                            palette
                          </span>
                          Color
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            try { audioService.playClick(); } catch (e) {}
                            setMovingList(list);
                            setCategoryPickerOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full active:scale-95 transition-all cursor-pointer"
                          style={{
                            background: 'rgba(219, 234, 254, 0.95)',
                            color: '#1e40af',
                            border: '1.5px solid rgba(147, 197, 253, 0.8)',
                            fontSize: '11px',
                            fontFamily: FONT,
                            fontWeight: 600
                          }}
                        >
                          <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                          Mover
                        </button>

                        {done > 0 && (
                          <button
                            type="button"
                            onClick={() => handleReset(list.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full active:scale-95 transition-all cursor-pointer"
                            style={{
                              background: 'rgba(255, 237, 213, 0.95)',
                              color: '#c2410c',
                              border: '1.5px solid rgba(253, 186, 116, 0.8)',
                              fontSize: '11px',
                              fontFamily: FONT,
                              fontWeight: 600
                            }}
                          >
                            <span className="material-symbols-outlined text-[14px]">refresh</span>
                            Reiniciar
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setConfirmDelete(list.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full active:scale-95 transition-all cursor-pointer ml-auto"
                          style={{
                            background: 'rgba(254, 226, 226, 0.95)',
                            color: '#dc2626',
                            border: '1.5px solid rgba(252, 165, 165, 0.8)',
                            fontSize: '11px',
                            fontFamily: FONT,
                            fontWeight: 600
                          }}
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* FAB NUEVA RUTINA */}
      <button
        type="button"
        onClick={handleNew}
        className="fixed active:scale-95 transition-all cursor-pointer z-40 inline-flex items-center gap-1.5"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
          right: '20px',
          padding: '14px 20px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          color: '#065f46',
          border: '2px solid #6ee7b7',
          fontSize: '14px',
          fontFamily: FONT,
          fontWeight: 700,
          boxShadow: '0 6px 0 0 #6ee7b7, 0 10px 24px rgba(16, 185, 129, 0.3)'
        }}
      >
        <span className="material-symbols-outlined text-[20px]">check</span>
        <span>Nueva</span>
      </button>

      {/* MODAL CREAR/EDITAR */}
      <ChecklistModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingList(null);
          setPendingCategory(null);
        }}
        onSave={handleSave}
        editingList={editingList}
      />

      {/* PICKER DE CATEGORÍA */}
      {categoryPickerOpen && (
        <div
          className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => {
            setCategoryPickerOpen(false);
            setMovingList(null);
            setPendingCategory(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl p-5"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)',
              border: '2px solid #c4b5fd',
              boxShadow: '0 6px 0 0 #c4b5fd, 0 10px 20px rgba(0, 0, 0, 0.15)'
            }}
          >
            <h3
              style={{
                color: '#1e1b4b',
                fontSize: '18px',
                fontFamily: FONT,
                fontWeight: 700,
                marginBottom: '4px',
                textAlign: 'center'
              }}
            >
              {movingList ? '¿A qué solapa la movemos?' : '¿En qué solapa la creamos?'}
            </h3>
            <p
              style={{
                color: '#7c6f9e',
                fontSize: '12px',
                fontFamily: FONT,
                fontWeight: 500,
                marginBottom: '16px',
                textAlign: 'center'
              }}
            >
              {movingList
                ? `"${movingList.title}" se va a mover a la solapa elegida.`
                : 'Elegí dónde va a vivir esta nueva rutina.'}
            </p>

            <div className="flex flex-col gap-2.5">
              {categoryOptions.map((tab) => {
                const isCurrent = movingList && (movingList.category || 'manana') === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      try { audioService.playSuccess(); } catch (e) {}

                      if (movingList) {
                        updateChecklist(movingList.id, { category: tab.id });
                        setMovingList(null);
                        setCategoryPickerOpen(false);
                      } else {
                        setPendingCategory(tab.id);
                        setCategoryPickerOpen(false);
                        setEditingList(null);
                        setModalOpen(true);
                      }
                    }}
                    disabled={isCurrent}
                    className="w-full p-3 rounded-2xl flex items-center gap-3 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: tab.bg,
                      border: `2px solid ${tab.color}`,
                      boxShadow: `0 3px 0 0 ${tab.color}`
                    }}
                  >
                    <span style={{ fontSize: '22px' }}>{tab.emoji}</span>
                    <span
                      style={{
                        color: tab.color,
                        fontSize: '15px',
                        fontFamily: FONT,
                        fontWeight: 700,
                        flex: 1,
                        textAlign: 'left'
                      }}
                    >
                      {tab.label}
                    </span>
                    {isCurrent && (
                      <span
                        className="px-2 py-1 rounded-full"
                        style={{
                          background: tab.color,
                          color: '#ffffff',
                          fontSize: '10px',
                          fontFamily: FONT,
                          fontWeight: 700
                        }}
                      >
                        actual
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                setCategoryPickerOpen(false);
                setMovingList(null);
                setPendingCategory(null);
              }}
              className="w-full mt-4 h-11 rounded-2xl active:scale-95 transition-all cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#7c3aed',
                border: '2px solid rgba(196, 181, 253, 0.5)',
                fontSize: '13px',
                fontFamily: FONT,
                fontWeight: 700
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* 🆕 PICKER DE COLOR */}
      {colorPickerList && (
        <div
          className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setColorPickerList(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl p-5"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)',
              border: '2px solid #c4b5fd',
              boxShadow: '0 6px 0 0 #c4b5fd, 0 10px 20px rgba(0, 0, 0, 0.15)'
            }}
          >
            <h3
              style={{
                color: '#1e1b4b',
                fontSize: '18px',
                fontFamily: FONT,
                fontWeight: 700,
                marginBottom: '4px',
                textAlign: 'center'
              }}
            >
              Elegí el color del cuaderno
            </h3>
            <p
              style={{
                color: '#7c6f9e',
                fontSize: '12px',
                fontFamily: FONT,
                fontWeight: 500,
                marginBottom: '16px',
                textAlign: 'center'
              }}
            >
              "{colorPickerList.title}"
            </p>

            <div className="grid grid-cols-3 gap-3">
              {NOTEBOOK_COLORS.map((colorDef) => {
                const isCurrent = (colorPickerList.color || 'yellow') === colorDef.id;
                return (
                  <button
                    key={colorDef.id}
                    type="button"
                    onClick={() => {
                      try { audioService.playSuccess(); } catch (e) {}
                      updateChecklist(colorPickerList.id, { color: colorDef.id });
                      setColorPickerList(null);
                    }}
                    className="aspect-square rounded-2xl flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer relative overflow-hidden"
                    style={{
                      background: `linear-gradient(180deg, ${colorDef.bg1} 0%, ${colorDef.bg2} 100%)`,
                      border: `2px solid ${isCurrent ? '#7c3aed' : 'rgba(196, 181, 253, 0.5)'}`,
                      boxShadow: isCurrent ? '0 0 0 3px rgba(167, 139, 250, 0.4)' : 'none'
                    }}
                  >
                    {/* Mini rayas del cuaderno */}
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: `repeating-linear-gradient(
                          to bottom,
                          transparent 0px,
                          transparent 8px,
                          ${colorDef.line} 8px,
                          ${colorDef.line} 9px
                        )`,
                        opacity: 0.6,
                        pointerEvents: 'none'
                      }}
                    />
                    {isCurrent && (
                      <span
                        className="material-symbols-outlined"
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          color: '#7c3aed',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          zIndex: 2
                        }}
                      >
                        check_circle
                      </span>
                    )}
                    <span
                      style={{
                        position: 'relative',
                        zIndex: 1,
                        color: '#1e1b4b',
                        fontSize: '10px',
                        fontFamily: FONT,
                        fontWeight: 700,
                        background: 'rgba(255, 255, 255, 0.8)',
                        padding: '1px 6px',
                        borderRadius: '999px'
                      }}
                    >
                      {colorDef.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setColorPickerList(null)}
              className="w-full mt-4 h-11 rounded-2xl active:scale-95 transition-all cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#7c3aed',
                border: '2px solid rgba(196, 181, 253, 0.5)',
                fontSize: '13px',
                fontFamily: FONT,
                fontWeight: 700
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MENÚ ⋯ */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[140] flex items-start justify-end p-4"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMenuOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-16 w-64 rounded-2xl overflow-hidden"
            style={{
              background: '#ffffff',
              border: '2px solid #c4b5fd',
              boxShadow: '0 6px 0 0 #c4b5fd, 0 10px 20px rgba(0,0,0,0.15)'
            }}
          >
            <MenuItem icon="tune" label="Editar solapas" onClick={openTabsEditor} />
            <MenuItem icon="restart_alt" label="Reiniciar todas" onClick={handleResetAll} />
          </div>
        </div>
      )}

      {/* EDITOR DE SOLAPAS */}
      {tabsEditorOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-md rounded-3xl p-5 max-h-[85vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)',
              border: '2px solid #c4b5fd',
              boxShadow: '0 6px 0 0 #c4b5fd, 0 10px 20px rgba(0, 0, 0, 0.15)'
            }}
          >
            <h3
              style={{
                color: '#1e1b4b',
                fontSize: '20px',
                fontFamily: FONT,
                fontWeight: 700,
                marginBottom: '4px'
              }}
            >
              Editar solapas 🏷️
            </h3>
            <p
              style={{
                color: '#7c6f9e',
                fontSize: '12px',
                fontFamily: FONT,
                fontWeight: 500,
                marginBottom: '16px'
              }}
            >
              Cambiá el nombre, agregá nuevas o eliminá las que no uses.
            </p>

            <div className="flex flex-col gap-2.5">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className="flex items-center gap-2 p-2.5 rounded-2xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '1.5px solid rgba(196, 181, 253, 0.4)'
                  }}
                >
                  <input
                    type="text"
                    value={tab.emoji}
                    onChange={(e) => updateTabField(tab.id, 'emoji', e.target.value.slice(0, 2))}
                    className="w-10 h-10 text-center outline-none"
                    style={{
                      fontSize: '18px',
                      background: 'rgba(224, 213, 245, 0.5)',
                      borderRadius: '10px',
                      border: '1.5px solid rgba(196, 181, 253, 0.6)'
                    }}
                  />
                  <input
                    type="text"
                    value={tab.label}
                    onChange={(e) => updateTabField(tab.id, 'label', e.target.value)}
                    disabled={tab.locked}
                    className="flex-1 px-2 py-2 outline-none"
                    style={{
                      fontSize: '14px',
                      fontFamily: FONT,
                      fontWeight: 600,
                      color: tab.locked ? '#7c6f9e' : '#1e1b4b',
                      background: tab.locked ? 'rgba(240, 240, 250, 0.7)' : 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '10px',
                      border: '1.5px solid rgba(196, 181, 253, 0.5)'
                    }}
                  />
                  {tab.locked ? (
                    <span
                      className="px-2 py-1 rounded-full"
                      style={{
                        fontSize: '10px',
                        fontFamily: FONT,
                        fontWeight: 700,
                        color: '#7c6f9e',
                        background: 'rgba(196, 181, 253, 0.25)'
                      }}
                    >
                      fija
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeTab(tab.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90 transition-all cursor-pointer"
                      style={{
                        background: 'rgba(254, 226, 226, 0.9)',
                        color: '#dc2626',
                        border: '1px solid rgba(252, 165, 165, 0.7)'
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addTab}
              className="w-full mt-3 py-2.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1.5px dashed rgba(167, 139, 250, 0.7)',
                color: '#7c3aed',
                fontSize: '13px',
                fontFamily: FONT,
                fontWeight: 700
              }}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Agregar solapa
            </button>

            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={resetTabs}
                className="flex-1 h-11 rounded-2xl active:scale-95 transition-all cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  color: '#7c3aed',
                  border: '2px solid rgba(196, 181, 253, 0.5)',
                  fontSize: '12px',
                  fontFamily: FONT,
                  fontWeight: 700
                }}
              >
                Restaurar
              </button>
              <button
                type="button"
                onClick={() => setTabsEditorOpen(false)}
                className="flex-1 h-11 rounded-2xl active:scale-95 transition-all cursor-pointer text-white"
                style={{
                  background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 0 0 #5b21b6',
                  fontSize: '12px',
                  fontFamily: FONT,
                  fontWeight: 700
                }}
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR BORRADO */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-3xl p-6 text-center"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)',
              border: '2px solid #c4b5fd',
              boxShadow: '0 6px 0 0 #c4b5fd, 0 10px 20px rgba(0, 0, 0, 0.15)'
            }}
          >
            <span className="text-4xl block mb-3">🗑️</span>
            <h3
              style={{
                color: '#1e1b4b',
                fontSize: '18px',
                fontFamily: FONT,
                fontWeight: 700,
                marginBottom: '6px'
              }}
            >
              ¿Eliminar esta rutina?
            </h3>
            <p
              style={{
                color: '#7c6f9e',
                fontSize: '13px',
                fontFamily: FONT,
                fontWeight: 500,
                marginBottom: '20px'
              }}
            >
              Se van a borrar también los pasos.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 h-12 rounded-2xl active:scale-95 transition-all cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  border: '2px solid rgba(196, 181, 253, 0.5)',
                  color: '#1e1b4b',
                  fontFamily: FONT,
                  fontWeight: 700
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 h-12 rounded-2xl active:scale-95 transition-all cursor-pointer text-white"
                style={{
                  background: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)',
                  border: '2px solid #dc2626',
                  boxShadow: '0 4px 0 0 #991b1b',
                  fontFamily: FONT,
                  fontWeight: 700
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full px-4 py-3 flex items-center gap-3 cursor-pointer active:bg-[#f5f3ff] transition-colors"
    style={{ borderBottom: '1px solid rgba(196, 181, 253, 0.2)' }}
  >
    <span className="material-symbols-outlined text-[20px]" style={{ color: '#7c3aed' }}>
      {icon}
    </span>
    <span
      style={{
        color: '#1e1b4b',
        fontSize: '14px',
        fontFamily: '"Fredoka", "Nunito", system-ui, sans-serif',
        fontWeight: 600
      }}
    >
      {label}
    </span>
  </button>
);