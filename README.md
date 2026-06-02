# Petualangan Mario - 100 Level

Game platformer 2D ala Mario Bros dengan 100 level, dibuat pakai Phaser 3 dan bisa dibuild jadi APK Android via Capacitor.

## Cara Main

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` di browser (Chrome/Edge/Firefox).

## Kontrol

| Tombol | Aksi |
|---|---|
| `←` `→` atau `A` `D` | Gerak kiri/kanan |
| `Space` / `↑` / `W` | Lompat |
| `P` / `Esc` | Pause |
| `R` | Restart level |
| `M` | Mute / unmute sound |

Setelah menang, tekan `Space` / `Enter` untuk lanjut ke level berikutnya (ada auto-advance 3 detik).

## Build APK Android

```bash
npm run android:init      # inisialisasi Capacitor (sekali)
npm run android:sync      # sync web assets ke android/
npm run android:build:debug   # build APK debug
```

Lihat `KEYSTORE.md` untuk cara generate keystore sebelum build release.

## Struktur Project

```
game-mario/
├── index.html              # entry HTML (Phaser CDN)
├── package.json            # npm scripts
├── capacitor.config.json   # konfigurasi Capacitor
├── src/
│   ├── main.js             # inisialisasi Phaser.Game + scene registry
│   ├── scenes/             # Boot, Preload, Intro, LevelSelect, Game, Cut, Ending
│   ├── entities/           # Player, Enemy, Coin, PowerUp
│   ├── systems/            # HUD, LevelManager, LevelGenerator, SoundManager
│   └── data/               # levels.js (8 manual + 92 generated), story.js
├── android/                # hasil `npx cap add android`
├── KEYSTORE.md             # cara generate keystore
└── README.md               # file ini
```

## Status

- [x] 100 level (8 handcrafted + 92 procedural deterministic)
- [x] Cutscene setiap kelipatan 10 level
- [x] Ending setelah level 100
- [x] Pixel art sprites (Mario, Goomba, bat, coin, flag, mushroom, star)
- [x] Web Audio API procedural SFX (no external audio files)
- [x] Coyote time + jump buffer untuk kontrol responsif
- [x] HUD: nyawa, skor, level, waktu, koin, mute indicator
- [x] Auto-advance + SPACE shortcut dari layar "LEVEL SELESAI"
- [x] Capacitor Android config
