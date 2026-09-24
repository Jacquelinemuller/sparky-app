import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';

export default function PinModal({ isOpen, onClose, onSuccess }) {
  const { parentPin, setParentPin, verifyParentPin } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('enter'); // 'enter' | 'change'
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const isDefault = parentPin === '1234';

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setNewPin('');
      setConfirmPin('');
      setMode(isDefault ? 'change' : 'enter');
    }
  }, [isOpen, isDefault]);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    try { audioService.playPop(); } catch (e) {}
    setError('');
    if (mode === 'enter') {
      if (pin.length < 4) setPin(pin + digit);
    } else {
      if (newPin.length < 4) setNewPin(newPin + digit);
    }
  };

  const handleDelete = () => {
    try { audioService.playClick(); } catch (e) {}
    setError('');
    if (mode === 'enter') {
      setPin(pin.slice(0, -1));
    } else {
      setNewPin(newPin.slice(0, -1));
    }
  };

  const handleClear = () => {
    try { audioService.playClick(); } catch (e) {}
    setError('');
    if (mode === 'enter') setPin('');
    else {
      setNewPin('');
      setConfirmPin('');
    }
  };

  const handleSubmitEnter = () => {
    if (pin.length !== 4) {
      setError('Ingresá los 4 dígitos');
      return;
    }
    if (verifyParentPin(pin)) {
      try { audioService.playSuccess(); } catch (e) {}
      onSuccess();
      onClose();
    } else {
      try { audioService.playReminderNudge(); } catch (e) {}
      setError('PIN incorrecto');
      setPin('');
    }
  };

  const handleSubmitChange = () => {
    if (newPin.length !== 4) {
      setError('El PIN debe tener 4 dígitos');
      return;
    }
    if (confirmPin.length === 0) {
      setConfirmPin(newPin);
      setNewPin('');
      setError('');
      return;
    }
    if (newPin !== confirmPin) {
      setError('Los PIN no coinciden');
      setNewPin('');
      setConfirmPin('');
      return;
    }
    try { audioService.playSuccess(); } catch (e) {}
    setParentPin(newPin);
    onSuccess();
    onClose();
  };

  const currentPin = mode === 'enter' ? pin : newPin;
  const showDots = 4;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-3xl border-4 border-[#8b5cf6] shadow-[0_10px_0_0_#7c3aed] p-5 sm:p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8b5cf6] text-[24px]">
              {mode === 'enter' ? 'lock' : 'key'}
            </span>
            <h2 className="font-headline-md text-headline-md font-black text-[#8b5cf6]">
              {mode === 'enter' ? 'Acceso Padres' : isDefault ? 'Crear PIN' : 'Cambiar PIN'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#ede9fe] active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[#8b5cf6]">close</span>
          </button>
        </div>

        {/* Instrucciones */}
        <p className="font-body-sm text-body-sm text-on-surface-variant text-center mb-4">
          {mode === 'enter'
            ? 'Ingresá el PIN de 4 dígitos'
            : isDefault
            ? 'Creá un PIN nuevo para proteger esta sección'
            : 'Ingresá el nuevo PIN dos veces'}
        </p>

        {/* Dots */}
        <div className="flex items-center justify-center gap-3 mb-5">
          {Array.from({ length: showDots }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-all ${
                currentPin.length > i
                  ? 'bg-[#8b5cf6] scale-110'
                  : 'bg-[#ede9fe] border-2 border-[#c4b5fd]'
              }`}
            />
          ))}
        </div>

        {/* Mensaje de estado */}
        {mode === 'change' && confirmPin.length > 0 && (
          <p className="font-label-sm text-label-sm text-center text-[#8b5cf6] font-bold mb-3">
            Repetí el PIN
          </p>
        )}

        {error && (
          <p className="font-label-sm text-label-sm text-center text-red-500 font-bold mb-3">
            {error}
          </p>
        )}

        {/* Teclado numérico */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => handleDigit(String(n))}
              disabled={currentPin.length >= 4}
              className="h-14 rounded-2xl bg-[#f8fafc] border-2 border-[#e2e8f0] text-2xl font-black text-on-surface active:scale-95 active:bg-[#ede9fe] transition-all cursor-pointer disabled:opacity-40"
            >
              {n}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-[#fee2e2] border-2 border-[#fecaca] text-[#dc2626] font-black text-sm active:scale-95 transition-all cursor-pointer"
          >
            Borrar
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            disabled={currentPin.length >= 4}
            className="h-14 rounded-2xl bg-[#f8fafc] border-2 border-[#e2e8f0] text-2xl font-black text-on-surface active:scale-95 active:bg-[#ede9fe] transition-all cursor-pointer disabled:opacity-40"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-[#f8fafc] border-2 border-[#e2e8f0] text-on-surface active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[24px]">backspace</span>
          </button>
        </div>

        {/* Botón confirmar */}
        <button
          type="button"
          onClick={mode === 'enter' ? handleSubmitEnter : handleSubmitChange}
          disabled={
            mode === 'enter'
              ? pin.length !== 4
              : confirmPin.length === 0
              ? newPin.length !== 4
              : newPin.length !== 4
          }
          className="w-full h-12 rounded-2xl bg-[#8b5cf6] text-white font-label-lg text-label-lg font-black shadow-[0_4px_0_0_#5b21b6] active:translate-y-1 active:shadow-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {mode === 'enter'
            ? 'Entrar'
            : confirmPin.length === 0
            ? 'Continuar'
            : 'Guardar PIN'}
        </button>

        {/* Cambiar modo */}
        {mode === 'enter' && !isDefault && (
          <button
            type="button"
            onClick={() => {
              setMode('change');
              setError('');
              setPin('');
            }}
            className="w-full mt-3 text-center font-label-sm text-label-sm text-[#8b5cf6] font-bold hover:underline cursor-pointer"
          >
            Cambiar PIN
          </button>
        )}

      </div>
    </div>
  );
}