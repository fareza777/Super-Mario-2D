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
    name: 'Edge of the World',
    world: { width: 2400, height: 800 },
    player: { x: 60, y: 650 },
    platforms: [
      { x: 0, y: 768, width: 2400, height: 32 },
      { x: 250, y: 670, width: 160, height: 20 },
      { x: 500, y: 600, width: 160, height: 20 },
      { x: 750, y: 530, width: 128, height: 20 },
      { x: 1000, y: 670, width: 192, height: 20 },
      { x: 1300, y: 600, width: 160, height: 20 },
      { x: 1600, y: 530, width: 160, height: 20 },
      { x: 1900, y: 670, width: 200, height: 20 }
    ],
    coins: [
      { x: 280, y: 630 }, { x: 320, y: 630 }, { x: 360, y: 630 },
      { x: 530, y: 560 }, { x: 570, y: 560 },
      { x: 780, y: 490 }, { x: 820, y: 490 },
      { x: 1030, y: 630 }, { x: 1070, y: 630 }, { x: 1110, y: 630 }, { x: 1150, y: 630 },
      { x: 1330, y: 560 }, { x: 1370, y: 560 },
      { x: 1630, y: 490 }, { x: 1670, y: 490 },
      { x: 1940, y: 630 }
    ],
    enemies: [
      { x: 900, y: 736, type: 'patrol', speed: 80, patrolRange: 200 }
    ],
    powerUps: [],
    goal: { x: 2280, y: 768 }
  },
  {
    id: 2,
    name: 'Silent Trail',
    world: { width: 2400, height: 800 },
    player: { x: 60, y: 650 },
    platforms: [
      { x: 0, y: 768, width: 2400, height: 32 },
      { x: 200, y: 660, width: 128, height: 20 },
      { x: 400, y: 590, width: 128, height: 20 },
      { x: 600, y: 520, width: 128, height: 20 },
      { x: 900, y: 660, width: 192, height: 20 },
      { x: 1200, y: 590, width: 128, height: 20 },
      { x: 1500, y: 660, width: 192, height: 20 },
      { x: 1800, y: 590, width: 128, height: 20 },
      { x: 2050, y: 660, width: 160, height: 20 }
    ],
    coins: [
      { x: 230, y: 620 }, { x: 270, y: 620 },
      { x: 430, y: 550 },
      { x: 630, y: 480 },
      { x: 930, y: 620 }, { x: 970, y: 620 }, { x: 1010, y: 620 },
      { x: 1230, y: 550 },
      { x: 1530, y: 620 }, { x: 1570, y: 620 },
      { x: 1830, y: 550 },
      { x: 2080, y: 620 }, { x: 2120, y: 620 }
    ],
    enemies: [
      { x: 500, y: 736, type: 'patrol', speed: 90, patrolRange: 200 },
      { x: 1300, y: 736, type: 'patrol', speed: 100, patrolRange: 250 }
    ],
    powerUps: [],
    goal: { x: 2280, y: 768 }
  },
  {
    id: 3,
    name: 'Displaced Soul',
    world: { width: 2400, height: 800 },
    player: { x: 60, y: 650 },
    platforms: [
      { x: 0, y: 768, width: 2400, height: 32 },
      { x: 200, y: 670, width: 96, height: 20 },
      { x: 380, y: 600, width: 96, height: 20 },
      { x: 560, y: 530, width: 96, height: 20 },
      { x: 740, y: 600, width: 96, height: 20 },
      { x: 920, y: 670, width: 96, height: 20 },
      { x: 1100, y: 600, width: 96, height: 20 },
      { x: 1280, y: 530, width: 96, height: 20 },
      { x: 1460, y: 600, width: 96, height: 20 },
      { x: 1640, y: 670, width: 96, height: 20 },
      { x: 1820, y: 600, width: 96, height: 20 },
      { x: 2000, y: 670, width: 200, height: 20 }
    ],
    coins: [
      { x: 100, y: 730 }, { x: 150, y: 730 }, { x: 200, y: 730 },
      { x: 300, y: 730 }, { x: 350, y: 730 }, { x: 400, y: 730 },
      { x: 500, y: 730 }, { x: 550, y: 730 },
      { x: 230, y: 630 },
      { x: 410, y: 560 },
      { x: 590, y: 490 },
      { x: 770, y: 560 },
      { x: 950, y: 630 },
      { x: 1130, y: 560 },
      { x: 1310, y: 490 },
      { x: 1490, y: 560 },
      { x: 1670, y: 630 },
      { x: 1850, y: 560 },
      { x: 2030, y: 630 }, { x: 2070, y: 630 }, { x: 2110, y: 630 }
    ],
    enemies: [
      { x: 1500, y: 736, type: 'patrol', speed: 100, patrolRange: 200 }
    ],
    powerUps: [],
    goal: { x: 2280, y: 768 }
  },
  {
    id: 4,
    name: 'Fading Dusk',
    world: { width: 2400, height: 800 },
    player: { x: 60, y: 650 },
    platforms: [
      { x: 0, y: 768, width: 2400, height: 32 },
      { x: 300, y: 670, width: 128, height: 20 },
      { x: 550, y: 600, width: 128, height: 20 },
      { x: 800, y: 530, width: 128, height: 20 },
      { x: 1100, y: 670, width: 160, height: 20 },
      { x: 1400, y: 600, width: 128, height: 20 },
      { x: 1700, y: 530, width: 128, height: 20 },
      { x: 1950, y: 670, width: 200, height: 20 }
    ],
    coins: [
      { x: 330, y: 630 }, { x: 370, y: 630 },
      { x: 580, y: 560 },
      { x: 830, y: 490 },
      { x: 1130, y: 630 }, { x: 1170, y: 630 },
      { x: 1430, y: 560 },
      { x: 1730, y: 490 },
      { x: 1980, y: 630 }, { x: 2020, y: 630 }
    ],
    enemies: [
      { x: 700, y: 736, type: 'patrol', speed: 80, patrolRange: 150 },
      { x: 1250, y: 550, type: 'flying', speed: 50, range: 60, axis: 'vertical' }
    ],
    powerUps: [
      { x: 1500, y: 630, type: 'mushroom' }
    ],
    goal: { x: 2280, y: 768 }
  },
  {
    id: 5,
    name: 'Cracked Stairs',
    world: { width: 2400, height: 800 },
    player: { x: 60, y: 650 },
    platforms: [
      { x: 0, y: 768, width: 2400, height: 32 },
      { x: 250, y: 670, width: 96, height: 20, breakable: true },
      { x: 450, y: 600, width: 96, height: 20, breakable: true },
      { x: 650, y: 670, width: 96, height: 20 },
      { x: 850, y: 600, width: 96, height: 20, breakable: true },
      { x: 1050, y: 530, width: 96, height: 20, breakable: true },
      { x: 1250, y: 670, width: 128, height: 20 },
      { x: 1500, y: 600, width: 96, height: 20, breakable: true },
      { x: 1700, y: 530, width: 96, height: 20, breakable: true },
      { x: 1900, y: 670, width: 200, height: 20 }
    ],
    coins: [
      { x: 280, y: 630 }, { x: 320, y: 630 },
      { x: 480, y: 560 },
      { x: 680, y: 630 },
      { x: 880, y: 560 },
      { x: 1080, y: 490 },
      { x: 1280, y: 630 }, { x: 1320, y: 630 },
      { x: 1530, y: 560 },
      { x: 1730, y: 490 },
      { x: 1930, y: 630 }, { x: 1970, y: 630 }
    ],
    enemies: [
      { x: 500, y: 736, type: 'patrol', speed: 90, patrolRange: 180 },
      { x: 1300, y: 736, type: 'patrol', speed: 100, patrolRange: 200 }
    ],
    powerUps: [
      { x: 1100, y: 490, type: 'star' }
    ],
    goal: { x: 2280, y: 768 }
  },
  {
    id: 6,
    name: 'Poisoned Clouds',
    world: { width: 2400, height: 800 },
    player: { x: 60, y: 650 },
    platforms: [
      { x: 0, y: 768, width: 2400, height: 32 },
      { x: 250, y: 670, width: 128, height: 20 },
      { x: 500, y: 580, width: 128, height: 20 },
      { x: 800, y: 670, width: 160, height: 20 },
      { x: 1100, y: 580, width: 128, height: 20 },
      { x: 1400, y: 670, width: 160, height: 20 },
      { x: 1700, y: 580, width: 128, height: 20 },
      { x: 1950, y: 670, width: 200, height: 20 }
    ],
    coins: [
      { x: 280, y: 630 }, { x: 320, y: 630 },
      { x: 530, y: 540 },
      { x: 830, y: 630 }, { x: 870, y: 630 },
      { x: 1130, y: 540 },
      { x: 1430, y: 630 }, { x: 1470, y: 630 },
      { x: 1730, y: 540 },
      { x: 1980, y: 630 }, { x: 2020, y: 630 }
    ],
    enemies: [
      { x: 600, y: 550, type: 'flying', speed: 50, range: 70, axis: 'vertical' },
      { x: 1000, y: 600, type: 'flying', speed: 60, range: 80, axis: 'both' },
      { x: 1500, y: 550, type: 'flying', speed: 50, range: 60, axis: 'vertical' },
      { x: 1200, y: 736, type: 'patrol', speed: 90, patrolRange: 200 }
    ],
    powerUps: [
      { x: 800, y: 630, type: 'mushroom' }
    ],
    goal: { x: 2280, y: 768 }
  },
  {
    id: 7,
    name: 'Ruins',
    world: { width: 2400, height: 800 },
    player: { x: 60, y: 650 },
    platforms: [
      { x: 0, y: 768, width: 2400, height: 32 },
      { x: 200, y: 670, width: 96, height: 20, breakable: true },
      { x: 400, y: 600, width: 96, height: 20, breakable: true },
      { x: 600, y: 670, width: 96, height: 20, breakable: true },
      { x: 800, y: 600, width: 96, height: 20, breakable: true },
      { x: 1000, y: 670, width: 96, height: 20, breakable: true },
      { x: 1200, y: 580, width: 96, height: 20 },
      { x: 1400, y: 660, width: 96, height: 20, breakable: true },
      { x: 1600, y: 580, width: 96, height: 20, breakable: true },
      { x: 1800, y: 660, width: 96, height: 20, breakable: true },
      { x: 2000, y: 580, width: 96, height: 20 }
    ],
    coins: [
      { x: 230, y: 630 }, { x: 270, y: 630 },
      { x: 430, y: 560 },
      { x: 630, y: 630 },
      { x: 830, y: 560 },
      { x: 1030, y: 630 },
      { x: 1230, y: 540 },
      { x: 1430, y: 620 },
      { x: 1630, y: 540 },
      { x: 1830, y: 620 },
      { x: 2030, y: 540 }
    ],
    enemies: [
      { x: 350, y: 736, type: 'patrol', speed: 100, patrolRange: 200 },
      { x: 1100, y: 736, type: 'patrol', speed: 110, patrolRange: 250 },
      { x: 700, y: 580, type: 'flying', speed: 50, range: 80, axis: 'both' }
    ],
    powerUps: [
      { x: 1500, y: 620, type: 'star' }
    ],
    goal: { x: 2280, y: 768 }
  },
  {
    id: 8,
    name: 'Final Explorer',
    world: { width: 2400, height: 800 },
    player: { x: 60, y: 650 },
    platforms: [
      { x: 0, y: 768, width: 2400, height: 32 },
      { x: 200, y: 670, width: 96, height: 20, breakable: true },
      { x: 400, y: 600, width: 96, height: 20 },
      { x: 600, y: 670, width: 96, height: 20, breakable: true },
      { x: 800, y: 580, width: 96, height: 20 },
      { x: 1000, y: 670, width: 96, height: 20, breakable: true },
      { x: 1200, y: 580, width: 96, height: 20, breakable: true },
      { x: 1400, y: 660, width: 96, height: 20 },
      { x: 1600, y: 580, width: 96, height: 20, breakable: true },
      { x: 1800, y: 660, width: 96, height: 20 },
      { x: 2000, y: 580, width: 96, height: 20 }
    ],
    coins: [
      { x: 230, y: 630 },
      { x: 430, y: 560 },
      { x: 630, y: 630 },
      { x: 830, y: 540 },
      { x: 1030, y: 630 },
      { x: 1230, y: 540 },
      { x: 1430, y: 620 },
      { x: 1630, y: 540 },
      { x: 1830, y: 620 },
      { x: 2030, y: 540 }
    ],
    enemies: [
      { x: 300, y: 736, type: 'patrol', speed: 110, patrolRange: 200 },
      { x: 800, y: 736, type: 'patrol', speed: 120, patrolRange: 250 },
      { x: 1500, y: 736, type: 'patrol', speed: 120, patrolRange: 300 },
      { x: 500, y: 580, type: 'flying', speed: 60, range: 80, axis: 'both' },
      { x: 1100, y: 550, type: 'flying', speed: 70, range: 90, axis: 'both' },
      { x: 1700, y: 580, type: 'flying', speed: 60, range: 70, axis: 'vertical' }
    ],
    powerUps: [
      { x: 1000, y: 630, type: 'mushroom' },
      { x: 2000, y: 540, type: 'star' }
    ],
    goal: { x: 2280, y: 768 }
  }
];

// ====== Pre-generate level 9-100 ======
// asumsi: 92 level di-generate saat module load, deterministic via seed
const generatedLevels = [];
for (let i = 9; i <= 100; i++) {
  generatedLevels.push(LevelGenerator.generateLevel(i));
}

export const levels = [...manualLevels, ...generatedLevels];


