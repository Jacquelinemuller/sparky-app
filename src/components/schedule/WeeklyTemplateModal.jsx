import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button3D from '../common/Button3D';
import VoiceInput from '../VoiceInput';
import TimeRangeInput from '../TimeRangeInput';

const DAYS = [
  { id: 'monday', label: 'Lun', fullLabel: 'Lunes' },
  { id: 'tuesday', label: 'Mar', fullLabel: 'Martes' },
  { id: 'wednesday', label: 'Mié', fullLabel: 'Miércoles' },
  { id: 'thursday', label: 'Jue', fullLabel: 'Jueves' },
  { id: 'friday', label: 'Vie', fullLabel: 'Viernes' },
  { id: 'saturday', label: 'Sáb', fullLabel: 'Sábado' },
  { id: 'sunday', label: 'Dom', fullLabel: 'Domingo' }
];

export default function WeeklyTemplateModal({
  isOpen,
  onClose,
  weeklyTemplate,
  onUpdateBlock,
  onAddBlock,
  onDeleteBlock
}) {
  const [selectedDay, setSelectedDay] = useState('monday');
  const [editingIndex, setEditingIndex] = useState(null);
  const [draftBlocks, setDraftBlocks] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setDraftBlocks(JSON.parse(JSON.stringify(weeklyTemplate[selectedDay] || [])));
      setEditingIndex(null);
    }
  }, [isOpen, selectedDay, weeklyTemplate]);

  const handleBlockChange = (index, field, value) => {
    setDraftBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    );
  };

  const handleAddBlock = () => {
    const newBlock = {
      id: 'blk_' + Date.now(),
      title: 'Nuevo bloque',
      time: '08:00 - 09:00',
      icon: 'schedule',
      type: 'fixed'
    };
    setDraftBlocks((prev) => [...prev, newBlock]);
    setEditingIndex(draftBlocks.length);
  };

  const handleDeleteBlock = (index) => {
    setDraftBlocks((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setDraftBlocks((prev) => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const handleMoveDown = (index) => {
    setDraftBlocks((prev) => {
      if (index === prev.length - 1) return prev;
      const copy = [...prev];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
  };

  const handleSaveDay = () => {
    const original = weeklyTemplate[selectedDay] || [];

    draftBlocks.forEach((block) => {
      const wasOriginal = original.find((b) => b.id === block.id);
      if (wasOriginal) {
        onUpdateBlock(selectedDay, block.id, block);
      } else {
        onAddBlock(selectedDay, block);
      }
    });

    original.forEach((origBlock) => {
      const stillExists = draftBlocks.find((b) => b.id === origBlock.id);
      if (!stillExists) {
        onDeleteBlock(selectedDay, origBlock.id);
      }
    });

    setEditingIndex(null);
  };

  const handleClose = () => {
    handleSaveDay();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Plantilla Semanal" maxWidth="max-w-2xl">
      <div className="flex flex-col gap-4">

        {/* Selector de días */}
        <div className="flex items-center justify-between gap-1 p-1.5 bg-[#ecfccb]/60 border-2 border-[#d9f99d]/60 rounded-2xl">
          {DAYS.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => {
                handleSaveDay();
                setSelectedDay(day.id);
              }}
              className={`flex-1 py-2 px-1 rounded-xl font-headline text-xs font-black transition-all cursor-pointer ${
                selectedDay === day.id
                  ? 'bg-[#65a30d] text-white shadow-[0_3px_0_0_#3f6212]'
                  : 'text-[#365314] hover:bg-[#f7fee7]'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>

        {/* Info del día */}
        <div className="flex items-center justify-between px-1">
          <span className="font-label-md text-label-md font-bold text-[#365314]">
            {DAYS.find((d) => d.id === selectedDay)?.fullLabel}
          </span>
          <span className="font-label-sm text-label-sm text-[#4d7c0f] font-bold">
            {draftBlocks.length} bloques
          </span>
        </div>

        {/* Lista de bloques */}
        <div className="flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {draftBlocks.map((block, index) => {
            const isEditing = editingIndex === index;

            return (
              <div
                key={block.id}
                className={`p-3 rounded-2xl border-2 transition-all ${
                  isEditing ? 'border-[#84cc16] bg-[#f7fee7]' : 'border-[#d9f99d] bg-white'
                }`}
              >
                {!isEditing ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="material-symbols-outlined text-[#65a30d] text-[22px]">
                        {block.icon || 'schedule'}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-on-surface truncate">
                          {block.title}
                          {block.type === 'free_slot' && (
                            <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[#ecfccb] text-[#365314] border border-[#bef264] font-black uppercase">
                              Libre
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {block.time} {block.duration && `• ${block.duration}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f7fee7] disabled:opacity-30 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[#65a30d] text-[18px]">
                          arrow_upward
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === draftBlocks.length - 1}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f7fee7] disabled:opacity-30 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[#65a30d] text-[18px]">
                          arrow_downward
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingIndex(index)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f7fee7] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[#65a30d] text-[18px]">
                          edit
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(index)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-red-500 text-[18px]">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {/* Título con mic */}
                    <VoiceInput
                      value={block.title}
                      onChange={(v) => handleBlockChange(index, 'title', v)}
                      placeholder="Título del bloque"
                      maxLength={40}
                      color="#65a30d"
                      bg="#ffffff"
                      borderColor="#d9f99d"
                      style={{ fontSize: '14px', padding: '10px 12px' }}
                    />

                    {/* Hora con dropdowns */}
                    <TimeRangeInput
                      value={block.time}
                      onChange={(v) => handleBlockChange(index, 'time', v)}
                    />

                    {/* Duración (solo slot libre) */}
                    {block.type === 'free_slot' && (
                      <input
                        type="text"
                        value={block.duration || ''}
                        onChange={(e) => handleBlockChange(index, 'duration', e.target.value)}
                        placeholder="Duración (ej: 1h 15m)"
                        maxLength={10}
                        className="w-full p-2.5 rounded-xl border-2 border-[#d9f99d] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                      />
                    )}

                    {/* Tipo */}
                    <div>
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">
                        Tipo
                      </label>
                      <div className="flex gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => handleBlockChange(index, 'type', 'fixed')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                            block.type === 'fixed'
                              ? 'bg-[#65a30d] text-white'
                              : 'bg-white border border-[#d9f99d] text-[#65a30d]'
                          }`}
                        >
                          📌 Fijo
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBlockChange(index, 'type', 'free_slot')}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                            block.type === 'free_slot'
                              ? 'bg-[#65a30d] text-white'
                              : 'bg-white border border-[#d9f99d] text-[#65a30d]'
                          }`}
                        >
                          ⭐ Slot libre
                        </button>
                      </div>
                    </div>

                    {/* Íconos (reemplaza el input de texto que había antes) */}
                    <div>
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">
                        Ícono
                      </label>
                      <input
                        type="text"
                        value={block.icon || ''}
                        onChange={(e) => handleBlockChange(index, 'icon', e.target.value)}
                        placeholder="Ícono (ej: school, sports_soccer)"
                        maxLength={20}
                        className="w-full mt-1 p-2.5 rounded-xl border-2 border-[#d9f99d] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingIndex(null)}
                      className="w-full py-2 rounded-xl bg-[#f7fee7] border border-[#d9f99d] text-[#65a30d] text-xs font-bold cursor-pointer"
                    >
                      ✓ Listo
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleAddBlock}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-[#bef264] text-[#65a30d] font-bold text-sm hover:bg-[#f7fee7] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Agregar bloque
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-3 border-t-2 border-[#d9f99d]/50">
        <Button3D variant="outline" onClick={handleClose}>
          Cerrar
        </Button3D>
        <Button3D
          variant="success"
          icon="save"
          onClick={() => {
            handleSaveDay();
            onClose();
          }}
        >
          Guardar todo
        </Button3D>
      </div>
    </Modal>
  );
}