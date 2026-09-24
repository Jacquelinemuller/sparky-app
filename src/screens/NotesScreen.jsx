import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { audioService } from '../services/audioService';

const COLOR_OPTIONS = [
  { id: 'yellow', bg: '#fef3c7', text: '#78350f', border: '#f59e0b', label: 'Soleado' },
  { id: 'pink',   bg: '#ffe4e6', text: '#881337', border: '#ec4899', label: 'Melocotón' },
  { id: 'mint',   bg: '#d1fae5', text: '#064e3b', border: '#10b981', label: 'Menta' },
  { id: 'blue',   bg: '#dbeafe', text: '#1e3a8a', border: '#3b82f6', label: 'Cielo' }
];

const COLOR_MAP = Object.fromEntries(COLOR_OPTIONS.map((c) => [c.id, c]));

// Soporte de Speech Recognition
const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export const NotesScreen = () => {
  const { notes, addNote, updateNote, deleteNote, convertNoteToTask, setActiveTab } = useApp();

  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [errorMsg, setErrorMsg] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualText, setManualText] = useState('');
  const [convertingNote, setConvertingNote] = useState(null);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const [supported] = useState(() => !!SpeechRecognition);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    if (!supported) {
      setErrorMsg('Tu navegador no soporta grabación por voz. Usá la opción "Escribir" 📝');
      setShowManualInput(true);
      return;
    }

    setErrorMsg('');
    setLiveTranscript('');
    setFinalTranscript('');
    setRecordingSeconds(0);

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-AR';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let finalText = '';

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalText += result[0].transcript + ' ';
            setFinalTranscript(finalText.trim());
          } else {
            interim += result[0].transcript;
          }
        }
        setLiveTranscript(interim);
      };

      recognition.onerror = (e) => {
        if (e.error === 'not-allowed') {
          setErrorMsg('Necesitamos permiso para usar el micrófono 🎤');
        } else if (e.error === 'no-speech') {
          // silencio, no es error grave
        } else {
          setErrorMsg('Hubo un problema con la grabación');
        }
        stopRecording();
      };

      recognition.onend = () => {
        if (isRecording) {
          // Si se detuvo inesperadamente, intentar mantener vivo si seguimos grabando
          try { recognition.start(); } catch (e) {}
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);

      try { audioService.playPop(); } catch (e) {}
    } catch (e) {
      setErrorMsg('No pudimos iniciar la grabación');
    }
  };

  const stopRecording = () => {
    clearInterval(timerRef.current);
    setIsRecording(false);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }

    try { audioService.playClick(); } catch (e) {}
  };

  const cancelRecording = () => {
    stopRecording();
    setLiveTranscript('');
    setFinalTranscript('');
    setRecordingSeconds(0);
  };

  const saveRecording = () => {
    const text = (finalTranscript + ' ' + liveTranscript).trim();
    if (!text) {
      setErrorMsg('No se escuchó nada. Probá de nuevo 🎤');
      return;
    }

    addNote({
      text,
      color: selectedColor,
      isVoice: true
    });

    setLiveTranscript('');
    setFinalTranscript('');
    setRecordingSeconds(0);
    setErrorMsg('');
  };

  const saveManualNote = () => {
    const text = manualText.trim();
    if (!text) return;

    addNote({
      text,
      color: selectedColor,
      isVoice: false
    });

    setManualText('');
    setShowManualInput(false);
    setSelectedColor('yellow');
  };

  const handleConvert = (noteId) => {
    convertNoteToTask(noteId);
    setConvertingNote(noteId);
    setTimeout(() => {
      setConvertingNote(null);
      setActiveTab('missions');
    }, 600);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto select-none pb-8 px-2 pt-4">

      {/* Header */}
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

      {/* Card de grabación de voz */}
      <div className="w-full bg-white rounded-3xl p-5 shadow-[0_5px_0_0_#fed7aa] border-2 border-[#fed7aa] mb-4">
        {!isRecording && !finalTranscript && !liveTranscript && (
          <>
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={startRecording}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff6b00] to-[#ea580c] shadow-[0_6px_0_0_#c2410c,0_8px_24px_rgba(255,107,0,0.4)] flex items-center justify-center text-white active:translate-y-1 active:shadow-[0_2px_0_0_#c2410c] transition-all cursor-pointer"
                title="Toca para grabar"
              >
                <span className="material-symbols-outlined text-[44px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                  mic
                </span>
              </button>
              <p className="font-title-md text-title-md font-black text-on-surface mt-3">
                Toca para grabar
              </p>
              <p className="font-label-sm text-label-sm text-on-surface-variant text-center mt-1">
                Decí lo que querés recordar y lo convertimos en nota ✨
              </p>
            </div>

            {errorMsg && (
              <div className="w-full mt-3 p-2.5 rounded-xl bg-[#fee2e2] border border-[#fecaca] flex items-start gap-2">
                <span className="text-base">⚠️</span>
                <p className="font-label-sm text-label-sm text-[#991b1b] font-bold leading-tight">
                  {errorMsg}
                </p>
              </div>
            )}

            {/* Selector de color */}
            <div className="w-full mt-4 pt-3 border-t border-[#fed7aa]/50">
              <p className="font-label-sm text-[11px] font-black text-on-surface-variant uppercase tracking-wider mb-2 text-center">
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
                      style={{
                        backgroundColor: c.bg,
                        borderColor: c.border
                      }}
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

            {/* Alternativa: escribir manualmente */}
            <button
              type="button"
              onClick={() => setShowManualInput(true)}
              className="w-full mt-4 py-2.5 rounded-2xl bg-[#fff7ed] border border-[#fed7aa] text-[#ea580c] font-label-sm text-label-sm font-black flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>Prefiero escribir</span>
            </button>
          </>
        )}

        {/* Grabando */}
        {isRecording && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 w-24 h-24 rounded-full bg-red-500 opacity-40 animate-ping" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-[0_6px_0_0_#991b1b,0_8px_24px_rgba(239,68,68,0.4)] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[44px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                  mic
                </span>
              </div>
            </div>

            <p className="font-headline-md text-headline-md font-black text-red-500 mt-3 tabular-nums">
              {formatTime(recordingSeconds)}
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
              Estoy escuchando... 🎧
            </p>

            {/* Transcripción en vivo */}
            <div className="w-full mt-4 p-3 rounded-2xl bg-[#fff7ed] border border-dashed border-[#ff6b00] min-h-[60px] max-h-[140px] overflow-y-auto">
              <p className="font-body-sm text-body-sm text-on-surface leading-snug">
                {finalTranscript}{' '}
                <span className="text-on-surface-variant italic">{liveTranscript}</span>
                {!finalTranscript && !liveTranscript && (
                  <span className="text-on-surface-variant/50 italic">Tu voz aparecerá aquí...</span>
                )}
              </p>
            </div>

            {/* Botones de acción mientras graba */}
            <div className="flex items-center gap-2 mt-4 w-full">
              <button
                type="button"
                onClick={cancelRecording}
                className="flex-1 h-12 rounded-2xl bg-white border-2 border-[#fed7aa] text-[#9a3412] font-bold text-sm active:scale-95 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="flex-1 h-12 rounded-2xl bg-[#10b981] text-white font-black text-sm shadow-[0_3px_0_0_#047857] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[20px]">stop_circle</span>
                <span>Terminar</span>
              </button>
            </div>
          </div>
        )}

        {/* Terminó de grabar, listo para guardar */}
        {!isRecording && (finalTranscript || liveTranscript) && (
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[#10b981] text-[22px]">check_circle</span>
              <p className="font-title-md font-black text-on-surface">
                ¡Listo! Revisá lo que dijiste:
              </p>
            </div>

            <div className="w-full p-3 rounded-2xl bg-[#fff7ed] border border-[#fed7aa] mb-3">
              <p className="font-body-md text-body-md text-on-surface font-semibold leading-snug">
                {(finalTranscript + ' ' + liveTranscript).trim()}
              </p>
            </div>

            {/* Selector de color rápido */}
            <div className="flex items-center justify-center gap-2.5 mb-3">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = selectedColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                      isSelected ? 'ring-2 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.bg, borderColor: c.border }}
                    title={c.label}
                  >
                    {isSelected && (
                      <span className="material-symbols-outlined text-[16px]" style={{ color: c.text }}>
                        check
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={cancelRecording}
                className="flex-1 h-12 rounded-2xl bg-white border-2 border-[#fed7aa] text-[#9a3412] font-bold text-sm active:scale-95 transition-all cursor-pointer"
              >
                Descartar
              </button>
              <button
                type="button"
                onClick={saveRecording}
                className="flex-[2] h-12 rounded-2xl bg-[#10b981] text-white font-black text-sm shadow-[0_3px_0_0_#047857] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[20px]">save</span>
                <span>Guardar nota</span>
              </button>
            </div>
          </div>
        )}

        {/* Input manual */}
        {showManualInput && !isRecording && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-title-md font-black text-on-surface">
                ✍️ Escribir nota
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowManualInput(false);
                  setManualText('');
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#fff7ed] active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">close</span>
              </button>
            </div>

            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Escribí lo que querés recordar..."
              maxLength={200}
              rows={3}
              autoFocus
              className="w-full p-3 rounded-2xl border-2 border-[#fed7aa] bg-white text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b00] resize-none"
            />

            <div className="flex items-center justify-center gap-2.5">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = selectedColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                      isSelected ? 'ring-2 ring-offset-2 scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.bg, borderColor: c.border }}
                  >
                    {isSelected && (
                      <span className="material-symbols-outlined text-[16px]" style={{ color: c.text }}>
                        check
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={saveManualNote}
              disabled={!manualText.trim()}
              className="w-full h-12 rounded-2xl bg-[#10b981] text-white font-black text-sm shadow-[0_3px_0_0_#047857] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              <span>Guardar nota</span>
            </button>
          </div>
        )}
      </div>

      {/* Lista de notas */}
      <div className="w-full flex flex-col gap-3">
        {notes.length === 0 && !isRecording && !showManualInput && (
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

              {/* Acciones */}
              <div className="flex items-center justify-between gap-1 mt-3 pt-2 border-t border-current/10 flex-wrap">
                <div className="flex items-center gap-1">
                  {/* Cambiar color */}
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
                    className="px-3 py-1.5 rounded-full bg-[#ff6b00] text-white font-label-sm text-label-sm font-black shadow-[0_2px_0_0_#c2410c] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
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