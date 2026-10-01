import React, { useState, useEffect } from 'react';
import { audioService } from '../services/audioService';
import VoiceInput from './VoiceInput';

const EMOJI_OPTIONS = [
  '🚿', '🎒', '🦷', '🍳', '🛏️', '📚', '🧦', '🎨', '🏃', '🧘',
  '🐶', '🍽️', '🧼', '👕', '🌙', '☀️'
];

export const ChecklistModal = ({ isOpen, onClose, onSave, editingList }) => {
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('📋');
  const [steps, setSteps] = useState([]);
  const [newStepText, setNewStepText] = useState('');
  const [editingStepId, setEditingStepId] = useState(null);
  const [editingStepText, setEditingStepText] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingList) {
      setTitle(editingList.title || '');
      setEmoji(editingList.emoji || '📋');
      setSteps(editingList.steps || []);
    } else {
      setTitle('');
      setEmoji('📋');
      setSteps([]);
    }
    setNewStepText('');
    setEditingStepId(null);
    setEditingStepText('');
  }, [isOpen, editingList]);

  if (!isOpen) return null;

  const handleAddStep = () => {
    const text = newStepText.trim();
    if (!text) return;
    try { audioService.playPop(); } catch (e) {}
    setSteps((prev) => [
      ...prev,
      { id: 'st_' + Date.now() + Math.random().toString(36).slice(2, 6), text, done: false }
    ]);
    setNewStepText('');
  };

  const handleRemoveStep = (stepId) => {
    try { audioService.playClick(); } catch (e) {}
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
  };

  const handleStartEditStep = (step) => {
    setEditingStepId(step.id);
    setEditingStepText(step.text);
  };

  const handleSaveEditStep = () => {
    const text = editingStepText.trim();
    if (!text) return;
    setSteps((prev) =>
      prev.map((s) => (s.id === editingStepId ? { ...s, text } : s))
    );
    setEditingStepId(null);
    setEditingStepText('');
  };

  const handleCancelEditStep = () => {
    setEditingStepId(null);
    setEditingStepText('');
  };

  const handleSave = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    try { audioService.playSuccess(); } catch (e) {}
    onSave({
      title: cleanTitle,
      emoji,
      steps
    });
    onClose();
  };

  const canSave = title.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{
          background: '#ffffff',
          borderTop: '3px solid #8b5cf6',
          boxShadow: '0 -10px 40px rgba(139, 92, 246, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <span
            className="font-black"
            style={{ color: '#0f172a', fontSize: '18px' }}
          >
            {editingList ? 'Editar rutina' : 'Nueva rutina'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f5f3ff] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#8b5cf6] text-[22px]">close</span>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* Ícono + Título */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col gap-2 flex-shrink-0">
              <span
                className="font-black uppercase tracking-wider"
                style={{ color: '#8b5cf6', fontSize: '10px' }}
              >
                Ícono
              </span>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: '#ede9fe', border: '2px solid #c4b5fd' }}
              >
                <span className="text-3xl">{emoji}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <span
                className="font-black uppercase tracking-wider"
                style={{ color: '#8b5cf6', fontSize: '10px' }}
              >
                Nombre de la rutina
              </span>
              <VoiceInput
                value={title}
                onChange={setTitle}
                placeholder="Ej: Bañarse"
                maxLength={40}
                color="#8b5cf6"
                bg="#faf5ff"
                borderColor="#ddd6fe"
                style={{ fontSize: '15px' }}
              />
            </div>
          </div>

          {/* Selector de emoji */}
          <div className="flex flex-col gap-2">
            <span
              className="font-black uppercase tracking-wider"
              style={{ color: '#64748b', fontSize: '10px' }}
            >
              Elegí un ícono
            </span>
            <div className="grid grid-cols-8 gap-1.5">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => {
                    try { audioService.playPop(); } catch (e) {}
                    setEmoji(em);
                  }}
                  className="aspect-square rounded-xl flex items-center justify-center text-xl cursor-pointer active:scale-90 transition-all"
                  style={{
                    background: emoji === em ? '#ede9fe' : '#f8fafc',
                    border: `1.5px solid ${emoji === em ? '#8b5cf6' : '#e2e8f0'}`
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de pasos */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span
                className="font-black uppercase tracking-wider"
                style={{ color: '#8b5cf6', fontSize: '10px' }}
              >
                Pasos
              </span>
              <span
                className="font-black text-[11px] px-2 py-0.5 rounded-full"
                style={{ background: '#ede9fe', color: '#8b5cf6' }}
              >
                {steps.length}
              </span>
            </div>

            {steps.length === 0 ? (
              <p
                className="text-center text-[12px] italic py-3"
                style={{ color: '#94a3b8' }}
              >
                Todavía no agregaste pasos.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {steps.map((step, idx) => {
                  const isEditing = editingStepId === step.id;
                  return (
                    <div
                      key={step.id}
                      className="w-full p-2.5 rounded-2xl flex items-center gap-2"
                      style={{
                        background: '#f8fafc',
                        border: '1.5px solid #e2e8f0'
                      }}
                    >
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center font-black flex-shrink-0"
                        style={{
                          background: '#ede9fe',
                          color: '#8b5cf6',
                          fontSize: '11px'
                        }}
                      >
                        {idx + 1}
                      </span>

                      {isEditing ? (
                        <>
                          <div className="flex-1 min-w-0">
                            <VoiceInput
                              value={editingStepText}
                              onChange={setEditingStepText}
                              placeholder="Editar paso..."
                              maxLength={60}
                              color="#8b5cf6"
                              bg="#ffffff"
                              borderColor="#8b5cf6"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditStep();
                                if (e.key === 'Escape') handleCancelEditStep();
                              }}
                              style={{ fontSize: '13px', padding: '6px 10px' }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleSaveEditStep}
                            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer active:scale-95 flex-shrink-0"
                            style={{ background: '#10b981' }}
                          >
                            <span className="material-symbols-outlined text-white text-[16px]">check</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEditStep}
                            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer active:scale-95 flex-shrink-0"
                            style={{ background: '#f1f5f9' }}
                          >
                            <span className="material-symbols-outlined text-[#64748b] text-[16px]">close</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <span
                            className="flex-1 min-w-0 break-words font-medium"
                            style={{ color: '#1f2937', fontSize: '13px' }}
                          >
                            {step.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartEditStep(step)}
                            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer active:scale-95 flex-shrink-0"
                            style={{ background: '#f5f3ff' }}
                          >
                            <span className="material-symbols-outlined text-[#8b5cf6] text-[16px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(step.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer active:scale-95 flex-shrink-0"
                            style={{ background: '#fef2f2' }}
                          >
                            <span className="material-symbols-outlined text-red-500 text-[16px]">delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Agregar paso */}
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 min-w-0">
                <VoiceInput
                  value={newStepText}
                  onChange={setNewStepText}
                  placeholder="Escribí o dictá un paso..."
                  maxLength={60}
                  color="#8b5cf6"
                  bg="#faf5ff"
                  borderColor="#c4b5fd"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddStep();
                  }}
                  style={{ fontSize: '13px', borderStyle: 'dashed' }}
                />
              </div>
              <button
                type="button"
                onClick={handleAddStep}
                disabled={!newStepText.trim()}
                className="w-12 rounded-2xl flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-40 transition-all flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                  boxShadow: '0 2px 0 0 #5b21b6',
                  minHeight: '46px'
                }}
              >
                <span className="material-symbols-outlined text-white text-[20px]">add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <div
          className="sticky bottom-0 px-5 py-4 flex gap-2"
          style={{
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-black text-sm cursor-pointer active:scale-95 transition-all"
            style={{
              background: '#f1f5f9',
              color: '#64748b',
              border: '1.5px solid #e2e8f0'
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex-[2] py-3 rounded-2xl font-black text-sm cursor-pointer active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
              color: '#fff',
              boxShadow: '0 3px 0 0 #5b21b6'
            }}
          >
            {editingList ? 'Guardar cambios' : 'Crear rutina'}
          </button>
        </div>
      </div>
    </div>
  );
};