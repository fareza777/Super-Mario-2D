/**
 * src/scenes/BootScene.js
 * ---------------------------------------------------------------
 * Scene pertama yang dijalankan. Saat ini hanya melakukan
 * transisi cepat ke PreloadScene. Pada fase berikutnya dapat
 * digunakan untuk inisialisasi data global, cek platform, dll.
 * ---------------------------------------------------------------
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
