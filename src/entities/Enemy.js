/**
 * src/entities/Enemy.js
 * ---------------------------------------------------------------
 * Entity musuh dengan dua tipe:
 *   - 'patrol' : berjalan horizontal di area patrol, berbalik arah
 *                saat mencapai batas atau menabrak dinding.
 *                Animasi: langkah kecil (Y bounce) ketika di tanah.
 *   - 'flying' : melayang dengan pola sinus (vertikal atau both).
 *                Animasi: kepakan sayap (scaleX osilasi).
 *
 * Properti data: { type, x, y, speed?, patrolRange?, range?, axis? }
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
    this.timeAccum = 0;
    this.facing = 1;

    this.setCollideWorldBounds(true);
    this.setBounce(0);
    this.body.setSize(30, 30);
    this.body.setOffset(1, 1);

    this.isDying = false;

    if (this.type === 'flying') {
      // musuh terbang:不受重力影响，position di-update manual via sinus
      this.body.setAllowGravity(false);
      this.setVelocity(0, 0);
      this.body.setImmovable(true);
      // kepakan sayap: scaleX berosilasi
      this._flapTween = scene.tweens.add({
        targets: this,
        scaleX: { from: 0.7, to: 1.2 },
        scaleY: { from: 0.9, to: 1.05 },
        duration: 180,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      this.setVelocityX(this.speed);
      // goyangan langkah (Y bounce kecil)
      this._walkTween = scene.tweens.add({
        targets: this,
        y: y - 2,
        duration: 220,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  /**
   * Dipanggil tiap frame. Untuk 'flying' menggerakkan posisi dengan
   * pola sinus. Untuk 'patrol' menangani pembalikan arah.
   */
  update(time, delta) {
    if (this.isDying) return;

    if (this.type === 'flying') {
      this.timeAccum += delta;
      // asumsi: periode 500ms untuk sumbu-Y, 700ms untuk sumbu-X
      this.y = this.startY + Math.sin(this.timeAccum / 500) * this.range;
      if (this.axis === 'both') {
        this.x = this.startX + Math.cos(this.timeAccum / 700) * this.range;
      }
      // hadap sesuai arah movement
      this.setFlipX(this.x > this.startX);
      return;
    }

    // patrol
    const v = this.body.velocity.x;
    const speed = v !== 0 ? Math.abs(v) : this.speed;
    const reachedLeft = this.x <= this.startX - this.patrolRange;
    const reachedRight = this.x >= this.startX + this.patrolRange;
    const hitWall = this.body.blocked.left || this.body.blocked.right;

    if (reachedLeft || (hitWall && v < 0)) {
      this.setVelocityX(speed);
      this.setFlipX(false);
      this.facing = 1;
      // sinkronkan walk bounce dengan posisi baru (supaya tetap di atas tanah)
      if (this._walkTween) {
        this._walkTween.stop();
        this._walkTween = this.scene.tweens.add({
          targets: this,
          y: this.y - 2,
          duration: 220,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    } else if (reachedRight || (hitWall && v > 0)) {
      this.setVelocityX(-speed);
      this.setFlipX(true);
      this.facing = -1;
      if (this._walkTween) {
        this._walkTween.stop();
        this._walkTween = this.scene.tweens.add({
          targets: this,
          y: this.y - 2,
          duration: 220,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    } else {
      this.setFlipX(v < 0);
    }
  }

  die() {
    if (this.isDying) return;
    this.isDying = true;
    if (this._walkTween) this._walkTween.stop();
    if (this._flapTween) this._flapTween.stop();
    this.setTint(0x888888);
    this.setVelocity(0, -250);
    this.setAngle(-30);
    this.body.setEnable(false);
    // spin saat terbang ke atas
    this.scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 700,
      ease: 'Linear',
      onUpdate: () => {
        this.y -= 0.5;
      }
    });
    this.scene.time.delayedCall(700, () => this.destroy());
  }
}
