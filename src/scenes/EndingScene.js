/**
 * src/scenes/EndingScene.js
 * ---------------------------------------------------------------
 * Ditampilkan setelah level 100 (akhir permainan). Menampilkan
 * ringkasan skor total, waktu, dan pesan penutup.
 * ---------------------------------------------------------------
 */
import { story } from '../data/story.js';

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
}

export default class EndingScene extends Phaser.Scene {
  constructor() {
    super('EndingScene');
  }

  init(data) {
    this.finalScore = data.score || 0;
    this.elapsedTime = data.time || 0;
  }

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // dekorasi bintang
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(0, 800);
      const y = Phaser.Math.Between(0, 600);
      const s = this.add.circle(x, y, 2, 0xffeb3b, 0.8);
      this.tweens.add({
        targets: s,
        alpha: 0.2,
        duration: Phaser.Math.Between(800, 2000),
        yoyo: true,
        repeat: -1
      });
    }

    this.add.text(400, 70, story.ending.title, {
      fontSize: '72px',
      color: '#ffeb3b',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 7
    }).setOrigin(0.5);

    this.add.text(400, 175, story.ending.text, {
      fontSize: '19px',
      color: '#ffffff',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 700 }
    }).setOrigin(0.5);

    this.add.text(400, 300, 'Skor Total', {
      fontSize: '22px',
      color: '#cccccc',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(400, 340, String(this.finalScore), {
      fontSize: '44px',
      color: '#ffeb3b',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(400, 405, 'Waktu: ' + formatTime(this.elapsedTime), {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    const btn = this.add.rectangle(400, 490, 240, 50, 0x2196f3)
      .setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true });
    this.add.text(400, 490, 'Kembali ke Menu', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    btn.on('pointerdown', () => this.scene.start('LevelSelectScene'));
    btn.on('pointerover', () => btn.setFillStyle(0x42a5f5));
    btn.on('pointerout', () => btn.setFillStyle(0x2196f3));
  }
}
