/**
 * src/scenes/GameScene.js
 * ---------------------------------------------------------------
 * Scene utama game. Memuat data level, membangun dunia, menangani
 * collision, pause, platform breakable, power-up, partikel, dan
 * alur menang/kalah/cutscene/ending.
 *
 * State UI: 'playing' | 'paused' | 'won' | 'lost'
 *
 * Input:
 *   - Keyboard: WASD/Panah + Space (desktop)
 *   - Touch: D-pad kiri/kanan + tombol A lompat (mobile)
 *
 * Peningkatan terbaru:
 *   - Touch controls untuk mobile (D-pad + jump)
 *   - SPACE/ENTER shortcut pada layar LEVEL SELESAI
 *   - Auto-advance 3 detik dengan countdown
 *   - Total koin diteruskan ke HUD
 * ---------------------------------------------------------------
 */
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Coin from '../entities/Coin.js';
import PowerUp from '../entities/PowerUp.js';
import HUD from '../systems/HUD.js';
import LevelManager from '../systems/LevelManager.js';
import { sound } from '../systems/SoundManager.js';
import { music } from '../systems/MusicManager.js';
import { levels } from '../data/levels.js';
import { getCutsceneStory } from '../data/story.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.lives = 5;
    this.score = 0;
    this.currentLevel = 1;
    this.gameState = 'playing';
    this.levelData = null;
    this.pauseOverlay = null;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.goalIndicator = null;
    this._autoAdvance = null;
    this._autoAdvanceText = null;
    // touch state (diinisialisasi di createTouchControls)
    this.touch = { left: false, right: false, jumpCounter: 0 };
    this._touchObjects = [];
  }

  init(data) {
    console.log('[GameScene v10] init() data=' + JSON.stringify(data));
    if (data && data.level) {
      this.currentLevel = data.level;
    }
    // v7: scene.start() pada scene yang sama = RESTART, bukan instance baru.
    // Constructor TIDAK jalan lagi, jadi SEMUA state yang di-set di
    // constructor harus di-reset manual di sini. Sebelumnya gameState
    // tetap 'won' dari overlay level complete → input blocked di level
    // baru → player stuck gak bisa gerak.
    this.gameState = 'playing';
    this.levelData = null;
    this.pauseOverlay = null;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.goalIndicator = null;
    this._autoAdvance = null;
    this._autoAdvanceText = null;
    this.touch = { left: false, right: false, jumpCounter: 0 };
    this._touchObjects = [];
    // lives & score PERSIST across levels (tidak di-reset)
  }

  create() {
    console.log('[GameScene v10] create() level=' + this.currentLevel);
    try {
      this.levelData = levels.find(l => l.id === this.currentLevel);
      if (!this.levelData) {
        if (levels.length === 0) {
          this.showEmptyState();
        } else {
          this.showError('Level ' + this.currentLevel + ' tidak ditemukan.');
        }
        return;
      }

      // Validasi minimal data level
      if (!this.levelData.platforms || this.levelData.platforms.length === 0) {
        this.showError('Level ' + this.currentLevel + ' tidak punya platform.');
        return;
      }

      this.startTime = this.time.now;
      this.elapsedTime = 0;

      this.setupWorld(this.levelData);
      this.createBackground();
      this.createPlatforms(this.levelData.platforms);
      this.createCoins(this.levelData.coins || []);
      this.createEnemies(this.levelData.enemies || []);
      this.createPowerUps(this.levelData.powerUps || []);
      this.createGoal(this.levelData.goal);
      this.createPlayer(this.levelData.player);
      this.setupCollisions();
      this.setupCamera();
      this.setupInput();
      this.hud = new HUD(
        this,
        this.lives,
        this.score,
        this.currentLevel,
        this.levelData.name,
        (this.levelData.coins || []).length
      );
      // v14: hubungkan tombol home & pause di HUD
      this.hud.setHomeCallback(() => this._confirmGoHome());
      this.hud.setPauseCallback(() => this.togglePause());
      this.createTouchControls();

      sound.init();
      this.input.keyboard.once('keydown', () => sound.resume());
      this.input.once('pointerdown', () => sound.resume());

      // v10: dengarkan event pause dari HTML button
      this.game.events.on('mobile-pause', this.togglePause, this);

      // v17: BGM per level range + ambient abyss hum
      this._playBGMForLevel();
      music.playAmbient();

      // stop musik saat scene shutdown
      this.events.once('shutdown', () => {
        music.stopAll();
        this.game.events.off('mobile-pause', this.togglePause, this);
      });

      console.log('[GameScene v7] create() done. coins=' +
        (this.levelData.coins || []).length +
        ' platforms=' + (this.levelData.platforms || []).length);
    } catch (err) {
      console.error('[GameScene v7] create() error:', err);
      this.showError('Error di level ' + this.currentLevel + ': ' + (err && err.message ? err.message : err));
    }
  }

  setupWorld(levelData) {
    this.physics.world.setBounds(0, 0, levelData.world.width, levelData.world.height);
  }

  createBackground() {
    // GrimPass: latar langit gelap gradasi ungu-hitam
    const W = this.cameras.main.width;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d001a, 0x0d001a, 0x1a0033, 0x1a0033, 1);
    bg.fillRect(0, 0, W, 800);
    bg.setScrollFactor(0);

    // bintang berkelip (banyak)
    for (let i = 0; i < 25; i++) {
      const x = Phaser.Math.Between(0, 2400);
      const y = Phaser.Math.Between(0, 300);
      const isPurple = Phaser.Math.Between(0, 1) === 0;
      const s = this.add.circle(x, y, 1, isPurple ? 0xce93d8 : 0x80deea, 0.6);
      s.setScrollFactor(0.3);
      this.tweens.add({
        targets: s,
        alpha: 0.1,
        duration: Phaser.Math.Between(1500, 3500),
        yoyo: true,
        repeat: -1
      });
    }
  }

  createPlatforms(platforms) {
    this.platforms = this.physics.add.staticGroup();
    platforms.forEach(p => {
      const texture = p.breakable ? 'platform-breakable' : 'platform';
      let drawn = 0;
      while (drawn < p.width) {
        const tileW = Math.min(32, p.width - drawn);
        const platform = this.platforms.create(p.x + drawn, p.y, texture);
        platform.setDisplaySize(tileW, p.height);
        platform.setOrigin(0, 0);
        platform.refreshBody();
        if (p.breakable) {
          platform.setData('breakable', true);
          platform.setData('breaking', false);
        }
        drawn += tileW;
      }
    });
  }

  createCoins(coinsData) {
    this.coins = [];
    console.log('[v5] Creating ' + coinsData.length + ' coins');
    coinsData.forEach((c, i) => {
      const coin = new Coin(this, c.x, c.y);
      console.log('[v5] Coin ' + i + ' at (' + c.x + ', ' + c.y + ')');
      this.coins.push(coin);
    });
    this._lastCoinCount = coinsData.length;
  }

  createEnemies(enemiesData) {
    // v8: runChildUpdate=true supaya Enemy.update() terpanggil tiap frame.
    // Sebelumnya default false → patrol & wall-flip logic tidak jalan,
    // enemy cuma pakai velocity awal lalu diam setelah nabrak world bound.
    this.enemies = this.physics.add.group({ runChildUpdate: true });
    enemiesData.forEach(e => {
      const enemy = new Enemy(this, e.x, e.y, e);
      this.enemies.add(enemy);
    });
  }

  createPowerUps(powerUpsData) {
    this.powerUps = this.physics.add.group();
    powerUpsData.forEach(p => {
      const powerUp = new PowerUp(this, p.x, p.y, p.type);
      this.powerUps.add(powerUp);
    });
  }

  createGoal(goal) {
    this.goal = this.physics.add.staticSprite(goal.x, goal.y, 'goal');
    this.goal.setOrigin(0.5, 1);
    this.goal.body.setSize(60, 80);
  }

  createPlayer(playerData) {
    this.player = new Player(this, playerData.x, playerData.y);
  }

  setupCollisions() {
    this.physics.add.collider(this.player, this.platforms, (player, platform) => {
      if (
        platform.getData('breakable') &&
        !platform.getData('breaking') &&
        player.body.touching.down &&
        platform.body.touching.up
      ) {
        this.startBreaking(platform);
      }
    });
    this.physics.add.collider(this.enemies, this.platforms);
    // v5: coin overlap di-handle MANUAL di update() — lihat coinOverlap()
    this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);
    this.physics.add.collider(this.player, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.powerUps, this.collectPowerUp, null, this);
  }

  startBreaking(platform) {
    platform.setData('breaking', true);
    this.tweens.add({
      targets: platform,
      alpha: 0.3,
      duration: 120,
      yoyo: true,
      repeat: 5
    });
    sound.play('break');
    this.time.delayedCall(2000, () => {
      if (platform.active) platform.destroy();
    });
  }

  setupCamera() {
    const bounds = this.physics.world.bounds;
    this.cameras.main.setBounds(0, 0, bounds.width, bounds.height);
    this.cameras.main.startFollow(this.player, true, 0.3, 0.3);
    this.cameras.main.setDeadzone(80, 60);
  }

  setupInput() {
    this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.keyR.on('down', () => this.restartLevel());
    this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.keyP.on('down', () => this.togglePause());
    this.keyEsc = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keyEsc.on('down', () => this.togglePause());
    this.keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    this.keyM.on('down', () => {
      const muted = sound.toggleMute();
      this.hud.setMute(muted);
    });

    this.keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.keyUp = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keySpace.on('down', () => this.handleAdvanceKey());
    this.keyEnter.on('down', () => this.handleAdvanceKey());
  }

  handleAdvanceKey() {
    if (this.gameState === 'won') {
      this.advanceToNext();
    }
  }

  // ============================================================
  // =============== v14: HOME & CONFIRM DIALOG ================
  // ============================================================

  /**
   * Konfirmasi sebelum kembali ke menu utama. Jika pemain
   * tidak sengaja tap tombol home, bisa batal.
   */
  _confirmGoHome() {
    if (this.gameState === 'won' || this.gameState === 'lost') {
      // langsung kembali kalau sudah di layar menang/kalah
      this.scene.start('LevelSelectScene');
      return;
    }
    if (this._confirmOverlay) return;  // sudah ada
    this._confirmOverlay = [];
    const cam = this.cameras.main;
    const W = cam.width;
    const H = cam.height;
    const cx = W / 2;
    const cy = H / 2;
    const isMobile = W < 600;

    // Pause game sementara
    this.gameState = 'paused';
    this.physics.world.pause();
    this.time.paused = true;

    const bg = this.add.rectangle(cx, cy, Math.min(W - 40, 480), 220, 0x0d001a, 0.88)
      .setScrollFactor(0).setDepth(300).setStrokeStyle(2, 0x7c4dff, 0.6);
    const title = this.add.text(cx, cy - 70, 'Kembali ke Menu?', {
      fontSize: (isMobile ? 22 : 26) + 'px',
      color: '#ce93d8',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);
    const sub = this.add.text(cx, cy - 35, 'Progress tingkat ini akan hilang.', {
      fontSize: '14px',
      color: '#9fa8da',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(301);

    // Tombol Ya — ungu
    const yaBtn = this.add.rectangle(cx - 70, cy + 30, 120, 48, 0x4527a0)
      .setStrokeStyle(2, 0xce93d8, 0.7)
      .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
    const yaTxt = this.add.text(cx - 70, cy + 30, 'YA', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    yaBtn.on('pointerdown', () => {
      sound.play('click');
      this._dismissConfirm();
      this.scene.start('LevelSelectScene');
    });
    yaBtn.on('pointerover', () => yaBtn.setFillStyle(0x66bb6a));
    yaBtn.on('pointerout', () => yaBtn.setFillStyle(0x4caf50));

    // Tombol Batal
    const batalBtn = this.add.rectangle(cx + 70, cy + 30, 120, 48, 0x757575)
      .setStrokeStyle(2, 0xffffff, 0.5)
      .setScrollFactor(0).setDepth(301).setInteractive({ useHandCursor: true });
    const batalTxt = this.add.text(cx + 70, cy + 30, 'BATAL', {
      fontSize: '20px', color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302);
    batalBtn.on('pointerdown', () => {
      sound.play('click');
      this._dismissConfirm();
      this.resumeGame();
    });
    batalBtn.on('pointerover', () => batalBtn.setFillStyle(0x9e9e9e));
    batalBtn.on('pointerout', () => batalBtn.setFillStyle(0x757575));

    this._confirmOverlay.push(bg, title, sub, yaBtn, yaTxt, batalBtn, batalTxt);
  }

  _dismissConfirm() {
    if (this._confirmOverlay) {
      this._confirmOverlay.forEach(o => o.destroy());
      this._confirmOverlay = null;
    }
  }

  // ============================================================
  // =============== TOUCH CONTROLS (MOBILE) ===================
  // ============================================================

  /**
   * Buat D-pad kiri/kanan + tombol A (lompat) di layar.
   * Posisi fix di layar (setScrollFactor(0), depth 500).
   * Hidden saat pause/menu (di-shutdown via shutdown()).
   *
   * v8: HANYA tampilkan di touch device. Desktop pakai keyboard saja
   * supaya tidak menutupi area game. Phaser.device.input.touch bisa
   * true di beberapa desktop browser (touch laptop), tapi biasanya
   * user ingin keyboard.
   */
  createTouchControls() {
    this.touch = { left: false, right: false, jumpCounter: 0 };
    this._touchObjects = [];

    // v10: kontrol dihandle oleh HTML button (lihat index.html),
    // bukan Phaser overlay. Method ini jadi no-op.
  }

  hideTouchControls() {
    if (this._touchObjects) {
      this._touchObjects.forEach(o => { if (o && o.destroy) o.destroy(); });
      this._touchObjects = [];
    }
    if (this.touch) {
      this.touch.left = false;
      this.touch.right = false;
      this.touch.jumpCounter = 0;
    }
  }

  // ============================================================
  // =============== UPDATE LOOP ==============================
  // ============================================================

  update(time, delta) {
    if (this.gameState === 'paused') return;
    if (!this.player || !this.player.active) return;

    if (this.gameState === 'playing') {
      this.elapsedTime = this.time.now - this.startTime;
      this.hud.setTime(this.elapsedTime);

      // v10: gabungkan keyboard + Phaser touch + HTML touch input
      const inHTML = window.__input || {};
      const left = this.keyLeft.isDown || this.keyA.isDown ||
        (this.touch && this.touch.left) || inHTML.left;
      const right = this.keyRight.isDown || this.keyD.isDown ||
        (this.touch && this.touch.right) || inHTML.right;
      const jump =
        Phaser.Input.Keyboard.JustDown(this.keyUp) ||
        Phaser.Input.Keyboard.JustDown(this.keyW) ||
        Phaser.Input.Keyboard.JustDown(this.keySpace) ||
        (this.touch && this.touch.jumpCounter > 0) ||
        inHTML.jumpPressed;
      if (this.touch && this.touch.jumpCounter > 0) {
        this.touch.jumpCounter -= 1;
      }
      if (inHTML.jumpPressed) {
        inHTML.jumpPressed = false;
      }
      this.player.handleInput(left, right, jump, delta);

      // v5: manual coin overlap (coin tidak punya physics body)
      this.coinOverlap();

      if (this.levelData && this.player.x >= this.levelData.goal.x) {
        this.reachGoal();
      }

      if (this.player.y > this.physics.world.bounds.height + 80) {
        this.playerDie();
      }

      this.updateGoalIndicator();
    } else {
      this.player.setVelocityX(0);
    }
  }

  updateGoalIndicator() {
    if (this.goalIndicator) {
      this.goalIndicator.destroy();
      this.goalIndicator = null;
    }
    if (!this.levelData) return;
    const dist = this.levelData.goal.x - this.player.x;
    if (dist > 0 && dist < 600) {
      this.goalIndicator = this.add.text(
        this.cameras.main.width / 2,
        120,
        'GOAL: ' + Math.ceil(dist) + ' px',
        {
          fontSize: '14px',
          color: '#ffeb3b',
          fontFamily: 'Arial',
          stroke: '#000',
          strokeThickness: 3
        }
      ).setOrigin(0.5).setScrollFactor(0).setDepth(50);
    }
  }

  // ---- collectibles ----

  collectCoin(player, coin) {
    if (!coin || coin._collected) return;
    console.log('[v5] collectCoin at (' + coin.x + ', ' + coin.y + ')');
    coin.collect();
    this.score += coin.value;
    this.hud.setScore(this.score);
    this.hud.addCoin();
    this.spawnCoinBurst(coin.x, coin.y);
    sound.play('coin');
  }

  /**
   * v5: cek overlap coin manual (distance squared check).
   * Threshold 28^2 = 784. Coin tidak punya physics body,
   * jadi tidak mungkin "jatuh" / "hilang" karena physics.
   */
  coinOverlap() {
    if (!this.coins || !this.player) return;
    const px = this.player.x;
    const py = this.player.y;
    for (let i = 0; i < this.coins.length; i++) {
      const coin = this.coins[i];
      if (!coin || coin._collected || !coin.active) continue;
      const dx = coin.x - px;
      const dy = coin.y - py;
      if (dx * dx + dy * dy < 784) {  // dist < 28
        this.collectCoin(this.player, coin);
      }
    }
  }

  collectPowerUp(player, powerUp) {
    if (!powerUp.active) return;
    powerUp.collect();

    if (powerUp.type === 'mushroom') {
      this.lives = Math.min(99, this.lives + 1);
      this.hud.setLives(this.lives);
      this.showFloatingText('+1 NYAWA', powerUp.x, powerUp.y, '#ffeb3b');
      sound.play('mushroom');
    } else if (powerUp.type === 'star') {
      this.player.collectStar();
      this.showFloatingText('BINTANG!', powerUp.x, powerUp.y, '#fdd835');
    }
  }

  // ---- particles ----

  spawnCoinBurst(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i + Math.random() * 0.4;
      const dist = 22 + Math.random() * 12;
      const p = this.add.circle(x, y, 3 + Math.random() * 2, 0xffd700);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 450,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }

  spawnStompBurst(x, y) {
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI * 2 / 10) * i + Math.random() * 0.3;
      const dist = 18 + Math.random() * 10;
      const p = this.add.circle(x, y, 3 + Math.random() * 2, 0xd72c2c);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 350,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy()
      });
    }
  }

  showFloatingText(text, x, y, color) {
    const t = this.add.text(x, y, text, {
      fontSize: '20px',
      color: color || '#ffeb3b',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
    this.tweens.add({
      targets: t,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => t.destroy()
    });
  }

  // ---- goal & death ----

  reachGoal() {
    if (this.gameState !== 'playing') return;
    this.gameState = 'won';
    console.log('[GameScene v6] reachGoal() level=' + this.currentLevel);
    if (this.goalIndicator) {
      this.goalIndicator.destroy();
      this.goalIndicator = null;
    }
    if (this.player) this.player.setVelocity(0, 0);
    LevelManager.markCompleted(this.currentLevel, this.score);
    sound.play('win');
    this.showLevelComplete();
  }

  hitEnemy(player, enemy) {
    if (this.gameState !== 'playing') return;
    if (!enemy.active || enemy.isDying) return;

    if (player.isInvincible) {
      enemy.die();
      this.score += 100;
      this.hud.setScore(this.score);
      this.spawnStompBurst(enemy.x, enemy.y);
      sound.play('stomp');
      return;
    }

    const playerBottom = player.body.bottom;
    const enemyTop = enemy.body.top;
    if (player.body.velocity.y > 0 && playerBottom <= enemyTop + 12) {
      enemy.die();
      player.setVelocityY(-400);
      this.score += 100;
      this.hud.setScore(this.score);
      this.spawnStompBurst(enemy.x, enemy.y);
      sound.play('stomp');
    } else {
      this.playerDie();
    }
  }

  playerDie() {
    if (this.gameState !== 'playing') return;
    this.lives -= 1;
    this.hud.setLives(this.lives);
    if (this.goalIndicator) {
      this.goalIndicator.destroy();
      this.goalIndicator = null;
    }
    if (this.player) this.player.die();

    if (this.lives <= 0) {
      this.gameState = 'lost';
      this.time.delayedCall(900, () => this.showGameOver());
    } else {
      this.time.delayedCall(900, () => {
        if (this.player) this.player.respawn();
      });
    }
  }

  // ---- UI overlays ----

  /**
   * Helper: posisi overlay center di SCREEN space (bukan world).
   * Dengan setScrollFactor(0), posisi = posisi layar, jadi pakai
   * cam.width/2 & cam.height/2 (bukan worldView).
   * FIX bug: dulu pakai worldView → overlay ke luar layar di level lebar.
   */
  getScreenCenter() {
    return {
      x: this.cameras.main.width / 2,
      y: this.cameras.main.height / 2
    };
  }

  showLevelComplete() {
    this.hideTouchControls();
    const cam = this.cameras.main;
    const W = cam.width;
    const H = cam.height;
    const cx = W / 2;
    const cy = H / 2;
    const isMobile = W < 600 || this.sys.game.device.input.touch;

    // Overlay — INTERACTIVE
    const overlayW = Math.min(W - 40, 620);
    const overlayH = Math.min(H - 40, 420);
    const overlay = this.add.rectangle(cx, cy, overlayW, overlayH, 0x0d001a, 0.85)
      .setScrollFactor(0).setDepth(99)
      .setStrokeStyle(2, 0x7c4dff, 0.5)
      .setInteractive({ useHandCursor: true });
    overlay.on('pointerdown', () => {
      if (this.gameState === 'won') this.advanceToNext();
    });

    const titleSize = isMobile ? 28 : 34;
    this.add.text(cx, cy - (isMobile ? 150 : 160), 'TINGKAT ' + this.currentLevel + ' TERLEWATI', {
      fontSize: titleSize + 'px',
      color: '#ce93d8',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    this.add.text(cx, cy - (isMobile ? 110 : 115), 'Skor: ' + this.score + '   Waktu: ' + this.formatTime(this.elapsedTime), {
      fontSize: (isMobile ? 17 : 20) + 'px',
      color: '#80deea',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    // ====== Tombol "LANJUT" (mobile-friendly) ======
    let label;
    if (this.currentLevel === 100) {
      label = 'Lanjut ke Penutup';
    } else if (this.currentLevel % 10 === 0) {
      label = 'Lanjut (Cerita)';
    } else {
      label = 'Lanjut Tingkat ' + (this.currentLevel + 1);
    }

    const lanjutBtnY = isMobile ? cy - 50 : cy - 40;
    const lanjutBtnW = isMobile ? W - 80 : 320;
    const lanjutBtnH = isMobile ? 70 : 60;
    const lanjutBtn = this.add.rectangle(cx, lanjutBtnY, lanjutBtnW, lanjutBtnH, 0x4527a0)
      .setScrollFactor(0).setDepth(101)
      .setStrokeStyle(3, 0xce93d8, 0.8)
      .setInteractive({ useHandCursor: true });
    const lanjutTxt = this.add.text(cx, lanjutBtnY, label, {
      fontSize: (isMobile ? 20 : 22) + 'px',
      color: '#e0e0e0',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
    lanjutBtn.on('pointerdown', () => {
      if (this.gameState === 'won') this.advanceToNext();
    });
    lanjutBtn.on('pointerover', () => lanjutBtn.setFillStyle(0x5e35b1));
    lanjutBtn.on('pointerout', () => lanjutBtn.setFillStyle(0x4527a0));

    // Tombol Ulangi & Menu
    const otherBtnY = isMobile ? lanjutBtnY + 60 : lanjutBtnY + 55;
    this.makeMenuButton(cx, otherBtnY, 'Ulangi Tingkat', () => {
      this.cancelAutoAdvance();
      this.scene.start('GameScene', { level: this.currentLevel });
    }, 100);
    this.makeMenuButton(cx, otherBtnY + 45, 'Menu Tingkat', () => {
      this.cancelAutoAdvance();
      this.scene.start('LevelSelectScene');
    }, 100);

    // Hint
    const hintY = otherBtnY + 95;
    const hintText = isMobile
      ? 'TAP BUTTON TO CONTINUE'
      : 'PRESS SPACE / ENTER  or  CLICK BUTTON';
    const hint = this.add.text(cx, hintY, hintText, {
      fontSize: (isMobile ? 12 : 14) + 'px',
      color: '#ce93d8',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.tweens.add({
      targets: hint,
      alpha: 0.4,
      duration: 600,
      yoyo: true,
      repeat: -1
    });

    this.startAutoAdvance(8);
  }

  advanceToNext() {
    console.log('[GameScene v6] advanceToNext() from level=' + this.currentLevel);
    this.cancelAutoAdvance();
    if (this.currentLevel === 100) {
      this.scene.start('EndingScene', { score: this.score, time: this.elapsedTime });
    } else if (this.currentLevel % 10 === 0) {
      const cutscene = getCutsceneStory(this.currentLevel);
      this.scene.start('CutScene', {
        levelNumber: this.currentLevel,
        cutscene,
        nextLevel: this.currentLevel + 1
      });
    } else {
      const nextLevel = this.currentLevel + 1;
      console.log('[GameScene v6] -> GameScene level=' + nextLevel);
      this.scene.start('GameScene', { level: nextLevel });
    }
  }

  startAutoAdvance(seconds) {
    this.cancelAutoAdvance();
    const cam = this.cameras.main;
    const cx = cam.width / 2;  // SCREEN center
    const cy = cam.height / 2;
    const isMobile = cam.width < 600;

    this._autoAdvanceText = this.add.text(cx, cy + (isMobile ? 165 : 175), '', {
      fontSize: (isMobile ? 14 : 16) + 'px',
      color: '#90ee90',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    let remaining = seconds;
    const tick = () => {
      if (this.gameState !== 'won') {
        this.cancelAutoAdvance();
        return;
      }
      this._autoAdvanceText.setText('Auto lanjut dalam ' + remaining + ' detik... (klik untuk skip)');
      remaining -= 1;
      if (remaining < 0) {
        this.advanceToNext();
      } else {
        this._autoAdvance = this.time.delayedCall(1000, tick);
      }
    };
    tick();
  }

  cancelAutoAdvance() {
    if (this._autoAdvance) {
      this._autoAdvance.remove();
      this._autoAdvance = null;
    }
    if (this._autoAdvanceText) {
      this._autoAdvanceText.destroy();
      this._autoAdvanceText = null;
    }
  }

  showGameOver() {
    this.hideTouchControls();
    const cam = this.cameras.main;
    const W = cam.width;
    const H = cam.height;
    const cx = W / 2;  // SCREEN center, bukan world
    const cy = H / 2;
    const isMobile = W < 600 || this.sys.game.device.input.touch;

    // v17: overlay tema gelap GrimPass (ungu/merah)
    const ovW = Math.min(W - 40, 560);
    const ovH = Math.min(H - 40, 380);
    const ov = this.add.rectangle(cx, cy, ovW, ovH, 0x0d001a, 0.88)
      .setScrollFactor(0).setDepth(99)
      .setStrokeStyle(3, 0xff5252, 0.7);

    this.add.text(cx, cy - (isMobile ? 130 : 145), 'JIWA PADAM', {
      fontSize: (isMobile ? 40 : 52) + 'px',
      color: '#ff5252',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    this.add.text(cx, cy - (isMobile ? 85 : 95), 'Skor: ' + this.score, {
      fontSize: (isMobile ? 18 : 22) + 'px',
      color: '#80deea',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    // v17: tombol lebih besar & jelas. 3 opsi: lanjut, ulangi, menu
    const btnW = isMobile ? W - 80 : 280;
    const btnH = isMobile ? 52 : 48;
    const gap = isMobile ? 8 : 10;
    const startY = cy - (isMobile ? 30 : 30);

    // Lanjut (1 jiwa) — ungu
    const retry = this.add.rectangle(cx, startY, btnW, btnH, 0x4527a0)
      .setScrollFactor(0).setDepth(101)
      .setStrokeStyle(3, 0xce93d8, 0.7)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, startY, 'LANJUT (+1 JIWA)', {
      fontSize: (isMobile ? 18 : 18) + 'px',
      color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
    retry.on('pointerdown', () => {
      sound.play('click');
      this.lives = 1;
      this.hud.setLives(this.lives);
      this.scene.start('GameScene', { level: this.currentLevel });
    });
    retry.on('pointerover', () => retry.setFillStyle(0x5e35b1));
    retry.on('pointerout', () => retry.setFillStyle(0x4527a0));

    // Ulangi dari 0 (5 jiwa) — cyan
    const restart = this.add.rectangle(cx, startY + btnH + gap, btnW, btnH, 0x00838f)
      .setScrollFactor(0).setDepth(101)
      .setStrokeStyle(3, 0x80deea, 0.7)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, startY + btnH + gap, 'ULANGI DARI 0 (5 JIWA)', {
      fontSize: (isMobile ? 18 : 18) + 'px',
      color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
    restart.on('pointerdown', () => {
      sound.play('click');
      this.lives = 5;
      this.scene.start('GameScene', { level: this.currentLevel });
    });
    restart.on('pointerover', () => restart.setFillStyle(0x00acc1));
    restart.on('pointerout', () => restart.setFillStyle(0x00838f));

    // Menu — merah marun
    const menu = this.add.rectangle(cx, startY + 2 * (btnH + gap), btnW, btnH, 0xb71c1c)
      .setScrollFactor(0).setDepth(101)
      .setStrokeStyle(3, 0xff8a80, 0.7)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, startY + 2 * (btnH + gap), 'KEMBALI KE MENU', {
      fontSize: (isMobile ? 18 : 18) + 'px',
      color: '#ffffff', fontFamily: 'Arial', fontStyle: 'bold',
      stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
    menu.on('pointerdown', () => {
      sound.play('click');
      this.scene.start('LevelSelectScene');
    });
    menu.on('pointerover', () => menu.setFillStyle(0xd32f2f));
    menu.on('pointerout', () => menu.setFillStyle(0xb71c1c));
  }

  togglePause() {
    if (this.gameState === 'won' || this.gameState === 'lost') return;
    if (this.gameState === 'paused') {
      this.resumeGame();
    } else {
      this.pauseGame();
    }
  }

  pauseGame() {
    this.gameState = 'paused';
    this.physics.world.pause();
    this.time.paused = true;
    this.showPauseOverlay();
  }

  resumeGame() {
    this.gameState = 'playing';
    this.physics.world.resume();
    this.time.paused = false;
    this.hidePauseOverlay();
  }

  showPauseOverlay() {
    this.hideTouchControls();
    this.pauseOverlay = [];
    const cam = this.cameras.main;
    const W = cam.width;
    const H = cam.height;
    const cx = W / 2;  // SCREEN center, bukan world
    const cy = H / 2;
    const isMobile = W < 600 || this.sys.game.device.input.touch;

    const bg = this.add.rectangle(cx, cy, Math.min(W - 40, 560), Math.min(H - 40, 340), 0x0d001a, 0.85)
      .setScrollFactor(0).setDepth(200).setStrokeStyle(2, 0x7c4dff, 0.5);
    const title = this.add.text(cx, cy - (isMobile ? 110 : 120), 'JEDA', {
      fontSize: (isMobile ? 40 : 52) + 'px',
      color: '#ce93d8',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0).setDepth(201);
    this.pauseOverlay.push(bg, title);

    this.makeMenuButton(cx, cy - 30, 'Lanjut', () => this.resumeGame(), 201);
    this.makeMenuButton(cx, cy + 25, 'Ulangi', () => {
      this.hidePauseOverlay();
      this.scene.start('GameScene', { level: this.currentLevel });
    }, 201);
    this.makeMenuButton(cx, cy + 80, 'Menu', () => {
      this.scene.start('LevelSelectScene');
    }, 201);
  }

  hidePauseOverlay() {
    if (this.pauseOverlay) {
      this.pauseOverlay.forEach(obj => obj.destroy());
      this.pauseOverlay = null;
    }
  }

  makeMenuButton(cx, y, label, callback, depth) {
    const d = depth || 100;
    const btn = this.add.rectangle(cx, y, 220, 44, 0x4527a0)
      .setScrollFactor(0).setDepth(d)
      .setStrokeStyle(2, 0xce93d8, 0.6)
      .setInteractive({ useHandCursor: true });
    const txt = this.add.text(cx, y, label, {
      fontSize: '19px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(d + 1);
    btn.on('pointerdown', () => {
      sound.play('click');
      callback();
    });
    btn.on('pointerover', () => btn.setFillStyle(0x5e35b1));
    btn.on('pointerout', () => btn.setFillStyle(0x4527a0));
  }

  formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  }

  restartLevel() {
    this.cancelAutoAdvance();
    this.scene.start('GameScene', { level: this.currentLevel });
  }

  // ===== v17: BGM selection per level range (dark fantasy tracks) =====
  _playBGMForLevel() {
    let track;
    if (this.currentLevel <= 30) track = 'passage';
    else if (this.currentLevel <= 60) track = 'pursuit';
    else if (this.currentLevel <= 99) track = 'cursed';
    else track = 'peace';
    music.playBGM(track);
  }

  showEmptyState() {
    this.add.text(300, 400, 'Belum ada level tersedia', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  showError(msg) {
    this.add.text(300, 400, msg, {
      fontSize: '24px',
      color: '#ff5555',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 560 },
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
  }
}
