/**
 * src/scenes/IntroScene.js
 * ---------------------------------------------------------------
 * Layar judul. Menampilkan nama game dan tombol Mulai /
 * Pilih Level. Latar bintang-bintang berkedip.
 * ---------------------------------------------------------------
 */
import { story } from '../data/story.js';
import { music } from '../systems/MusicManager.js';

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  create() {
    // v11: BGM calm untuk intro
    music.playBGM('calm');
    music.stopWind();
    this.events.once('shutdown', () => music.stopBGM());

    this.createBackground();
    this.createTitle();
    this.createSubtitle();
    this.createIntroText();
    this.createButtons();
    this.createFooter();
  }

  createBackground() {
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x1a237e)
      .setOrigin(0, 0).setScrollFactor(0);

    // dekorasi bintang berkedip
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 600);
      const s = this.add.circle(x, y, 2, 0xffffff, 0.8);
      this.tweens.add({
        targets: s,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1
      });
    }
  }

  createTitle() {
    this.add.text(400, 130, 'PETUALANGAN', {
      fontSize: '58px',
      color: '#ffeb3b',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(400, 200, 'MARIO', {
      fontSize: '88px',
      color: '#ff5252',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 8
    }).setOrigin(0.5);
  }

  createSubtitle() {
    this.add.text(400, 275, '100 level menantang menanti!', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
  }

  createIntroText() {
    this.add.text(400, 320, story.intro, {
      fontSize: '14px',
      color: '#cccccc',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 600 }
    }).setOrigin(0.5);
  }

  createButtons() {
    const btnStart = this.add.rectangle(400, 410, 240, 60, 0x4caf50)
      .setStrokeStyle(3, 0xffffff).setInteractive({ useHandCursor: true });
    this.add.text(400, 410, 'MULAI', {
      fontSize: '30px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
    btnStart.on('pointerdown', () => this.scene.start('GameScene', { level: 1 }));
    btnStart.on('pointerover', () => btnStart.setFillStyle(0x66bb6a));
    btnStart.on('pointerout', () => btnStart.setFillStyle(0x4caf50));

    const btnSelect = this.add.rectangle(400, 490, 240, 50, 0x2196f3)
      .setStrokeStyle(3, 0xffffff).setInteractive({ useHandCursor: true });
    this.add.text(400, 490, 'Pilih Level', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    btnSelect.on('pointerdown', () => this.scene.start('LevelSelectScene'));
    btnSelect.on('pointerover', () => btnSelect.setFillStyle(0x42a5f5));
    btnSelect.on('pointerout', () => btnSelect.setFillStyle(0x2196f3));
  }

  createFooter() {
    this.add.text(400, 560, 'Fase 3 - 100 Level - Powered by Phaser 3', {
      fontSize: '13px',
      color: '#999999',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }
}
