/**
 * src/scenes/SettingsScene.js
 * ---------------------------------------------------------------
 * v19: GrimPass sound settings menu (dark theme).
 * Accessible from IntroScene, LevelSelectScene, and pause.
 *
 * Features:
 *   - Toggle MUSIC (BGM + ambient) — separate on/off
 *   - Toggle SOUND EFFECTS (SFX: coin, jump, enemies, etc.) — on/off
 *   - VOLUME slider (0-100%) — controls master volume (both channels)
 *   - Back button to previous scene
 *
 * Settings saved to localStorage for persistence across sessions.
 * Format: { bgmEnabled, sfxEnabled, volume }
 * ---------------------------------------------------------------
 */
import { sound } from '../systems/SoundManager.js';
import { music } from '../systems/MusicManager.js';

const STORAGE_KEY = 'grimPassSettings';

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // migrasi dari format lama (soundEnabled) ke format baru
      if (parsed.soundEnabled !== undefined &&
          parsed.bgmEnabled === undefined) {
        parsed.bgmEnabled = parsed.soundEnabled;
        parsed.sfxEnabled = parsed.soundEnabled;
        delete parsed.soundEnabled;
      }
      return parsed;
    }
  } catch (e) {}
  return { bgmEnabled: true, sfxEnabled: true, volume: 0.5 };
}

function saveSettings(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {}
}

export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  init(data) {
    this.returnTo = data && data.returnTo ? data.returnTo : 'IntroScene';
    this.returnData = data && data.returnData ? data.returnData : null;
  }

  create() {
    const cam = this.cameras.main;
    const W = cam.width;
    const H = cam.height;
    const cx = W / 2;

    // Latar
    this.add.rectangle(0, 0, W, H, 0x050010)
      .setOrigin(0, 0).setScrollFactor(0);

    // dekorasi bintang
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H);
      const isPurple = Phaser.Math.Between(0, 1) === 0;
      const s = this.add.circle(x, y, 1.5, isPurple ? 0xce93d8 : 0x80deea, 0.5);
      this.tweens.add({
        targets: s,
        alpha: 0.15,
        duration: Phaser.Math.Between(1200, 2800),
        yoyo: true,
        repeat: -1
      });
    }

    // ========== Judul ==========
    this.add.text(cx, 90, 'SETTINGS', {
      fontSize: '40px',
      color: '#ce93d8',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(cx, 130, 'Sound & Volume', {
      fontSize: '15px',
      color: '#9fa8da',
      fontFamily: 'Arial',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // ========== Muat settings tersimpan ==========
    const s = loadSettings();
    this.bgmEnabled = s.bgmEnabled !== false;
    this.sfxEnabled = s.sfxEnabled !== false;
    this.volume = s.volume != null ? s.volume : 0.5;

    // terapkan ke audio engine
    sound.setVolume(this.volume);
    sound.setSFXEnabled(this.sfxEnabled);
    music.setBGMEnabled(this.bgmEnabled);

    // ========== Panel rounded ==========
    const panelW = Math.min(W - 40, 440);
    const panelH = 390;
    const panelX = cx - panelW / 2;
    const panelY = 160;

    const panel = this.add.graphics();
    panel.fillStyle(0x0d001a, 0.85);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 14);
    panel.lineStyle(1.5, 0x7c4dff, 0.6);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 14);

    // simpan posisi slider
    this._sliderX = panelX + 30;
    this._sliderY = panelY + 270;
    this._sliderW = panelW - 60;
    this._sliderH = 8;

    // ========== Baris 1: Toggle MUSIK (BGM + ambient) ==========
    const r1Y = panelY + 55;
    this._addToggleRow(
      panelX + 30, r1Y, panelW - 60,
      'BACKGROUND MUSIC',
      'Music & ambient',
      this.bgmEnabled,
      (on) => {
        this.bgmEnabled = on;
        music.setBGMEnabled(on);
        this._saveAndApply();
        if (on) sound.play('click');
      }
    );

    // garis pemisah
    this._addDivider(panelX, panelY + 120, panelW);

    // ========== Baris 2: Toggle EFEK SUARA (SFX) ==========
    const r2Y = panelY + 145;
    this._addToggleRow(
      panelX + 30, r2Y, panelW - 60,
      'SOUND EFFECTS',
      'Coin, jump, enemies, etc.',
      this.sfxEnabled,
      (on) => {
        this.sfxEnabled = on;
        sound.setSFXEnabled(on);
        this._saveAndApply();
        if (on) sound.play('click');
      }
    );

    // garis pemisah
    this._addDivider(panelX, panelY + 210, panelW);

    // ========== Baris 3: Slider Volume ==========
    const r3Y = panelY + 235;
    this.add.text(panelX + 30, r3Y, 'VOLUME', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });

    this.volumeLabel = this.add.text(panelX + panelW - 24, r3Y, Math.round(this.volume * 100) + '%', {
      fontSize: '18px',
      color: '#80deea',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(1, 0);

    // Track slider
    const track = this.add.graphics();
    track.fillStyle(0x1a1a2e, 1);
    track.fillRoundedRect(this._sliderX, this._sliderY, this._sliderW, this._sliderH, 4);

    this.sliderFill = this.add.graphics();

    // Handle
    const handleR = 14;
    this.sliderHandle = this.add.circle(
      this._sliderX + this.volume * this._sliderW,
      this._sliderY + this._sliderH / 2,
      handleR, 0xce93d8
    ).setStrokeStyle(2, 0x000000);
    this.sliderHandle.setInteractive({ useHandCursor: true, draggable: true });
    this._drawSliderFill();

    // Drag handler
    this.input.on('pointermove', (pointer) => {
      if (!this.sliderHandle.input.dragging) return;
      const newX = Phaser.Math.Clamp(pointer.x, this._sliderX, this._sliderX + this._sliderW);
      this.sliderHandle.x = newX;
      this.volume = (newX - this._sliderX) / this._sliderW;
      this._drawSliderFill();
      this.volumeLabel.setText(Math.round(this.volume * 100) + '%');
      sound.setVolume(this.volume);
    });
    this.input.on('pointerup', () => {
      if (this.sliderHandle && this.sliderHandle.input && this.sliderHandle.input.dragging) {
        this.sliderHandle.input.dragging = false;
        this._saveAndApply();
      }
    });

    // Klik di track
    track.setInteractive(
      new Phaser.Geom.Rectangle(this._sliderX, this._sliderY - 10, this._sliderW, this._sliderH + 20),
      Phaser.Geom.Rectangle.Contains
    );
    track.on('pointerdown', (pointer) => {
      const newX = Phaser.Math.Clamp(pointer.x, this._sliderX, this._sliderX + this._sliderW);
      this.sliderHandle.x = newX;
      this.volume = (newX - this._sliderX) / this._sliderW;
      this._drawSliderFill();
      this.volumeLabel.setText(Math.round(this.volume * 100) + '%');
      sound.setVolume(this.volume);
      this._saveAndApply();
    });

    // ========== Status text ==========
    this.statusText = this.add.text(panelX + 30, panelY + panelH - 28, '', {
      fontSize: '12px',
      color: '#aaaaaa',
      fontFamily: 'Arial',
      fontStyle: 'italic'
    });
    this._updateStatus();

    // ========== Tombol Simpan & Kembali ==========
    const btnY = panelY + panelH + 35;
    const btn = this.add.rectangle(cx, btnY, 220, 48, 0x4527a0)
      .setStrokeStyle(3, 0xce93d8, 0.7)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, btnY, 'SAVE & BACK', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);

    btn.on('pointerdown', () => {
      sound.play('click');
      this._saveAndApply();
      this._goBack();
    });
    btn.on('pointerover', () => btn.setFillStyle(0x5e35b1));
    btn.on('pointerout', () => btn.setFillStyle(0x4527a0));

    // Tombol Batal
    const cancelY = btnY + 58;
    this.add.text(cx, cancelY, 'Cancel', {
      fontSize: '14px',
      color: '#9fa8da',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this._goBack())
      .on('pointerover', function() { this.setColor('#ce93d8'); })
      .on('pointerout', function() { this.setColor('#9fa8da'); });

    // Version
    this.add.text(cx, H - 10, 'v19', {
      fontSize: '10px',
      color: '#555555',
      fontFamily: 'Arial'
    }).setOrigin(0.5, 1);
  }

  // ========== helpers ==========

  _addToggleRow(x, y, w, label, sublabel, initialOn, onChange) {
    // Label
    this.add.text(x, y, label, {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    this.add.text(x, y + 24, sublabel, {
      fontSize: '11px',
      color: '#90a4ae',
      fontFamily: 'Arial'
    });

    // Toggle di kanan
    const toggleW = 64;
    const toggleH = 30;
    const toggleX = x + w - toggleW;
    const toggleY = y;

    const bg = this.add.graphics();
    bg.setInteractive(
      new Phaser.Geom.Rectangle(toggleX, toggleY, toggleW, toggleH),
      Phaser.Geom.Rectangle.Contains
    );
    this._drawToggle(bg, toggleX, toggleY, toggleW, toggleH, initialOn);

    bg.on('pointerdown', () => {
      const newOn = !this._isToggleOn(bg, toggleX, toggleW);
      this._drawToggle(bg, toggleX, toggleY, toggleW, toggleH, newOn);
      onChange(newOn);
      this._updateStatus();
    });
  }

  _isToggleOn(g, x, w) {
    // bandingkan warna background: hijau (4caf50) = on, abu (555555) = off
    // pendekatan sederhana: cek x posisi handle
    // tapi karena handle digambar ulang, kita track via fillStyle
    // untuk simplicity, kita pakai state terakhir yang disimpan di g
    return g._toggleState !== false;
  }

  _addDivider(panelX, y, panelW) {
    const line = this.add.graphics();
    line.lineStyle(1, 0xffffff, 0.08);
    line.lineBetween(panelX + 20, y, panelX + panelW - 20, y);
  }

  _drawToggle(g, x, y, w, h, on) {
    g.clear();
    g.fillStyle(on ? 0x7c4dff : 0x424242, 1);
    g.fillRoundedRect(x, y, w, h, h / 2);
    g.lineStyle(1, 0xce93d8, 0.3);
    g.strokeRoundedRect(x, y, w, h, h / 2);
    const handleX = on ? (x + w - h / 2 - 3) : (x + h / 2 + 3);
    const handleY = y + h / 2;
    g.fillStyle(0xe0e0e0, 1);
    g.fillCircle(handleX, handleY, h / 2 - 4);
    g._toggleState = !!on;
  }

  _drawSliderFill() {
    this.sliderFill.clear();
    this.sliderFill.fillStyle(0x7c4dff, 1);
    this.sliderFill.fillRoundedRect(
      this._sliderX, this._sliderY - this._sliderH / 2,
      this.volume * this._sliderW, this._sliderH * 2, 4
    );
  }

  _updateStatus() {
    if (!this.bgmEnabled && !this.sfxEnabled) {
      this.statusText.setText('All sound is off');
      this.statusText.setColor('#9fa8da');
    } else if (this.volume === 0) {
      this.statusText.setText('Volume 0% — not audible');
      this.statusText.setColor('#9fa8da');
    } else if (this.bgmEnabled && this.sfxEnabled) {
      this.statusText.setText('Music & sound effects active');
      this.statusText.setColor('#ce93d8');
    } else if (this.bgmEnabled) {
      this.statusText.setText('Only background music active');
      this.statusText.setColor('#80deea');
    } else {
      this.statusText.setText('Only sound effects active');
      this.statusText.setColor('#ce93d8');
    }
  }

  _saveAndApply() {
    saveSettings({
      bgmEnabled: this.bgmEnabled,
      sfxEnabled: this.sfxEnabled,
      volume: this.volume
    });
    this._updateStatus();
  }

  _goBack() {
    if (this.returnTo === 'GameScene') {
      this.scene.start('GameScene', this.returnData || { level: 1 });
    } else {
      this.scene.start(this.returnTo);
    }
  }
}
