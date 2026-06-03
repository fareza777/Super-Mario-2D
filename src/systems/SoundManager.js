/**
 * src/systems/SoundManager.js
 * ---------------------------------------------------------------
 * Sound effect procedural (GrimPass — dark fantasy) via Web Audio
 * API. Tidak memuat file audio eksternal.
 *
 * Karakter SFX v17: creepy/ethereal — banyak triangle/sine
 * dengan decay panjang (reverb-like), minor intervals, dan
 * sweep lambat. Menghindari square wave yang terlalu "gamey".
 *
 * Tipe suara:
 *   - jump     : sweep naik lembut, seperti melayang
 *   - coin     : bell lembut (3 harmonik) — soul orb diambil
 *   - stomp    : thump dalam + noise — musuh dikalahkan
 *   - lose     : descent minor 3 nada, creepy
 *   - win      : ascending major 4 nada — kelegaan
 *   - power    : ascending chime (untuk Heart Shard)
 *   - cloak    : shimmer ascending 5 nada (untuk Shadow Cloak)
 *   - break    : noise burst + low thump (Cursed Wood pecah)
 *   - click    : tick halus untuk UI
 *   - portal   : descending sweep dengan noise (Soul Gate)
 * ---------------------------------------------------------------
 */
import { music } from './MusicManager.js';

class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.enabled = true;
    this.muted = false;
    this.volume = 0.5;
    this.sfxEnabled = true;
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
      this._applyGain();
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      this.enabled = false;
    }
  }

  _applyGain() {
    if (!this.masterGain) return;
    const v = (this.sfxEnabled && !this.muted) ? this.volume : 0;
    this.masterGain.gain.value = v;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    this._applyGain();
    if (music) music.setMuted(this.muted);
    return this.muted;
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    this._applyGain();
  }

  getVolume() {
    return this.volume;
  }

  setSFXEnabled(on) {
    this.sfxEnabled = !!on;
    this._applyGain();
  }

  isSFXEnabled() {
    return this.sfxEnabled;
  }

  play(type) {
    if (!this.enabled || this.muted || !this.sfxEnabled || !this.ctx) return;
    this.resume();
    switch (type) {
      case 'jump':     this._jump();     break;
      case 'coin':     this._coin();     break;
      case 'stomp':    this._stomp();    break;
      case 'lose':     this._lose();     break;
      case 'win':      this._win();      break;
      case 'mushroom': this._power();    break;
      case 'star':     this._cloak();    break;
      case 'break':    this._break();    break;
      case 'click':    this._click();    break;
      case 'portal':   this._portal();   break;
    }
  }

  // ---- tone primitives ----

  _tone(freq, duration, type, volume, attackTime) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    const v = volume != null ? volume : 0.3;
    const at = attackTime != null ? attackTime : 0.015;
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(v, this.ctx.currentTime + at);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  _sweep(f1, f2, duration, type, volume) {
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(f1, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(f2, this.ctx.currentTime + duration);
    const v = volume != null ? volume : 0.2;
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  _noise(duration, volume, filterFreq) {
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

    if (filterFreq) {
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = filterFreq;
      src.connect(filter);
      filter.connect(g);
    } else {
      src.connect(g);
    }
    g.connect(this.masterGain);
    src.start();
  }

  // ---- sound effects (v17 dark fantasy) ----

  // jump: sweep naik halus, triangle, seperti melayang
  _jump() {
    this._sweep(180, 540, 0.18, 'triangle', 0.15);
  }

  // coin (soul orb): bell lembut 2 nada
  _coin() {
    this._tone(880, 0.18, 'sine', 0.18, 0.005);
    setTimeout(() => this._tone(1175, 0.22, 'sine', 0.18, 0.005), 70);
  }

  // stomp (Shadow Crawler dikalahkan): thump dalam + noise
  _stomp() {
    this._tone(110, 0.15, 'sine', 0.22, 0.005);
    this._noise(0.08, 0.15, 800);
  }

  // lose (jiwa padam): descent minor 3 nada, creepy
  _lose() {
    this._tone(330, 0.22, 'triangle', 0.20, 0.01);
    setTimeout(() => this._tone(247, 0.22, 'triangle', 0.20, 0.01), 160);
    setTimeout(() => this._tone(165, 0.4, 'triangle', 0.20, 0.01), 320);
  }

  // win (capai Soul Gate): ascending major 4 nada
  _win() {
    this._tone(523, 0.15, 'sine', 0.20, 0.01);
    setTimeout(() => this._tone(659, 0.15, 'sine', 0.20, 0.01), 120);
    setTimeout(() => this._tone(784, 0.15, 'sine', 0.20, 0.01), 240);
    setTimeout(() => this._tone(1047, 0.4, 'sine', 0.20, 0.01), 360);
  }

  // power (Heart Shard): ascending chime lembut
  _power() {
    this._tone(440, 0.12, 'sine', 0.20, 0.005);
    setTimeout(() => this._tone(554, 0.12, 'sine', 0.20, 0.005), 100);
    setTimeout(() => this._tone(659, 0.18, 'sine', 0.20, 0.005), 200);
  }

  // cloak (Shadow Cloak): shimmer ascending 5 nada
  _cloak() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => this._tone(440 + i * 110, 0.10, 'sine', 0.18, 0.005), i * 70);
    }
  }

  // break (Cursed Wood pecah): noise burst + low thump
  _break() {
    this._noise(0.22, 0.20, 1500);
    this._tone(140, 0.18, 'square', 0.15, 0.005);
  }

  // click (UI): tick halus
  _click() {
    this._tone(900, 0.035, 'sine', 0.10, 0.003);
  }

  // portal (Soul Gate saat capai): descending sweep + noise
  _portal() {
    this._sweep(800, 200, 0.6, 'sawtooth', 0.12);
    this._noise(0.5, 0.06, 600);
  }
}

export const sound = new SoundManager();
