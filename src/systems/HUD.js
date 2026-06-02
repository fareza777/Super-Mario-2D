/**
 * src/systems/HUD.js
 * ---------------------------------------------------------------
 * Heads-Up Display: menampilkan nyawa, skor, level, timer, koin.
 * v11: dipusatkan (center) supaya tetap terlihat saat canvas
 *      extend horizontal di mobile (HEIGHT_CONTROLS_WIDTH mode).
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
    const cx = W / 2;
    const isMobile = W < 600;
    const baseSize = isMobile ? 22 : 20;
    const coinSize = isMobile ? 20 : 18;
    const hintSize = isMobile ? 13 : 11;
    const padding = isMobile ? 12 : 14;

    const style = {
      fontSize: baseSize + 'px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    };

    // Background panel semi-transparan di tengah-atas (supaya teks
    // tetap terbaca di atas background apapun, termasuk game world)
    this.bgPanel = this.scene.add.rectangle(
      cx, padding - 4, Math.min(W - 20, 360), isMobile ? 152 : 142,
      0x000000, 0.45
    ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(49);

    // v11: semua text di-center horizontal, disusun vertikal dari atas
    this.livesText = this.scene.add.text(cx, padding, 'Nyawa: ' + this.lives, style)
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(50);

    this.scoreText = this.scene.add.text(cx, padding + 28, 'Skor: ' + this.score, style)
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(50);

    const levelLabel = 'Level: ' + this.level + (this.levelName ? ' - ' + this.levelName : '');
    this.levelText = this.scene.add.text(cx, padding + 56, levelLabel, style)
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(50);

    this.timeText = this.scene.add.text(cx, padding + 84, 'Waktu: 00:00', style)
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(50);

    this.coinText = this.scene.add.text(cx, padding + 112, 'Koin: ' + this.collectedCoins + ' / ' + this.totalCoins, {
      fontSize: coinSize + 'px',
      color: '#ffd700',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(50);

    this.muteText = this.scene.add.text(cx, padding + 140, '', {
      fontSize: '14px',
      color: '#ff8080',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(50);

    // VERSION di tengah-bawah
    this.versionText = this.scene.add.text(
      cx, H - 8, 'v11', {
      fontSize: '11px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(50);

    // Desktop hint di pojok kanan-atas (desktop only, canvas muat)
    if (!isMobile) {
      this.hintText = this.scene.add.text(
        W - 16, 16,
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
