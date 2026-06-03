/**
 * src/systems/MusicManager.js
 * ---------------------------------------------------------------
 * Background music & ambient (GrimPass — dark fantasy) via Web
 * Audio API procedural. Tidak ada file audio eksternal.
 *
 * Skala musik: minor dengan interval Phrygian/Locrian (b2, b6)
 * untuk nuansa misterius & mencekam. Progresi chord banyak
 * menggunakan diminished & minor untuk nuansa gelap.
 *
 * Ambient: "abyss hum" — drone bertingkat (3-4 oscillator detune)
 * + lowpass sweep lambat + occasional distant bell toll.
 *
 * v17: rebrand musik ke dark fantasy.
 * ---------------------------------------------------------------
 */

const NOTES = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51,
  Bb2: 116.54, Bb3: 233.08, Bb4: 466.16, Bb5: 932.33,
  Fs2: 92.50, Fs3: 185.00, Fs4: 369.99,
  Cs3: 138.59, Cs4: 277.18, Cs5: 554.37,
  REST: 0
};

const CHORDS = {
  // minor (dark)
  Am: [NOTES.A3, NOTES.C4, NOTES.E4, NOTES.A4],
  Dm: [NOTES.D3, NOTES.F4, NOTES.A4, NOTES.D5],
  Em: [NOTES.E3, NOTES.G3, NOTES.B3, NOTES.E4],
  Cm: [NOTES.C3, NOTES.Eb4_alt, NOTES.G4, NOTES.C5],
  // phrygian bII (Neapolitan) — nuansa arabian/dark
  Bb: [NOTES.Bb3, NOTES.D4, NOTES.F4, NOTES.Bb4],
  // major (sedikit harapan)
  C:  [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5],
  F:  [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.F5],
  G:  [NOTES.G4, NOTES.B4, NOTES.D5, NOTES.G5]
};

// Catatan Eb untuk Cm chord (karena NOTES tidak punya Eb)
const Eb4_alt = 311.13;
const Eb5_alt = 622.25;

const BASS = {
  Am: NOTES.A2,
  Dm: NOTES.D2,
  Em: NOTES.E2,
  Cm: NOTES.C2,
  Bb: NOTES.Bb2,
  C:  NOTES.C2,
  F:  NOTES.F2,
  G:  NOTES.G2
};

const TRACKS = {
  // used di level 1-30 (biasa)
  passage: {
    name: 'Passage',
    bpm: 70,
    progression: ['Am', 'Bb', 'C', 'Dm'],
    wave: 'triangle',
    filter: 1400
  },
  // level 31-60 (menantang)
  pursuit: {
    name: 'Pursuit',
    bpm: 110,
    progression: ['Dm', 'Bb', 'F', 'C'],
    wave: 'sawtooth',
    filter: 1800
  },
  // level 61-90 (intens)
  cursed: {
    name: 'Cursed',
    bpm: 120,
    progression: ['Cm', 'Bb', 'F', 'G'],
    wave: 'sawtooth',
    filter: 1600
  },
  // cutscene
  whisper: {
    name: 'Whisper',
    bpm: 50,
    progression: ['Am', 'F', 'C', 'G'],
    wave: 'sine',
    filter: 900
  },
  // ending
  peace: {
    name: 'Peace',
    bpm: 70,
    progression: ['F', 'C', 'G', 'Am'],
    wave: 'sine',
    filter: 1600
  }
};

class MusicManager {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.musicGain = null;
    this.musicFilter = null;
    this.ambientGain = null;
    this.muted = false;
    this.volume = 0.5;
    this.bgmEnabled = true;
    this.isPlayingBGM = false;
    this.bgmTimers = [];
    this.droneSources = [];
    this.bellTimers = [];
  }

  init() {
    if (this.context) return;
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('[Music] Web Audio API unavailable');
      return;
    }
    this.masterGain = this.context.createGain();
    this._applyGain();
    this.masterGain.connect(this.context.destination);

    this.musicGain = this.context.createGain();
    this.musicGain.gain.value = 0.32;

    this.musicFilter = this.context.createBiquadFilter();
    this.musicFilter.type = 'lowpass';
    this.musicFilter.frequency.value = 1400;
    this.musicFilter.Q.value = 0.7;

    this.musicGain.connect(this.musicFilter);
    this.musicFilter.connect(this.masterGain);

    this.ambientGain = this.context.createGain();
    this.ambientGain.gain.value = 0.18;
    this.ambientGain.connect(this.masterGain);
  }

  _applyGain() {
    if (!this.masterGain) return;
    this.masterGain.gain.value = this.muted ? 0 : this.volume;
  }

  resume() {
    if (this.context && this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
    this._applyGain();
  }

  isMuted() {
    return this.muted;
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    this._applyGain();
  }

  getVolume() {
    return this.volume;
  }

  setBGMEnabled(on) {
    this.bgmEnabled = !!on;
    if (!on) {
      this.stopBGM();
      this.stopAmbient();
    }
  }

  isBGMEnabled() {
    return this.bgmEnabled;
  }

  muteForSettings() {
    this.stopBGM();
    this.stopAmbient();
  }

  unmuteForSettings() {
    // BGM/wind akan di-restart oleh scene berikutnya
  }

  playBGM(trackName) {
    if (!this.bgmEnabled) return;
    this.stopBGM();
    this.init();
    this.resume();

    const track = TRACKS[trackName] || TRACKS.passage;
    if (!track) return;
    this.isPlayingBGM = true;

    if (this.musicFilter) {
      this.musicFilter.frequency.setTargetAtTime(
        track.filter, this.context.currentTime, 0.5
      );
    }

    const beatDuration = 60 / track.bpm;
    const measureDuration = beatDuration * 4;

    let measureIdx = 0;
    const progression = track.progression;

    const playNextMeasure = () => {
      if (!this.isPlayingBGM) return;
      const chordName = progression[measureIdx % progression.length];
      const chord = CHORDS[chordName];
      if (!chord) { measureIdx++; return; }

      // Arpeggio: 4 note per measure, 1 per beat
      // v17: lebih pelan (0.6 sustain) untuk nuansa gelap
      for (let i = 0; i < 4; i++) {
        const t = setTimeout(() => {
          if (!this.isPlayingBGM) return;
          this._playNote(chord[i], beatDuration * 0.85, track.wave, 0.10);
        }, i * beatDuration * 1000);
        this.bgmTimers.push(t);
      }

      // Bass: root note
      this._playNote(BASS[chordName], measureDuration * 0.95, 'triangle', 0.22);

      // Sub-bass (1 oktaf di bawah)
      this._playNote(BASS[chordName] / 2, measureDuration * 0.95, 'sine', 0.14);

      measureIdx++;
      const nextT = setTimeout(playNextMeasure, measureDuration * 1000);
      this.bgmTimers.push(nextT);
    };

    playNextMeasure();
    console.log('[Music v17] BGM start:', track.name);
  }

  stopBGM() {
    this.isPlayingBGM = false;
    this.bgmTimers.forEach(t => clearTimeout(t));
    this.bgmTimers = [];
  }

  _playNote(freq, duration, type, gainValue) {
    if (!this.context || freq === 0 || freq === NOTES.REST) return;
    const now = this.context.currentTime;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainValue, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  /**
   * v17: ambient "abyss hum" — layered detuned drone + lowpass
   * sweep. Bukan "angin" lagi, tapi "kekosongan bernyanyi".
   * Plus occasional distant bell toll.
   */
  playAmbient() {
    if (!this.bgmEnabled) return;
    if (!this.context) return;
    if (this.droneSources.length > 0) return;
    this.init();

    // ========== Layer 1: low drone (A1 = 55Hz) ==========
    const droneFreq = 55.00;  // A1
    const drone = this.context.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = droneFreq;

    // detune LFO untuk gerakan drone
    const droneLfo = this.context.createOscillator();
    const droneLfoGain = this.context.createGain();
    droneLfo.frequency.value = 0.08;
    droneLfoGain.gain.value = 4;  // ±4 cents detune
    droneLfo.connect(droneLfoGain);
    droneLfoGain.connect(drone.detune);

    // ========== Layer 2: mid drone (A2 = 110Hz, oktaf 5th) ==========
    const drone2 = this.context.createOscillator();
    drone2.type = 'triangle';
    drone2.frequency.value = droneFreq * 2;

    // ========== Layer 3: high shimmer (A3, lembut) ==========
    const drone3 = this.context.createOscillator();
    drone3.type = 'sine';
    drone3.frequency.value = droneFreq * 4;
    const drone3Gain = this.context.createGain();
    drone3Gain.gain.value = 0.3;  // very quiet

    // ========== Filter: lowpass dengan LFO sweep ==========
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    filter.Q.value = 2.0;

    const filterLfo = this.context.createOscillator();
    const filterLfoGain = this.context.createGain();
    filterLfo.frequency.value = 0.05;  // 20 detik periode
    filterLfoGain.gain.value = 250;    // ±250Hz sweep
    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(filter.frequency);

    // ========== Master ambient gain ==========
    const ambientMaster = this.context.createGain();
    ambientMaster.gain.value = 0.7;

    drone.connect(filter);
    drone2.connect(filter);
    drone3.connect(drone3Gain).connect(filter);
    filter.connect(ambientMaster);
    ambientMaster.connect(this.ambientGain);

    drone.start();
    drone2.start();
    drone3.start();
    droneLfo.start();
    filterLfo.start();

    this.droneSources.push(drone, drone2, drone3, droneLfo, filterLfo);

    // ========== Distant bell toll (setiap 12-18 detik) ==========
    const scheduleBell = () => {
      if (this.droneSources.length === 0) return;
      const delay = 12000 + Math.random() * 6000;  // 12-18 detik
      const t = setTimeout(() => {
        this._playBell();
        scheduleBell();
      }, delay);
      this.bellTimers.push(t);
    };
    scheduleBell();
  }

  _playBell() {
    if (!this.context) return;
    const now = this.context.currentTime;

    // bell: 2-3 harmonic sinusoid dengan decay panjang
    const harmonics = [
      { freq: 220,  gain: 0.18, decay: 4.0 },  // A3 fundamental
      { freq: 440,  gain: 0.10, decay: 2.5 },  // A4 overtone
      { freq: 660,  gain: 0.06, decay: 1.5 }   // E5 overtone
    ];

    harmonics.forEach(h => {
      const osc = this.context.createOscillator();
      const g = this.context.createGain();
      osc.type = 'sine';
      osc.frequency.value = h.freq;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(h.gain, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + h.decay);
      osc.connect(g);
      g.connect(this.ambientGain);
      osc.start(now);
      osc.stop(now + h.decay + 0.1);
    });
  }

  stopAmbient() {
    this.droneSources.forEach(src => {
      try { src.stop(); } catch (e) {}
    });
    this.droneSources = [];
    this.bellTimers.forEach(t => clearTimeout(t));
    this.bellTimers = [];
  }

  // backward-compat alias (beberapa scene masih panggil playWind)
  playWind() { this.playAmbient(); }
  stopWind() { this.stopAmbient(); }

  stopAll() {
    this.stopBGM();
    this.stopAmbient();
  }
}

const music = new MusicManager();
export { music };
