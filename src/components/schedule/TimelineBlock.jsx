import React from 'react';
import { audioService } from '../../services/audioService';

export default function TimelineBlock({ block, onEdit }) {
  if (!block) return null;

  const handleEdit = (e) => {
    e.stopPropagation();
    try { audioService.playClick(); } catch (err) {}
    onEdit(block);
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 shadow-[0_3px_0_0_#d9f99d] border border-[#ecfccb] flex items-center justify-between gap-3 transition-all hover:translate-y-[-1px]">
      {/* Contenido principal */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Ícono */}
        <div className="w-12 h-12 rounded-xl bg-[#ecfccb] flex items-center justify-center text-[#3f6212] flex-shrink-0">
          <span className="material-symbols-outlined text-[26px]">
            {block.icon || 'schedule'}
          </span>
        </div>

        {/* Texto */}
        <div className="flex flex-col min-w-0">
          <span className="font-headline text-sm font-black text-on-surface truncate leading-tight">
            {block.title}
          </span>
          <span className="font-body-sm text-xs text-on-surface-variant leading-snug">
            {block.time}
          </span>
        </div>
      </div>

      {/* Botón editar (opcional, solo si se pasa onEdit) */}
      {onEdit && (
        <button
          type="button"
          onClick={handleEdit}
          className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-full hover:bg-[#f7fee7] active:scale-95 transition-all cursor-pointer"
          title="Editar bloque"
        >
          <span className="material-symbols-outlined text-[#65a30d] text-[20px]">
            edit
          </span>
        </button>
      )}
    </div>
  );
}