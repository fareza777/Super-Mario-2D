/**
 * src/scenes/CutScene.js
 * ---------------------------------------------------------------
 * Cutscene cerita. Ditampilkan setelah level 10, 20, ..., 90
 * (sebelum masuk level berikutnya). Data cerita dari story.js.
 * ---------------------------------------------------------------
 */
import { music } from '../systems/MusicManager.js';

export default class CutScene extends Phaser.Scene {
  constructor() {
    super('CutScene');
  }

  init(data) {
    this.levelNumber = data.levelNumber;
    this.cutscene = data.cutscene;
    this.nextLevel = data.nextLevel;
  }

  create() {
    // v11: BGM calm untuk cutscene
    music.playBGM('calm');
    music.stopWind();
    this.events.once('shutdown', () => music.stopBGM());

    this.cameras.main.setBackgroundColor('#0d1b2a');

    // dekorasi bintang
    for (let i = 0; i < 25; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 600);
      const s = this.add.circle(x, y, 2, 0xffffff, 0.6);
      this.tweens.add({
        targets: s,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 2500),
        yoyo: true,
        repeat: -1
      });
    }

    this.add.text(400, 80, 'DUNIA ' + Math.ceil(this.levelNumber / 10), {
      fontSize: '44px',
      color: '#ffeb3b',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5);

    if (this.cutscene) {
      this.add.text(400, 155, this.cutscene.title, {
        fontSize: '28px',
        color: '#ff8080',
        fontFamily: 'Arial',
        stroke: '#000',
        strokeThickness: 3
      }).setOrigin(0.5);

      this.add.text(400, 280, this.cutscene.text, {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial',
        align: 'center',
        wordWrap: { width: 700 }
      }).setOrigin(0.5);
    } else {
      this.add.text(400, 280, 'Lanjut ke level berikutnya...', {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
    }

    const btn = this.add.rectangle(400, 480, 200, 50, 0x4caf50)
      .setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true });
    this.add.text(400, 480, 'Lanjut', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    btn.on('pointerdown', () => this.scene.start('GameScene', { level: this.nextLevel }));
    btn.on('pointerover', () => btn.setFillStyle(0x66bb6a));
    btn.on('pointerout', () => btn.setFillStyle(0x4caf50));
  }
}
