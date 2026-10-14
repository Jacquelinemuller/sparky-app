import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import VoiceInput from '../components/VoiceInput';
import { audioService } from '../services/audioService';

const PAPER_BG = 'linear-gradient(180deg, #f5f0e6 0%, #e8dfc8 100%)';
const HAND_FONT = '"Patrick Hand", cursive';
const TITLE_FONT = '"WimpyKid", "Patrick Hand", cursive';
const LINE_HEIGHT = 26;
const LINE_COLOR = 'rgba(120, 90, 50, 0.4)';

const SECTION_ICONS = {
  logro:    '/kit/1.png',
  desafio:  '/kit/2.png',
  emocion:  '/kit/3.png',
  audio:    '/kit/4.png'
};

const EMOTIONS = [
  { id: 'feliz',       emoji: '😊', label: 'Feliz' },
  { id: 'tranquilo',   emoji: '😌', label: 'Tranquilo' },
  { id: 'triste',      emoji: '😢', label: 'Triste' },
  { id: 'enojado',     emoji: '😠', label: 'Enojado' },
  { id: 'nervioso',    emoji: '😰', label: 'Nervioso' },
  { id: 'sorprendido', emoji: '😲', label: 'Sorprendido' }
];

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatShortDate(dateOrKey) {
  const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  let date;
  if (typeof dateOrKey === 'string') {
    const [y, m, d] = dateOrKey.split('-').map(Number);
    date = new Date(y, m - 1, d);
  } else if (dateOrKey instanceof Date) {
    date = dateOrKey;
  } else {
    date = new Date();
  }
  return `${DAYS[date.getDay()]} ${date.getDate()}`;
}

function formatFriendlyDate(dateOrKey) {
  const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  let date;
  if (typeof dateOrKey === 'string') {
    const [y, m, d] = dateOrKey.split('-').map(Number);
    date = new Date(y, m - 1, d);
  } else if (dateOrKey instanceof Date) {
    date = dateOrKey;
  } else {
    date = new Date();
  }
  return `${DAYS[date.getDay()]} ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}

function getEmotionById(id) {
  return EMOTIONS.find((e) => e.id === id) || null;
}

// ============================================
// GRABADORA DE VOZ
// ============================================
function VoiceRecorder({ value, transcription, onSave, maxSeconds = 90 }) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  useEffect(() => {
    return () => stopEverything();
  }, []);

  const stopEverything = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} recognitionRef.current = null; }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
  };

  const startRecording = async () => {
    setError('');
    setLiveTranscript('');
    transcriptRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : MediaRecorder.isTypeSupported('audio/webm')
        ? { mimeType: 'audio/webm' }
        : {};

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          onSave(reader.result, transcriptRef.current.trim());
        };
        reader.readAsDataURL(blob);
        stopEverything();
      };

      recorder.start();
      setIsRecording(true);
      setElapsed(0);

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.lang = 'es-AR';
          recognition.continuous = true;
          recognition.interimResults = true;

          recognition.onresult = (event) => {
            let finalText = '';
            let interimText = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) finalText += transcript + ' ';
              else interimText += transcript;
            }
            if (finalText) transcriptRef.current += finalText;
            setLiveTranscript((transcriptRef.current + interimText).trim());
          };
          recognition.onerror = (e) => console.warn('Speech recognition error:', e.error);
          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) { console.warn('No se pudo iniciar transcripción:', e); }
      }

      timerRef.current = setInterval(() => {
        setElapsed((s) => {
          if (s + 1 >= maxSeconds) { stopRecording(); return maxSeconds; }
          return s + 1;
        });
      }, 1000);

      try { audioService.playPop(); } catch (e) {}
    } catch (err) {
      setError('No pudimos acceder al micrófono. Revisá los permisos.');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
    setIsRecording(false);
    try { audioService.playClick(); } catch (e) {}
  };

  const deleteAudio = () => {
    try { audioService.playClick(); } catch (e) {}
    onSave(null, '');
    setElapsed(0);
    setIsPlaying(false);
    setLiveTranscript('');
    transcriptRef.current = '';
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  };

  const togglePlay = () => {
    if (!value) return;
    if (isPlaying && audioRef.current) { audioRef.current.pause(); setIsPlaying(false); return; }
    const audio = new Audio(value);
    audioRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.play().then(() => setIsPlaying(true)).catch(() => setError('No se pudo reproducir'));
  };

  const formatSeconds = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-2">
      {!value && !isRecording && (
        <button
          type="button"
          onClick={startRecording}
          className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #ff4d6d 0%, #e63946 100%)',
            boxShadow: '0 4px 0 0 #991b1b',
            fontFamily: HAND_FONT
          }}
        >
          <span className="material-symbols-outlined text-white text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>
            mic
          </span>
          <span className="text-white font-black text-base">Grabar un audio</span>
        </button>
      )}

      {isRecording && (
        <div className="flex flex-col gap-2">
          <div
            className="w-full py-3 rounded-2xl flex items-center justify-between gap-3 px-4"
            style={{ background: '#fee2e2', border: '2px solid #ef4444', fontFamily: HAND_FONT }}
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500" style={{ animation: 'pulseRecording 1s ease-in-out infinite' }} />
              <span className="font-black text-red-700 text-base">Grabando… {formatSeconds(elapsed)}</span>
            </div>
            <button
              type="button"
              onClick={stopRecording}
              className="px-4 py-1.5 rounded-full bg-red-600 text-white font-black text-sm active:scale-95 transition-all cursor-pointer"
            >
              Detener
            </button>
          </div>

          {liveTranscript && (
            <div className="w-full p-3 rounded-2xl" style={{ background: '#fef3c7', border: '2px dashed #fbbf24' }}>
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-wide mb-1">📝 Se está escuchando</p>
              <p className="text-sm text-amber-900 font-bold leading-snug">{liveTranscript}</p>
            </div>
          )}
        </div>
      )}

      {value && !isRecording && (
        <div className="flex flex-col gap-2">
          <div
            className="w-full p-3 rounded-2xl flex items-center gap-2"
            style={{ background: '#ecfdf5', border: '2px solid #10b981', fontFamily: HAND_FONT }}
          >
            <button
              type="button"
              onClick={togglePlay}
              className="w-11 h-11 rounded-full bg-[#10b981] flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-black text-emerald-800 text-sm">Audio guardado ✅</p>
              <p className="text-emerald-700 text-xs font-bold">Tocalo para escucharlo</p>
            </div>
            <button
              type="button"
              onClick={deleteAudio}
              className="w-10 h-10 rounded-full bg-white border-2 border-red-200 flex items-center justify-center text-red-500 active:scale-90 transition-all cursor-pointer flex-shrink-0"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>

          {transcription && (
            <div className="w-full p-3 rounded-2xl" style={{ background: '#f0f9ff', border: '2px solid #93c5fd' }}>
              <p className="text-[10px] font-black text-blue-700 uppercase tracking-wide mb-1">📝 Lo que se entendió del audio</p>
              <p className="text-sm text-blue-900 font-bold leading-snug">{transcription}</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[11px] font-bold text-red-600 px-1">{error}</p>}
    </div>
  );
}

// ============================================
// HOJA CON LÍNEAS DE CUADERNO
// ============================================
function RuledSheet({ children, style = {} }) {
  return (
    <div
      className="w-full rounded-3xl shadow-[0_8px_24px_rgba(120,90,50,0.15)] relative overflow-hidden"
      style={{
        background: '#fdfaf3',
        border: '2px solid #e8dfc8',
        ...style
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            to bottom,
            transparent 0px,
            transparent ${LINE_HEIGHT - 1}px,
            ${LINE_COLOR} ${LINE_HEIGHT - 1}px,
            ${LINE_COLOR} ${LINE_HEIGHT}px
          )`,
          top: '60px',
          opacity: 0.5
        }}
      />
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{
          left: '28px',
          width: '2px',
          background: 'rgba(239, 68, 68, 0.25)'
        }}
      />
      <div className="relative z-10" style={{ padding: '20px 20px 20px 40px' }}>
        {children}
      </div>
    </div>
  );
}

// ============================================
// BULLET sobre renglón
// ============================================
function SheetLine({ children }) {
  return (
    <div
      className="flex items-start gap-2"
      style={{
        minHeight: `${LINE_HEIGHT}px`,
        lineHeight: `${LINE_HEIGHT}px`,
        fontFamily: HAND_FONT,
        fontSize: '17px',
        color: '#3b2a12'
      }}
    >
      <span style={{ flexShrink: 0, lineHeight: `${LINE_HEIGHT}px` }}>•</span>
      <div className="flex-1 min-w-0" style={{ lineHeight: `${LINE_HEIGHT}px` }}>
        {children}
      </div>
    </div>
  );
}

// ============================================
// DIARIO HISTÓRICO
// ============================================
function DiaryHistory({ entries, onBack }) {
  const sortedDates = Object.keys(entries).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen flex flex-col antialiased" style={{ background: PAPER_BG }}>
      <header
        className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl"
        style={{ background: 'rgba(245, 240, 230, 0.95)', borderBottom: '1.5px solid rgba(120, 90, 50, 0.2)' }}
      >
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full font-bold active:scale-95 transition-all cursor-pointer"
            style={{ background: '#ffffff', border: '1.5px solid rgba(120, 90, 50, 0.25)', color: '#6b4a1f', fontFamily: HAND_FONT }}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Volver</span>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: '#fef3c7', border: '1.5px solid #fbbf24' }}>
            <span className="text-lg">📖</span>
            <span className="font-black uppercase tracking-wider" style={{ color: '#78350f', fontSize: '11px', fontFamily: HAND_FONT }}>
              Mi Diario
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 pb-10 px-4 max-w-md mx-auto gap-4">
        {sortedDates.length === 0 ? (
          <RuledSheet>
            <div className="text-center py-6">
              <span className="text-5xl block mb-3">📖</span>
              <p className="font-black text-lg" style={{ color: '#6b4a1f', fontFamily: TITLE_FONT }}>
                Todavía no hay días guardados
              </p>
              <p className="text-sm mt-1" style={{ color: '#8b6f47', fontFamily: HAND_FONT }}>
                Completá tu primer día y va a aparecer acá ✨
              </p>
            </div>
          </RuledSheet>
        ) : (
          sortedDates.map((dateKey) => {
            const entry = entries[dateKey];
            const emotion = getEmotionById(entry.emocion);
            return (
              <RuledSheet key={dateKey}>
                <div
                  style={{
                    fontFamily: TITLE_FONT,
                    fontSize: '26px',
                    color: '#6b4a1f',
                    lineHeight: `${LINE_HEIGHT}px`,
                    marginBottom: `${LINE_HEIGHT}px`
                  }}
                >
                  <span
                    style={{
                      borderBottom: '2px solid #6b4a1f',
                      paddingBottom: '2px',
                      display: 'inline-block'
                    }}
                  >
                    {formatShortDate(dateKey)}:
                  </span>
                </div>

                {emotion && (
                  <SheetLine>
                    <span className="mr-1">{emotion.emoji}</span>
                    <strong>Me sentí {emotion.label.toLowerCase()}</strong>
                    {entry.comoMeSenti && (
                      <>
                        {' '}porque{' '}
                        {entry.comoMeSenti.charAt(0).toLowerCase() + entry.comoMeSenti.slice(1)}
                      </>
                    )}
                  </SheetLine>
                )}

                {entry.logro && (
                  <SheetLine>
                    <span className="mr-1">⭐</span>
                    <strong>Lo logré:</strong>{' '}
                    {entry.logro}
                  </SheetLine>
                )}

                {entry.desafio && (
                  <SheetLine>
                    <span className="mr-1">🧩</span>
                    <strong>Fue un desafío:</strong>{' '}
                    {entry.desafio}
                  </SheetLine>
                )}

                {entry.textoDia && (
                  <SheetLine>
                    <span className="mr-1">✍️</span>
                    <strong>Conté sobre mi día:</strong>{' '}
                    {entry.textoDia}
                  </SheetLine>
                )}

                {entry.transcripcion && (
                  <SheetLine>
                    <span className="mr-1">🎙️</span>
                    <strong>Del audio:</strong>{' '}
                    {entry.transcripcion}
                  </SheetLine>
                )}
              </RuledSheet>
            );
          })
        )}
      </main>
    </div>
  );
}

// ============================================
// PANTALLA PRINCIPAL
// ============================================
export const MiDiaScreen = () => {
  const { setActiveScreen, saveMiDiaEntry, miDiaEntries, userName } = useApp();

  const todayKey = getTodayKey();
  const existing = (miDiaEntries || {})[todayKey] || {};

  const [view, setView] = useState('hoy');

  const [logro, setLogro] = useState(existing.logro || '');
  const [desafio, setDesafio] = useState(existing.desafio || '');
  const [emocion, setEmocion] = useState(existing.emocion || null);
  const [comoMeSenti, setComoMeSenti] = useState(existing.comoMeSenti || '');
  const [textoDia, setTextoDia] = useState(existing.textoDia || '');
  const [audioBase64, setAudioBase64] = useState(existing.audio || null);
  const [transcripcion, setTranscripcion] = useState(existing.transcripcion || '');
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      saveMiDiaEntry(todayKey, {
        logro, desafio, emocion, comoMeSenti, textoDia,
        audio: audioBase64, transcripcion
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [logro, desafio, emocion, comoMeSenti, textoDia, audioBase64, transcripcion, todayKey]);

  const goBack = () => {
    try { audioService.playClick(); } catch (e) {}
    setActiveScreen('apoyos');
  };

  const handleEmotion = (id) => {
    try { audioService.playPop(); } catch (e) {}
    setEmocion((prev) => (prev === id ? null : id));
  };

  const handleAudioSave = (base64, text) => {
    setAudioBase64(base64);
    setTranscripcion(text);
  };

  const handleSaveManual = () => {
    saveMiDiaEntry(todayKey, {
      logro, desafio, emocion, comoMeSenti, textoDia,
      audio: audioBase64, transcripcion
    });
    try { audioService.playSuccess(); } catch (e) {}
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1400);
  };

  if (view === 'diario') {
    return (
      <DiaryHistory
        entries={miDiaEntries || {}}
        onBack={() => { try { audioService.playClick(); } catch (e) {} setView('hoy'); }}
      />
    );
  }

  const numDays = Object.keys(miDiaEntries || {}).length;

  return (
    <div className="min-h-screen flex flex-col antialiased" style={{ background: PAPER_BG }}>
      <header
        className="fixed top-0 w-full z-50 pt-safe backdrop-blur-xl"
        style={{ background: 'rgba(245, 240, 230, 0.95)', borderBottom: '1.5px solid rgba(120, 90, 50, 0.2)' }}
      >
        <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-lg mx-auto">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 h-11 px-4 rounded-full font-bold active:scale-95 transition-all cursor-pointer"
            style={{ background: '#ffffff', border: '1.5px solid rgba(120, 90, 50, 0.25)', color: '#6b4a1f', fontFamily: HAND_FONT }}
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Volver</span>
          </button>

          <button
            type="button"
            onClick={() => { try { audioService.playPop(); } catch (e) {} setView('diario'); }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full active:scale-95 transition-all cursor-pointer"
            style={{ background: '#fef3c7', border: '1.5px solid #fbbf24' }}
          >
            <span className="text-lg">📖</span>
            <span className="font-black uppercase tracking-wider" style={{ color: '#78350f', fontSize: '11px', fontFamily: HAND_FONT }}>
              Mi Diario ({numDays})
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full pt-20 pb-10 px-4 max-w-md mx-auto gap-4">

        <div className="text-center px-2">
          <p className="font-black text-xl" style={{ color: '#6b4a1f', fontFamily: TITLE_FONT }}>
            ¡Hola, {userName || 'amiguito'}! 👋
          </p>
          <p className="text-sm mt-0.5" style={{ color: '#8b6f47', fontFamily: HAND_FONT }}>
            {formatFriendlyDate()}
          </p>
        </div>

        <RuledSheet>
          <div style={{ fontFamily: TITLE_FONT, fontSize: '26px', color: '#6b4a1f', marginBottom: '20px' }}>
            <span style={{ borderBottom: '2px solid #6b4a1f', paddingBottom: '2px', display: 'inline-block' }}>
              {formatFriendlyDate()}
            </span>
          </div>

          {/* 1. LO LOGRÉ */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <img src={SECTION_ICONS.logro} alt="Lo logré" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" draggable={false} />
              <div className="flex-1 min-w-0">
                <p className="font-black text-base leading-tight" style={{ color: '#92400e', fontFamily: HAND_FONT }}>
                  1. Lo logré ⭐
                </p>
                <p className="text-[11px] font-bold leading-tight" style={{ color: '#a16207', fontFamily: HAND_FONT, opacity: 0.85 }}>
                  ¿Qué me salió bien hoy?
                </p>
              </div>
            </div>

            <VoiceInput
              value={logro}
              onChange={setLogro}
              placeholder="Escribí o dictá…"
              maxLength={140}
              color="#b45309"
              bg="#ffffff"
              borderColor="#e8dfc8"
              style={{
                fontFamily: HAND_FONT,
                fontSize: '16px',
                padding: '10px 12px',
                background: '#ffffff',
                border: '1.5px solid #e8dfc8',
                borderRadius: '12px',
                lineHeight: `${LINE_HEIGHT}px`
              }}
            />
          </div>

          {/* 2. FUE UN DESAFÍO */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <img src={SECTION_ICONS.desafio} alt="Fue un desafío" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" draggable={false} />
              <div className="flex-1 min-w-0">
                <p className="font-black text-base leading-tight" style={{ color: '#166534', fontFamily: HAND_FONT }}>
                  2. Fue un desafío 🧩
                </p>
                <p className="text-[11px] font-bold leading-tight" style={{ color: '#15803d', fontFamily: HAND_FONT, opacity: 0.85 }}>
                  ¿Qué me costó o fue difícil?
                </p>
              </div>
            </div>

            <VoiceInput
              value={desafio}
              onChange={setDesafio}
              placeholder="Escribí o dictá…"
              maxLength={140}
              color="#15803d"
              bg="#ffffff"
              borderColor="#e8dfc8"
              style={{
                fontFamily: HAND_FONT,
                fontSize: '16px',
                padding: '10px 12px',
                background: '#ffffff',
                border: '1.5px solid #e8dfc8',
                borderRadius: '12px',
                lineHeight: `${LINE_HEIGHT}px`
              }}
            />
          </div>

          {/* 3. ¿CÓMO ME SENTÍ? */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <img src={SECTION_ICONS.emocion} alt="Cómo me sentí" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" draggable={false} />
              <div className="flex-1 min-w-0">
                <p className="font-black text-base leading-tight" style={{ color: '#9d174d', fontFamily: HAND_FONT }}>
                  3. ¿Cómo me sentí? 😊
                </p>
                <p className="text-[11px] font-bold leading-tight" style={{ color: '#be185d', fontFamily: HAND_FONT, opacity: 0.85 }}>
                  Elegí una carita y contá por qué
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {EMOTIONS.map((e) => {
                const isSelected = emocion === e.id;
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => handleEmotion(e.id)}
                    className="flex flex-col items-center justify-center gap-0.5 py-2 rounded-2xl transition-all cursor-pointer"
                    style={{
                      background: isSelected ? '#fce7f3' : '#ffffff',
                      border: `2px solid ${isSelected ? '#ec4899' : '#fbcfe8'}`,
                      boxShadow: isSelected ? '0 3px 0 0 #ec4899' : '0 2px 0 0 #fbcfe8',
                      transform: isSelected ? 'translateY(-2px)' : 'none',
                      fontFamily: HAND_FONT
                    }}
                  >
                    <span className="text-2xl leading-none">{e.emoji}</span>
                    <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: isSelected ? '#9d174d' : '#be185d', opacity: isSelected ? 1 : 0.75 }}>
                      {e.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <VoiceInput
              value={comoMeSenti}
              onChange={setComoMeSenti}
              placeholder="¿Por qué me sentí así?"
              maxLength={200}
              color="#be185d"
              bg="#ffffff"
              borderColor="#e8dfc8"
              style={{
                fontFamily: HAND_FONT,
                fontSize: '16px',
                padding: '10px 12px',
                background: '#ffffff',
                border: '1.5px solid #e8dfc8',
                borderRadius: '12px',
                lineHeight: `${LINE_HEIGHT}px`
              }}
            />
          </div>

          {/* 4. CUÉNTAME ALGO DEL DÍA */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img src={SECTION_ICONS.audio} alt="Cuéntame algo del día" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0" draggable={false} />
              <div className="flex-1 min-w-0">
                <p className="font-black text-base leading-tight" style={{ color: '#3730a3', fontFamily: HAND_FONT }}>
                  4. Cuéntame algo del día 🎙️
                </p>
                <p className="text-[11px] font-bold leading-tight" style={{ color: '#4338ca', fontFamily: HAND_FONT, opacity: 0.85 }}>
                  Escribí, dictá o grabá un audio
                </p>
              </div>
            </div>

            <VoiceInput
              value={textoDia}
              onChange={setTextoDia}
              placeholder="Escribí o dictá lo que quieras contar…"
              maxLength={300}
              color="#4338ca"
              bg="#ffffff"
              borderColor="#e8dfc8"
              style={{
                fontFamily: HAND_FONT,
                fontSize: '16px',
                padding: '10px 12px',
                background: '#ffffff',
                border: '1.5px solid #e8dfc8',
                borderRadius: '12px',
                lineHeight: `${LINE_HEIGHT}px`,
                minHeight: '80px'
              }}
            />

            <div className="flex items-center gap-2 my-3">
              <span className="flex-1 h-px bg-[#c7d2fe]" />
              <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#6366f1', fontFamily: HAND_FONT }}>
                y/o grabá un audio
              </span>
              <span className="flex-1 h-px bg-[#c7d2fe]" />
            </div>

            <VoiceRecorder
              value={audioBase64}
              transcription={transcripcion}
              onSave={handleAudioSave}
              maxSeconds={90}
            />
          </div>
        </RuledSheet>

        <button
          type="button"
          onClick={handleSaveManual}
          className="w-full py-4 rounded-2xl font-black text-base active:scale-[0.98] transition-all cursor-pointer"
          style={{
            background: savedFlash
              ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
              : 'linear-gradient(135deg, #65a30d 0%, #4d7c0f 100%)',
            color: '#fff',
            boxShadow: savedFlash
              ? '0 5px 0 0 #15803d'
              : '0 5px 0 0 #3f6212, 0 10px 20px rgba(101,163,13,0.25)',
            fontFamily: HAND_FONT
          }}
        >
          {savedFlash ? '✅ ¡Guardado!' : '💾 Guardar mi día'}
        </button>

        <p className="text-[11px] text-center font-bold" style={{ color: '#8b6f47', fontFamily: HAND_FONT }}>
          🐾 Sparky guarda todo automáticamente mientras escribís.
        </p>
      </main>

      <style>{`
        @keyframes pulseRecording {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
};