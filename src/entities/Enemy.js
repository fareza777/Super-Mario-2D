/**
 * src/entities/Enemy.js
 * ---------------------------------------------------------------
 * Entity musuh dengan dua tipe:
 *   - 'patrol' : berjalan horizontal di area patrol, berbalik arah
 *                saat mencapai batas atau menabrak dinding.
 *   - 'flying' : melayang dengan pola sinus (vertikal atau both).
 *
 * v9: rewrite total — HAPUS walk-tween pada `sprite.y` (sebelumnya
 *     conflict dengan physics: tween set y → physics step override →
 *     fight terus-menerus → velocity.x bisa reset ke 0 → enemy diam).
 *     Ganti dengan setScale() wobble (visual only, tidak ganggu body).
 * ---------------------------------------------------------------
 */
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config = {}) {
    const isFly = config.type === 'flying';
    super(scene, x, y, isFly ? 'enemy-fly' : 'enemy');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.type = isFly ? 'flying' : 'patrol';
    this.startX = x;
    this.startY = y;
    this.patrolRange = config.patrolRange || 100;
    this.range = config.range || 80;
    this.axis = config.axis || 'vertical';
    this.speed = config.speed || (isFly ? 50 : 80);
    this.facing = 1;  // 1 = kanan, -1 = kiri
    this.isDying = false;
    this._walkPhase = 0;
    this._frameCount = 0;

    this.body.setSize(30, 30);
    this.body.setOffset(1, 1);
    // JANGAN setCollideWorldBounds(true) — bisa bentrok dengan patrol
    // range. World bounds dihandle oleh physics world & platform.

    if (this.type === 'flying') {
      this.body.setAllowGravity(false);
      this.body.setImmovable(true);
      this.setVelocity(0, 0);
    } else {
      this.setVelocityX(this.facing * this.speed);
    }

    console.log('[Enemy v9] spawned type=' + this.type +
      ' at(' + x + ',' + y + ') speed=' + this.speed);
  }

  /**
   * Dipanggil tiap frame oleh group { runChildUpdate: true }.
   * Untuk 'flying' menggerakkan posisi manual via sinus.
   * Untuk 'patrol' cek batas patrol + wall hit, flip velocity.
   */
  update(time, delta) {
    if (this.isDying || !this.active) return;

    this._frameCount += 1;
    // log periodik supaya bisa verify update dipanggil + velocity benar
    if (this._frameCount % 60 === 0 && this.type === 'patrol') {
      console.log('[Enemy v9] patrol tick x=' + Math.round(this.x) +
        ' vx=' + Math.round(this.body.velocity.x) +
        ' facing=' + this.facing);
    }

    if (this.type === 'flying') {
      this._walkPhase += delta;
      this.y = this.startY + Math.sin(this._walkPhase / 500) * this.range;
      if (this.axis === 'both') {
        this.x = this.startX + Math.cos(this._walkPhase / 700) * this.range;
      }
      this.setFlipX(this.x > this.startX);
      return;
    }

    // ===== patrol =====
    const reachedLeft = this.x <= this.startX - this.patrolRange;
    const reachedRight = this.x >= this.startX + this.patrolRange;
    const hitWall = this.body.blocked.left || this.body.blocked.right;

    if (reachedRight || (hitWall && this.facing > 0)) {
      this.facing = -1;
    } else if (reachedLeft || (hitWall && this.facing < 0)) {
      this.facing = 1;
    }

    // set velocity setiap frame supaya konsisten (tidak andalkan
    // velocity awal saja)
    this.setVelocityX(this.facing * this.speed);
    this.setFlipX(this.facing < 0);

    // visual wobble: scaleY oscillation, TIDAK mengganggu physics body
    this._walkPhase += delta * 0.012;
    const wobble = 1 + Math.abs(Math.sin(this._walkPhase)) * 0.08;
    this.setScale(1, wobble);
  }

  die() {
    if (this.isDying) return;
    this.isDying = true;
    this.setTint(0x888888);
    this.setVelocity(0, -250);
    this.setAngle(-30);
    this.body.setEnable(false);
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 700,
      ease: 'Linear',
      onUpdate: () => { this.y -= 0.5; }
    });
    this.scene.time.delayedCall(700, () => this.destroy());
  }
}
