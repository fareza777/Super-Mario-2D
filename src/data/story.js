/**
 * src/data/story.js
 * ---------------------------------------------------------------
 * GrimPass — Narasi dan cerita untuk cutscene.
 *
 * Premis: Pemain adalah "Soul Wanderer", arwah yang terperangkap
 * di antara dunia hidup dan alam baka. Untuk menemukan kedamaian,
 * mereka harus melewati GrimPass — wilayah berbahaya yang
 * dihuni bayangan, wraith, dan jiwa-jiwa yang hilang.
 *
 * Ada 9 cutscene (setelah level 10, 20, ..., 90) dan satu
 * penutup setelah level 100.
 * ---------------------------------------------------------------
 */

export const story = {
  intro: 'Di ambang kehidupan dan kematian, tersesatlah sebuah jiwa.\nTanpa nama, tanpa tujuan, hanya lentera kecil yang tersisa.\nHadapilah kegelapan. Temukan jalan. Lewati GrimPass.',

  ending: {
    title: 'KEDAMAIAN',
    text: 'Lentera padam. Bayangan memudar. Setelah melewati\nsepuluh dunia kegelapan, Soul Wanderer akhirnya menemukan\nkedamaian yang dicari.\n\nNamun GrimPass tetap ada...\nmenanti jiwa berikutnya yang tersesat.'
  }
};

// 9 cutscene — dipanggil setelah level 10, 20, 30, ..., 90
const CUTSCENES = {
  10: {
    title: 'Batas Dunia',
    text: 'Langkah pertama telah diambil. Bayangan berbisik\nnamamu — mereka mengenal kehadiranmu.\n\nJangan percaya pada suara yang memanggil dari belakang.'
  },
  20: {
    title: 'Jejak yang Terlupakan',
    text: 'Di sini, memori menghilang seperti daun di musim gugur.\nKamu bukan yang pertama melewati jalan ini.\n\nYang lain telah jatuh. Jangan jadi yang berikutnya.'
  },
  30: {
    title: 'Jurang',
    text: 'Dasar yang tak terlihat menatap balik. Jangan\nmenoleh ke bawah — Abyss menyukai rasa takut.\n\nTetaplah melangkah. Ke depan, bukan ke bawah.'
  },
  40: {
    title: 'Taman Tulang',
    text: 'Istirahatlah di sini, jika kau berani.\n\nYang mati tidak bangun. Namun mereka\nmendengar setiap napas yang kau ambil.'
  },
  50: {
    title: 'Reruntuhan Terkutuk',
    text: 'Bangunan kuno ini mengingat segalanya.\n\nKekuatan purba berdenyut di balik dinding\n yang retak. Jangan sentuh apapun yang bersinar.'
  },
  60: {
    title: 'Wilayah Bayangan',
    text: 'Cahaya adalah kenangan di sini.\nHanya lentera kecilmu yang bisa dipercaya.\n\nBayangan bukan musuh — mereka adalah teman\nyang lupa bentuknya.'
  },
  70: {
    title: 'Puncak Terkutuk',
    text: 'Puncak menguji semua yang mendaki.\n\nAngin membawa suara-suara dari masa lalu.\nSedikit yang mencapai puncak. Lebih sedikit lagi\nyang turun dengan waras.'
  },
  80: {
    title: 'Laut Jiwa',
    text: 'Laut Jiwa memanggil. Jutaan jiwa hilang\nberenang tanpa tujuan di bawah permukaan.\n\nApakah kamu akan menjawab panggilannya?\nAtau tetap di atas, di tepi?'
  },
  90: {
    title: 'Kekosongan',
    text: 'Kekosongan menunggu. Tidak ada kembali\ndari ketiadaan.\n\nSatu langkah lagi. Hanya satu.\nDan GrimPass akan terbuka.'
  }
};

export function getCutsceneStory(levelNumber) {
  return CUTSCENES[levelNumber] || null;
}
