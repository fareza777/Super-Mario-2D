/**
 * src/systems/LevelManager.js
 * ---------------------------------------------------------------
 * Mengelola progress level: level yang sudah diselesaikan dan
 * skor terbaik per level. Disimpan di localStorage sehingga
 * progress bertahan antar sesi browser.
 *
 * Ketergantungan: tidak ada. Pure utility, dipanggil dari
 * GameScene (setelah menang) dan LevelSelectScene (cek status).
 * ---------------------------------------------------------------
 */
const STORAGE_COMPLETED = 'mario-completed-levels';
const STORAGE_BEST_SCORES = 'mario-best-scores';

export default class LevelManager {
  static getCompletedLevels() {
    try {
      const data = localStorage.getItem(STORAGE_COMPLETED);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static isCompleted(levelId) {
    return LevelManager.getCompletedLevels().includes(levelId);
  }

  static markCompleted(levelId, score) {
    const completed = LevelManager.getCompletedLevels();
    if (!completed.includes(levelId)) {
      completed.push(levelId);
      try {
        localStorage.setItem(STORAGE_COMPLETED, JSON.stringify(completed));
      } catch (e) {
        // localStorage tidak tersedia (private mode) - abaikan
      }
    }
    LevelManager.setBestScore(levelId, score);
  }

  static getBestScore(levelId) {
    try {
      const data = localStorage.getItem(STORAGE_BEST_SCORES);
      const scores = data ? JSON.parse(data) : {};
      return scores[levelId] || 0;
    } catch (e) {
      return 0;
    }
  }

  static setBestScore(levelId, score) {
    try {
      const data = localStorage.getItem(STORAGE_BEST_SCORES);
      const scores = data ? JSON.parse(data) : {};
      if (!scores[levelId] || score > scores[levelId]) {
        scores[levelId] = score;
        localStorage.setItem(STORAGE_BEST_SCORES, JSON.stringify(scores));
      }
    } catch (e) {
      // abaikan
    }
  }

  /**
   * Total level yang tersedia (Fase 3 akan menggunakan ini untuk
   * menampilkan 100 level di LevelSelectScene).
   */
  static getTotalLevels() {
    return 100;
  }
}
