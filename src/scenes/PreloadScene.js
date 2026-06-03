/**
 * src/scenes/PreloadScene.js
 * ---------------------------------------------------------------
 * GrimPass — semua tekstur di-generate prosedural (pixel art)
 * dengan Phaser.GameObjects.Graphics. Tidak ada file aset
 * eksternal.
 *
 * Entity & tekstur (semua 32x32 kecuali coin/soul/mushroom/star 28x28):
 *   player          : Soul Wanderer — sosok bertudung gelap dengan
 *                     mata bersinar & lentera kuning di tangan
 *   enemy           : Shadow Crawler — blob gelap merayap dengan
 *                     dua mata merah menyala
 *   enemy-fly       : Wraith — hantu translucent putih-biru dengan
 *                     mata kosong & ujung bergelombang
 *   coin            : Soul Orb — bola cyan bersinar dengan inti
 *                     putih & cincin glow
 *   platform        : Dark Stone — batu gelap dengan lumut hijau
 *                     di atas & retakan
 *   platform-breakable : Cursed Wood — papan kayu gelap dengan
 *                     retakan bersinar ungu
 *   goal            : Soul Gate — gerbang batu dengan energi
 *                     ungu-sian berputar di dalamnya (32x80)
 *   mushroom        : Heart Shard — kristal hati merah bersinar
 *                     untuk +1 nyawa
 *   star            : Shadow Cloak — energi gelap berputar ungu
 *                     untuk invincibility
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

    this.add.text(cx, cy - 20, 'Memuat...', {
      fontSize: '32px',
      color: '#b2ebf2',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.add.text(cx, cy + 20, levels.length + ' level menanti', {
      fontSize: '18px',
      color: '#7c4dff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    this.time.delayedCall(600, () => {
      this.scene.start('IntroScene');
    });
  }

  makeArt(key, w, h, drawFn) {
    const g = this.add.graphics();
    drawFn(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  // ============================================================
  // =============== PIXEL ART GRIMPASS =========================
  // ============================================================

  createPixelArt() {
    // ---- Soul Wanderer (player, 32x32) ----
    // Sosok bertudung gelap dengan mata cyan bersinar & lentera
    this.makeArt('player', 32, 32, (g) => {
      // bayangan tanah samar
      g.fillStyle(0x000000, 0.3);
      g.fillEllipse(16, 30, 14, 3);

      // tudung (hood) — ungu sangat gelap
      g.fillStyle(0x1a0033, 1);
      g.fillRect(8, 2, 16, 12);
      // puncak tudung lebih gelap
      g.fillStyle(0x0d001a, 1);
      g.fillRect(10, 2, 12, 4);
      // sisi tudung
      g.fillStyle(0x240046, 1);
      g.fillRect(7, 6, 2, 10);
      g.fillRect(23, 6, 2, 10);

      // wajah dalam tudung (hitam pekat)
      g.fillStyle(0x000000, 1);
      g.fillRect(10, 9, 12, 7);

      // mata bersinar cyan
      g.fillStyle(0x4fc3f7, 1);
      g.fillRect(12, 11, 3, 2);
      g.fillRect(17, 11, 3, 2);
      // core putih mata
      g.fillStyle(0xe0f7fa, 1);
      g.fillRect(13, 11, 1, 1);
      g.fillRect(18, 11, 1, 1);

      // jubah (robe) — ungu gelap
      g.fillStyle(0x311b92, 1);
      g.fillRect(6, 14, 20, 4);
      g.fillStyle(0x4527a0, 1);
      g.fillRect(5, 18, 22, 6);
      g.fillStyle(0x311b92, 1);
      g.fillRect(4, 24, 24, 5);
      // hem jubah bergerigi
      g.fillStyle(0x1a0033, 1);
      g.fillRect(4, 29, 3, 1);
      g.fillRect(10, 29, 3, 1);
      g.fillRect(16, 29, 3, 1);
      g.fillRect(22, 29, 3, 1);

      // lengan kiri (menyamping)
      g.fillStyle(0x4527a0, 1);
      g.fillRect(3, 18, 3, 5);
      // tangan kiri
      g.fillStyle(0x1a0033, 1);
      g.fillRect(2, 22, 3, 3);

      // lengan kanan memegang lentera
      g.fillStyle(0x4527a0, 1);
      g.fillRect(26, 19, 3, 5);
      // lentera (kuning bersinar)
      g.fillStyle(0xffd700, 1);
      g.fillRect(27, 23, 4, 5);
      // frame lentera
      g.fillStyle(0x8d6e63, 1);
      g.fillRect(27, 22, 4, 1);
      g.fillRect(27, 28, 4, 1);
      // core terang lentera
      g.fillStyle(0xfff59d, 1);
      g.fillRect(28, 24, 2, 3);
      // glow halus sekitar lentera
      g.fillStyle(0xfff59d, 0.3);
      g.fillRect(25, 23, 8, 5);
    });

    // ---- Shadow Crawler (enemy patrol, 32x32) ----
    // Blob gelap merayap dengan dua mata merah menyala
    this.makeArt('enemy', 32, 32, (g) => {
      // bayangan tanah
      g.fillStyle(0x000000, 0.4);
      g.fillEllipse(16, 30, 18, 3);

      // tubuh utama — ungu sangat gelap
      g.fillStyle(0x1a0033, 1);
      g.fillRect(4, 8, 24, 16);
      // sisi atas bergelombang (bayangan bergoyang)
      g.fillStyle(0x240046, 1);
      g.fillCircle(8, 9, 4);
      g.fillCircle(16, 7, 5);
      g.fillCircle(24, 9, 4);
      // sisi bawah bergelombang
      g.fillStyle(0x1a0033, 1);
      g.fillCircle(8, 25, 4);
      g.fillCircle(24, 25, 4);
      // highlight samar di tengah
      g.fillStyle(0x311b92, 0.6);
      g.fillEllipse(16, 16, 14, 8);

      // mata merah menyala
      g.fillStyle(0xff1744, 1);
      g.fillRect(10, 13, 4, 4);
      g.fillRect(18, 13, 4, 4);
      // core putih mata
      g.fillStyle(0xffeb3b, 1);
      g.fillRect(11, 14, 2, 2);
      g.fillRect(19, 14, 2, 2);
      // pupil hitam
      g.fillStyle(0x000000, 1);
      g.fillRect(12, 15, 1, 1);
      g.fillRect(20, 15, 1, 1);

      // mulut — garis gelap dengan taring
      g.fillStyle(0x000000, 1);
      g.fillRect(10, 20, 12, 2);
      g.fillStyle(0xffffff, 1);
      g.fillRect(12, 22, 1, 2);
      g.fillRect(18, 22, 1, 2);
    });

    // ---- Wraith (enemy terbang, 32x32) ----
    // Hantu translucent putih-biru dengan mata kosong
    this.makeArt('enemy-fly', 32, 32, (g) => {
      // tubuh utama — putih-biru translucent
      g.fillStyle(0xb2ebf2, 0.85);
      g.fillRect(8, 4, 16, 16);
      // kepala membulat
      g.fillCircle(16, 8, 7);
      // sisi badan
      g.fillStyle(0x80deea, 0.85);
      g.fillRect(7, 10, 2, 8);
      g.fillRect(23, 10, 2, 8);
      g.fillRect(9, 18, 14, 2);
      // highlight di kepala
      g.fillStyle(0xe0f7fa, 0.9);
      g.fillCircle(13, 6, 3);

      // mata kosong (lubang hitam)
      g.fillStyle(0x000000, 1);
      g.fillRect(12, 9, 3, 4);
      g.fillRect(17, 9, 3, 4);
      // pupil samar merah
      g.fillStyle(0xff1744, 0.7);
      g.fillRect(13, 11, 1, 1);
      g.fillRect(18, 11, 1, 1);

      // mulut (O kecil)
      g.fillStyle(0x000000, 1);
      g.fillRect(14, 15, 4, 3);

      // ujung bergelombang (tidak simetris)
      g.fillStyle(0xb2ebf2, 0.8);
      g.fillTriangle(8, 20, 11, 20, 9, 28);
      g.fillTriangle(11, 20, 14, 20, 12, 27);
      g.fillTriangle(14, 20, 18, 20, 16, 29);
      g.fillTriangle(18, 20, 21, 20, 19, 26);
      g.fillTriangle(21, 20, 24, 20, 22, 28);

      // partikel ethereal samar
      g.fillStyle(0x80deea, 0.4);
      g.fillCircle(6, 14, 1);
      g.fillCircle(26, 12, 1);
      g.fillCircle(4, 22, 1);
    });

    // ---- Soul Orb (coin, 28x28) ----
    // Orb cyan bersinar dengan inti putih
    this.makeArt('coin', 28, 28, (g) => {
      // outer glow (cyan)
      g.fillStyle(0x4fc3f7, 0.4);
      g.fillCircle(14, 14, 13);
      // mid glow
      g.fillStyle(0x29b6f6, 0.6);
      g.fillCircle(14, 14, 11);
      // main orb (cyan terang)
      g.fillStyle(0x4fc3f7, 1);
      g.fillCircle(14, 14, 9);
      // inner core putih
      g.fillStyle(0xe0f7fa, 1);
      g.fillCircle(14, 14, 6);
      // core terang pusat
      g.fillStyle(0xffffff, 1);
      g.fillCircle(13, 12, 3);
      // highlight kecil
      g.fillStyle(0xffffff, 1);
      g.fillCircle(10, 10, 1);
      // ring tipis sian
      g.lineStyle(1, 0x00b0ff, 1);
      g.strokeCircle(14, 14, 9);
    });

    // ---- Dark Stone platform (32x32) ----
    // Batu gelap dengan lumut di atas
    this.makeArt('platform', 32, 32, (g) => {
      // batu utama — abu-abu gelap
      g.fillStyle(0x37474f, 1);
      g.fillRect(0, 0, 32, 32);
      // highlight atas (tepi)
      g.fillStyle(0x546e7a, 1);
      g.fillRect(0, 0, 32, 2);
      // retakan & tekstur
      g.fillStyle(0x263238, 1);
      g.fillRect(4, 8, 1, 6);
      g.fillRect(12, 12, 1, 8);
      g.fillRect(20, 6, 1, 10);
      g.fillRect(26, 14, 1, 6);
      g.fillRect(8, 20, 1, 4);
      g.fillRect(18, 22, 1, 6);
      // lumut hijau di atas
      g.fillStyle(0x2e7d32, 1);
      g.fillRect(0, 0, 32, 3);
      // lumut tambahan (acak)
      g.fillStyle(0x1b5e20, 1);
      g.fillRect(3, 0, 2, 2);
      g.fillRect(10, 0, 3, 2);
      g.fillRect(18, 0, 2, 2);
      g.fillRect(25, 0, 3, 2);
      // highlight lumut
      g.fillStyle(0x4caf50, 1);
      g.fillRect(6, 0, 1, 1);
      g.fillRect(15, 0, 1, 1);
      g.fillRect(22, 0, 1, 1);
      // sisi bawah lebih gelap (bayangan)
      g.fillStyle(0x1c313a, 1);
      g.fillRect(0, 30, 32, 2);
    });

    // ---- Cursed Wood platform (breakable, 32x32) ----
    // Papan kayu gelap dengan retakan bersinar ungu
    this.makeArt('platform-breakable', 32, 32, (g) => {
      // kayu dasar
      g.fillStyle(0x4e342e, 1);
      g.fillRect(0, 0, 32, 32);
      // grain kayu horizontal
      g.fillStyle(0x3e2723, 1);
      g.fillRect(0, 10, 32, 1);
      g.fillRect(0, 22, 32, 1);
      // retakan dengan glow ungu
      g.fillStyle(0x7b1fa2, 1);
      g.fillRect(9, 0, 1, 11);
      g.fillRect(20, 4, 1, 18);
      g.fillRect(14, 14, 1, 12);
      g.fillRect(4, 18, 1, 8);
      g.fillRect(26, 8, 1, 10);
      // core retakan (terang)
      g.fillStyle(0xe040fb, 1);
      g.fillRect(9, 3, 1, 4);
      g.fillRect(20, 8, 1, 6);
      g.fillRect(14, 18, 1, 4);
      g.fillRect(4, 22, 1, 3);
      g.fillRect(26, 12, 1, 4);
      // paku berkarat
      g.fillStyle(0x212121, 1);
      g.fillRect(2, 3, 2, 2);
      g.fillRect(28, 3, 2, 2);
      g.fillRect(2, 27, 2, 2);
      g.fillRect(28, 27, 2, 2);
      // highlight paku
      g.fillStyle(0x616161, 1);
      g.fillRect(2, 3, 1, 1);
      g.fillRect(28, 3, 1, 1);
    });

    // ---- Soul Gate (goal, 32x80) ----
    // Gerbang batu dengan energi ungu-sian berputar
    this.makeArt('goal', 32, 80, (g) => {
      // batu frame (kiri)
      g.fillStyle(0x37474f, 1);
      g.fillRect(2, 4, 5, 74);
      // batu frame (kanan)
      g.fillRect(25, 4, 5, 74);
      // batu frame (atas melengkung)
      g.fillRect(4, 2, 24, 4);
      g.fillRect(6, 0, 20, 2);
      g.fillStyle(0x263238, 1);
      g.fillRect(4, 4, 2, 74);
      g.fillRect(26, 4, 2, 74);
      // highlight batu
      g.fillStyle(0x546e7a, 1);
      g.fillRect(7, 4, 2, 74);
      g.fillRect(23, 4, 2, 74);

      // energi portal (gradient ungu -> sian)
      g.fillStyle(0x4a148c, 0.9);
      g.fillRect(9, 10, 14, 60);
      g.fillStyle(0x7b1fa2, 0.85);
      g.fillRect(9, 12, 14, 58);
      g.fillStyle(0x311b92, 0.7);
      g.fillRect(10, 14, 12, 54);

      // swirl energi sian di dalam
      g.fillStyle(0x4fc3f7, 0.8);
      g.fillCircle(16, 20, 3);
      g.fillCircle(16, 35, 4);
      g.fillCircle(16, 50, 3);
      g.fillCircle(16, 62, 2);

      // core energi terang
      g.fillStyle(0xe0f7fa, 1);
      g.fillCircle(16, 35, 2);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(16, 35, 1);

      // partikel mengambang
      g.fillStyle(0x80deea, 0.9);
      g.fillRect(11, 28, 1, 1);
      g.fillRect(20, 42, 1, 1);
      g.fillRect(12, 55, 1, 1);
      g.fillStyle(0xce93d8, 0.9);
      g.fillRect(19, 25, 1, 1);
      g.fillRect(11, 48, 1, 1);
      g.fillRect(20, 58, 1, 1);

      // base batu
      g.fillStyle(0x263238, 1);
      g.fillRect(2, 76, 30, 4);
      g.fillStyle(0x455a64, 1);
      g.fillRect(2, 76, 30, 1);
    });

    // ---- Heart Shard (powerup +1 nyawa, 28x28) ----
    // Kristal hati merah bersinar
    this.makeArt('mushroom', 28, 28, (g) => {
      // shadow
      g.fillStyle(0x000000, 0.3);
      g.fillEllipse(14, 26, 12, 2);

      // bentuk hati (heart shape) — atas membulat
      g.fillStyle(0xb71c1c, 1);
      g.fillCircle(9, 9, 5);
      g.fillCircle(19, 9, 5);
      g.fillStyle(0xd32f2f, 1);
      g.fillRect(8, 8, 12, 6);
      g.fillRect(7, 9, 14, 4);

      // body hati
      g.fillStyle(0xd32f2f, 1);
      g.fillTriangle(4, 11, 24, 11, 14, 22);
      g.fillStyle(0xb71c1c, 1);
      g.fillTriangle(5, 11, 23, 11, 14, 21);

      // highlight mengkilap
      g.fillStyle(0xffeb3b, 0.8);
      g.fillCircle(10, 7, 2);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(10, 7, 1);

      // core glow dalam
      g.fillStyle(0xff5252, 0.6);
      g.fillCircle(14, 13, 3);

      // partikel cahaya
      g.fillStyle(0xffeb3b, 0.5);
      g.fillRect(2, 4, 1, 1);
      g.fillRect(25, 5, 1, 1);
      g.fillRect(24, 18, 1, 1);
    });

    // ---- Shadow Cloak (powerup invincibility, 28x28) ----
    // Energi gelap berputar ungu
    this.makeArt('star', 28, 28, (g) => {
      // outer glow ungu
      g.fillStyle(0x4a148c, 0.5);
      g.fillCircle(14, 14, 13);
      // swirl outer (putaran)
      g.fillStyle(0x311b92, 1);
      g.fillCircle(14, 14, 11);
      // swirl arms — empat penjuru
      g.fillStyle(0x4a148c, 1);
      g.fillTriangle(14, 2, 11, 14, 17, 14);
      g.fillTriangle(14, 26, 11, 14, 17, 14);
      g.fillTriangle(2, 14, 14, 11, 14, 17);
      g.fillTriangle(26, 14, 14, 11, 14, 17);
      // diagonal arms
      g.fillTriangle(5, 5, 11, 11, 14, 14);
      g.fillTriangle(23, 5, 17, 11, 14, 14);
      g.fillTriangle(5, 23, 11, 17, 14, 14);
      g.fillTriangle(23, 23, 17, 17, 14, 14);

      // inner core terang
      g.fillStyle(0x7b1fa2, 1);
      g.fillCircle(14, 14, 6);
      g.fillStyle(0x9c27b0, 1);
      g.fillCircle(14, 14, 4);
      g.fillStyle(0xce93d8, 1);
      g.fillCircle(14, 14, 2);

      // sparkles putih
      g.fillStyle(0xffffff, 1);
      g.fillCircle(14, 14, 1);
      g.fillRect(8, 8, 1, 1);
      g.fillRect(19, 8, 1, 1);
      g.fillRect(8, 19, 1, 1);
      g.fillRect(19, 19, 1, 1);
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
