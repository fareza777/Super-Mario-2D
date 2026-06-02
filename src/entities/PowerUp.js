/**
 * src/entities/PowerUp.js
 * ---------------------------------------------------------------
 * Entity power-up. Dua tipe (Fase 3):
 *   - 'mushroom' : menambah 1 nyawa (max 99)
 *   - 'star'     : invincibility 5 detik (berkedip)
 *
 * Power-up melayang di tempat, body immovable, dan di-collect
 * saat player menyentuh dari atas/samping.
 * ---------------------------------------------------------------
 */
export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, type === 'star' ? 'star' : 'mushroom');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.type = type;
    this.setImmovable(true);
    this.body.setAllowGravity(false);

    // animasi melayang naik-turun
    scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  collect() {
    if (!this.active) return;
    this.body.setEnable(false);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleY: 0,
      duration: 200,
      onComplete: () => this.destroy()
    });
  }
}
