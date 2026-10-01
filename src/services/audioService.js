// Web Audio API Sound Synthesizer + Reproducción de archivos de audio

class AudioService {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.ambientNode = null;
    this.ambientGain = null;
    this.barkAudio = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setEnabled(val) {
    this.enabled = val;
    if (!val && this.ambientNode) {
      this.stopAmbient();
    }
  }

  playBark() {
    if (!this.enabled) return;
    try {
      if (!this.barkAudio) {
        this.barkAudio = new Audio('/sounds/bark.wav');
        this.barkAudio.preload = 'auto';
      }
      this.barkAudio.currentTime = 0;
      this.barkAudio.volume = 0.8;
      this.barkAudio.play().catch(() => {});
    } catch (e) {}
  }

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.04);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  playPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  }

  playReminderNudge() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const tones = [880.0, 1174.66];
    tones.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.14;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.28, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  playPomodoroAlarm() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [587.33, 739.99, 880.0, 1174.66];
    chords.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    });
  }

  // ============================================
  // TONOS DE ALARMA (5 estilos)
  // ============================================

  // 🎵 Campanita — default, suave
  playAlarm_campanita() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [587.33, 739.99, 880.0, 1174.66];
    chords.forEach((freq) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    });
  }

  // ☎️ Llamada — beep-beep-beep repetido
  playAlarm_llamada() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 3 beeps por ciclo, 2 ciclos
    for (let ciclo = 0; ciclo < 2; ciclo++) {
      for (let i = 0; i < 3; i++) {
        const startTime = now + ciclo * 1.2 + i * 0.2;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, startTime);

        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.setValueAtTime(0.4, startTime + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.15);
      }
    }
  }

  // 🐶 Ladrido — bark + tono ascendente
  playAlarm_ladrido() {
    if (!this.enabled) return;

    // Reproducir el bark
    try { this.playBark(); } catch (e) {}

    // Y agregar un tono ascendente encima
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + 0.3;
    const notes = [392, 523.25, 659.25];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // 🚨 Urgente — despertador fuerte, repetitivo
  playAlarm_urgente() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 4 pulsos fuertes
    for (let i = 0; i < 4; i++) {
      const startTime = now + i * 0.25;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1046.5, startTime);

      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.setValueAtTime(0.35, startTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.2);
    }
  }

  // 🎶 Melodía — 4 notas ascendentes amables
  playAlarm_melodia() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [587.33, 739.99, 880.0, 1174.66];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.18;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.35, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.6);
    });
  }

  // 🎯 Dispatcher — toca el sonido según el tipo
  playAlarm(type = 'campanita') {
    switch (type) {
      case 'llamada':
        return this.playAlarm_llamada();
      case 'ladrido':
        return this.playAlarm_ladrido();
      case 'urgente':
        return this.playAlarm_urgente();
      case 'melodia':
        return this.playAlarm_melodia();
      case 'campanita':
      default:
        return this.playAlarm_campanita();
    }
  }

  // 🆕 Tono puro a una frecuencia dada (para Simon Dice y otros juegos)
  playTone(freq = 440, duration = 0.35) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  playError() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  startAmbient(type = 'whitenoise') {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    this.stopAmbient();

    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut * 0.95) + (white * 0.05);
      data[i] = type === 'rain' ? lastOut * 3 : white * 0.5;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
    filter.frequency.setValueAtTime(type === 'rain' ? 650 : 850, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.ctx.destination);

    noise.start();
    this.ambientNode = noise;
  }

  stopAmbient() {
    if (this.ambientNode) {
      try {
        this.ambientNode.stop();
        this.ambientNode.disconnect();
      } catch (e) {}
      this.ambientNode = null;
    }
  }
}

export const audioService = new AudioService();