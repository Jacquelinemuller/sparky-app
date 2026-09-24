import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button3D from '../common/Button3D';

const ICON_OPTIONS = [
  'schedule', 'school', 'restaurant', 'sports_soccer', 'shower',
  'sports_esports', 'language', 'palette', 'music_note', 'celebration',
  'family_restroom', 'bed', 'breakfast_dining', 'movie', 'checklist',
  'self_improvement', 'menu_book', 'directions_bike', 'pool', 'pets'
];

export default function EditDayModal({ isOpen, onClose, dayId, dayLabel, blocks, onSave }) {
  const [editableBlocks, setEditableBlocks] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    if (isOpen) {
      // Copia profunda para no mutar los originales
      setEditableBlocks(JSON.parse(JSON.stringify(blocks || [])));
      setEditingIndex(null);
    }
  }, [isOpen, blocks]);

  const handleBlockChange = (index, field, value) => {
    setEditableBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b))
    );
  };

  const handleDeleteBlock = (index) => {
    setEditableBlocks((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleAddBlock = () => {
    const newBlock = {
      id: 'blk_' + Date.now(),
      title: 'Nuevo bloque',
      time: '00:00 - 00:00',
      icon: 'schedule',
      type: 'fixed'
    };
    setEditableBlocks((prev) => [...prev, newBlock]);
    setEditingIndex(editableBlocks.length);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setEditableBlocks((prev) => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const handleMoveDown = (index) => {
    setEditableBlocks((prev) => {
      if (index === prev.length - 1) return prev;
      const copy = [...prev];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
  };

  const handleSave = () => {
    onSave(editableBlocks);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar ${dayLabel}`} maxWidth="max-w-lg">
      <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">

        {editableBlocks.map((block, index) => {
          const isEditing = editingIndex === index;

          return (
            <div
              key={block.id}
              className={`p-3 rounded-2xl border-2 transition-all ${
                isEditing ? 'border-[#84cc16] bg-[#f7fee7]' : 'border-[#d9f99d] bg-white'
              }`}
            >
              {!isEditing ? (
                // Vista compacta
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="material-symbols-outlined text-[#65a30d] text-[22px]">
                      {block.icon || 'schedule'}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm text-on-surface truncate">
                        {block.title}
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
                      title="Subir"
                    >
                      <span className="material-symbols-outlined text-[#65a30d] text-[18px]">
                        arrow_upward
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === editableBlocks.length - 1}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f7fee7] disabled:opacity-30 cursor-pointer"
                      title="Bajar"
                    >
                      <span className="material-symbols-outlined text-[#65a30d] text-[18px]">
                        arrow_downward
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingIndex(index)}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f7fee7] cursor-pointer"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-[#65a30d] text-[18px]">
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBlock(index)}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 cursor-pointer"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-red-500 text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                // Vista edición
                <div className="flex flex-col gap-2.5">
                  <input
                    type="text"
                    value={block.title}
                    onChange={(e) => handleBlockChange(index, 'title', e.target.value)}
                    placeholder="Título del bloque"
                    maxLength={40}
                    className="w-full p-2.5 rounded-xl border-2 border-[#d9f99d] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                  />

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={block.time}
                      onChange={(e) => handleBlockChange(index, 'time', e.target.value)}
                      placeholder="08:00 - 12:00"
                      maxLength={20}
                      className="flex-1 p-2.5 rounded-xl border-2 border-[#d9f99d] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                    />
                    {block.type === 'free_slot' && (
                      <input
                        type="text"
                        value={block.duration || ''}
                        onChange={(e) => handleBlockChange(index, 'duration', e.target.value)}
                        placeholder="1h 15m"
                        maxLength={10}
                        className="w-24 p-2.5 rounded-xl border-2 border-[#d9f99d] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                      />
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">
                      Ícono
                    </label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {ICON_OPTIONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => handleBlockChange(index, 'icon', icon)}
                          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all cursor-pointer ${
                            block.icon === icon
                              ? 'bg-[#65a30d] text-white'
                              : 'bg-white border border-[#d9f99d] text-[#65a30d] hover:bg-[#f7fee7]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">{icon}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">
                      Tipo
                    </label>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => handleBlockChange(index, 'type', 'fixed')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          block.type === 'fixed'
                            ? 'bg-[#65a30d] text-white'
                            : 'bg-white border border-[#d9f99d] text-[#65a30d]'
                        }`}
                      >
                        📌 Bloque fijo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBlockChange(index, 'type', 'free_slot')}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          block.type === 'free_slot'
                            ? 'bg-[#65a30d] text-white'
                            : 'bg-white border border-[#d9f99d] text-[#65a30d]'
                        }`}
                      >
                        ⭐ Slot libre
                      </button>
                    </div>
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

        {/* Botón agregar */}
        <button
          type="button"
          onClick={handleAddBlock}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-[#bef264] text-[#65a30d] font-bold text-sm hover:bg-[#f7fee7] transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Agregar bloque
        </button>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t-2 border-[#d9f99d]/50">
        <Button3D variant="outline" onClick={onClose}>
          Cancelar
        </Button3D>
        <Button3D variant="success" icon="check" onClick={handleSave}>
          Guardar cambios
        </Button3D>
      </div>
    </Modal>
  );
}