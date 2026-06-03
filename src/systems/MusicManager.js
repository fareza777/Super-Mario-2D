/**
 * src/systems/MusicManager.js
 * ---------------------------------------------------------------
 * Background music & ambient menggunakan Web Audio API procedural.
 * Tidak ada file audio eksternal — semua di-generate via oscillator.
 *
 * Track BGM berdasarkan chord progression + arpeggio + bass line.
 * Ambient: white noise filtered jadi "angin".
 *
 * v11: musik ambient + BGM per-scene/per-level-range.
 * ---------------------------------------------------------------
 */

const NOTES = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50, D6: 1174.66, E6: 1318.51,
  Bb3: 233.08, Bb4: 466.16, Bb5: 932.33,
  Fs3: 185.00, Cs4: 277.18,
  REST: 0
};

const CHORDS = {
  C:  [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5],
  G:  [NOTES.G4, NOTES.B4, NOTES.D5, NOTES.G5],
  Am: [NOTES.A4, NOTES.C5, NOTES.E5, NOTES.A5],
  F:  [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.F5],
  Dm: [NOTES.D4, NOTES.F4, NOTES.A4, NOTES.D5],
  Bb: [NOTES.Bb4, NOTES.D5, NOTES.F5, NOTES.Bb5],
  Em: [NOTES.E4, NOTES.G4, NOTES.B4, NOTES.E5]
};

const BASS = {
  C:  NOTES.C3,
  G:  NOTES.G3,
  Am: NOTES.A3,
  F:  NOTES.F3,
  Dm: NOTES.D3,
  Bb: NOTES.Bb3,
  Em: NOTES.E3
};

const TRACKS = {
  adventure: {
    name: 'Adventure',
    bpm: 120,
    progression: ['C', 'G', 'Am', 'F'],
    wave: 'square',
    filter: 3000
  },
  challenge: {
    name: 'Challenge',
    bpm: 140,
    progression: ['Dm', 'Bb', 'F', 'C'],
    wave: 'sawtooth',
    filter: 2800
  },
  epic: {
    name: 'Epic',
    bpm: 150,
    progression: ['Am', 'F', 'C', 'G'],
    wave: 'sawtooth',
    filter: 2500
  },
  calm: {
    name: 'Calm',
    bpm: 80,
    progression: ['Am', 'F', 'C', 'G'],
    wave: 'triangle',
    filter: 2000
  },
  ending: {
    name: 'Ending',
    bpm: 100,
    progression: ['C', 'F', 'G', 'C'],
    wave: 'square',
    filter: 3000
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
    this.bgmEnabled = true;  // v14: BGM on/off dari settings
    this.isPlayingBGM = false;
    this.bgmTimers = [];
    this.windSource = null;
    this.windLfo = null;
  }

  init() {
    if (this.context) return;
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('[Music] Web Audio API tidak tersedia');
      return;
    }
    this.masterGain = this.context.createGain();
    this._applyGain();
    this.masterGain.connect(this.context.destination);

    this.musicGain = this.context.createGain();
    this.musicGain.gain.value = 0.35;

    this.musicFilter = this.context.createBiquadFilter();
    this.musicFilter.type = 'lowpass';
    this.musicFilter.frequency.value = 3000;
    this.musicFilter.Q.value = 0.5;

    this.musicGain.connect(this.musicFilter);
    this.musicFilter.connect(this.masterGain);

    this.ambientGain = this.context.createGain();
    this.ambientGain.gain.value = 0.15;
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

  // v14: volume 0..1
  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    this._applyGain();
  }

  getVolume() {
    return this.volume;
  }

  // v14: BGM on/off (dari SettingsScene)
  setBGMEnabled(on) {
    this.bgmEnabled = !!on;
    if (!on) {
      this.stopBGM();
      this.stopWind();
    }
  }

  isBGMEnabled() {
    return this.bgmEnabled;
  }

  // v14: dipanggil dari SoundManager.setSoundEnabled(false)
  muteForSettings() {
    this.stopBGM();
    this.stopWind();
  }

  unmuteForSettings() {
    // BGM/wind akan di-restart oleh scene berikutnya
  }

  /**
   * Mainkan BGM. Otomatis stop BGM sebelumnya.
   */
  playBGM(trackName) {
    if (!this.bgmEnabled) return;
    this.stopBGM();
    this.init();
    this.resume();

    const track = TRACKS[trackName] || TRACKS.adventure;
    if (!track) return;
    this.isPlayingBGM = true;

    if (this.musicFilter) {
      this.musicFilter.frequency.setTargetAtTime(
        track.filter, this.context.currentTime, 0.5
      );
    }

    const beatDuration = 60 / track.bpm;  // detik per beat
    const measureDuration = beatDuration * 4;  // 4 beat per measure

    let measureIdx = 0;
    const progression = track.progression;

    const playNextMeasure = () => {
      if (!this.isPlayingBGM) return;
      const chordName = progression[measureIdx % progression.length];
      const chord = CHORDS[chordName];
      if (!chord) { measureIdx++; return; }

      // Arpeggio: 4 note per measure (1 per beat)
      for (let i = 0; i < 4; i++) {
        const t = setTimeout(() => {
          if (!this.isPlayingBGM) return;
          this._playNote(chord[i], beatDuration * 0.7, track.wave, 0.12);
        }, i * beatDuration * 1000);
        this.bgmTimers.push(t);
      }

      // Bass: root note, 1 note per measure
      this._playNote(BASS[chordName], measureDuration * 0.9, 'triangle', 0.25);

      // Sub-bass (oktaf bawah) untuk richness
      this._playNote(BASS[chordName] / 2, measureDuration * 0.9, 'sine', 0.15);

      measureIdx++;
      const nextT = setTimeout(playNextMeasure, measureDuration * 1000);
      this.bgmTimers.push(nextT);
    };

    playNextMeasure();
    console.log('[Music] BGM start:', track.name);
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
    gain.gain.linearRampToValueAtTime(gainValue, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  /**
   * Ambient angin: white noise → lowpass filter, LFO modulation
   * untuk efek "gusting".
   */
  playWind() {
    if (!this.bgmEnabled) return;
    if (!this.context) return;
    if (this.windSource) return;  // sudah jalan
    this.init();

    const bufferSize = this.context.sampleRate * 3;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.6;
    }
    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 1;

    const gain = this.context.createGain();
    gain.gain.value = 0.5;

    // LFO untuk "gust" effect: modulate filter freq
    const lfo = this.context.createOscillator();
    const lfoGain = this.context.createGain();
    lfo.frequency.value = 0.15;  // gust period ~6.7 detik
    lfoGain.gain.value = 200;     // ±200Hz modulasi
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);
    noise.start();
    lfo.start();

    this.windSource = noise;
    this.windLfo = lfo;
  }

  stopWind() {
    if (this.windSource) {
      try { this.windSource.stop(); } catch (e) {}
      this.windSource = null;
    }
    if (this.windLfo) {
      try { this.windLfo.stop(); } catch (e) {}
      this.windLfo = null;
    }
  }

  stopAll() {
    this.stopBGM();
    this.stopWind();
  }
}

const music = new MusicManager();
export { music };
