/**
 * src/scenes/SettingsScene.js
 * ---------------------------------------------------------------
 * v14: Menu pengaturan suara. Bisa diakses dari IntroScene,
 * LevelSelectScene, dan pause overlay GameScene.
 *
 * Fitur:
 *   - Toggle Suara (master on/off) — hide/show kedua SFX & BGM
 *   - Slider Volume (0-100%) — mengatur volume master
 *   - Tombol Kembali ke scene sebelumnya
 *
 * Settings disimpan ke localStorage agar persisten antar sesi.
 * ---------------------------------------------------------------
 */
import { sound } from '../systems/SoundManager.js';
import { music } from '../systems/MusicManager.js';

const STORAGE_KEY = 'marioGameSettings';

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { soundEnabled: true, volume: 0.5 };
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
    const isMobile = W < 700;

    // Latar
    this.add.rectangle(0, 0, W, H, 0x1a1a2e)
      .setOrigin(0, 0).setScrollFactor(0);

    // dekorasi bintang
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H);
      const s = this.add.circle(x, y, 1.5, 0xffffff, 0.5);
      this.tweens.add({
        targets: s,
        alpha: 0.15,
        duration: Phaser.Math.Between(1200, 2800),
        yoyo: true,
        repeat: -1
      });
    }

    // ========== Judul ==========
    this.add.text(cx, 100, 'PENGATURAN', {
      fontSize: '42px',
      color: '#ffeb3b',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(cx, 145, 'Suara & Volume', {
      fontSize: '16px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // ========== Muat settings tersimpan ==========
    const s = loadSettings();
    this.soundEnabled = s.soundEnabled;
    this.volume = s.volume;

    // terapkan ke audio engine
    sound.setVolume(this.volume);
    sound.setSoundEnabled(this.soundEnabled);

    // ========== Panel rounded ==========
    const panelW = Math.min(W - 40, 440);
    const panelH = 320;
    const panelX = cx - panelW / 2;
    const panelY = 180;

    const panel = this.add.graphics();
    panel.fillStyle(0x0d1b2a, 0.8);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 14);
    panel.lineStyle(1.5, 0x4caf50, 0.5);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 14);

    // simpan posisi untuk dipakai ulang di _drawSliderFill
    this._sliderX = panelX + 30;
    this._sliderY = panelY + 200;
    this._sliderW = panelW - 60;
    this._sliderH = 8;

    // ========== Baris 1: Toggle Suara ==========
    const r1Y = panelY + 60;
    this.add.text(panelX + 30, r1Y, 'SUARA', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });

    this.add.text(panelX + 30, r1Y + 26, 'Efek suara & musik', {
      fontSize: '12px',
      color: '#90a4ae',
      fontFamily: 'Arial'
    });

    // Toggle (rounded rect dengan handle yang bergerak)
    const toggleW = 70;
    const toggleH = 32;
    const toggleX = panelX + panelW - toggleW - 24;
    const toggleY = r1Y - 4;

    this.toggleBg = this.add.graphics();
    this.toggleBg.setInteractive(
      new Phaser.Geom.Rectangle(toggleX, toggleY, toggleW, toggleH),
      Phaser.Geom.Rectangle.Contains
    );
    this._drawToggle(this.toggleBg, toggleX, toggleY, toggleW, toggleH, this.soundEnabled);

    this.toggleBg.on('pointerdown', () => {
      this.soundEnabled = !this.soundEnabled;
      sound.setSoundEnabled(this.soundEnabled);
      this._drawToggle(this.toggleBg, toggleX, toggleY, toggleW, toggleH, this.soundEnabled);
      this._saveAndApply();
      if (this.soundEnabled) sound.play('click');
    });

    // ========== Baris 2: Slider Volume ==========
    const r2Y = panelY + 150;
    this.add.text(panelX + 30, r2Y, 'VOLUME', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });

    this.volumeLabel = this.add.text(panelX + panelW - 24, r2Y, Math.round(this.volume * 100) + '%', {
      fontSize: '18px',
      color: '#ffeb3b',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(1, 0);

    // Track slider
    const track = this.add.graphics();
    track.fillStyle(0x333333, 1);
    track.fillRoundedRect(this._sliderX, this._sliderY, this._sliderW, this._sliderH, 4);

    // Fill (bagian yang sudah diisi)
    this.sliderFill = this.add.graphics();

    // Handle (lingkaran draggable)
    const handleR = 14;
    this.sliderHandle = this.add.circle(
      this._sliderX + this.volume * this._sliderW,
      this._sliderY + this._sliderH / 2,
      handleR, 0xffeb3b
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

    // Klik di track untuk set volume langsung
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

    // ========== Baris 3: Status BGM ==========
    const r3Y = panelY + 230;
    this.bgmStatus = this.add.text(panelX + 30, r3Y, '', {
      fontSize: '13px',
      color: '#aaaaaa',
      fontFamily: 'Arial',
      fontStyle: 'italic'
    });
    this._updateBgmStatus();

    // ========== Tombol Kembali ==========
    const btnY = panelY + panelH + 40;
    const btn = this.add.rectangle(cx, btnY, 220, 52, 0x4caf50)
      .setStrokeStyle(3, 0xffffff, 0.6)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, btnY, 'SIMPAN & KEMBALI', {
      fontSize: '20px',
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
    btn.on('pointerover', () => btn.setFillStyle(0x66bb6a));
    btn.on('pointerout', () => btn.setFillStyle(0x4caf50));

    // Tombol Batal
    const cancelY = btnY + 65;
    this.add.text(cx, cancelY, 'Kembali tanpa simpan', {
      fontSize: '14px',
      color: '#888888',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this._goBack())
      .on('pointerover', function() { this.setColor('#bbbbbb'); })
      .on('pointerout', function() { this.setColor('#888888'); });

    // Version
    this.add.text(cx, H - 12, 'v14', {
      fontSize: '10px',
      color: '#555555',
      fontFamily: 'Arial'
    }).setOrigin(0.5, 1);
  }

  _drawToggle(g, x, y, w, h, on) {
    g.clear();
    // background
    g.fillStyle(on ? 0x4caf50 : 0x555555, 1);
    g.fillRoundedRect(x, y, w, h, h / 2);
    g.lineStyle(1, 0xffffff, 0.2);
    g.strokeRoundedRect(x, y, w, h, h / 2);
    // handle
    const handleX = on ? (x + w - h / 2 - 3) : (x + h / 2 + 3);
    const handleY = y + h / 2;
    g.fillStyle(0xffffff, 1);
    g.fillCircle(handleX, handleY, h / 2 - 4);
  }

  _drawSliderFill() {
    this.sliderFill.clear();
    this.sliderFill.fillStyle(0x4caf50, 1);
    this.sliderFill.fillRoundedRect(
      this._sliderX, this._sliderY - this._sliderH / 2,
      this.volume * this._sliderW, this._sliderH * 2, 4
    );
  }

  _updateBgmStatus() {
    if (!this.soundEnabled) {
      this.bgmStatus.setText('Semua suara dimatikan');
      this.bgmStatus.setColor('#888888');
    } else if (this.volume === 0) {
      this.bgmStatus.setText('Volume 0% — tidak terdengar');
      this.bgmStatus.setColor('#888888');
    } else {
      this.bgmStatus.setText('Musik latar dan efek suara aktif');
      this.bgmStatus.setColor('#90ee90');
    }
  }

  _saveAndApply() {
    saveSettings({ soundEnabled: this.soundEnabled, volume: this.volume });
    this._updateBgmStatus();
  }

  _goBack() {
    if (this.returnTo === 'GameScene') {
      this.scene.start('GameScene', this.returnData || { level: 1 });
    } else {
      this.scene.start(this.returnTo);
    }
  }
}
