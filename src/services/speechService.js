// speechService.js - Síntesis de voz con Web Speech API (nativa del navegador)

class SpeechService {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.selectedVoice = null;
    this.isSpeaking = false;

    if (this.synth) {
      // Cargar voces (pueden tardar en estar listas)
      this.loadVoices();
      if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();

    // Buscar la mejor voz en español
    const spanishVoices = this.voices.filter((v) =>
      v.lang.toLowerCase().startsWith('es')
    );

    // Preferir voces latinoamericanas o argentinas
    const preferred =
      spanishVoices.find((v) => v.lang === 'es-AR') ||
      spanishVoices.find((v) => v.lang === 'es-MX') ||
      spanishVoices.find((v) => v.lang === 'es-US') ||
      spanishVoices.find((v) => v.lang === 'es-ES') ||
      spanishVoices[0];

    this.selectedVoice = preferred || this.voices[0] || null;
  }

  isSupported() {
    return !!this.synth;
  }

  speak(text, options = {}) {
    if (!this.synth) return false;
    if (!text) return false;

    // Cortar cualquier lectura previa
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.selectedVoice?.lang || 'es-AR';
    utterance.voice = this.selectedVoice;
    utterance.rate = options.rate || 0.95; // Un poco más lento, amigable
    utterance.pitch = options.pitch || 1.1; // Un poco más agudo, amigable
    utterance.volume = options.volume || 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (options.onError) options.onError();
    };

    this.synth.speak(utterance);
    return true;
  }

  stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.isSpeaking = false;
  }
}

export const speechService = new SpeechService();