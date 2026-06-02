/**
 * src/data/story.js
 * ---------------------------------------------------------------
 * Data cerita untuk intro, cutscene per dunia (setelah level
 * 10, 20, ..., 90), dan ending (setelah level 100).
 * Semua teks dalam Bahasa Indonesia.
 * ---------------------------------------------------------------
 */
export const story = {
  intro: 'Selamat datang di Petualangan Mario! Bantulah Mario menyelamatkan Putri dari cengkeraman Raja Bowser di 100 level yang menantang!',

  cutscenes: [
    {
      afterLevel: 10,
      title: 'Akhir Dunia 1',
      text: 'Mario berhasil melewati Hutan Hijau. Namun rintangan baru menantinya di dunia berikutnya. Awan gelap mulai menyelimuti cakrawala...'
    },
    {
      afterLevel: 20,
      title: 'Akhir Dunia 2',
      text: 'Awan gelap menyelimuti dunia kedua. Musuh-musuh terbang berdatangan dari langit! Mario harus lebih waspada dalam setiap langkah.'
    },
    {
      afterLevel: 30,
      title: 'Akhir Dunia 3',
      text: 'Mario menemukan petunjuk tentang lokasi Bowser. Tapi jalannya penuh jebakan dan musuh yang lebih kuat dari sebelumnya.'
    },
    {
      afterLevel: 40,
      title: 'Akhir Dunia 4',
      text: 'Kastil gelap terlihat di cakrawala. Angin dingin berhembus. Mario merasa ini adalah tempat persembunyian Bowser selama ini.'
    },
    {
      afterLevel: 50,
      title: 'Setengah Perjalanan',
      text: 'Setengah perjalanan telah dilalui! Mario beristirahat sejenak, tapi waktu tidak menunggu. Lanjutkan perjuangan, Mario!'
    },
    {
      afterLevel: 60,
      title: 'Akhir Dunia 6',
      text: 'Lava dan api mulai muncul di sekitar Mario. Suhu udara semakin panas. Satu langkah salah, dan Mario akan jatuh ke dalam api!'
    },
    {
      afterLevel: 70,
      title: 'Akhir Dunia 7',
      text: 'Bantuan ajaib datang dari langit! Jamur dan bintang jatuh untuk Mario. Gunakan dengan bijak di dunia yang penuh rintangan ini.'
    },
    {
      afterLevel: 80,
      title: 'Akhir Dunia 8',
      text: 'Hampir sampai! Mario melihat menara Bowser di kejauhan. Tinggal sedikit lagi menuju pertarungan akhir. Kumpulkan semua kekuatan!'
    },
    {
      afterLevel: 90,
      title: 'Akhir Dunia 9',
      text: 'Ksatria-ksatria Bowser menjaga jalan masuk. Mario harus berjuang habis-habisan untuk menembus pertahanan terakhir mereka.'
    }
  ],

  ending: {
    title: 'TAMAT',
    text: 'Selamat! Kamu telah menyelesaikan Petualangan Mario dan menyelamatkan Putri dari cengkeraman Bowser! Terima kasih telah bermain!'
  }
};

/**
 * Ambil data cutscene untuk level tertentu (multiple of 10).
 * @param {number} levelNumber
 * @returns {object|null}
 */
export function getCutsceneStory(levelNumber) {
  return story.cutscenes.find(c => c.afterLevel === levelNumber) || null;
}
