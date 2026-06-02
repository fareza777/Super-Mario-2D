/**
 * src/systems/HUD.js
 * ---------------------------------------------------------------
 * Heads-Up Display: menampilkan nyawa, skor, level (dengan nama),
 * timer, jumlah koin terkumpul, dan indikator mute.
 * Di-update oleh GameScene.
 *
 * Mobile-aware: posisi & ukuran diset relatif terhadap canvas size,
 * sehingga tetap rapi di layar kecil (HP portrait).
 * ---------------------------------------------------------------
 */
export default class HUD {
  constructor(scene, lives, score, level, levelName, totalCoins) {
    this.scene = scene;
    this.lives = lives;
    this.score = score;
    this.level = level;
    this.levelName = levelName || '';
    this.totalCoins = totalCoins || 0;
    this.collectedCoins = 0;
    this.elapsedMs = 0;
    this.muted = false;
    this.create();
  }

  create() {
    const cam = this.scene.cameras.main;
    const W = cam.width;   // 800
    const H = cam.height;  // 600

    // deteksi layar kecil (HP portrait) — besarkan font
    const isMobile = W < 600;
    const baseSize = isMobile ? 22 : 20;
    const coinSize = isMobile ? 20 : 18;
    const hintSize = isMobile ? 13 : 11;
    const padding = isMobile ? 14 : 16;

    const style = {
      fontSize: baseSize + 'px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    };

    // Panel semi-transparan di belakang HUD kiri-atas (biar teks tetap
    // terbaca di atas background apapun)
    this.bgPanel = this.scene.add.rectangle(
      W * 0.28, padding + 80, W * 0.56, isMobile ? 170 : 160,
      0x000000, 0.35
    ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(49);

    this.livesText = this.scene.add.text(padding, padding, 'Nyawa: ' + this.lives, style)
      .setScrollFactor(0).setDepth(50);

    this.scoreText = this.scene.add.text(padding, padding + 30, 'Skor: ' + this.score, style)
      .setScrollFactor(0).setDepth(50);

    const levelLabel = 'Level: ' + this.level + (this.levelName ? ' - ' + this.levelName : '');
    this.levelText = this.scene.add.text(padding, padding + 60, levelLabel, style)
      .setScrollFactor(0).setDepth(50);

    this.timeText = this.scene.add.text(padding, padding + 90, 'Waktu: 00:00', style)
      .setScrollFactor(0).setDepth(50);

    this.coinText = this.scene.add.text(
      padding,
      padding + 120,
      'Koin: ' + this.collectedCoins + ' / ' + this.totalCoins,
      {
        fontSize: coinSize + 'px',
        color: '#ffd700',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 4
      }
    ).setScrollFactor(0).setDepth(50);

    this.muteText = this.scene.add.text(padding, padding + 150, '', {
      fontSize: '14px',
      color: '#ff8080',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 2
    }).setScrollFactor(0).setDepth(50);

    // VERSION INDICATOR — pojok kanan bawah
    this.versionText = this.scene.add.text(
      W - 8,
      H - 8,
      'v6',
      {
        fontSize: '11px',
        color: '#888888',
        fontFamily: 'Arial'
      }
    ).setOrigin(1, 1).setScrollFactor(0).setDepth(50);

    // Hint controls (hanya desktop)
    if (!isMobile) {
      this.hintText = this.scene.add.text(
        W - 16,
        16,
        'P: Pause  |  R: Restart  |  M: Mute  |  WASD/Panah: Gerak  |  Spasi: Lompat',
        {
          fontSize: hintSize + 'px',
          color: '#ffffff',
          fontFamily: 'Arial',
          stroke: '#000000',
          strokeThickness: 2
        }
      ).setOrigin(1, 0).setScrollFactor(0).setDepth(50);
    }
  }

  setLives(n) {
    this.lives = n;
    this.livesText.setText('Nyawa: ' + this.lives);
  }

  setScore(s) {
    this.score = s;
    this.scoreText.setText('Skor: ' + this.score);
  }

  setTime(ms) {
    this.elapsedMs = ms;
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    this.timeText.setText(
      'Waktu: ' + String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0')
    );
  }

  addCoin() {
    this.collectedCoins += 1;
    this.coinText.setText('Koin: ' + this.collectedCoins + ' / ' + this.totalCoins);
  }

  setMute(muted) {
    this.muted = muted;
    this.muteText.setText(muted ? '[M] MUTED' : '');
  }
}
