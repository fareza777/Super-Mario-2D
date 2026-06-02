/**
 * src/data/levels.js
 * ---------------------------------------------------------------
 * Menggabungkan 8 level hardcoded (Fase 2) dengan 92 level
 * hasil generator prosedural (Fase 3), total 100 level.
 *
 * Level 1-8  : handcrafted, dengan nama tema (mis. "Hutan Hijau")
 * Level 9-100: di-generate dengan seed deterministik
 *              (Phaser.Math.RandomDataGenerator)
 *
 * Struktur level (sama untuk manual & generated):
 *   id, name, world, player, platforms, coins, enemies, powerUps, goal
 * ---------------------------------------------------------------
 */
import LevelGenerator from '../systems/LevelGenerator.js';

// ====== 8 level handcrafted (Fase 2) ======
const manualLevels = [
  {
    id: 1,
    name: 'Hutan Hijau',
    world: { width: 2400, height: 600 },
    player: { x: 60, y: 450 },
    platforms: [
      { x: 0, y: 568, width: 2400, height: 32 },
      { x: 250, y: 470, width: 160, height: 20 },
      { x: 500, y: 400, width: 160, height: 20 },
      { x: 750, y: 330, width: 128, height: 20 },
      { x: 1000, y: 470, width: 192, height: 20 },
      { x: 1300, y: 400, width: 160, height: 20 },
      { x: 1600, y: 330, width: 160, height: 20 },
      { x: 1900, y: 470, width: 200, height: 20 }
    ],
    coins: [
      { x: 280, y: 430 }, { x: 320, y: 430 }, { x: 360, y: 430 },
      { x: 530, y: 360 }, { x: 570, y: 360 },
      { x: 780, y: 290 }, { x: 820, y: 290 },
      { x: 1030, y: 430 }, { x: 1070, y: 430 }, { x: 1110, y: 430 }, { x: 1150, y: 430 },
      { x: 1330, y: 360 }, { x: 1370, y: 360 },
      { x: 1630, y: 290 }, { x: 1670, y: 290 },
      { x: 1940, y: 430 }
    ],
    enemies: [
      { x: 900, y: 536, type: 'patrol', speed: 80, patrolRange: 200 }
    ],
    powerUps: [],
    goal: { x: 2280, y: 568 }
  },
  {
    id: 2,
    name: 'Rumput Luas',
    world: { width: 2400, height: 600 },
    player: { x: 60, y: 450 },
    platforms: [
      { x: 0, y: 568, width: 2400, height: 32 },
      { x: 200, y: 460, width: 128, height: 20 },
      { x: 400, y: 390, width: 128, height: 20 },
      { x: 600, y: 320, width: 128, height: 20 },
      { x: 900, y: 460, width: 192, height: 20 },
      { x: 1200, y: 390, width: 128, height: 20 },
      { x: 1500, y: 460, width: 192, height: 20 },
      { x: 1800, y: 390, width: 128, height: 20 },
      { x: 2050, y: 460, width: 160, height: 20 }
    ],
    coins: [
      { x: 230, y: 420 }, { x: 270, y: 420 },
      { x: 430, y: 350 },
      { x: 630, y: 280 },
      { x: 930, y: 420 }, { x: 970, y: 420 }, { x: 1010, y: 420 },
      { x: 1230, y: 350 },
      { x: 1530, y: 420 }, { x: 1570, y: 420 },
      { x: 1830, y: 350 },
      { x: 2080, y: 420 }, { x: 2120, y: 420 }
    ],
    enemies: [
      { x: 500, y: 536, type: 'patrol', speed: 90, patrolRange: 200 },
      { x: 1300, y: 536, type: 'patrol', speed: 100, patrolRange: 250 }
    ],
    powerUps: [],
    goal: { x: 2280, y: 568 }
  },
  {
    id: 3,
    name: 'Koin Bertebaran',
    world: { width: 2400, height: 600 },
    player: { x: 60, y: 450 },
    platforms: [
      { x: 0, y: 568, width: 2400, height: 32 },
      { x: 200, y: 470, width: 96, height: 20 },
      { x: 380, y: 400, width: 96, height: 20 },
      { x: 560, y: 330, width: 96, height: 20 },
      { x: 740, y: 400, width: 96, height: 20 },
      { x: 920, y: 470, width: 96, height: 20 },
      { x: 1100, y: 400, width: 96, height: 20 },
      { x: 1280, y: 330, width: 96, height: 20 },
      { x: 1460, y: 400, width: 96, height: 20 },
      { x: 1640, y: 470, width: 96, height: 20 },
      { x: 1820, y: 400, width: 96, height: 20 },
      { x: 2000, y: 470, width: 200, height: 20 }
    ],
    coins: [
      { x: 100, y: 530 }, { x: 150, y: 530 }, { x: 200, y: 530 },
      { x: 300, y: 530 }, { x: 350, y: 530 }, { x: 400, y: 530 },
      { x: 500, y: 530 }, { x: 550, y: 530 },
      { x: 230, y: 430 },
      { x: 410, y: 360 },
      { x: 590, y: 290 },
      { x: 770, y: 360 },
      { x: 950, y: 430 },
      { x: 1130, y: 360 },
      { x: 1310, y: 290 },
      { x: 1490, y: 360 },
      { x: 1670, y: 430 },
      { x: 1850, y: 360 },
      { x: 2030, y: 430 }, { x: 2070, y: 430 }, { x: 2110, y: 430 }
    ],
    enemies: [
      { x: 1500, y: 536, type: 'patrol', speed: 100, patrolRange: 200 }
    ],
    powerUps: [],
    goal: { x: 2280, y: 568 }
  },
  {
    id: 4,
    name: 'Langit Awal',
    world: { width: 2400, height: 600 },
    player: { x: 60, y: 450 },
    platforms: [
      { x: 0, y: 568, width: 2400, height: 32 },
      { x: 300, y: 470, width: 128, height: 20 },
      { x: 550, y: 400, width: 128, height: 20 },
      { x: 800, y: 330, width: 128, height: 20 },
      { x: 1100, y: 470, width: 160, height: 20 },
      { x: 1400, y: 400, width: 128, height: 20 },
      { x: 1700, y: 330, width: 128, height: 20 },
      { x: 1950, y: 470, width: 200, height: 20 }
    ],
    coins: [
      { x: 330, y: 430 }, { x: 370, y: 430 },
      { x: 580, y: 360 },
      { x: 830, y: 290 },
      { x: 1130, y: 430 }, { x: 1170, y: 430 },
      { x: 1430, y: 360 },
      { x: 1730, y: 290 },
      { x: 1980, y: 430 }, { x: 2020, y: 430 }
    ],
    enemies: [
      { x: 700, y: 536, type: 'patrol', speed: 80, patrolRange: 150 },
      { x: 1250, y: 350, type: 'flying', speed: 50, range: 60, axis: 'vertical' }
    ],
    powerUps: [
      { x: 1500, y: 430, type: 'mushroom' }
    ],
    goal: { x: 2280, y: 568 }
  },
  {
    id: 5,
    name: 'Tangga Runtuh',
    world: { width: 2400, height: 600 },
    player: { x: 60, y: 450 },
    platforms: [
      { x: 0, y: 568, width: 2400, height: 32 },
      { x: 250, y: 470, width: 96, height: 20, breakable: true },
      { x: 450, y: 400, width: 96, height: 20, breakable: true },
      { x: 650, y: 470, width: 96, height: 20 },
      { x: 850, y: 400, width: 96, height: 20, breakable: true },
      { x: 1050, y: 330, width: 96, height: 20, breakable: true },
      { x: 1250, y: 470, width: 128, height: 20 },
      { x: 1500, y: 400, width: 96, height: 20, breakable: true },
      { x: 1700, y: 330, width: 96, height: 20, breakable: true },
      { x: 1900, y: 470, width: 200, height: 20 }
    ],
    coins: [
      { x: 280, y: 430 }, { x: 320, y: 430 },
      { x: 480, y: 360 },
      { x: 680, y: 430 },
      { x: 880, y: 360 },
      { x: 1080, y: 290 },
      { x: 1280, y: 430 }, { x: 1320, y: 430 },
      { x: 1530, y: 360 },
      { x: 1730, y: 290 },
      { x: 1930, y: 430 }, { x: 1970, y: 430 }
    ],
    enemies: [
      { x: 500, y: 536, type: 'patrol', speed: 90, patrolRange: 180 },
      { x: 1300, y: 536, type: 'patrol', speed: 100, patrolRange: 200 }
    ],
    powerUps: [
      { x: 1100, y: 290, type: 'star' }
    ],
    goal: { x: 2280, y: 568 }
  },
  {
    id: 6,
    name: 'Awan Berbahaya',
    world: { width: 2400, height: 600 },
    player: { x: 60, y: 450 },
    platforms: [
      { x: 0, y: 568, width: 2400, height: 32 },
      { x: 250, y: 470, width: 128, height: 20 },
      { x: 500, y: 380, width: 128, height: 20 },
      { x: 800, y: 470, width: 160, height: 20 },
      { x: 1100, y: 380, width: 128, height: 20 },
      { x: 1400, y: 470, width: 160, height: 20 },
      { x: 1700, y: 380, width: 128, height: 20 },
      { x: 1950, y: 470, width: 200, height: 20 }
    ],
    coins: [
      { x: 280, y: 430 }, { x: 320, y: 430 },
      { x: 530, y: 340 },
      { x: 830, y: 430 }, { x: 870, y: 430 },
      { x: 1130, y: 340 },
      { x: 1430, y: 430 }, { x: 1470, y: 430 },
      { x: 1730, y: 340 },
      { x: 1980, y: 430 }, { x: 2020, y: 430 }
    ],
    enemies: [
      { x: 600, y: 350, type: 'flying', speed: 50, range: 70, axis: 'vertical' },
      { x: 1000, y: 400, type: 'flying', speed: 60, range: 80, axis: 'both' },
      { x: 1500, y: 350, type: 'flying', speed: 50, range: 60, axis: 'vertical' },
      { x: 1200, y: 536, type: 'patrol', speed: 90, patrolRange: 200 }
    ],
    powerUps: [
      { x: 800, y: 430, type: 'mushroom' }
    ],
    goal: { x: 2280, y: 568 }
  },
  {
    id: 7,
    name: 'Kehancuran Total',
    world: { width: 2400, height: 600 },
    player: { x: 60, y: 450 },
    platforms: [
      { x: 0, y: 568, width: 2400, height: 32 },
      { x: 200, y: 470, width: 96, height: 20, breakable: true },
      { x: 400, y: 400, width: 96, height: 20, breakable: true },
      { x: 600, y: 470, width: 96, height: 20, breakable: true },
      { x: 800, y: 400, width: 96, height: 20, breakable: true },
      { x: 1000, y: 470, width: 96, height: 20, breakable: true },
      { x: 1200, y: 380, width: 96, height: 20 },
      { x: 1400, y: 460, width: 96, height: 20, breakable: true },
      { x: 1600, y: 380, width: 96, height: 20, breakable: true },
      { x: 1800, y: 460, width: 96, height: 20, breakable: true },
      { x: 2000, y: 380, width: 96, height: 20 }
    ],
    coins: [
      { x: 230, y: 430 }, { x: 270, y: 430 },
      { x: 430, y: 360 },
      { x: 630, y: 430 },
      { x: 830, y: 360 },
      { x: 1030, y: 430 },
      { x: 1230, y: 340 },
      { x: 1430, y: 420 },
      { x: 1630, y: 340 },
      { x: 1830, y: 420 },
      { x: 2030, y: 340 }
    ],
    enemies: [
      { x: 350, y: 536, type: 'patrol', speed: 100, patrolRange: 200 },
      { x: 1100, y: 536, type: 'patrol', speed: 110, patrolRange: 250 },
      { x: 700, y: 380, type: 'flying', speed: 50, range: 80, axis: 'both' }
    ],
    powerUps: [
      { x: 1500, y: 420, type: 'star' }
    ],
    goal: { x: 2280, y: 568 }
  },
  {
    id: 8,
    name: 'Petualang Sejati',
    world: { width: 2400, height: 600 },
    player: { x: 60, y: 450 },
    platforms: [
      { x: 0, y: 568, width: 2400, height: 32 },
      { x: 200, y: 470, width: 96, height: 20, breakable: true },
      { x: 400, y: 400, width: 96, height: 20 },
      { x: 600, y: 470, width: 96, height: 20, breakable: true },
      { x: 800, y: 380, width: 96, height: 20 },
      { x: 1000, y: 470, width: 96, height: 20, breakable: true },
      { x: 1200, y: 380, width: 96, height: 20, breakable: true },
      { x: 1400, y: 460, width: 96, height: 20 },
      { x: 1600, y: 380, width: 96, height: 20, breakable: true },
      { x: 1800, y: 460, width: 96, height: 20 },
      { x: 2000, y: 380, width: 96, height: 20 }
    ],
    coins: [
      { x: 230, y: 430 },
      { x: 430, y: 360 },
      { x: 630, y: 430 },
      { x: 830, y: 340 },
      { x: 1030, y: 430 },
      { x: 1230, y: 340 },
      { x: 1430, y: 420 },
      { x: 1630, y: 340 },
      { x: 1830, y: 420 },
      { x: 2030, y: 340 }
    ],
    enemies: [
      { x: 300, y: 536, type: 'patrol', speed: 110, patrolRange: 200 },
      { x: 800, y: 536, type: 'patrol', speed: 120, patrolRange: 250 },
      { x: 1500, y: 536, type: 'patrol', speed: 120, patrolRange: 300 },
      { x: 500, y: 380, type: 'flying', speed: 60, range: 80, axis: 'both' },
      { x: 1100, y: 350, type: 'flying', speed: 70, range: 90, axis: 'both' },
      { x: 1700, y: 380, type: 'flying', speed: 60, range: 70, axis: 'vertical' }
    ],
    powerUps: [
      { x: 1000, y: 430, type: 'mushroom' },
      { x: 2000, y: 340, type: 'star' }
    ],
    goal: { x: 2280, y: 568 }
  }
];

// ====== Pre-generate level 9-100 ======
// asumsi: 92 level di-generate saat module load, deterministic via seed
const generatedLevels = [];
for (let i = 9; i <= 100; i++) {
  generatedLevels.push(LevelGenerator.generateLevel(i));
}

export const levels = [...manualLevels, ...generatedLevels];
