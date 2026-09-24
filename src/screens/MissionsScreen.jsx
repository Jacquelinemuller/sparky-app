import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import EditTaskModal from '../components/EditTaskModal';
import PhotoViewerModal from '../components/PhotoViewerModal';
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

function PriorityDots({ current, onChange }) {
  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => {
        const isSelected = current === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`rounded-full transition-all cursor-pointer ${
              isSelected ? 'w-5 h-5 ring-2 ring-offset-1' : 'w-4 h-4 opacity-60 hover:opacity-100'
            }`}
            style={{
              backgroundColor: cfg.color,
              boxShadow: isSelected ? `0 0 8px ${cfg.color}` : 'none'
            }}
            title={cfg.label}
          />
        );
      })}
    </div>
  );
}

export const MissionsScreen = () => {
  const { tasks, addTask, deleteTask, setTaskPriority, setTaskDifficulty, editTask, setTaskPhoto, userName } = useApp();
  const [title, setTitle] = useState('');
  const [timeMinutes, setTimeMinutes] = useState(15);
  const [difficulty, setDifficulty] = useState('media');
  const [category, setCategory] = useState('school');
  const [priority, setPriority] = useState('yellow');
  const [microSteps, setMicroSteps] = useState([]);
  const [newStep, setNewStep] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState('all');
  const [difficultyEdited, setDifficultyEdited] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // Foto en creación
  const [newTaskPhoto, setNewTaskPhoto] = useState(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef(null);

  // Foto rápida (desde la lista, para tarea existente)
  const [photoTargetTaskId, setPhotoTargetTaskId] = useState(null);
  const quickPhotoInputRef = useRef(null);

  // Visor de foto
  const [photoToView, setPhotoToView] = useState(null);
  const [photoViewTitle, setPhotoViewTitle] = useState('');

  useEffect(() => {
    if (!difficultyEdited) {
      setDifficulty(suggestDifficultyFromTime(timeMinutes));
    }
  }, [timeMinutes, difficultyEdited]);

  const handleAddStep = () => {
    const trimmed = newStep.trim();
    if (!trimmed || microSteps.length >= MAX_MICROSTEPS) return;
    setMicroSteps([...microSteps, trimmed]);
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

  // ============ FOTO EN CREACIÓN ============
  const handleNewTaskPhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError('');
    setIsProcessingPhoto(true);

    try {
      const base64 = await compressImage(file);
      const sizeKb = getBase64SizeKb(base64);

      if (sizeKb > 800) {
        setPhotoError('La imagen quedó muy pesada. Probá con otra más simple.');
        setIsProcessingPhoto(false);
        return;
      }

      setNewTaskPhoto(base64);
      try { audioService.playPop(); } catch (err) {}
    } catch (err) {
      setPhotoError(err.message || 'No se pudo procesar la imagen');
    } finally {
      setIsProcessingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveNewTaskPhoto = () => {
    try { audioService.playClick(); } catch (e) {}
    setNewTaskPhoto(null);
    setPhotoError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ============ FOTO RÁPIDA EN LISTA ============
  const handleQuickPhotoClick = (task) => {
    try { audioService.playPop(); } catch (e) {}

    if (task.photo) {
      setPhotoToView(task.photo);
      setPhotoViewTitle(task.title);
    } else {
      setPhotoTargetTaskId(task.id);
      if (quickPhotoInputRef.current) {
        quickPhotoInputRef.current.click();
      }
    }
  };

  const handleQuickPhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !photoTargetTaskId) return;

    setIsProcessingPhoto(true);

    try {
      const base64 = await compressImage(file);
      const sizeKb = getBase64SizeKb(base64);

      if (sizeKb > 800) {
        alert('La imagen quedó muy pesada. Probá con otra más simple.');
        setIsProcessingPhoto(false);
        setPhotoTargetTaskId(null);
        return;
      }

      setTaskPhoto(photoTargetTaskId, base64);
    } catch (err) {
      alert(err.message || 'No se pudo procesar la imagen');
    } finally {
      setIsProcessingPhoto(false);
      setPhotoTargetTaskId(null);
      if (quickPhotoInputRef.current) quickPhotoInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setTitle('');
    setTimeMinutes(15);
    setDifficulty('media');
    setCategory('school');
    setPriority('yellow');
    setMicroSteps([]);
    setNewStep('');
    setDifficultyEdited(false);
    setNewTaskPhoto(null);
    setPhotoError('');
    setIsProcessingPhoto(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title,
      timeMinutes: parseInt(timeMinutes, 10),
      difficulty,
      category,
      priority,
      color: CATEGORY_CONFIG[category]?.color || '#ff6b00',
      microSteps: microSteps.map((text, idx) => ({
        id: `ms_${Date.now()}_${idx}`,
        text,
        done: false
      })),
      photo: newTaskPhoto
    });

    resetForm();
    setIsAdding(false);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const counts = {
    all: tasks.length,
    active: tasks.filter((t) => t.status === 'active').length,
    queued: tasks.filter((t) => t.status === 'queued').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const filters = [
    { id: 'all', label: 'Todas', count: counts.all },
    { id: 'active', label: 'Activas', count: counts.active },
    { id: 'queued', label: 'En cola', count: counts.queued },
    { id: 'completed', label: 'Hechas', count: counts.completed },
  ];

  const previewXp = getXpFromDifficulty(difficulty);
  const suggestedDifficulty = suggestDifficultyFromTime(timeMinutes);
  const showSuggestionNote = difficulty !== suggestedDifficulty;

  return (
    <div className="flex flex-col w-full max-w-md mx-auto items-center select-none pb-8 px-2">

      {/* Input file oculto para foto rápida */}
      <input
        ref={quickPhotoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleQuickPhotoSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <h1 className="font-headline-lg font-black text-on-surface leading-tight">
            Organizador
          </h1>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
            {counts.completed} de {counts.all} completadas
          </span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl bg-[#ff6b00] text-white font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Nueva</span>
        </button>
      </div>

      {/* Formulario de creación */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="w-full p-4 rounded-2xl bg-[#fff7ed] border-2 border-[#fed7aa] shadow-md mb-4 flex flex-col gap-3"
        >
          <h3 className="font-title-md font-bold text-[#ea580c]">
            Crear nueva misión para {userName}
          </h3>

          {/* FOTO */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant">
              📷 Recordatorio (opcional)
            </label>
            <p className="text-[10px] text-on-surface-variant/70 mt-0.5 mb-2">
              Sacale una foto al pizarrón o cuaderno. Así no tenés que escribir.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleNewTaskPhotoSelect}
              className="hidden"
            />

            {!newTaskPhoto && !isProcessingPhoto && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 rounded-2xl bg-[#f5f3ff] border-2 border-dashed border-[#c4b5fd] text-[#8b5cf6] font-label-md text-label-md font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">add_a_photo</span>
                <span>Agregar foto</span>
              </button>
            )}

            {isProcessingPhoto && photoTargetTaskId === null && (
              <div className="w-full py-3 rounded-2xl bg-[#f5f3ff] border-2 border-[#c4b5fd] flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[#8b5cf6] text-[22px] animate-spin">
                  progress_activity
                </span>
                <span className="font-label-md text-label-md font-black text-[#8b5cf6]">
                  Procesando imagen...
                </span>
              </div>
            )}

            {newTaskPhoto && !isProcessingPhoto && (
              <div className="relative w-full rounded-2xl overflow-hidden border-2 border-[#c4b5fd]">
                <img
                  src={newTaskPhoto}
                  alt="Recordatorio"
                  className="w-full max-h-40 object-contain bg-[#f8fafc]"
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
                    onClick={handleRemoveNewTaskPhoto}
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

          <input
            type="text"
            placeholder="¿Qué misión toca? (ej. Leer 10 min)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-xl border border-[#fed7aa] bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b00]"
            required
          />

          {/* Tiempo */}
          <div>
            <label className="text-xs font-bold text-on-surface-variant">
              ⏱️ ¿Cuánto tiempo crees que te va a llevar?
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
              <span className="w-20 text-center px-2 py-1 rounded-xl bg-white border border-[#fed7aa] font-black text-sm text-on-surface">
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
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-xl bg-white border-2 border-[#fed7aa]"
                  >
                    <span className="w-6 h-6 rounded-full bg-[#ffedd5] text-[#ea580c] flex items-center justify-center text-xs font-black flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="flex-1 font-body-sm text-body-sm text-on-surface break-words">
                      {step}
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
                  className="flex-1 p-2.5 rounded-xl border border-[#fed7aa] bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b00]"
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
            <div className="grid grid-cols-3 gap-2 mt-1 w-full">
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
                      isSelected
                        ? 'text-white'
                        : 'bg-white text-on-surface-variant border-[#fed7aa]'
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

          <div className="flex justify-end gap-2 mt-1">
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                resetForm();
              }}
              className="px-3 py-1.5 rounded-xl bg-gray-200 text-gray-700 text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#ff6b00] text-white text-xs font-bold shadow cursor-pointer"
            >
              Guardar Misión
            </button>
          </div>
        </form>
      )}

      {/* Filtros */}
      <div className="w-full flex gap-1.5 mb-3 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border-2 transition-all cursor-pointer ${
              filter === f.id
                ? 'bg-[#ff6b00] text-white border-[#ff6b00]'
                : 'bg-white text-on-surface-variant border-[#fed7aa] hover:border-[#ff6b00]'
            }`}
            type="button"
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Lista de tareas */}
      <div className="w-full flex flex-col gap-3">
        {filteredTasks.length === 0 ? (
          <div className="w-full p-6 rounded-2xl bg-[#fff7ed] border-2 border-dashed border-[#fed7aa] text-center">
            <span className="text-3xl">🌱</span>
            <p className="font-body-md text-on-surface-variant mt-2">
              No hay misiones en esta categoría.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const cfg = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.general;
            const diffCfg = DIFFICULTY_CONFIG[task.difficulty] || DIFFICULTY_CONFIG.media;
            const isCompleted = task.status === 'completed';
            const isActive = task.status === 'active';
            const priorityCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.yellow;
            const hasSteps = (task.microSteps || []).length > 0;
            const hasPhoto = !!task.photo;
            const isExpanded = expandedTaskId === task.id;

            return (
              <div
                key={task.id}
                className={`w-full rounded-2xl border shadow-sm transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 border-emerald-200 opacity-75'
                    : isActive
                    ? 'bg-[#fff7ed] border-2 border-[#ff6b00] ring-2 ring-[#ff6b00]/20'
                    : 'bg-white border-[#fed7aa]/60'
                }`}
                style={{ borderLeftWidth: '6px', borderLeftColor: priorityCfg.color }}
              >
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-start gap-3 w-full">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                      style={{ backgroundColor: cfg.color + '22' }}
                    >
                      <span>{cfg.icon}</span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {hasPhoto && (
                          <span className="material-symbols-outlined text-[#8b5cf6] text-[16px]" title="Tiene foto">
                            image
                          </span>
                        )}
                        <span
                          className={`font-title-md font-bold break-words whitespace-normal leading-tight ${
                            isCompleted ? 'line-through text-gray-500' : 'text-on-surface'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <span
                          className="px-1.5 py-0.5 rounded-full text-[10px] font-black text-white"
                          style={{ backgroundColor: diffCfg.color }}
                        >
                          {diffCfg.icon} {diffCfg.label}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {task.timeMinutes} min • +{task.xpReward} XP
                        </span>
                        {hasSteps && (
                          <span className="text-[10px] font-bold text-[#ea580c]">
                            • 🪜 {task.microSteps.filter((s) => s.done).length}/{task.microSteps.length}
                          </span>
                        )}
                        {isActive && <span className="text-xs text-[#ea580c] font-bold">• ⚡ Activa</span>}
                        {isCompleted && <span className="text-xs text-emerald-600 font-bold">• ✅</span>}
                        {task.status === 'queued' && <span className="text-xs text-on-surface-variant">• 🔒 En cola</span>}
                      </div>
                    </div>
                  </div>

                  {hasPhoto && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoToView(task.photo);
                        setPhotoViewTitle(task.title);
                        try { audioService.playPop(); } catch (e) {}
                      }}
                      className="w-full rounded-xl overflow-hidden border border-[#c4b5fd] bg-[#f8fafc] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <img
                        src={task.photo}
                        alt={`Recordatorio de ${task.title}`}
                        className="w-full max-h-32 object-contain"
                      />
                      <div className="py-1.5 bg-[#f5f3ff] text-[#8b5cf6] font-label-sm text-[10px] font-black uppercase tracking-wider text-center">
                        📷 Tocar para ampliar
                      </div>
                    </button>
                  )}

                  {!isCompleted && (
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={task.difficulty || 'media'}
                          onChange={(e) => setTaskDifficulty(task.id, e.target.value)}
                          className="text-[11px] font-bold px-2 py-1 rounded-lg border-2 border-[#fed7aa] bg-white cursor-pointer"
                          title="Cambiar dificultad"
                        >
                          {Object.entries(DIFFICULTY_CONFIG).map(([key, c]) => (
                            <option key={key} value={key}>
                              {c.icon} {c.label}
                            </option>
                          ))}
                        </select>

                        <PriorityDots
                          current={task.priority || 'yellow'}
                          onChange={(p) => setTaskPriority(task.id, p)}
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Botón de foto rápida */}
                        <button
                          type="button"
                          onClick={() => handleQuickPhotoClick(task)}
                          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f5f3ff] active:scale-95 transition-all cursor-pointer"
                          title={hasPhoto ? 'Ver foto' : 'Agregar foto'}
                        >
                          <span
                            className="material-symbols-outlined text-[20px]"
                            style={{
                              color: hasPhoto ? '#10b981' : '#8b5cf6',
                              fontVariationSettings: hasPhoto ? '"FILL" 1' : '"FILL" 0'
                            }}
                          >
                            {hasPhoto ? 'photo_camera' : 'add_a_photo'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingTask(task)}
                          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#fff7ed] active:scale-95 transition-all cursor-pointer"
                          title="Editar misión completa"
                        >
                          <span className="material-symbols-outlined text-[#ea580c] text-[20px]">edit</span>
                        </button>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-100 active:scale-95 transition-all cursor-pointer"
                          title="Eliminar misión"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-red-500 text-[20px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="flex items-center justify-end gap-1">
                      {hasPhoto && (
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoToView(task.photo);
                            setPhotoViewTitle(task.title);
                          }}
                          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f5f3ff] active:scale-95 transition-all cursor-pointer"
                          title="Ver foto"
                        >
                          <span className="material-symbols-outlined text-[#10b981] text-[20px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                            photo_camera
                          </span>
                        </button>
                      )}
                      <span className="material-symbols-outlined text-success-mint text-2xl">
                        check_circle
                      </span>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-100 active:scale-95 transition-all cursor-pointer"
                        title="Eliminar misión"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-red-500 text-[20px]">
                          delete
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {hasSteps && (
                  <button
                    type="button"
                    onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                    className="w-full py-2 px-4 border-t border-[#fed7aa]/50 flex items-center justify-between text-xs font-bold text-[#ea580c] hover:bg-[#fff7ed]/50 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">list</span>
                      {isExpanded ? 'Ocultar pasos' : 'Ver pasos'}
                    </span>
                    <span className={`material-symbols-outlined text-[18px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>
                )}

                {hasSteps && isExpanded && (
                  <div className="px-4 pb-3 flex flex-col gap-1.5">
                    {task.microSteps.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-2 p-2 rounded-xl bg-[#fff7ed] border border-[#fed7aa]/50"
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black ${
                            step.done
                              ? 'bg-[#10b981] text-white'
                              : 'bg-[#ffedd5] text-[#ea580c]'
                          }`}
                        >
                          {step.done ? '✓' : '•'}
                        </span>
                        <span
                          className={`font-body-sm text-body-sm flex-1 break-words ${
                            step.done ? 'line-through text-on-surface-variant opacity-60' : 'text-on-surface'
                          }`}
                        >
                          {step.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal de edición */}
      <EditTaskModal
        isOpen={!!editingTask}
                onClose={() => setEditingTask(null)}
        task={editingTask}
        onSave={(taskId, updates) => editTask(taskId, updates)}
      />

      {/* Visor de foto a pantalla completa */}
      <PhotoViewerModal
        isOpen={!!photoToView}
        onClose={() => {
          setPhotoToView(null);
          setPhotoViewTitle('');
        }}
        photo={photoToView}
        title={photoViewTitle}
      />
    </div>
  );
};