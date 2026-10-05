import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';
import VoiceInput from '../components/VoiceInput';

const COLOR_OPTIONS = [
  { id: 'yellow', bg: '#fef3c7', text: '#78350f', border: '#f59e0b', label: 'Soleado' },
  { id: 'pink',   bg: '#ffe4e6', text: '#881337', border: '#ec4899', label: 'Melocotón' },
  { id: 'mint',   bg: '#d1fae5', text: '#064e3b', border: '#10b981', label: 'Menta' },
  { id: 'blue',   bg: '#dbeafe', text: '#1e3a8a', border: '#3b82f6', label: 'Cielo' }
];

const COLOR_MAP = Object.fromEntries(COLOR_OPTIONS.map((c) => [c.id, c]));

export const NotesScreen = () => {
  const { notes, addNote, updateNote, deleteNote, convertNoteToTask, setActiveTab } = useApp();

  const [noteText, setNoteText] = useState('');
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [errorMsg, setErrorMsg] = useState('');
  const [convertingNote, setConvertingNote] = useState(null);

  const saveNote = () => {
    const text = noteText.trim();
    if (!text) {
      setErrorMsg('No se escuchó nada. Probá de nuevo 🎤');
      setTimeout(() => setErrorMsg(''), 2500);
      return;
    }

    addNote({
      text,
      color: selectedColor,
      isVoice: true
    });

    setNoteText('');
    setSelectedColor('yellow');
    setErrorMsg('');
    try { audioService.playSuccess(); } catch (e) {}
  };

  const handleConvert = (noteId) => {
    convertNoteToTask(noteId);
    setConvertingNote(noteId);
    setTimeout(() => {
      setConvertingNote(null);
      setActiveTab('missions');
    }, 600);
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto select-none pb-8 px-2 pt-4">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <h1 className="font-headline-lg font-black text-on-surface leading-tight">
            Mis notas
          </h1>
          <span className="font-label-sm text-label-sm text-on-surface-variant font-bold">
            {notes.length} {notes.length === 1 ? 'nota' : 'notas'} guardadas
          </span>
        </div>
      </div>

      <div className="w-full bg-white rounded-3xl p-5 shadow-[0_5px_0_0_#fed7aa] border-2 border-[#fed7aa] mb-4">
        <div className="flex flex-col items-center mb-2">
          <p className="font-title-md text-title-md font-black text-on-surface text-center">
            Decí lo que querés recordar
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant text-center mt-1 mb-3">
            y lo convertimos en nota ✨
          </p>
        </div>

        {/* 🎤 VoiceInput en modo BIG MIC */}
        <VoiceInput
          value={noteText}
          onChange={setNoteText}
          placeholder="Acá va a aparecer lo que digas..."
          maxLength={200}
          color="#ff6b00"
          bg="#fff7ed"
          borderColor="#fed7aa"
          rows={3}
          style={{ fontSize: '15px', padding: '12px' }}
          bigMic={true}
          bigMicLabelIdle="Toca para grabar"
          bigMicLabelRecording="Estoy escuchando... 🎧"
        />

        {errorMsg && (
          <div className="w-full mt-3 p-2.5 rounded-xl bg-[#fee2e2] border border-[#fecaca] flex items-start gap-2">
            <span className="text-base">⚠️</span>
            <p className="text-[11px] text-[#991b1b] font-bold leading-tight">
              {errorMsg}
            </p>
          </div>
        )}

        {/* Color de la nota */}
        <div className="w-full mt-4 pt-3 border-t border-[#fed7aa]/50">
          <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-wider mb-2 text-center">
            Color de la nota
          </p>
          <div className="flex items-center justify-center gap-2.5">
            {COLOR_OPTIONS.map((c) => {
              const isSelected = selectedColor === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedColor(c.id);
                    try { audioService.playPop(); } catch (e) {}
                  }}
                  className={`w-10 h-10 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                    isSelected ? 'ring-2 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.bg, borderColor: c.border }}
                  title={c.label}
                >
                  {isSelected && (
                    <span className="material-symbols-outlined text-[18px]" style={{ color: c.text }}>
                      check
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botón Guardar */}
        <button
          type="button"
          onClick={saveNote}
          disabled={!noteText.trim()}
          className="w-full mt-4 h-12 rounded-2xl bg-[#10b981] text-white font-black text-sm shadow-[0_3px_0_0_#047857] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[20px]">save</span>
          <span>Guardar nota</span>
        </button>
      </div>

      {/* Lista de notas */}
      <div className="w-full flex flex-col gap-3">
        {notes.length === 0 && (
          <div className="w-full p-6 rounded-2xl bg-[#fff7ed] border-2 border-dashed border-[#fed7aa] text-center">
            <span className="text-4xl block mb-2">📝</span>
            <p className="font-body-md text-on-surface-variant font-bold">
              Todavía no hay notas
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant/70 mt-1">
              Tocá el micrófono y contame algo ✨
            </p>
          </div>
        )}

        {notes.map((note) => {
          const c = COLOR_MAP[note.color] || COLOR_MAP.yellow;
          const isConverting = convertingNote === note.id;

          return (
            <div
              key={note.id}
              className={`w-full p-3.5 rounded-2xl border-2 transition-all ${isConverting ? 'scale-95 opacity-60' : ''}`}
              style={{ backgroundColor: c.bg, borderColor: c.border }}
            >
              <div className="flex items-start gap-2.5">
                <div className="flex flex-col items-center pt-0.5 flex-shrink-0">
                  <span className="text-lg">{note.isVoice ? '🎙️' : '✍️'}</span>
                </div>

                <p
                  className="font-body-md text-body-md font-semibold leading-snug flex-1 break-words"
                  style={{ color: c.text }}
                >
                  {note.text}
                </p>
              </div>

              <div className="flex items-center justify-between gap-1 mt-3 pt-2 border-t border-current/10 flex-wrap">
                <div className="flex items-center gap-1">
                  {COLOR_OPTIONS.map((color) => {
                    const isCurrent = note.color === color.id;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => updateNote(note.id, { color: color.id })}
                        className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                          isCurrent ? 'ring-2 ring-offset-1 scale-110' : 'opacity-50 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color.bg, borderColor: color.border }}
                        title={`Pintar de ${color.label}`}
                      />
                    );
                  })}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => deleteNote(note.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/60 active:scale-95 transition-all cursor-pointer"
                    title="Borrar nota"
                  >
                    <span className="material-symbols-outlined text-[18px] opacity-70">delete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConvert(note.id)}
                    disabled={isConverting}
                    className="px-3 py-1.5 rounded-full bg-[#ff6b00] text-white text-[11px] font-black shadow-[0_2px_0_0_#c2410c] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">task_alt</span>
                    <span>Convertir en misión</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};