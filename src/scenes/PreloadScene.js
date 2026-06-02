/**
 * src/scenes/PreloadScene.js
 * ---------------------------------------------------------------
 * Menampilkan state "Loading..." dan membuat tekstur pixel art
 * secara prosedural menggunakan Phaser.GameObjects.Graphics.
 *
 * Tekstur yang di-generate (semua 32x32 kecuali coin/mushroom/star):
 *   player          : Mario-style (caping merah, wajah, mata,
 *                     kumis, overall biru, kancing kuning, sepatu)
 *   enemy           : Goomba (tubuh jamur coklat, mata, alis, kaki)
 *   enemy-fly       : Kelelawar ungu (sayap, mata merah)
 *   coin            : Koin emas berkilat (28x28, dengan highlight)
 *   platform        : Rumput hijau di atas, tanah coklat di bawah
 *   platform-breakable : Papan kayu dengan retakan & paku
 *   goal            : Tiang bendera + bendera hijau (32x80)
 *   mushroom        : Jamur power-up merah dengan titik putih
 *   star            : Bintang kuning 5 sudut dengan wajah
 * ---------------------------------------------------------------
 */
import { levels } from '../data/levels.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  create() {
    try {
      this.createPixelArt();
    } catch (err) {
      this.showError('Gagal membuat aset: ' + (err && err.message ? err.message : err));
      return;
    }

    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    this.add.text(cx, cy - 20, 'Loading...', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(cx, cy + 20, levels.length + ' level tersedia', {
      fontSize: '18px',
      color: '#ffeb3b',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.time.delayedCall(600, () => {
      this.scene.start('IntroScene');
    });
  }

  // ---- pembungkus untuk menggambar pixel art ----
  makeArt(key, w, h, drawFn) {
    const g = this.add.graphics();
    drawFn(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  // ============================================================
  // =============== PIXEL ART PER ENTITAS =====================
  // ============================================================

  createPixelArt() {
    // ---- Mario-style player (32x32) ----
    this.makeArt('player', 32, 32, (g) => {
      // topi merah
      g.fillStyle(0xd32f2f, 1);
      g.fillRect(6, 2, 20, 8);
      // brim topi (lebih gelap)
      g.fillStyle(0x9a0007, 1);
      g.fillRect(4, 9, 24, 2);
      // lingkaran M di topi (kuning)
      g.fillStyle(0xfdd835, 1);
      g.fillCircle(16, 5, 2);
      // wajah
      g.fillStyle(0xffcc80, 1);
      g.fillRect(8, 11, 16, 9);
      // mata
      g.fillStyle(0x000000, 1);
      g.fillRect(11, 14, 2, 3);
      g.fillRect(19, 14, 2, 3);
      // kumis
      g.fillStyle(0x3e2723, 1);
      g.fillRect(10, 17, 12, 2);
      // overall biru
      g.fillStyle(0x1976d2, 1);
      g.fillRect(7, 20, 18, 10);
      // lengan baju merah
      g.fillStyle(0xd32f2f, 1);
      g.fillRect(3, 20, 5, 6);
      g.fillRect(24, 20, 5, 6);
      // tangan (kulit)
      g.fillStyle(0xffcc80, 1);
      g.fillRect(3, 25, 4, 3);
      g.fillRect(25, 25, 4, 3);
      // kancing kuning
      g.fillStyle(0xfdd835, 1);
      g.fillRect(10, 22, 2, 2);
      g.fillRect(20, 22, 2, 2);
      // celana biru tua
      g.fillStyle(0x0d47a1, 1);
      g.fillRect(7, 28, 7, 2);
      g.fillRect(18, 28, 7, 2);
      // sepatu coklat
      g.fillStyle(0x4e342e, 1);
      g.fillRect(6, 30, 8, 2);
      g.fillRect(18, 30, 8, 2);
    });

    // ---- Goomba enemy (32x32) ----
    this.makeArt('enemy', 32, 32, (g) => {
      // tutup jamur coklat gelap
      g.fillStyle(0x5d4037, 1);
      g.fillRect(4, 2, 24, 14);
      // garis gelap di tengah tutup
      g.fillStyle(0x3e2723, 1);
      g.fillRect(4, 10, 24, 2);
      // body / wajah coklat muda
      g.fillStyle(0x8d6e63, 1);
      g.fillRect(6, 16, 20, 10);
      // mata putih
      g.fillStyle(0xffffff, 1);
      g.fillRect(9, 18, 5, 5);
      g.fillRect(18, 18, 5, 5);
      // pupil hitam
      g.fillStyle(0x000000, 1);
      g.fillRect(10, 20, 2, 3);
      g.fillRect(20, 20, 2, 3);
      // alis marah
      g.fillStyle(0x000000, 1);
      g.fillRect(8, 17, 6, 1);
      g.fillRect(18, 17, 6, 1);
      // mulut (garis)
      g.fillStyle(0x000000, 1);
      g.fillRect(11, 24, 10, 1);
      // kaki
      g.fillStyle(0x3e2723, 1);
      g.fillRect(7, 26, 7, 5);
      g.fillRect(18, 26, 7, 5);
    });

    // ---- Flying bat enemy (32x32) ----
    this.makeArt('enemy-fly', 32, 32, (g) => {
      // sayap kiri
      g.fillStyle(0x9c27b0, 1);
      g.fillTriangle(2, 16, 12, 8, 12, 24);
      // sayap kanan
      g.fillTriangle(30, 16, 20, 8, 20, 24);
      // body bulat
      g.fillStyle(0x7b1fa2, 1);
      g.fillCircle(16, 16, 9);
      // highlight
      g.fillStyle(0xba68c8, 1);
      g.fillCircle(14, 13, 3);
      // mata merah
      g.fillStyle(0xff0000, 1);
      g.fillRect(12, 14, 3, 3);
      g.fillRect(17, 14, 3, 3);
      // pupil
      g.fillStyle(0x000000, 1);
      g.fillRect(13, 15, 1, 1);
      g.fillRect(18, 15, 1, 1);
      // taring
      g.fillStyle(0xffffff, 1);
      g.fillRect(13, 19, 1, 2);
      g.fillRect(18, 19, 1, 2);
    });

    // ---- Coin (28x28) ----
    this.makeArt('coin', 28, 28, (g) => {
      // outer dark gold
      g.fillStyle(0xb8860b, 1);
      g.fillCircle(14, 14, 14);
      // inner bright gold
      g.fillStyle(0xffd700, 1);
      g.fillCircle(14, 14, 12);
      // highlight shine (kiri atas)
      g.fillStyle(0xfff59d, 1);
      g.fillCircle(9, 9, 4);
      // small shine 2
      g.fillStyle(0xffffff, 1);
      g.fillCircle(8, 8, 1);
      // shadow kanan bawah
      g.fillStyle(0xb8860b, 1);
      g.fillCircle(19, 19, 3);
      // outline dalam
      g.fillStyle(0xc9a227, 1);
      g.fillCircle(14, 14, 8, null);
      g.lineStyle(1, 0xc9a227, 1);
      g.strokeCircle(14, 14, 8);
    });

    // ---- Platform (32x32) — grass atas, tanah bawah ----
    this.makeArt('platform', 32, 32, (g) => {
      // grass top
      g.fillStyle(0x4caf50, 1);
      g.fillRect(0, 0, 32, 8);
      // grass blades
      g.fillStyle(0x66bb6a, 1);
      g.fillRect(4, 0, 2, 4);
      g.fillRect(12, 0, 2, 5);
      g.fillRect(20, 0, 2, 4);
      g.fillRect(28, 0, 2, 5);
      // soil
      g.fillStyle(0x8b4513, 1);
      g.fillRect(0, 8, 32, 24);
      // soil dark accents
      g.fillStyle(0x5c2e0d, 1);
      g.fillRect(0, 24, 32, 2);
      g.fillRect(0, 16, 2, 4);
      g.fillRect(16, 12, 2, 4);
      g.fillRect(28, 20, 2, 4);
      // grass bottom shadow
      g.fillStyle(0x2e7d32, 1);
      g.fillRect(0, 6, 32, 2);
    });

    // ---- Breakable platform (32x32) — papan kayu retak ----
    this.makeArt('platform-breakable', 32, 32, (g) => {
      // wood base
      g.fillStyle(0xa0522d, 1);
      g.fillRect(0, 0, 32, 32);
      // wood grain horizontal
      g.fillStyle(0x6d4c41, 1);
      g.fillRect(0, 10, 32, 2);
      g.fillRect(0, 22, 32, 2);
      // cracks
      g.fillStyle(0x000000, 1);
      g.fillRect(9, 0, 1, 11);
      g.fillRect(20, 4, 1, 18);
      g.fillRect(14, 14, 1, 12);
      g.fillRect(4, 18, 1, 8);
      g.fillRect(26, 8, 1, 10);
      // nails
      g.fillStyle(0x212121, 1);
      g.fillRect(2, 3, 2, 2);
      g.fillRect(28, 3, 2, 2);
      g.fillRect(2, 27, 2, 2);
      g.fillRect(28, 27, 2, 2);
    });

    // ---- Goal flag (32x80) ----
    this.makeArt('goal', 32, 80, (g) => {
      // pole gold top
      g.fillStyle(0xffd700, 1);
      g.fillCircle(16, 5, 4);
      // pole
      g.fillStyle(0x5d4037, 1);
      g.fillRect(15, 6, 2, 74);
      // flag main
      g.fillStyle(0x2e7d32, 1);
      g.fillTriangle(17, 14, 30, 26, 17, 38);
      // flag highlight
      g.fillStyle(0x4caf50, 1);
      g.fillTriangle(17, 14, 27, 23, 17, 32);
      // pole base
      g.fillStyle(0x3e2723, 1);
      g.fillRect(12, 76, 8, 4);
    });

    // ---- Mushroom power-up (28x28) ----
    this.makeArt('mushroom', 28, 28, (g) => {
      // stem
      g.fillStyle(0xffcc80, 1);
      g.fillRect(8, 16, 12, 10);
      // stem shadow
      g.fillStyle(0xc28c5a, 1);
      g.fillRect(8, 24, 12, 2);
      // cap red
      g.fillStyle(0xe53935, 1);
      g.fillRect(4, 4, 20, 14);
      // cap dark line
      g.fillStyle(0xb71c1c, 1);
      g.fillRect(4, 4, 20, 2);
      // white spots
      g.fillStyle(0xffffff, 1);
      g.fillCircle(9, 10, 2);
      g.fillCircle(17, 8, 2);
      g.fillCircle(20, 14, 2);
      // eyes
      g.fillStyle(0x000000, 1);
      g.fillRect(10, 18, 2, 2);
      g.fillRect(16, 18, 2, 2);
    });

    // ---- Star (28x28) ----
    this.makeArt('star', 28, 28, (g) => {
      // 5-point star polygon
      const cx = 14;
      const cy = 14;
      const points = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 12 : 5;
        const a = (i * Math.PI / 5) - Math.PI / 2;
        points.push(new Phaser.Geom.Point(cx + r * Math.cos(a), cy + r * Math.sin(a)));
      }
      g.fillStyle(0xfdd835, 1);
      g.fillPoints(points, true);
      // outline
      g.lineStyle(2, 0xf57f17, 1);
      g.strokePoints(points, true);
      // highlight
      g.fillStyle(0xfff59d, 1);
      g.fillCircle(11, 10, 2);
      // eyes
      g.fillStyle(0x000000, 1);
      g.fillRect(11, 14, 2, 2);
      g.fillRect(15, 14, 2, 2);
    });
  }

  showError(msg) {
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;
    this.add.text(cx, cy, msg, {
      fontSize: '22px',
      color: '#ff5555',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 700 },
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);
  }
}
