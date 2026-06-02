/**
 * src/systems/SoundManager.js
 * ---------------------------------------------------------------
 * Sound effect procedural berbasis Web Audio API. Tidak memuat
 * file audio eksternal - semua suara di-generate dengan oscillator
 * + noise. Karena kebijakan autoplay browser, AudioContext harus
 * di-resume() pada interaksi pengguna pertama (keydown/click).
 *
 * Tipe suara yang tersedia:
 *   - jump     : sweep naik pendek (saat lompat)
 *   - coin     : dua nada cepat (saat ambil koin)
 *   - stomp    : thump rendah + noise (saat injak musuh)
 *   - lose     : tiga nada turun (saat player mati)
 *   - win      : arpeggio naik (saat capai goal)
 *   - mushroom : dua nada naik (saat ambil mushroom)
 *   - star     : lima nada cepat (saat ambil star)
 *   - break    : noise burst (platform breakable hancur)
 *   - click    : klik tombol UI
 * ---------------------------------------------------------------
 */
class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.enabled = true;
    this.muted = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) {
        this.enabled = false;
        return;
      }
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.25;
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      this.enabled = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 0.25;
    }
    return this.muted;
  }

  play(type) {
    if (!this.enabled || this.muted || !this.ctx) return;
    this.resume();
    switch (type) {
      case 'jump':     this._jump();     break;
      case 'coin':     this._coin();     break;
      case 'stomp':    this._stomp();    break;
      case 'lose':     this._lose();     break;
      case 'win':      this._win();      break;
      case 'mushroom': this._mushroom(); break;
      case 'star':     this._star();     break;
      case 'break':    this._break();    break;
      case 'click':    this._click();    break;
    }
  }

  // ---- tone primitives ----

  _tone(freq, duration, type, volume) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    const v = volume != null ? volume : 0.3;
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  _sweep(f1, f2, duration, type, volume) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(f1, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(f2, this.ctx.currentTime + duration);
    const v = volume != null ? volume : 0.2;
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  _noise(duration, volume) {
    const bufferSize = Math.max(1, Math.floor(this.ctx.sampleRate * duration));
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const g = this.ctx.createGain();
    const v = volume != null ? volume : 0.2;
    g.gain.setValueAtTime(v, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    src.connect(g);
    g.connect(this.masterGain);
    src.start();
  }

  // ---- sound effects ----

  _jump() {
    this._sweep(220, 660, 0.12, 'square', 0.15);
  }

  _coin() {
    this._tone(988, 0.07, 'sine', 0.2);
    setTimeout(() => this._tone(1318, 0.1, 'sine', 0.2), 60);
  }

  _stomp() {
    this._tone(150, 0.1, 'square', 0.2);
    this._noise(0.05, 0.15);
  }

  _lose() {
    this._tone(330, 0.18, 'sawtooth', 0.2);
    setTimeout(() => this._tone(220, 0.18, 'sawtooth', 0.2), 140);
    setTimeout(() => this._tone(110, 0.3, 'sawtooth', 0.2), 280);
  }

  _win() {
    this._tone(523, 0.12, 'square', 0.2);
    setTimeout(() => this._tone(659, 0.12, 'square', 0.2), 100);
    setTimeout(() => this._tone(784, 0.12, 'square', 0.2), 200);
    setTimeout(() => this._tone(1047, 0.3, 'square', 0.2), 300);
  }

  _mushroom() {
    this._tone(440, 0.08, 'sine', 0.2);
    setTimeout(() => this._tone(660, 0.1, 'sine', 0.2), 80);
  }

  _star() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this._tone(660 + i * 110, 0.07, 'square', 0.2), i * 55);
    }
  }

  _break() {
    this._noise(0.18, 0.2);
    this._tone(200, 0.12, 'square', 0.15);
  }

  _click() {
    this._tone(800, 0.04, 'square', 0.12);
  }
}

export const sound = new SoundManager();
