/**
 * src/entities/Coin.js
 * ---------------------------------------------------------------
 * Entity koin. Versi DEBUG: TANPA animasi scale pulse, tanpa
 * rotasi tween — hanya gambar diam. Tujuannya untuk memastikan
 * koin tetap visible 100% di layar dan tidak "menghilang" karena
 * scale tween yang mungkin konflik dengan physics.
 *
 * Kalau koin masih hilang di versi ini, masalah BUKAN dari animasi.
 *
 * Position lock 6 lapis:
 *   1. setImmovable(true)
 *   2. setAllowGravity(false)
 *   3. setGravity(0, 0)
 *   4. setVelocity(0, 0)
 *   5. setSize(28, 28) + offset 0
 *   6. updateFromGameObject()
 * ---------------------------------------------------------------
 */
export default class Coin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'coin');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.value = 10;

    // ---- POSITION LOCK ----
    this.setImmovable(true);
    this.body.setAllowGravity(false);
    this.body.setGravity(0, 0);
    this.body.setVelocity(0, 0);
    this.body.setSize(28, 28);
    this.body.setOffset(0, 0);
    this.body.updateFromGameObject();

    // ---- TIDAK ADA ANIMASI TWEEN ----
    // Debug: hapus semua tween untuk verifikasi coin stability
  }

  collect() {
    if (!this.active) return;
    this.body.setEnable(false);
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleY: 0,
      alpha: 0,
      duration: 180,
      onComplete: () => this.destroy()
    });
  }
}
