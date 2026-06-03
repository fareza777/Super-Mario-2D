/**
 * src/scenes/IntroScene.js
 * ---------------------------------------------------------------
 * GrimPass — Title screen. Shows the game name "GRIMPASS" and
 * Start / Select Level buttons. Dark starfield background
 * with death/rebirth atmosphere.
 * ---------------------------------------------------------------
 */
import { story } from '../data/story.js';
import { music } from '../systems/MusicManager.js';

export default class IntroScene extends Phaser.Scene {
  constructor() {
    super('IntroScene');
  }

  create() {
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
    this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x0d001a)
      .setOrigin(0, 0).setScrollFactor(0);

    // dekorasi bintang berkelip biru-ungu
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, 600);
      const y = Phaser.Math.Between(0, 800);
      const isPurple = Phaser.Math.Between(0, 1) === 0;
      const s = this.add.circle(x, y, 1.5, isPurple ? 0xce93d8 : 0x80deea, 0.7);
      this.tweens.add({
        targets: s,
        alpha: 0.15,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1
      });
    }

    // kabut ungu di bagian bawah
    const fog = this.add.graphics();
    fog.fillStyle(0x4a148c, 0.15);
    fog.fillEllipse(300, 780, 700, 200);
  }

  createTitle() {
    // subtitle kecil di atas
    this.add.text(300, 110, 'S O U L   W A N D E R E R', {
      fontSize: '18px',
      color: '#b2ebf2',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 2,
      letterSpacing: 4
    }).setOrigin(0.5);

    // judul utama — GRIMPASS
    this.add.text(300, 175, 'GRIMPASS', {
      fontSize: '72px',
      color: '#e0e0e0',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 7
    }).setOrigin(0.5);

    // efek glow bawah judul
    this.add.text(300, 178, 'GRIMPASS', {
      fontSize: '72px',
      color: '#7c4dff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0.5);
  }

  createSubtitle() {
    this.add.text(300, 235, 'Cross the darkness. Find peace.', {
      fontSize: '16px',
      color: '#ce93d8',
      fontFamily: 'Arial',
      fontStyle: 'italic',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);
  }

  createIntroText() {
    this.add.text(300, 300, story.intro, {
      fontSize: '13px',
      color: '#b0bec5',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 540 },
      lineSpacing: 4
    }).setOrigin(0.5);
  }

  createButtons() {
    const btnStart = this.add.rectangle(300, 460, 240, 58, 0x311b92)
      .setStrokeStyle(3, 0xce93d8, 0.8).setInteractive({ useHandCursor: true });
    this.add.text(300, 460, 'START', {
      fontSize: '28px',
      color: '#e0e0e0',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
    btnStart.on('pointerdown', () => this.scene.start('GameScene', { level: 1 }));
    btnStart.on('pointerover', () => btnStart.setFillStyle(0x4527a0));
    btnStart.on('pointerout', () => btnStart.setFillStyle(0x311b92));

    const btnSelect = this.add.rectangle(300, 530, 240, 48, 0x263238)
      .setStrokeStyle(2, 0x80deea, 0.6).setInteractive({ useHandCursor: true });
    this.add.text(300, 530, 'Select Level', {
      fontSize: '22px',
      color: '#e0e0e0',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    btnSelect.on('pointerdown', () => this.scene.start('LevelSelectScene'));
    btnSelect.on('pointerover', () => btnSelect.setFillStyle(0x37474f));
    btnSelect.on('pointerout', () => btnSelect.setFillStyle(0x263238));
  }

  createFooter() {
    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    this.add.text(300, 750, 'GrimPass — 100 Levels — Made with Phaser 3', {
      fontSize: '12px',
      color: '#5e35b1',
      fontFamily: 'Arial',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // tombol Pengaturan
    const setBtn = this.add.rectangle(W - 50, H - 35, 130, 40, 0x37474f)
      .setStrokeStyle(2, 0x80deea, 0.4)
      .setInteractive({ useHandCursor: true });
    this.add.text(W - 50, H - 35, '⚙ Settings', {
      fontSize: '15px', color: '#b2ebf2', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);
    setBtn.on('pointerdown', () => {
      import('../systems/SoundManager.js').then(({ sound }) => sound.play('click'));
      this.scene.start('SettingsScene', { returnTo: 'IntroScene' });
    });
    setBtn.on('pointerover', () => setBtn.setFillStyle(0x455a64));
    setBtn.on('pointerout', () => setBtn.setFillStyle(0x37474f));
  }
}
