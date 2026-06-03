/**
 * src/systems/HUD.js
 * ---------------------------------------------------------------
 * Heads-Up Display: nyawa, skor, level, timer, koin.
 * v13: panel rounded dengan border hijau, layout 2-kolom,
 *      icon Unicode berwarna (♥ ★ ⏱ ◉), font tebal dengan stroke.
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
    const W = cam.width;   // 600
    const H = cam.height;  // 800
    const cx = W / 2;
    const isMobile = W < 700;

    const panelW = Math.min(W - 16, 360);
    const panelH = isMobile ? 110 : 100;
    const panelX = cx - panelW / 2;
    const panelY = 6;

    // ========== Panel rounded dengan border hijau ==========
    this.panel = this.scene.add.graphics();
    this.panel.fillStyle(0x0d1b2a, 0.72);
    this.panel.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
    this.panel.lineStyle(1.5, 0x4caf50, 0.55);
    this.panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);
    this.panel.setScrollFactor(0).setDepth(49);

    // garis divider vertikal di tengah panel
    this.panel.lineStyle(1, 0xffffff, 0.12);
    this.panel.lineBetween(cx, panelY + 10, cx, panelY + panelH - 10);

    // ========== Style helper ==========
    const lbl = {
      fontSize: '10px',
      color: '#90a4ae',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    };
    const val = (color, size) => ({
      fontSize: size + 'px',
      color: color,
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });

    const valSize = isMobile ? 18 : 20;
    const subSize = isMobile ? 13 : 14;

    // ========== Baris 1: NYAWA (kiri) + SKOR (kanan) ==========
    const r1 = panelY + 22;
    this.livesLbl = this.scene.add.text(cx - panelW / 4, r1 - 13, 'NYAWA', lbl)
      .setOrigin(0.5).setScrollFactor(0).setDepth(50);
    this.livesText = this.scene.add.text(cx - panelW / 4, r1 + 3, '♥ ' + this.lives, val('#ff5252', valSize))
      .setOrigin(0.5).setScrollFactor(0).setDepth(50);

    this.scoreLbl = this.scene.add.text(cx + panelW / 4, r1 - 13, 'SKOR', lbl)
      .setOrigin(0.5).setScrollFactor(0).setDepth(50);
    this.scoreText = this.scene.add.text(cx + panelW / 4, r1 + 3, '★ ' + this.score, val('#ffeb3b', valSize))
      .setOrigin(0.5).setScrollFactor(0).setDepth(50);

    // ========== Baris 2: Level name (tengah, di atas divider) ==========
    const r2 = panelY + 52;
    const levelLabel = 'Lv ' + this.level + (this.levelName ? '  ·  ' + this.levelName : '');
    this.levelText = this.scene.add.text(cx, r2, levelLabel, val('#ffffff', subSize))
      .setOrigin(0.5).setScrollFactor(0).setDepth(50);

    // ========== Baris 3: WAKTU (kiri) + KOIN (kanan) ==========
    const r3 = panelY + 82;
    this.timeLbl = this.scene.add.text(cx - panelW / 4, r3 - 12, 'WAKTU', lbl)
      .setOrigin(0.5).setScrollFactor(0).setDepth(50);
    this.timeText = this.scene.add.text(cx - panelW / 4, r3 + 3, '00:00', val('#90caf9', subSize))
      .setOrigin(0.5).setScrollFactor(0).setDepth(50);

    this.coinLbl = this.scene.add.text(cx + panelW / 4, r3 - 12, 'KOIN', lbl)
      .setOrigin(0.5).setScrollFactor(0).setDepth(50);
    this.coinText = this.scene.add.text(cx + panelW / 4, r3 + 3, '◉ ' + this.collectedCoins + '/' + this.totalCoins, val('#ffd700', subSize))
      .setOrigin(0.5).setScrollFactor(0).setDepth(50);

    // ========== Mute indicator (di bawah panel) ==========
    this.muteText = this.scene.add.text(cx, panelY + panelH + 4, '🔇 MUTED', {
      fontSize: '12px',
      color: '#ff8080',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(50);
    this.muteText.setVisible(false);

    // ========== Tombol Home (kiri-atas) ==========
    // v14: tombol kecil untuk kembali ke menu utama dari dalam game
    const homeX = 8;
    const homeY = 8;
    const homeR = 18;
    this.homeBtn = this.scene.add.circle(homeX + homeR, homeY + homeR, homeR, 0x1a237e, 0.85)
      .setStrokeStyle(2, 0x4caf50, 0.7)
      .setScrollFactor(0).setDepth(60)
      .setInteractive({ useHandCursor: true });
    this.homeIcon = this.scene.add.text(homeX + homeR, homeY + homeR, '⌂', {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61);
    this.homeBtn.on('pointerdown', () => {
      if (this._onHome) this._onHome();
    });
    this.homeBtn.on('pointerover', () => this.homeBtn.setFillStyle(0x283593, 0.9));
    this.homeBtn.on('pointerout', () => this.homeBtn.setFillStyle(0x1a237e, 0.85));

    // ========== Tombol Pause (kanan-atas) ==========
    // v14: tombol pause tambahan di HUD (selain HTML button di mobile)
    const pauseR = 18;
    const pauseX = W - 8 - pauseR;
    this.pauseBtn = this.scene.add.circle(pauseX, homeY + pauseR, pauseR, 0x37474f, 0.85)
      .setStrokeStyle(2, 0xffffff, 0.5)
      .setScrollFactor(0).setDepth(60)
      .setInteractive({ useHandCursor: true });
    // dua bar竖直 pause
    this.pauseIcon1 = this.scene.add.rectangle(pauseX - 4, homeY + pauseR, 4, 14, 0xffffff)
      .setOrigin(0.5).setScrollFactor(0).setDepth(61);
    this.pauseIcon2 = this.scene.add.rectangle(pauseX + 4, homeY + pauseR, 4, 14, 0xffffff)
      .setOrigin(0.5).setScrollFactor(0).setDepth(61);
    this.pauseBtn.on('pointerdown', () => {
      if (this._onPause) this._onPause();
    });
    this.pauseBtn.on('pointerover', () => this.pauseBtn.setFillStyle(0x455a64, 0.9));
    this.pauseBtn.on('pointerout', () => this.pauseBtn.setFillStyle(0x37474f, 0.85));

    // ========== Versi di bawah layar ==========
    this.versionText = this.scene.add.text(cx, H - 4, 'v16', {
      fontSize: '10px',
      color: '#555555',
      fontFamily: 'Arial'
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(50);

    // ========== Desktop hint (pojok kanan-atas, desktop only) ==========
    if (!isMobile) {
      this.hintText = this.scene.add.text(W - 12, 12,
        'P: Pause  |  R: Restart  |  M: Mute  |  WASD/Arrow: Gerak  |  Spasi: Lompat', {
        fontSize: '10px',
        color: '#cccccc',
        fontFamily: 'Arial',
        stroke: '#000',
        strokeThickness: 2
      }).setOrigin(1, 0).setScrollFactor(0).setDepth(50);
    }
  }

  setLives(n) {
    this.lives = n;
    this.livesText.setText('♥ ' + this.lives);
  }

  setScore(s) {
    this.score = s;
    this.scoreText.setText('★ ' + this.score);
  }

  setTime(ms) {
    this.elapsedMs = ms;
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    this.timeText.setText(
      String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0')
    );
  }

  addCoin() {
    this.collectedCoins += 1;
    this.coinText.setText('◉ ' + this.collectedCoins + '/' + this.totalCoins);
  }

  setMute(muted) {
    this.muted = muted;
    this.muteText.setVisible(muted);
  }

  // v14: callback saat tombol home ditekan
  setHomeCallback(fn) {
    this._onHome = fn;
  }

  // v14: callback saat tombol pause HUD ditekan
  setPauseCallback(fn) {
    this._onPause = fn;
  }
}
