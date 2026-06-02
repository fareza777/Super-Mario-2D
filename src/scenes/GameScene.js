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
    if (data && data.level) {
      this.currentLevel = data.level;
    }
    // reset touch state setiap kali scene (re)init
    this.touch = { left: false, right: false, jumpCounter: 0 };
  }

  create() {
    console.log('[GameScene v4] create() level=' + this.currentLevel);
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
      this.createTouchControls();

      sound.init();
      this.input.keyboard.once('keydown', () => sound.resume());
      this.input.once('pointerdown', () => sound.resume());

      console.log('[GameScene v4] create() done. coins=' +
        (this.levelData.coins || []).length +
        ' platforms=' + (this.levelData.platforms || []).length);
    } catch (err) {
      console.error('[GameScene v4] create() error:', err);
      this.showError('Error di level ' + this.currentLevel + ': ' + (err && err.message ? err.message : err));
    }
  }

  setupWorld(levelData) {
    this.physics.world.setBounds(0, 0, levelData.world.width, levelData.world.height);
  }

  createBackground() {
    const w = this.physics.world.bounds.width;
    const h = this.physics.world.bounds.height;
    this.add.rectangle(0, 0, w, h, 0x87CEEB).setOrigin(0, 0).setScrollFactor(0);
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
    this.coins = this.physics.add.group();
    coinsData.forEach(c => {
      const coin = new Coin(this, c.x, c.y);
      this.coins.add(coin);
    });
  }

  createEnemies(enemiesData) {
    this.enemies = this.physics.add.group();
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
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
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
  // =============== TOUCH CONTROLS (MOBILE) ===================
  // ============================================================

  /**
   * Buat D-pad kiri/kanan + tombol A (lompat) di layar.
   * Posisi fix di layar (setScrollFactor(0), depth 500).
   * Hidden saat pause/menu (di-shutdown via shutdown()).
   */
  createTouchControls() {
    this.touch = { left: false, right: false, jumpCounter: 0 };
    this._touchObjects = [];

    // deteksi mobile (untuk menampilkan hint)
    const isTouch = this.sys.game.device.input.touch;

    const baseAlpha = isTouch ? 0.45 : 0.25;
    const pressedAlpha = 0.75;
    const dpadColor = 0x2196f3;
    const dpadPressed = 0x64b5f6;
    const jumpColor = 0x4caf50;
    const jumpPressed = 0x81c784;

    const camH = this.cameras.main.height;
    const camW = this.cameras.main.width;
    const btnY = camH - 60;
    const makeBtn = (x, y, w, h, label, baseC, pressedC, fontSize, onDown, onUp) => {
      const btn = this.add.rectangle(x, y, w, h, baseC, baseAlpha)
        .setScrollFactor(0)
        .setDepth(500)
        .setStrokeStyle(3, 0xffffff, 0.5)
        .setInteractive({ useHandCursor: true });
      const txt = this.add.text(x, y, label, {
        fontSize: fontSize + 'px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5).setScrollFactor(0).setDepth(501);

      btn.on('pointerdown', () => {
        if (onDown) onDown();
        btn.setFillStyle(pressedC, pressedAlpha);
        btn.setScale(0.95);
        try { sound.play('click'); } catch (e) { /* ignore */ }
      });
      btn.on('pointerup', () => {
        if (onUp) onUp();
        btn.setFillStyle(baseC, baseAlpha);
        btn.setScale(1);
      });
      btn.on('pointerout', () => {
        if (onUp) onUp();
        btn.setFillStyle(baseC, baseAlpha);
        btn.setScale(1);
      });
      this._touchObjects.push(btn, txt);
    };

    // D-pad kiri
    makeBtn(
      80, btnY, 80, 80, '\u25C0',
      dpadColor, dpadPressed, 36,
      () => { this.touch.left = true; },
      () => { this.touch.left = false; }
    );
    // D-pad kanan
    makeBtn(
      180, btnY, 80, 80, '\u25B6',
      dpadColor, dpadPressed, 36,
      () => { this.touch.right = true; },
      () => { this.touch.right = false; }
    );
    // Lompat
    makeBtn(
      camW - 80, btnY, 100, 100, 'A',
      jumpColor, jumpPressed, 56,
      () => { this.touch.jumpCounter += 1; },
      null
    );
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

      const left = this.keyLeft.isDown || this.keyA.isDown || (this.touch && this.touch.left);
      const right = this.keyRight.isDown || this.keyD.isDown || (this.touch && this.touch.right);
      const jump =
        Phaser.Input.Keyboard.JustDown(this.keyUp) ||
        Phaser.Input.Keyboard.JustDown(this.keyW) ||
        Phaser.Input.Keyboard.JustDown(this.keySpace) ||
        (this.touch && this.touch.jumpCounter > 0);
      if (this.touch && this.touch.jumpCounter > 0) {
        this.touch.jumpCounter -= 1;
      }
      this.player.handleInput(left, right, jump, delta);

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
    if (!coin.active) return;
    coin.collect();
    this.score += coin.value;
    this.hud.setScore(this.score);
    this.hud.addCoin();
    this.spawnCoinBurst(coin.x, coin.y);
    sound.play('coin');
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
    console.log('[GameScene v4] reachGoal() level=' + this.currentLevel);
    if (this.goalIndicator) {
      this.goalIndicator.destroy();
      this.goalIndicator = null;
    }
    if (this.player) this.player.setVelocity(0, 0);
    LevelManager.markCompleted(this.currentLevel, this.score);
    sound.play('win');
    this.showLevelComplete();
    // v4: auto-advance DIHAPUS. User harus klik tombol atau tekan SPACE/ENTER.
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

  showLevelComplete() {
    this.hideTouchControls();
    const cam = this.cameras.main;
    const cx = cam.worldView.x + cam.width / 2;
    const cy = cam.worldView.y + cam.height / 2;

    // Overlay — INTERACTIVE supaya klik di area kosong juga lanjut
    const overlay = this.add.rectangle(cx, cy, 600, 380, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(99)
      .setInteractive({ useHandCursor: true });
    overlay.on('pointerdown', () => {
      console.log('[GameScene v4] overlay click -> advance');
      if (this.gameState === 'won') this.advanceToNext();
    });

    this.add.text(cx, cy - 145, 'LEVEL ' + this.currentLevel + ' SELESAI!', {
      fontSize: '32px',
      color: '#ffeb3b',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    this.add.text(cx, cy - 95, 'Skor: ' + this.score + '  |  Waktu: ' + this.formatTime(this.elapsedTime), {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    // Hint text FLASHING supaya user notice
    const hint = this.add.text(cx, cy + 130, '> TEKAN SPACE / ENTER / TAP UNTUK LANJUT <', {
      fontSize: '18px',
      color: '#ffeb3b',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);
    this.tweens.add({
      targets: hint,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    let btnY = cy - 40;

    if (this.currentLevel === 100) {
      this.makeMenuButton(cx, btnY, 'Lanjut ke Ending', () => this.advanceToNext(), 100);
      btnY += 50;
    } else if (this.currentLevel % 10 === 0) {
      this.makeMenuButton(cx, btnY, 'Lanjut (Cutscene)', () => this.advanceToNext(), 100);
      btnY += 50;
    } else {
      this.makeMenuButton(cx, btnY, 'Lanjut Level ' + (this.currentLevel + 1), () => this.advanceToNext(), 100);
      btnY += 50;
    }

    this.makeMenuButton(cx, btnY, 'Ulangi Level', () => {
      this.cancelAutoAdvance();
      this.scene.start('GameScene', { level: this.currentLevel });
    }, 100);
    btnY += 50;
    this.makeMenuButton(cx, btnY, 'Menu Level', () => {
      this.cancelAutoAdvance();
      this.scene.start('LevelSelectScene');
    }, 100);
  }

  advanceToNext() {
    console.log('[GameScene v4] advanceToNext() from level=' + this.currentLevel);
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
      console.log('[GameScene v4] -> GameScene level=' + nextLevel);
      this.scene.start('GameScene', { level: nextLevel });
    }
  }

  startAutoAdvance(seconds) {
    this.cancelAutoAdvance();
    const cam = this.cameras.main;
    const cx = cam.worldView.x + cam.width / 2;
    const cy = cam.worldView.y + cam.height / 2;

    this._autoAdvanceText = this.add.text(cx, cy + 160, '', {
      fontSize: '16px',
      color: '#90ee90',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    let remaining = seconds;
    const tick = () => {
      if (this.gameState !== 'won') return;
      this._autoAdvanceText.setText('Auto lanjut dalam ' + remaining + ' detik...');
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
    const cx = cam.worldView.x + cam.width / 2;
    const cy = cam.worldView.y + cam.height / 2;

    this.add.rectangle(cx, cy, 600, 320, 0x000000, 0.75)
      .setScrollFactor(0).setDepth(99);

    this.add.text(cx, cy - 95, 'GAME OVER', {
      fontSize: '54px',
      color: '#ff5252',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    this.add.text(cx, cy - 30, 'Skor: ' + this.score, {
      fontSize: '22px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    this.makeMenuButton(cx, cy + 20, 'Lanjut (+1 nyawa)', () => {
      this.lives = 1;
      this.hud.setLives(this.lives);
      this.scene.start('GameScene', { level: this.currentLevel });
    }, 100);
    this.makeMenuButton(cx, cy + 70, 'Ulangi dari 0', () => {
      this.lives = 5;
      this.scene.start('GameScene', { level: this.currentLevel });
    }, 100);
    this.makeMenuButton(cx, cy + 120, 'Menu Level', () => {
      this.scene.start('LevelSelectScene');
    }, 100);
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
    const cx = cam.worldView.x + cam.width / 2;
    const cy = cam.worldView.y + cam.height / 2;

    const bg = this.add.rectangle(cx, cy, 600, 320, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(200);
    const title = this.add.text(cx, cy - 100, 'PAUSE', {
      fontSize: '52px',
      color: '#ffeb3b',
      fontFamily: 'Arial',
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
    const btn = this.add.rectangle(cx, y, 220, 44, 0x2196f3)
      .setScrollFactor(0).setDepth(d).setInteractive({ useHandCursor: true });
    const txt = this.add.text(cx, y, label, {
      fontSize: '19px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5).setScrollFactor(0).setDepth(d + 1);
    btn.on('pointerdown', () => {
      sound.play('click');
      callback();
    });
    btn.on('pointerover', () => btn.setFillStyle(0x42a5f5));
    btn.on('pointerout', () => btn.setFillStyle(0x2196f3));
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

  showEmptyState() {
    this.add.text(400, 300, 'Belum ada level tersedia', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  showError(msg) {
    this.add.text(400, 300, msg, {
      fontSize: '24px',
      color: '#ff5555',
      fontFamily: 'Arial',
      align: 'center',
      wordWrap: { width: 700 },
      stroke: '#000',
      strokeThickness: 3
    }).setOrigin(0.5);
  }
}
