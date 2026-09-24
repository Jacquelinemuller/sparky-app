import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import Button3D from './common/Button3D';
import { audioService } from '../services/audioService';

const CATEGORIES = [
  { id: 'cumple',  label: 'Cumpleaños',  icon: '🎂', color: '#ec4899' },
  { id: 'salida',  label: 'Salida',      icon: '🚌', color: '#3b82f6' },
  { id: 'examen',  label: 'Examen',      icon: '📝', color: '#ef4444' },
  { id: 'medico',  label: 'Turno médico', icon: '🏥', color: '#10b981' },
  { id: 'otro',    label: 'Otro',        icon: '⭐', color: '#f59e0b' }
];

// Devuelve la fecha en formato YYYY-MM-DD
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function EventFormModal({ isOpen, onClose, onSave, editingEvent, defaultDate }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState('otro');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        setTitle(editingEvent.title || '');
        setDate(editingEvent.date || '');
        setTime(editingEvent.time || '');
        setCategory(editingEvent.category || 'otro');
        setNotes(editingEvent.notes || '');
      } else {
        setTitle('');
        const defaultD = defaultDate ? toDateKey(defaultDate) : toDateKey(new Date());
        setDate(defaultD);
        setTime('');
        setCategory('otro');
        setNotes('');
      }
    }
  }, [isOpen, editingEvent, defaultDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    try { audioService.playSuccess(); } catch (err) {}

    onSave({
      title: title.trim(),
      date,
      time: time.trim(),
      category,
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEvent ? 'Editar evento' : 'Nuevo evento especial'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Categoría */}
        <div>
          <label className="block font-label-md text-label-md font-extrabold text-on-surface mb-2">
            ¿Qué tipo de evento es?
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const isSelected = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'text-white'
                      : 'bg-white text-on-surface-variant border-[#e2e8f0] hover:border-[#8b5cf6]'
                  }`}
                  style={isSelected ? { backgroundColor: c.color, borderColor: c.color } : {}}
                >
                  <span>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Título */}
        <div>
          <label className="block font-label-md text-label-md font-extrabold text-on-surface mb-1.5">
            Título del evento
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Cumple de Juan en la casa de Sofi"
            maxLength={60}
            required
            className="w-full p-3 rounded-2xl border-2 border-[#e2e8f0] bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6]"
          />
        </div>

        {/* Fecha y hora */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block font-label-md text-label-md font-extrabold text-on-surface mb-1.5">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full p-3 rounded-2xl border-2 border-[#e2e8f0] bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
            />
          </div>
          <div className="w-32">
            <label className="block font-label-md text-label-md font-extrabold text-on-surface mb-1.5">
              Hora
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-3 rounded-2xl border-2 border-[#e2e8f0] bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
            />
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block font-label-md text-label-md font-extrabold text-on-surface mb-1.5">
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Llevar regalo y ropa cómoda"
            maxLength={150}
            rows={2}
            className="w-full p-3 rounded-2xl border-2 border-[#e2e8f0] bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] resize-none"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-2 border-t-2 border-[#e2e8f0]">
          <Button3D variant="outline" onClick={onClose}>
            Cancelar
          </Button3D>
          <Button3D type="submit" variant="creative" icon="check">
            {editingEvent ? 'Guardar cambios' : 'Crear evento'}
          </Button3D>
        </div>

      </form>
    </Modal>
  );
}