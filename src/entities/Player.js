/**
 * src/entities/Player.js
 * ---------------------------------------------------------------
 * Entity Player. Menggerakkan sprite, menangani input, gravitasi,
 * collision response, dan state invincibility (dari star).
 *
 * Kontrol responsif:
 *   - akselerasi & friksi horizontal
 *   - coyote time 100ms (boleh lompat 100ms setelah tinggalkan lantai)
 *   - jump buffer 150ms (tekan lompat 150ms sebelum mendarat)
 *   - respawn invincibility 1.2 detik (berkedip)
 *   - animasi rotasi saat mati
 *   - walk-bob (Y bounce) saat bergerak di atas tanah
 * ---------------------------------------------------------------
 */
import { sound } from '../systems/SoundManager.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setBounce(0.05);
    this.setMaxVelocity(300, 700);
    this.setDragX(0);
    this.body.setSize(28, 30);
    this.body.setOffset(2, 1);

    this.startX = x;
    this.startY = y;
    this.isDead = false;
    this.isInvincible = false;
    this._respawnTween = null;
    this._walkBobTween = null;
    this._wasOnFloor = false;

    // input helpers
    this.timeSinceLeftFloor = 0;
    this.jumpBufferTime = 0;
  }

  /**
   * Terapkan input ke player dengan akselerasi, coyote time, jump buffer,
   * dan walk-bob animation.
   */
  handleInput(left, right, jump, delta) {
    if (this.isDead) return;

    const dSec = (delta || 16.67) / 1000;

    const onFloor = this.body.onFloor();
    if (onFloor) {
      this.timeSinceLeftFloor = 0;
    } else {
      this.timeSinceLeftFloor += delta || 16.67;
    }

    if (jump) {
      this.jumpBufferTime = 150;
    } else {
      this.jumpBufferTime = Math.max(0, this.jumpBufferTime - (delta || 16.67));
    }

    // ---- horizontal movement ----
    const accel = 1500;
    const maxSpeed = 220;
    const friction = 1400;
    let vx = this.body.velocity.x;
    const moving = left || right;

    if (left) {
      vx -= accel * dSec;
      if (vx < -maxSpeed) vx = -maxSpeed;
      this.setFlipX(true);
    } else if (right) {
      vx += accel * dSec;
      if (vx > maxSpeed) vx = maxSpeed;
      this.setFlipX(false);
    } else {
      if (vx > 0) {
        vx -= friction * dSec;
        if (vx < 0) vx = 0;
      } else if (vx < 0) {
        vx += friction * dSec;
        if (vx > 0) vx = 0;
      }
    }
    this.setVelocityX(vx);

    // ---- walk-squish: scaleX/Y berosilasi (TIDAK menyentuh Y, supaya
    //      tidak konflik dengan deteksi onFloor() physics) ----
    if (onFloor && moving) {
      if (!this._walkBobTween || !this._walkBobTween.isPlaying()) {
        this._walkBobTween = this.scene.tweens.add({
          targets: this,
          scaleY: 0.9,
          scaleX: 1.1,
          duration: 130,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    } else {
      if (this._walkBobTween) {
        this._walkBobTween.stop();
        this._walkBobTween = null;
      }
      this.setScale(1);
    }

    // ---- jump ----
    const canCoyote = this.timeSinceLeftFloor < 100;
    if (this.jumpBufferTime > 0 && (onFloor || canCoyote)) {
      this.setVelocityY(-550);
      this.jumpBufferTime = 0;
      this.timeSinceLeftFloor = 1000;
      this.setFlipY(false);
      this.angle = 0;
      if (this._walkBobTween) {
        this._walkBobTween.stop();
        this._walkBobTween = null;
      }
      sound.play('jump');
    }
  }

  respawn() {
    if (this._respawnTween) {
      this._respawnTween.stop();
      this._respawnTween = null;
    }
    if (this._walkBobTween) {
      this._walkBobTween.stop();
      this._walkBobTween = null;
    }
    this.setPosition(this.startX, this.startY);
    this.setVelocity(0, 0);
    this.angle = 0;
    this.setFlipY(false);
    this.isDead = false;
    this.isInvincible = false;
    this.setAlpha(1);
    this.body.setEnable(true);
    this.timeSinceLeftFloor = 0;
    this.jumpBufferTime = 0;

    this._respawnTween = this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.setAlpha(1);
        this._respawnTween = null;
      }
    });
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    if (this._walkBobTween) {
      this._walkBobTween.stop();
      this._walkBobTween = null;
    }
    this.setVelocity(0, -360);
    this.setAlpha(0.6);
    this.angle = 0;
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 900,
      ease: 'Linear'
    });
    sound.play('lose');
  }

  collectStar() {
    if (this.isInvincible) return;
    this.isInvincible = true;
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 250,
      yoyo: true,
      repeat: 9,
      onComplete: () => {
        this.isInvincible = false;
        this.setAlpha(1);
      }
    });
    sound.play('star');
  }
}
