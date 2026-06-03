/**
 * src/systems/LevelGenerator.js
 * ---------------------------------------------------------------
 * Generator prosedural untuk 100 level. Deterministic: level
 * yang sama selalu ter-generate dengan urutan identik
 * (menggunakan Phaser.Math.RandomDataGenerator dengan seed).
 *
 * Difficulty naik setiap 10 level (1-10).
 * Output: objek level dengan struktur yang sama dengan
 * data/levels.js (id, name, world, player, platforms, coins,
 * enemies, powerUps, goal).
 * ---------------------------------------------------------------
 */
export default class LevelGenerator {
  /**
   * Hasilkan level untuk nomor level tertentu (1-100).
   * Level 1-8 diambil dari data/levels.js; level 9-100 dari sini.
   *
   * @param {number} levelNumber - nomor level (1-100)
   * @returns {object} data level lengkap
   */
  static generateLevel(levelNumber) {
    // asumsi: seed = levelNumber * 7919 (bilangan prima) untuk distribusi
    // yang lebih merata antar level
    const seed = levelNumber * 7919;
    const rng = new Phaser.Math.RandomDataGenerator([seed]);

    const difficulty = Math.min(10, Math.ceil(levelNumber / 10));
    const worldNum = Math.ceil(levelNumber / 10);
    const inWorld = ((levelNumber - 1) % 10) + 1; // 1-10
    const worldWidth = 2400;

    // ----- platform melayang -----
    const platformCount = 8 + Math.floor(rng.frac() * 7); // 8-14
    const platforms = [
      { x: 0, y: 768, width: worldWidth, height: 32 } // ground (v15: 800px world)
    ];

    for (let i = 0; i < platformCount; i++) {
      const baseX = 200 + (i * (worldWidth - 400) / platformCount);
      const xJitter = rng.integerInRange(-40, 40);
      const x = Math.max(180, Math.min(worldWidth - 250, Math.floor(baseX + xJitter)));
      // v15: y platform 520-680 (sebar di 800px world, 200px sky di atas)
      const y = 520 + Math.floor(rng.frac() * 160);
      const w = 96 + Math.floor(rng.frac() * 96); // 96-192
      const breakable = difficulty >= 4 && rng.frac() < 0.25;
      platforms.push({ x, y, width: w, height: 20, breakable });
    }

    // ----- musuh -----
    const enemyBase = 1 + Math.floor(difficulty * 0.4);
    const enemyCount = Math.min(7, enemyBase + Math.floor(rng.frac() * 2));
    const enemies = [];

    for (let i = 0; i < enemyCount; i++) {
      const x = 400 + Math.floor(rng.frac() * (worldWidth - 800));
      const isFly = difficulty >= 3 && rng.frac() < 0.3;
      if (isFly) {
        enemies.push({
          x,
          y: 480 + Math.floor(rng.frac() * 200),  // v15: 480-680
          type: 'flying',
          speed: 40 + difficulty * 5,
          range: 50 + Math.floor(rng.frac() * 60),
          axis: rng.frac() < 0.5 ? 'vertical' : 'both'
        });
      } else {
        enemies.push({
          x,
          y: 736,  // v15: patrol di ground (768 - 32)
          type: 'patrol',
          speed: 60 + Math.floor(rng.frac() * 30) + difficulty * 3,
          patrolRange: 100 + Math.floor(rng.frac() * 100) + difficulty * 5
        });
      }
    }

    // ----- koin -----
    const coinCount = 10 + Math.floor(rng.frac() * 12); // 10-21
    const coins = [];
    let attempts = 0;
    while (coins.length < coinCount && attempts < 200) {
      attempts++;
      const platform = platforms[Math.floor(rng.frac() * platforms.length)];
      if (platform.width < 60) continue;
      const cx = platform.x + 10 + Math.floor(rng.frac() * (platform.width - 20));
      const cy = platform.y - 40;
      coins.push({ x: cx, y: cy });
    }

    // ----- power-up (mushroom / star) -----
    // asumsi: probabilitas 20% mulai level 5, dengan komposisi 50/50
    const powerUps = [];
    if (levelNumber >= 5 && rng.frac() < 0.2) {
      const platform = platforms[Math.floor(rng.frac() * platforms.length)];
      const type = rng.frac() < 0.5 ? 'mushroom' : 'star';
      powerUps.push({
        x: platform.x + platform.width / 2,
        y: platform.y - 40,
        type
      });
    }

    // GrimPass: dark fantasy world names (English)
    const WORLD_NAMES = [
      "Edge of the World",
      "Forgotten Trail",
      "The Abyss",
      "Garden of Bones",
      "Cursed Ruins",
      "Shadowlands",
      "Cursed Peak",
      "Sea of Souls",
      "The Void",
      "GrimPass"
    ];

    return {
      id: levelNumber,
      name: WORLD_NAMES[worldNum - 1] + ' - ' + inWorld,
      world: { width: worldWidth, height: 800 },
      player: { x: 60, y: 650 },
      platforms,
      coins,
      enemies,
      powerUps,
      goal: { x: worldWidth - 120, y: 768 }
    };
  }
}
