import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition as NativeSpeech } from '@capacitor-community/speech-recognition';

const IS_NATIVE = Capacitor.isNativePlatform();
const WebSpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

const SHOW_DEBUG = false;

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
  micOffsetY = '0px',
  bigMic = false,
  bigMicLabelIdle = 'Toca para grabar',
  bigMicLabelRecording = 'Escuchando...'
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [interim, setInterim] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [debugLog, setDebugLog] = useState([]);

  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const fragmentsRef = useRef(new Set());
  const internalRef = useRef(null);
  const nativeListenerRef = useRef(null);
  const stopListenerRef = useRef(null);

  const interimRef = useRef('');
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const maxLengthRef = useRef(maxLength);

  const ref = externalRef || internalRef;

  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { maxLengthRef.current = maxLength; }, [maxLength]);
  useEffect(() => { interimRef.current = interim; }, [interim]);

  const log = (msg) => {
    console.log('🎤', msg);
    if (SHOW_DEBUG) {
      setDebugLog((prev) => [...prev.slice(-8), msg]);
    }
  };

  const autoResize = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  useEffect(() => {
    if (ref?.current) autoResize(ref.current);
  }, [value, ref]);

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
      if (stopListenerRef.current) {
        try { stopListenerRef.current.remove(); } catch (e) {}
        stopListenerRef.current = null;
      }
      try { NativeSpeech.removeAllListeners?.(); } catch (e) {}
      isRecordingRef.current = false;
    };
  }, []);

  // ============================================
  // 📱 MODO NATIVO (APK Android)
  // ============================================
  const startNativeRecording = async (retryCount = 0) => {
    log(`▶️ startNativeRecording (intento ${retryCount + 1})`);
    if (retryCount === 0) setDebugLog([]);

    try {
      log('🔐 Pidiendo permisos...');
      const perm = await NativeSpeech.requestPermissions();
      log('🔐 Permisos: ' + JSON.stringify(perm));

      if (perm.speechRecognition !== 'granted') {
        log('❌ Permiso DENEGADO');
        setErrorMsg('Necesitamos permiso para el micrófono 🎤');
        setTimeout(() => setErrorMsg(''), 2500);
        return;
      }
      log('✅ Permiso concedido');

      log('🔍 Verificando disponibilidad...');
      const available = await NativeSpeech.available();
      log('🔍 Available: ' + JSON.stringify(available));

      if (!available.available) {
        log('❌ No disponible');
        setErrorMsg('Tu dispositivo no soporta dictado');
        setTimeout(() => setErrorMsg(''), 2500);
        return;
      }
      log('✅ Disponible');

      if (nativeListenerRef.current) {
        try { nativeListenerRef.current.remove(); } catch (e) {}
        nativeListenerRef.current = null;
      }
      if (stopListenerRef.current) {
        try { stopListenerRef.current.remove(); } catch (e) {}
        stopListenerRef.current = null;
      }
      try { NativeSpeech.removeAllListeners?.(); } catch (e) {}

      log('🎧 Agregando listener partialResults...');
      nativeListenerRef.current = await NativeSpeech.addListener(
        'partialResults',
        (data) => {
          if (data.matches && data.matches.length > 0) {
            log('📥 parcial: ' + data.matches[0].slice(0, 60));
            setInterim(data.matches[0]);
          }
        }
      );

      log('🎧 Agregando listener listeningState...');
      stopListenerRef.current = await NativeSpeech.addListener(
        'listeningState',
        (data) => {
          log('📊 listeningState: ' + JSON.stringify(data));
        }
      );

      log('✅ Listeners agregados');

      log('🚀 Llamando a start()...');
      await NativeSpeech.start({
        language: 'es-AR',
        maxResults: 1,
        partialResults: true,
        popup: false
      });
      log('✅ start() OK');

      isRecordingRef.current = true;
      setIsRecording(true);
      try { audioService.playPop(); } catch (e) {}

    } catch (err) {
      log('❌ EXCEPCIÓN: ' + (err?.message || JSON.stringify(err)));
      console.error('Error speech nativo:', err);

      if (err?.message === 'No match' && retryCount < 3) {
        log(`⚠️ Reintentando (intento ${retryCount + 2}/4)...`);
        setTimeout(() => startNativeRecording(retryCount + 1), 700);
        return;
      }

      setErrorMsg('No pudimos iniciar el dictado');
      setTimeout(() => setErrorMsg(''), 4000);
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const stopNativeRecording = async () => {
    log('⏹️ stopNativeRecording iniciado');

    isRecordingRef.current = false;
    setIsRecording(false);

    const capturedText = interimRef.current?.trim() || '';

    try {
      const stopPromise = NativeSpeech.stop();
      await Promise.race([
        stopPromise,
        new Promise((resolve) => setTimeout(resolve, 1500))
      ]);
      log('✅ stop() OK');
    } catch (err) {
      log('⚠️ stop() falló: ' + (err?.message || 'unknown'));
    }

    try {
      if (nativeListenerRef.current) {
        await nativeListenerRef.current.remove();
        nativeListenerRef.current = null;
      }
      if (stopListenerRef.current) {
        await stopListenerRef.current.remove();
        stopListenerRef.current = null;
      }
      try { await NativeSpeech.removeAllListeners?.(); } catch (e) {}
      log('✅ Listeners removidos');
    } catch (err) {
      log('⚠️ Error al remover listeners');
    }

    if (capturedText && onChangeRef.current) {
      const currentValue = valueRef.current || '';
      const newValue = currentValue
        ? `${currentValue.trim()} ${capturedText}`
        : capturedText;
      onChangeRef.current(newValue.slice(0, maxLengthRef.current));
      log('✅ Texto guardado: ' + capturedText.slice(0, 40));
    } else {
      log('⚠️ No había texto para guardar');
    }

    setInterim('');
    interimRef.current = '';

    try { audioService.playClick(); } catch (e) {}
    log('✅ stopNativeRecording terminado');
  };

  // ============================================
  // 🌐 MODO WEB
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

  // ============================================
  // 🎨 RENDER: VARIANTE BIG MIC (botón grande circular)
  // ============================================
  if (bigMic) {
    return (
      <div className="flex flex-col items-center gap-3 w-full">

        {/* Botón grande circular */}
        <button
          type="button"
          onClick={handleMicClick}
          disabled={disabled}
          className="rounded-full flex items-center justify-center text-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-1"
          style={{
            width: '96px',
            height: '96px',
            background: isRecording
              ? 'linear-gradient(to bottom right, #ef4444, #dc2626)'
              : 'linear-gradient(to bottom right, #ff6b00, #ea580c)',
            boxShadow: isRecording
              ? '0 6px 0 0 #991b1b, 0 8px 24px rgba(239, 68, 68, 0.4)'
              : '0 6px 0 0 #c2410c, 0 8px 24px rgba(255, 107, 0, 0.4)',
            position: 'relative'
          }}
          title={isRecording ? 'Parar dictado' : 'Dictar por voz'}
        >
          {/* Anillo pulsante al grabar */}
          {isRecording && (
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: 'rgba(239, 68, 68, 0.4)',
                animation: 'micPulse 1.2s ease-in-out infinite',
                zIndex: -1
              }}
            />
          )}
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '44px',
              fontVariationSettings: '"FILL" 1',
              color: '#ffffff'
            }}
          >
            {isRecording ? 'stop_circle' : 'mic'}
          </span>
        </button>

        {/* Etiqueta debajo del botón */}
        <p className="font-title-md font-black text-on-surface text-center">
          {isRecording ? bigMicLabelRecording : bigMicLabelIdle}
        </p>

        {/* Textarea debajo (para ver y editar lo dictado) */}
        <textarea
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={maxLength}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          disabled={disabled}
          rows={rows}
          className={`w-full min-w-0 p-3 rounded-2xl text-[15px] font-bold focus:outline-none ${className}`}
          style={{
            background: bg,
            border: `2px solid ${borderColor}`,
            color: textColor,
            resize: 'none',
            overflow: 'hidden',
            lineHeight: '1.4',
            minHeight: '1.4em',
            ...style
          }}
        />

        {errorMsg && (
          <span className="text-[11px] font-black text-center" style={{ color: '#dc2626' }}>
            ⚠️ {errorMsg}
          </span>
        )}

        {/* Panel de debug */}
        {SHOW_DEBUG && debugLog.length > 0 && (
          <div
            style={{
              width: '100%',
              padding: '8px',
              background: '#1e1b4b',
              color: '#a5f3fc',
              borderRadius: '8px',
              fontSize: '10px',
              fontFamily: 'monospace',
              lineHeight: 1.4,
              maxHeight: '180px',
              overflowY: 'auto'
            }}
          >
            <div style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '4px' }}>
              🐛 DEBUG MIC:
            </div>
            {debugLog.map((line, i) => (
              <div key={i} style={{ wordBreak: 'break-all' }}>{line}</div>
            ))}
          </div>
        )}

        <style>{`
          @keyframes micPulse {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.3); opacity: 0.1; }
          }
        `}</style>
      </div>
    );
  }

  // ============================================
  // 🎨 RENDER: VARIANTE INLINE (default)
  // ============================================
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

      {SHOW_DEBUG && debugLog.length > 0 && (
        <div
          style={{
            marginTop: '8px',
            padding: '8px',
            background: '#1e1b4b',
            color: '#a5f3fc',
            borderRadius: '8px',
            fontSize: '10px',
            fontFamily: 'monospace',
            lineHeight: 1.4,
            maxHeight: '180px',
            overflowY: 'auto'
          }}
        >
          <div style={{ color: '#fbbf24', fontWeight: 'bold', marginBottom: '4px' }}>
            🐛 DEBUG MIC:
          </div>
          {debugLog.map((line, i) => (
            <div key={i} style={{ wordBreak: 'break-all' }}>{line}</div>
          ))}
        </div>
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