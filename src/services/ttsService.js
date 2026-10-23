// src/services/ttsService.js

class TTSService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.isMuted = localStorage.getItem('sparky_tts_muted') === 'true';
    this.queue = [];
    this.isPlaying = false;
    this.onStateChange = null; 
    this.voicesLoaded = false;

    // Cargar voces de forma asíncrona (a veces el navegador tarda en cargarlas)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.voicesLoaded = true;
      };
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    localStorage.setItem('sparky_tts_muted', muted);
    if (muted) this.stop();
    if (this.onStateChange) this.onStateChange(this.isPlaying, this.isMuted);
  }

  // 🔑 Lógica para buscar la mejor voz masculina disponible
  getBestMaleVoice() {
    const voices = this.synth.getVoices();
    // Filtramos solo las voces en español
    const spanishVoices = voices.filter(v => v.lang.startsWith('es'));

    if (spanishVoices.length === 0) return null;

    // 1. Buscamos por palabras clave conocidas de voces masculinas (Windows, Android, iOS)
    const maleKeywords = ['male', 'hombre', 'pablo', 'raul', 'jorge', 'diego', 'carlos', 'enrique'];
    const maleVoice = spanishVoices.find(v => 
      maleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
    );
    if (maleVoice) return maleVoice;

    // 2. Si no encontramos por nombre, intentamos preferir es-AR, es-MX o es-US
    const latamVoice = spanishVoices.find(v => v.lang === 'es-AR' || v.lang === 'es-MX' || v.lang === 'es-US');
    if (latamVoice) return latamVoice;

    // 3. Si no, devolvemos la primera en español
    return spanishVoices[0];
  }

  speak(texts, onEndCallback) {
    if (this.isMuted) return;
    if (!texts || (Array.isArray(texts) && texts.length === 0)) return;

    this.stop(); 
    this.queue = Array.isArray(texts) ? texts.filter(t => t && t.trim()) : [texts];
    this.onEnd = onEndCallback;
    this.isPlaying = true;
    if (this.onStateChange) this.onStateChange(true, this.isMuted);

    this.playNext();
  }

  playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      if (this.onStateChange) this.onStateChange(false, this.isMuted);
      if (this.onEnd) this.onEnd();
      return;
    }

    const text = this.queue.shift();
    const utterance = new SpeechSynthesisUtterance(text);

    const bestVoice = this.getBestMaleVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else {
      utterance.lang = 'es-ES';
    }

    // 🔑 CONFIGURACIÓN PARA PERRO MASCULINO
    utterance.pitch = 0.8;    // Tono más grave (efecto perro grande)
    utterance.rate = 0.95;    // Un poquito más pausado
    utterance.volume = 1;

    utterance.onend = () => {
      setTimeout(() => this.playNext(), 400); 
    };

    utterance.onerror = (e) => {
      console.error('Error en TTS:', e);
      this.playNext();
    };

    this.synth.speak(utterance);
  }

  stop() {
    if ('speechSynthesis' in window) {
      this.synth.cancel();
    }
    this.queue = [];
    this.isPlaying = false;
    if (this.onStateChange) this.onStateChange(false, this.isMuted);
  }
}

export const ttsService = new TTSService();