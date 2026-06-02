/**
 * src/entities/Coin.js  (v5 - NO PHYSICS BODY)
 * ---------------------------------------------------------------
 * Coin sebagai PURE sprite, tanpa physics body. Tidak ada
 * tween, tidak ada gravity, tidak ada overlap otomatis.
 *
 * Collection di-handle MANUAL via distance check di
 * GameScene.update() (lihat DI BAWAH).
 *
 * Tujuannya: hilangkan SEMUA sumber physics yang bisa bikin
 * koin "hilang" — kalau di v5 ini koin masih hilang,
 * masalah ada di tempat lain (kemungkinan Vercel cache
 * atau browser cache yang masih nyimpan versi lama).
 * ---------------------------------------------------------------
 */
export default class Coin extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'coin');
    scene.add.existing(this);
    this.value = 10;
    this._collected = false;
  }

  collect() {
    if (this._collected || !this.active) return;
    this._collected = true;
    this.scene.tweens.add({
      targets: this,
      scaleY: 0,
      alpha: 0,
      duration: 180,
      onComplete: () => this.destroy()
    });
  }
}
