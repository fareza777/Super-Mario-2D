/**
 * src/main.js
 * ---------------------------------------------------------------
 * Entry point untuk game Platformer Mario.
 * Menginisialisasi Phaser.Game dan mendaftarkan semua scene:
 *   Boot -> Preload -> Intro -> LevelSelect -> Game
 *           Game -> CutScene -> Game (untuk level 10,20,...,90)
 *           Game -> EndingScene (setelah level 100)
 *
 * Scale.FIT: canvas scale responsif untuk mobile (tetap 4:3)
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
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#87CEEB',
  pixelArt: true,
  // v11: deteksi mobile → HEIGHT_CONTROLS_WIDTH (canvas isi tinggi,
  // extend horizontal, kamera follow player → selalu kelihatan).
  // Desktop → FIT (4:3 letterbox).
  scale: (function() {
    var isMobile = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    return {
      mode: isMobile ? Phaser.Scale.HEIGHT_CONTROLS_WIDTH : Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600,
      parent: 'game-container',
      expandParent: false
    };
  })(),
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
