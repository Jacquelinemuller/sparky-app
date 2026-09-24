import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import Button3D from './common/Button3D';
import { audioService } from '../services/audioService';

const DAYS = [
  { id: 1, label: 'Lun' },
  { id: 2, label: 'Mar' },
  { id: 3, label: 'Mié' },
  { id: 4, label: 'Jue' },
  { id: 5, label: 'Vie' },
  { id: 6, label: 'Sáb' },
  { id: 7, label: 'Dom' }
];

export default function TipFormModal({ isOpen, onClose, onSave, editingTip }) {
  const [day, setDay] = useState(1);
  const [title, setTitle] = useState('');
  const [explanation, setExplanation] = useState('');
  const [action, setAction] = useState('');
  const [reward, setReward] = useState(15);
  const [isReplacing, setIsReplacing] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (editingTip) {
        setDay(editingTip.day || 1);
        setTitle(editingTip.title || '');
        setExplanation(editingTip.explanation || '');
        setAction(editingTip.action || '');
        setReward(editingTip.reward || 15);
        setIsReplacing(editingTip.isReplacing !== false);
      } else {
        setDay(1);
        setTitle('');
        setExplanation('');
        setAction('');
        setReward(15);
        setIsReplacing(true);
      }
    }
  }, [isOpen, editingTip]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !explanation.trim() || !action.trim()) return;

    try { audioService.playSuccess(); } catch (err) {}

    onSave({
      day: parseInt(day, 10),
      title: title.trim(),
      explanation: explanation.trim(),
      action: action.trim(),
      reward: parseInt(reward, 10) || 15,
      isReplacing
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTip ? 'Editar tip' : 'Nuevo tip para tu hijo/a'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Día */}
        <div>
          <label className="block font-label-md text-label-md font-extrabold text-on-surface mb-2">
            ¿Qué día aparece?
          </label>
          <div className="grid grid-cols-7 gap-1.5">
            {DAYS.map((d) => {
              const isSelected = day === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDay(d.id)}
                  className={`h-11 rounded-xl font-label-sm text-label-sm font-black transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#8b5cf6] text-white shadow-[0_3px_0_0_#5b21b6]'
                      : 'bg-white border-2 border-[#e2e8f0] text-on-surface-variant hover:border-[#8b5cf6]'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Título */}
        <div>
          <label className="block font-label-md text-label-md font-extrabold text-on-surface mb-1.5">
            Título del tip
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Ordenar la pieza antes de cenar"
            maxLength={60}
            required
            className="w-full p-3 rounded-2xl border-2 border-[#e2e8f0] bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6]"
          />
        </div>

        {/* Explicación */}
        <div>
          <label className="block font-label-md text-label-md font-extrabold text-on-surface mb-1.5">
            Explicación corta
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="¿Por qué es importante?"
            maxLength={200}
            rows={2}
            required
            className="w-full p-3 rounded-2xl border-2 border-[#e2e8f0] bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] resize-none"
          />
        </div>

        {/* Acción */}
        <div>
          <label className="block font-label-md text-label-md font-extrabold text-on-surface mb-1.5">
            Micro-reto (acción concreta)
          </label>
          <textarea
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Ej: Guardar todos los juguetes en su caja antes de comer"
            maxLength={120}
            rows={2}
            required
            className="w-full p-3 rounded-2xl border-2 border-[#e2e8f0] bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-[#8b5cf6] resize-none"
          />
        </div>

        {/* Recompensa */}
        <div>
          <label className="block font-label-md text-label-md font-extrabold text-on-surface mb-1.5">
            Recompensa en XP
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              min="5"
              max="100"
              step="5"
              className="w-24 p-3 rounded-2xl border-2 border-[#e2e8f0] bg-white text-on-surface text-sm text-center font-black focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]"
            />
            <span className="font-label-md text-label-md text-on-surface-variant font-bold">XP</span>
          </div>
        </div>

        {/* Reemplazar */}
        <div className="p-3 rounded-2xl bg-[#f5f3ff] border-2 border-[#ddd6fe]">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isReplacing}
              onChange={(e) => setIsReplacing(e.target.checked)}
              className="w-5 h-5 accent-[#8b5cf6] mt-0.5"
            />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-bold text-[#5b21b6]">
                Reemplazar el tip oficial del día
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Si lo desmarcás, se suma como tip extra
              </span>
            </div>
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-2 border-t-2 border-[#e2e8f0]">
          <Button3D variant="outline" onClick={onClose}>
            Cancelar
          </Button3D>
          <Button3D type="submit" variant="creative" icon="check">
            {editingTip ? 'Guardar cambios' : 'Crear tip'}
          </Button3D>
        </div>

      </form>
    </Modal>
  );
}