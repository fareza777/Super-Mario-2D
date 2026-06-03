/**
 * src/scenes/CutScene.js
 * ---------------------------------------------------------------
 * GrimPass — Story cutscene. Displayed after levels 10, 20,
 * ..., 90 (before entering the next level). Story data from
 * story.js. Visual theme: dark background with purple fog and
 * cyan/purple text.
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
    music.playBGM('whisper');
    music.stopWind();
    this.events.once('shutdown', () => music.stopBGM());

    // latar gelap
    this.cameras.main.setBackgroundColor('#0d001a');

    // dekorasi bintang
    for (let i = 0; i < 35; i++) {
      const x = Phaser.Math.Between(0, 600);
      const y = Phaser.Math.Between(0, 800);
      const isPurple = Phaser.Math.Between(0, 1) === 0;
      const s = this.add.circle(x, y, 1.5, isPurple ? 0xce93d8 : 0x80deea, 0.6);
      this.tweens.add({
        targets: s,
        alpha: 0.15,
        duration: Phaser.Math.Between(1200, 2800),
        yoyo: true,
        repeat: -1
      });
    }

    // kabut ungu bawah
    const fog = this.add.graphics();
    fog.fillStyle(0x4a148c, 0.2);
    fog.fillEllipse(300, 760, 800, 220);

    this.add.text(300, 110, 'CHAPTER ' + Math.ceil(this.levelNumber / 10), {
      fontSize: '28px',
      color: '#80deea',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    if (this.cutscene) {
      this.add.text(300, 180, this.cutscene.title, {
        fontSize: '32px',
        color: '#ce93d8',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 4
      }).setOrigin(0.5);

      this.add.text(300, 380, this.cutscene.text, {
        fontSize: '17px',
        color: '#e0e0e0',
        fontFamily: 'Arial',
        align: 'center',
        wordWrap: { width: 540 },
        lineSpacing: 6
      }).setOrigin(0.5);
    } else {
      this.add.text(300, 380, 'Continuing the journey...', {
        fontSize: '20px',
        color: '#b0bec5',
        fontFamily: 'Arial',
        fontStyle: 'italic'
      }).setOrigin(0.5);
    }

    // panel untuk tombol
    const btn = this.add.rectangle(300, 680, 220, 52, 0x311b92)
      .setStrokeStyle(2, 0xce93d8, 0.7).setInteractive({ useHandCursor: true });
    this.add.text(300, 680, 'Continue', {
      fontSize: '24px',
      color: '#e0e0e0',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    btn.on('pointerdown', () => this.scene.start('GameScene', { level: this.nextLevel }));
    btn.on('pointerover', () => btn.setFillStyle(0x4527a0));
    btn.on('pointerout', () => btn.setFillStyle(0x311b92));
  }
}
