/**
 * src/entities/Coin.js
 * ---------------------------------------------------------------
 * Entity koin. Animasi:
 *   - rotasi 360 derajat (terlihat berputar)
 *   - pulsing scale (berkilat seperti spin 3D dari samping)
 *
 * Y POSISI TETAP — tidak ada tween Y, supaya koin tidak drift
 * (tween Y pernah bentrok dengan deteksi onFloor / body).
 *
 * collected() dipanggil dari GameScene.collectCoin():
 *   - matikan body
 *   - kill semua tween
 *   - tween mengecil lalu menghilang
 *   - hancurkan objek
 * ---------------------------------------------------------------
 */
export default class Coin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'coin');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.value = 10;
    this.setImmovable(true);
    this.body.setAllowGravity(false);

    // animasi rotasi penuh (seperti spin 3D dari samping)
    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 900,
      repeat: -1
    });
    // pulsing skala (berkilat) — TIDAK menyentuh Y, supaya posisi
    // koin tetap fixed dan tidak drift (Fase polish 2)
    scene.tweens.add({
      targets: this,
      scaleX: { from: 1, to: 0.4 },
      scaleY: { from: 1, to: 1.15 },
      duration: 450,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  collect() {
    if (!this.active) return;
    this.body.setEnable(false);
    // stop semua tween yang sedang berjalan pada objek ini
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      scaleY: 0,
      alpha: 0,
      angle: this.angle + 180,
      duration: 180,
      onComplete: () => this.destroy()
    });
  }
}
