/**
 * src/scenes/LevelSelectScene.js
 * ---------------------------------------------------------------
 * Menu pilih level. Mendukung 100 level (Fase 3) dengan scroll
 * (mouse wheel). Status "selesai" dan skor terbaik dibaca dari
 * LevelManager (localStorage).
 * ---------------------------------------------------------------
 */
import { levels } from '../data/levels.js';
import LevelManager from '../systems/LevelManager.js';

export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  create() {
    this.createBackground();
    this.createTitle();
    this.createLevelList();
    this.createScrollHint();
    this.createFooter();
    this.setupScroll();
  }

  createBackground() {
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x1a237e)
      .setOrigin(0, 0).setScrollFactor(0);
  }

  createTitle() {
    this.add.text(300, 50, 'PILIH LEVEL', {
      fontSize: '40px',
      color: '#ffeb3b',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(300, 92, 'Petualangan Mario - 100 Level', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }

  createLevelList() {
    this.listContainer = this.add.container(0, 0);
    const startY = 130;
    const itemHeight = 50;

    levels.forEach((level, i) => {
      const y = startY + i * itemHeight;
      const completed = LevelManager.isCompleted(level.id);
      const bestScore = LevelManager.getBestScore(level.id);
      const color = completed ? 0x2e7d32 : 0x1565c0;

      const rect = this.add.rectangle(300, y, 500, 40, color);
      rect.setStrokeStyle(2, 0xffffff, 0.3);
      rect.setInteractive({ useHandCursor: true });

      const numText = this.add.text(120, y, String(level.id).padStart(3, '0'), {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#000',
        strokeThickness: 3
      }).setOrigin(0.5);

      const nameText = this.add.text(150, y, level.name, {
        fontSize: '17px',
        color: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#000',
        strokeThickness: 3
      }).setOrigin(0, 0.5);

      const statusText = completed ? ('Selesai  ' + bestScore) : 'Belum';
      const statusTxt = this.add.text(560, y, statusText, {
        fontSize: '14px',
        color: completed ? '#ffeb3b' : '#cccccc',
        fontFamily: 'Arial',
        stroke: '#000',
        strokeThickness: 2
      }).setOrigin(1, 0.5);

      rect.on('pointerdown', () => this.startLevel(level.id));
      rect.on('pointerover', () => rect.setFillStyle(0x42a5f5));
      rect.on('pointerout', () => rect.setFillStyle(color));

      this.listContainer.add([rect, numText, nameText, statusTxt]);
    });
  }

  createScrollHint() {
    this.add.text(580, 110, '↕ scroll', {
      fontSize: '12px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(1, 0);

    // v14: tombol Home (kiri-atas) untuk kembali ke IntroScene
    const homeBtn = this.add.circle(28, 28, 20, 0x1a237e, 0.85)
      .setStrokeStyle(2, 0x4caf50, 0.7)
      .setInteractive({ useHandCursor: true });
    this.add.text(28, 28, '⌂', {
      fontSize: '24px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold'
    }).setOrigin(0.5);
    homeBtn.on('pointerdown', () => {
      import('../systems/SoundManager.js').then(({ sound }) => sound.play('click'));
      this.scene.start('IntroScene');
    });
    homeBtn.on('pointerover', () => homeBtn.setFillStyle(0x283593, 0.9));
    homeBtn.on('pointerout', () => homeBtn.setFillStyle(0x1a237e, 0.85));

    // v14: tombol Pengaturan (kanan-atas)
    const W = this.cameras.main.width;
    const setBtn = this.add.rectangle(W - 35, 28, 100, 38, 0x455a64)
      .setStrokeStyle(2, 0xffffff, 0.4)
      .setInteractive({ useHandCursor: true });
    this.add.text(W - 35, 28, '⚙ Suara', {
      fontSize: '15px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);
    setBtn.on('pointerdown', () => {
      import('../systems/SoundManager.js').then(({ sound }) => sound.play('click'));
      this.scene.start('SettingsScene', { returnTo: 'LevelSelectScene' });
    });
    setBtn.on('pointerover', () => setBtn.setFillStyle(0x607d8b));
    setBtn.on('pointerout', () => setBtn.setFillStyle(0x455a64));
  }

  createFooter() {
    const totalLevels = levels.length;
    const completedCount = LevelManager.getCompletedLevels().length;
    this.add.text(300, 760,
      'Klik level untuk mulai  |  ' + completedCount + ' / ' + totalLevels + ' selesai',
      {
        fontSize: '13px',
        color: '#bbbbbb',
        fontFamily: 'Arial'
      }
    ).setOrigin(0.5);
  }

  setupScroll() {
    const totalHeight = levels.length * 50;
    const visibleHeight = 600; // area antara y=130 dan y=730
    const minY = -(totalHeight - visibleHeight);

    // wheel (desktop)
    this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
      const newY = Phaser.Math.Clamp(this.listContainer.y - deltaY * 0.5, minY, 0);
      this.listContainer.y = newY;
    });

    // v14: touch drag scroll untuk mobile. Drag ke atas = list
    // naik (ke bawah), drag ke bawah = list turun (ke atas).
    this._scrollState = { active: false, startY: 0, startListY: 0 };
    this.input.on('pointerdown', (pointer) => {
      // abaikan klik pada tombol level (sudah interaktif)
      this._scrollState.active = true;
      this._scrollState.startY = pointer.y;
      this._scrollState.startListY = this.listContainer.y;
    });
    this.input.on('pointermove', (pointer) => {
      if (!this._scrollState.active) return;
      const dy = pointer.y - this._scrollState.startY;
      const newY = Phaser.Math.Clamp(
        this._scrollState.startListY + dy, minY, 0
      );
      this.listContainer.y = newY;
    });
    this.input.on('pointerup', () => {
      this._scrollState.active = false;
    });
    this.input.on('pointerupoutside', () => {
      this._scrollState.active = false;
    });
  }

  startLevel(id) {
    this.scene.start('GameScene', { level: id });
  }
}
