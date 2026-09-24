import React, { useState, useEffect, useRef } from 'react';
import Modal from './common/Modal';
import Button3D from './common/Button3D';
import { getXpFromDifficulty, suggestDifficultyFromTime } from '../services/storageService';
import { compressImage, getBase64SizeKb } from '../utils/imageUtils';
import { audioService } from '../services/audioService';

const CATEGORY_CONFIG = {
  school:  { label: 'Cole',    color: '#ff6b00', icon: '📚' },
  routine: { label: 'Rutina',  color: '#5bb8fe', icon: '🎒' },
  leisure: { label: 'Ocio',    color: '#8b5cf6', icon: '🎮' },
  home:    { label: 'Casa',    color: '#f59e0b', icon: '🏠' },
  general: { label: 'General', color: '#10b981', icon: '⭐' },
};

const PRIORITY_CONFIG = {
  red:    { color: '#ef4444', label: 'Urgente' },
  yellow: { color: '#f59e0b', label: 'Normal' },
  green:  { color: '#10b981', label: 'Cuando pueda' }
};

const DIFFICULTY_CONFIG = {
  facil:   { color: '#10b981', icon: '🟢', label: 'Fácil',   desc: 'Rutina automática' },
  media:   { color: '#f59e0b', icon: '🟡', label: 'Media',   desc: 'Concentración' },
  dificil: { color: '#ef4444', icon: '🔴', label: 'Difícil', desc: 'Esfuerzo real' },
  epica:   { color: '#8b5cf6', icon: '⭐', label: 'Épica',   desc: 'Proyecto grande' }
};

const MAX_MICROSTEPS = 5;

export default function EditTaskModal({ isOpen, onClose, task, onSave }) {
  const [title, setTitle] = useState('');
  const [timeMinutes, setTimeMinutes] = useState(15);
  const [difficulty, setDifficulty] = useState('media');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('yellow');
  const [microSteps, setMicroSteps] = useState([]);
  const [newStep, setNewStep] = useState('');
  const [difficultyEdited, setDifficultyEdited] = useState(true);
  const [photo, setPhoto] = useState(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const fileInputRef = useRef(null);

 useEffect(() => {
  if (isOpen && task) {
    // ... el resto de los sets
    // scroll al inicio del modal
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) form.scrollTop = 0;
    }, 50);
  }
}, [isOpen, task]);
  useEffect(() => {
    if (!difficultyEdited) {
      setDifficulty(suggestDifficultyFromTime(timeMinutes));
    }
  }, [timeMinutes, difficultyEdited]);

  const handleAddStep = () => {
    const trimmed = newStep.trim();
    if (!trimmed || microSteps.length >= MAX_MICROSTEPS) return;
    setMicroSteps([
      ...microSteps,
      { id: `ms_${Date.now()}_${microSteps.length}`, text: trimmed, done: false }
    ]);
    setNewStep('');
  };

  const handleRemoveStep = (idx) => {
    setMicroSteps(microSteps.filter((_, i) => i !== idx));
  };

  const handleStepKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddStep();
    }
  };

  // ============ MANEJO DE FOTO ============
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    setIsProcessingPhoto(true);

    try {
      const base64 = await compressImage(file);
      const sizeKb = getBase64SizeKb(base64);

      if (sizeKb > 800) {
        setPhotoError('La imagen quedó muy pesada incluso comprimida. Probá con otra más simple.');
        setIsProcessingPhoto(false);
        return;
      }

      setPhoto(base64);
      try { audioService.playPop(); } catch (err) {}
    } catch (err) {
      setPhotoError(err.message || 'No se pudo procesar la imagen');
    } finally {
      setIsProcessingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    try { audioService.playClick(); } catch (e) {}
    setPhoto(null);
    setPhotoError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try { audioService.playSuccess(); } catch (err) {}

    onSave(task.id, {
      title: title.trim(),
      timeMinutes: parseInt(timeMinutes, 10),
      difficulty,
      xpReward: getXpFromDifficulty(difficulty),
      category,
      priority,
      color: CATEGORY_CONFIG[category]?.color || '#ff6b00',
      microSteps,
      photo
    });

    onClose();
  };

  if (!task) return null;

  const previewXp = getXpFromDifficulty(difficulty);
  const suggestedDifficulty = suggestDifficultyFromTime(timeMinutes);
  const showSuggestionNote = difficulty !== suggestedDifficulty;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar misión"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-h-[80vh] overflow-y-auto pr-1" style={{ scrollBehavior: 'smooth' }}>

        {/* FOTO */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant">
            📷 Recordatorio (opcional)
          </label>
          <p className="text-[10px] text-on-surface-variant/70 mt-0.5 mb-2">
            Sacale una foto al pizarrón, cuaderno o consigna. Así no tenés que escribir.
          </p>

          {/* Input file oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoSelect}
            className="hidden"
          />

          {!photo && !isProcessingPhoto && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-2xl bg-[#f5f3ff] border-2 border-dashed border-[#c4b5fd] text-[#8b5cf6] font-label-md text-label-md font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">add_a_photo</span>
              <span>Agregar foto</span>
            </button>
          )}

          {isProcessingPhoto && (
            <div className="w-full py-3 rounded-2xl bg-[#f5f3ff] border-2 border-[#c4b5fd] flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[#8b5cf6] text-[22px] animate-spin">
                progress_activity
              </span>
              <span className="font-label-md text-label-md font-black text-[#8b5cf6]">
                Procesando imagen...
              </span>
            </div>
          )}

          {photo && !isProcessingPhoto && (
            <div className="relative w-full rounded-2xl overflow-hidden border-2 border-[#c4b5fd]">
              <img
                src={photo}
                alt="Recordatorio"
                className="w-full max-h-48 object-contain bg-[#f8fafc]"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm border border-[#c4b5fd] flex items-center justify-center text-[#8b5cf6] shadow-md active:scale-90 transition-all cursor-pointer"
                  title="Cambiar foto"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                </button>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm border border-red-200 flex items-center justify-center text-red-500 shadow-md active:scale-90 transition-all cursor-pointer"
                  title="Eliminar foto"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
            </div>
          )}

          {photoError && (
            <div className="w-full mt-2 p-2 rounded-xl bg-[#fee2e2] border border-[#fecaca] flex items-start gap-1.5">
              <span className="text-sm">⚠️</span>
              <p className="font-label-sm text-[11px] text-[#991b1b] font-bold leading-tight">
                {photoError}
              </p>
            </div>
          )}
        </div>

        {/* Título */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant">
            Título de la misión
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            required
            className="w-full mt-1.5 p-3 rounded-xl border-2 border-[#fed7aa] bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b00]"
          />
        </div>

        {/* Tiempo */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant">
            ⏱️ ¿Cuánto tiempo te va a llevar?
          </label>
          <div className="flex items-center gap-3 mt-1.5">
            <input
              type="range"
              min="5"
              max="90"
              step="5"
              value={timeMinutes}
              onChange={(e) => setTimeMinutes(e.target.value)}
              className="flex-1 accent-[#ff6b00]"
            />
            <span className="w-20 text-center px-2 py-1 rounded-xl bg-white border-2 border-[#fed7aa] font-black text-sm text-on-surface">
              {timeMinutes} min
            </span>
          </div>
        </div>

        {/* Dificultad */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-on-surface-variant">
              Dificultad
            </label>
            {!difficultyEdited && (
              <span className="text-[10px] font-black text-[#ea580c] bg-[#ffedd5] px-2 py-0.5 rounded-full border border-[#fed7aa]">
                SUGERIDA
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => {
              const isSelected = difficulty === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setDifficulty(key);
                    setDifficultyEdited(true);
                  }}
                  className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                    isSelected
                      ? 'text-white'
                      : 'bg-white text-on-surface-variant border-[#fed7aa] hover:border-[#ff6b00]'
                  }`}
                  style={isSelected ? { backgroundColor: cfg.color, borderColor: cfg.color } : {}}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{cfg.icon}</span>
                    <span className="font-bold text-xs">{cfg.label}</span>
                  </div>
                  <span className={`text-[10px] ${isSelected ? 'text-white/90' : 'text-on-surface-variant/70'}`}>
                    {cfg.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview XP */}
        <div className="p-3 rounded-xl bg-white border-2 border-[#fed7aa] flex items-center justify-between">
          <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">
            🎁 Recompensa
          </span>
          <span className="font-black text-[#ea580c] text-base">
            +{previewXp} XP
          </span>
        </div>

        {showSuggestionNote && (
          <div className="p-2 rounded-xl bg-[#fef3c7] border border-[#fcd34d] flex items-start gap-2">
            <span className="text-base">💡</span>
            <p className="font-label-sm text-label-sm text-[#92400e] font-bold leading-tight">
              Con {timeMinutes} min, la sugerencia era{' '}
              <strong>{DIFFICULTY_CONFIG[suggestedDifficulty].label}</strong>.
            </p>
          </div>
        )}

        {/* Micro-pasos */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-on-surface-variant">
              🪜 Pasos pequeños (opcional)
            </label>
            <span className="text-[10px] font-bold text-on-surface-variant/70">
              {microSteps.length}/{MAX_MICROSTEPS}
            </span>
          </div>

          {microSteps.length > 0 && (
            <div className="flex flex-col gap-1.5 mb-2">
              {microSteps.map((step, idx) => (
                <div
                  key={step.id || idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white border-2 border-[#fed7aa]"
                >
                  <span className="w-6 h-6 rounded-full bg-[#ffedd5] text-[#ea580c] flex items-center justify-center text-xs font-black flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="flex-1 font-body-sm text-body-sm text-on-surface break-words">
                    {step.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 active:scale-95 transition-all cursor-pointer flex-shrink-0"
                  >
                    <span className="material-symbols-outlined text-red-500 text-[16px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {microSteps.length < MAX_MICROSTEPS && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newStep}
                onChange={(e) => setNewStep(e.target.value)}
                onKeyDown={handleStepKeyDown}
                placeholder="Ej: Leer el enunciado"
                maxLength={60}
                className="flex-1 p-2.5 rounded-xl border-2 border-[#fed7aa] bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b00]"
              />
              <button
                type="button"
                onClick={handleAddStep}
                disabled={!newStep.trim()}
                className="w-10 h-10 rounded-xl bg-[#ff6b00] text-white flex items-center justify-center shadow-[0_3px_0_0_#c2410c] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
              </button>
            </div>
          )}
        </div>

        {/* Categoría */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant">Categoría</label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                type="button"
                onClick={() => setCategory(key)}
                className={`px-2 py-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  category === key
                    ? 'bg-[#ff6b00] text-white border-[#ff6b00]'
                    : 'bg-white text-on-surface-variant border-[#fed7aa] hover:border-[#ff6b00]'
                }`}
              >
                <span className="text-base leading-none">{cfg.icon}</span>
                <span className="leading-tight">{cfg.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Prioridad */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant">Prioridad</label>
          <div className="flex items-center gap-3 mt-1.5">
            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => {
              const isSelected = priority === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPriority(key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${
                    isSelected ? 'text-white' : 'bg-white text-on-surface-variant border-[#fed7aa]'
                  }`}
                  style={isSelected ? { backgroundColor: cfg.color, borderColor: cfg.color } : {}}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: isSelected ? '#fff' : cfg.color }}
                  />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-2 border-t-2 border-[#fed7aa]/50">
          <Button3D variant="outline" onClick={onClose}>
            Cancelar
          </Button3D>
          <Button3D type="submit" variant="primary" icon="check">
            Guardar cambios
          </Button3D>
        </div>

      </form>
    </Modal>
  );
}