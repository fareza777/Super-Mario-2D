/**
 * src/scenes/EndingScene.js
 * ---------------------------------------------------------------
 * GrimPass — Ditampilkan setelah level 100. Menampilkan
 * ringkasan skor total, waktu, dan pesan penutup. Tema visual
 * gelap dengan cahaya spiritual cyan.
 * ---------------------------------------------------------------
 */
import { story } from '../data/story.js';
import { music } from '../systems/MusicManager.js';

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
    music.playBGM('ending');
    music.stopWind();
    this.events.once('shutdown', () => music.stopBGM());

    this.cameras.main.setBackgroundColor('#050010');

    // bintang emas & cyan berkelip
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, 600);
      const y = Phaser.Math.Between(0, 800);
      const isGold = Phaser.Math.Between(0, 2) === 0;
      const color = isGold ? 0xffe082 : (Phaser.Math.Between(0, 1) === 0 ? 0xce93d8 : 0x80deea);
      const s = this.add.circle(x, y, 1.5, color, 0.8);
      this.tweens.add({
        targets: s,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 2500),
        yoyo: true,
        repeat: -1
      });
    }

    // cahaya spiritual tengah
    const glow = this.add.graphics();
    glow.fillStyle(0x7c4dff, 0.2);
    glow.fillCircle(300, 200, 140);
    glow.fillStyle(0x80deea, 0.15);
    glow.fillCircle(300, 200, 90);

    this.add.text(300, 130, story.ending.title, {
      fontSize: '64px',
      color: '#e0e0e0',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(300, 300, story.ending.text, {
      fontSize: '15px',
      color: '#b0bec5',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 540 },
      lineSpacing: 6
    }).setOrigin(0.5);

    // statistik
    this.add.text(300, 480, 'Skor Akhir', {
      fontSize: '20px',
      color: '#9fa8da',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.add.text(300, 520, String(this.finalScore), {
      fontSize: '40px',
      color: '#ce93d8',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(300, 575, 'Waktu: ' + formatTime(this.elapsedTime), {
      fontSize: '22px',
      color: '#80deea',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // tombol kembali
    const btn = this.add.rectangle(300, 680, 260, 52, 0x311b92)
      .setStrokeStyle(2, 0xce93d8, 0.7).setInteractive({ useHandCursor: true });
    this.add.text(300, 680, 'Kembali ke Menu', {
      fontSize: '20px',
      color: '#e0e0e0',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    btn.on('pointerdown', () => this.scene.start('LevelSelectScene'));
    btn.on('pointerover', () => btn.setFillStyle(0x4527a0));
    btn.on('pointerout', () => btn.setFillStyle(0x311b92));
  }
}
