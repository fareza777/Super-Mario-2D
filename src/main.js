/**
 * src/main.js
 * ---------------------------------------------------------------
 * Entry point untuk game Platformer Mario.
 * Menginisialisasi Phaser.Game dan mendaftarkan semua scene:
 *   Boot -> Preload -> Intro -> LevelSelect -> Game
 *           Game -> CutScene -> Game (untuk level 10,20,...,90)
 *           Game -> EndingScene (setelah level 100)
 *
 * v12: canvas 3:4 portrait (600x800). Scale.FIT responsive.
 *      Level world tetap 800x600 (kamera scroll horizontal).
 * ---------------------------------------------------------------
 */
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import IntroScene from './scenes/IntroScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import GameScene from './scenes/GameScene.js';
import CutScene from './scenes/CutScene.js';
import EndingScene from './scenes/EndingScene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#87CEEB',
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 600,
    height: 800,
    parent: 'game-container',
    expandParent: false
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    IntroScene,
    LevelSelectScene,
    GameScene,
    CutScene,
    EndingScene
  ]
};

window.addEventListener('load', () => {
  try {
    const game = new Phaser.Game(config);
    window.__game = game;
  } catch (err) {
    const el = document.getElementById('game-container');
    if (el) {
      el.innerHTML =
        '<div style="padding:24px;color:#ff5555;background:#222;">' +
        '<h2>Gagal memulai game</h2>' +
        '<p>' + (err && err.message ? err.message : String(err)) + '</p>' +
        '</div>';
    }
    console.error('Phaser init error:', err);
  }
});
