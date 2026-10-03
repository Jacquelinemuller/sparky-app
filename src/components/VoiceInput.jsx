import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

/**
 * Input con botón de micrófono para dictado por voz.
 * Soporta múltiples líneas (auto-resize).
 *
 * Props nuevas:
 * - micIconSrc: ruta de la imagen para el micrófono (ej: '/mic.png')
 *               Si se pasa, se usa esa imagen en vez del ícono.
 * - micIconSize: tamaño de la imagen en px (default 36)
 * - micOffsetY: desplazamiento vertical del botón (ej: '-12px')
 */
export default function VoiceInput({
  value = '',
  onChange,
  placeholder = '',
  maxLength = 100,
  color = '#8b5cf6',
  bg = '#faf5ff',
  borderColor = '#ddd6fe',
  textColor = '#0f172a',
  className = '',
  style = {},
  inputRef: externalRef,
  onKeyDown,
  autoFocus = false,
  disabled = false,
  rows = 1,
  micIconSrc = null,
  micIconSize = 36,
  micOffsetY = '0px'
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [interim, setInterim] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const fragmentsRef = useRef(new Set());
  const internalRef = useRef(null);

  const ref = externalRef || internalRef;

  const autoResize = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  useEffect(() => {
    if (ref?.current) {
      autoResize(ref.current);
    }
  }, [value, ref]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
        recognitionRef.current = null;
      }
      isRecordingRef.current = false;
    };
  }, []);

  const startRecording = () => {
    if (!SpeechRecognition) {
      setErrorMsg('Tu navegador no soporta dictado por voz');
      setTimeout(() => setErrorMsg(''), 2500);
      return;
    }

    setErrorMsg('');
    setInterim('');
    fragmentsRef.current = new Set();

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-AR';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let interimText = '';
        let lastFinalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            lastFinalText = result[0].transcript.trim();
          } else {
            interimText += result[0].transcript;
          }
        }

        if (lastFinalText) {
          fragmentsRef.current.add(lastFinalText);
          const joined = Array.from(fragmentsRef.current).join(' ');
          const newValue = value ? `${value.trim()} ${joined}` : joined;
          if (onChange) onChange(newValue.slice(0, maxLength));
        }

        setInterim(interimText);
      };

      recognition.onerror = (e) => {
        if (e.error === 'not-allowed') {
          setErrorMsg('Necesitamos permiso para el micrófono 🎤');
        } else if (e.error === 'no-speech' || e.error === 'aborted') {
          // ignorar
        } else {
          setErrorMsg('Hubo un problema con el dictado');
        }
      };

      recognition.onend = () => {
        // sin restart
      };

      recognition.start();
      recognitionRef.current = recognition;
      isRecordingRef.current = true;
      setIsRecording(true);

      try { audioService.playPop(); } catch (e) {}
    } catch (err) {
      setErrorMsg('No pudimos iniciar el dictado');
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setInterim('');
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }
    try { audioService.playClick(); } catch (e) {}
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const displayValue = isRecording && interim
    ? `${value} ${interim}`.trim()
    : value;

  const handleChange = (e) => {
    if (!isRecording && onChange) onChange(e.target.value);
    autoResize(e.target);
  };

  // ¿Usar imagen personalizada?
  const useCustomIcon = Boolean(micIconSrc);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-stretch gap-2 w-full">
        <textarea
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          placeholder={isRecording ? 'Escuchando...' : placeholder}
          maxLength={maxLength}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          disabled={disabled}
          rows={rows}
          className={`flex-1 min-w-0 p-3 rounded-2xl text-[15px] font-bold focus:outline-none ${className}`}
          style={{
            background: isRecording ? '#ffffff' : bg,
            border: isRecording ? `2px solid ${color}` : `2px solid ${borderColor}`,
            color: textColor,
            resize: 'none',
            overflow: 'hidden',
            lineHeight: '1.4',
            minHeight: '1.4em',
            ...style
          }}
        />

        {/* 🎤 Botón de micrófono */}
        {useCustomIcon ? (
          /* ---- MODO IMAGEN (solo diario) ---- */
          <button
            type="button"
            onClick={handleMicClick}
            disabled={disabled}
            className="flex-shrink-0 flex items-center justify-center cursor-pointer active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed self-start"
            style={{
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              padding: 0,
              width: '48px',
              height: '48px',
              marginTop: micOffsetY,
              animation: isRecording ? 'micPulse 1s ease-in-out infinite' : 'none'
            }}
            title={isRecording ? 'Parar dictado' : 'Dictar por voz'}
          >
            {isRecording ? (
              <span
                className="material-symbols-outlined"
                style={{
                  color: '#dc2626',
                  fontSize: '40px',
                  fontVariationSettings: '"FILL" 1'
                }}
              >
                stop_circle
              </span>
            ) : (
              <img
                src={micIconSrc}
                alt="Micrófono"
                draggable={false}
                style={{
                  width: `${micIconSize}px`,
                  height: `${micIconSize}px`,
                  objectFit: 'contain',
                  pointerEvents: 'none'
                }}
              />
            )}
          </button>
        ) : (
          /* ---- MODO ÍCONO MATERIAL (todo el resto de la app) ---- */
          <button
            type="button"
            onClick={handleMicClick}
            disabled={disabled}
            className="flex-shrink-0 w-12 rounded-2xl flex items-center justify-center cursor-pointer active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed self-start"
            style={{
              background: isRecording
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : '#ffffff',
              border: isRecording ? 'none' : `2px solid ${borderColor}`,
              boxShadow: isRecording
                ? '0 2px 0 0 #991b1b'
                : `0 2px 0 0 ${borderColor}`,
              animation: isRecording ? 'micPulse 1s ease-in-out infinite' : 'none',
              minHeight: '48px'
            }}
            title={isRecording ? 'Parar dictado' : 'Dictar por voz'}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{
                color: isRecording ? '#ffffff' : color,
                fontVariationSettings: '"FILL" 1'
              }}
            >
              {isRecording ? 'stop_circle' : 'mic'}
            </span>
          </button>
        )}
      </div>

      {isRecording && !interim && (
        <span className="text-[10px] font-black uppercase tracking-wider animate-pulse" style={{ color }}>
          🎤 Escuchando...
        </span>
      )}
      {isRecording && interim && (
        <span className="text-[10px] font-medium italic" style={{ color: '#94a3b8' }}>
          {interim}
        </span>
      )}
      {errorMsg && (
        <span className="text-[10px] font-black" style={{ color: '#dc2626' }}>
          ⚠️ {errorMsg}
        </span>
      )}

      <style>{`
        @keyframes micPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}