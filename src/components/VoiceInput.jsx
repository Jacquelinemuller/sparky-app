import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition as NativeSpeech } from '@capacitor-community/speech-recognition';

// Detección de entorno
const IS_NATIVE = Capacitor.isNativePlatform();
const WebSpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

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
  const nativeListenerRef = useRef(null);

  const ref = externalRef || internalRef;

  const autoResize = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  useEffect(() => {
    if (ref?.current) autoResize(ref.current);
  }, [value, ref]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
        recognitionRef.current = null;
      }
      if (nativeListenerRef.current) {
        try { nativeListenerRef.current.remove(); } catch (e) {}
        nativeListenerRef.current = null;
      }
      isRecordingRef.current = false;
    };
  }, []);

  // ============================================
  // 📱 MODO NATIVO (APK Android)
  // ============================================
  const startNativeRecording = async () => {
    try {
      // 1. Pedir permisos
      const perm = await NativeSpeech.requestPermissions();
      if (perm.speechRecognition !== 'granted') {
        setErrorMsg('Necesitamos permiso para el micrófono 🎤');
        setTimeout(() => setErrorMsg(''), 2500);
        return;
      }

      // 2. Verificar disponibilidad
      const available = await NativeSpeech.available();
      if (!available.available) {
        setErrorMsg('Tu dispositivo no soporta dictado');
        setTimeout(() => setErrorMsg(''), 2500);
        return;
      }

      // 3. Configurar listener de resultados PARCIALES (para mostrar en vivo)
      nativeListenerRef.current = await NativeSpeech.addListener(
        'partialResults',
        (data) => {
          if (data.matches && data.matches.length > 0) {
            setInterim(data.matches[0]);
          }
        }
      );

      // 4. Arrancar reconocimiento
      // ⚠️ partialResults: false = SOLO resultado final, NO repite palabras
      await NativeSpeech.start({
        language: 'es-AR',
        maxResults: 1,
        partialResults: false,  // 🔑 CLAVE para no duplicar
        popup: false
      });

      isRecordingRef.current = true;
      setIsRecording(true);
      try { audioService.playPop(); } catch (e) {}
    } catch (err) {
      console.error('Error speech nativo:', err);
      setErrorMsg('No pudimos iniciar el dictado');
      setTimeout(() => setErrorMsg(''), 2500);
    }
  };

  const stopNativeRecording = async () => {
    try {
      await NativeSpeech.stop();

      // Obtener el resultado final
      const result = await NativeSpeech.getSupportedLanguages().catch(() => null);

      // El resultado final viene del listener 'listeningState' o del callback
      // ⚠️ La forma de obtener el último resultado depende de la versión
      // del plugin. Podemos escuchar el evento 'listeningState' o usar
      // removeAllListeners y esperar el final.

      try {
        const finalResults = await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve(null), 800);
          const listener = NativeSpeech.addListener('listeningState', (state) => {
            if (state.status === 'stopped') {
              clearTimeout(timeout);
              listener.then((l) => l.remove());
              resolve(null);
            }
          });
        });
      } catch (e) {}
    } catch (err) {
      console.error('Error al parar:', err);
    }

    if (nativeListenerRef.current) {
      try { nativeListenerRef.current.remove(); } catch (e) {}
      nativeListenerRef.current = null;
    }

    isRecordingRef.current = false;
    setIsRecording(false);
    setInterim('');
    try { audioService.playClick(); } catch (e) {}
  };

  // ============================================
  // 🌐 MODO WEB (navegador de escritorio)
  // ============================================
  const startWebRecording = () => {
    if (!WebSpeechRecognition) {
      setErrorMsg('Tu navegador no soporta dictado por voz');
      setTimeout(() => setErrorMsg(''), 2500);
      return;
    }

    setErrorMsg('');
    setInterim('');
    fragmentsRef.current = new Set();

    try {
      const recognition = new WebSpeechRecognition();
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

      recognition.start();
      recognitionRef.current = recognition;
      isRecordingRef.current = true;
      setIsRecording(true);
      try { audioService.playPop(); } catch (e) {}
    } catch (err) {
      setErrorMsg('No pudimos iniciar el dictado');
    }
  };

  const stopWebRecording = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    setInterim('');
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
      recognitionRef.current = null;
    }
    try { audioService.playClick(); } catch (e) {}
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleMicClick = () => {
    if (isRecording) {
      if (IS_NATIVE) {
        stopNativeRecording();
      } else {
        stopWebRecording();
      }
    } else {
      if (IS_NATIVE) {
        startNativeRecording();
      } else {
        startWebRecording();
      }
    }
  };

  const displayValue = isRecording && interim
    ? `${value} ${interim}`.trim()
    : value;

  const handleChange = (e) => {
    if (!isRecording && onChange) onChange(e.target.value);
    autoResize(e.target);
  };

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

        {useCustomIcon ? (
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