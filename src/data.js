// All game copy and tuning tables. Satire: every institution, person and headline here is fictional.

export const FOOD = {
  nasi: { e: '🍚', n: 'Nasi' }, ayam: { e: '🍗', n: 'Ayam' }, telur: { e: '🥚', n: 'Telur' }, ikan: { e: '🐟', n: 'Ikan' },
  brokoli: { e: '🥦', n: 'Brokoli' }, wortel: { e: '🥕', n: 'Wortel' }, pisang: { e: '🍌', n: 'Pisang' },
  jeruk: { e: '🍊', n: 'Jeruk' }, semangka: { e: '🍉', n: 'Semangka' }, susu: { e: '🥛', n: 'Susu' }
};
export const FOOD_KEYS = Object.keys(FOOD);

// what the same food looks like while the cameras are rolling
export const LUX = { nasi: '🍛', ayam: '🥩', telur: '🍤', ikan: '🦞', brokoli: '🥗', wortel: '🥗', pisang: '🍇', jeruk: '🍇', semangka: '🍇', susu: '🧃' };

export const HAZ = {
  lalat: { e: '🪰', lines: ['Hush! Lalat!', 'Lalatnya juga dapat jatah?'] },
  kerikil: { e: '🪨', lines: ['Kriuk… itu kerikil', 'Nasi atau material proyek?'] },
  tikus: { e: '🐀' },
  basi: { e: '🦠' }
};
export const POW = { viral: '📢', esteh: '🧋', orangdalam: '🤝', hati: '❤️' };

export const LABELS = {
  lalat: 'Lalat: hindari', kerikil: 'Kerikil: hindari', tikus: 'Tikus berdasi: mencuri lauk', basi: 'Lauk kemarin: hindari',
  viral: 'Viral: +100 poin', esteh: 'Es teh: slow-mo', orangdalam: 'Orang dalam: menu mendekat', hati: 'Warga patungan: +1 nyawa'
};

export const BUDGETS = [15000, 12500, 10000, 8000, 6500, 5000, 4000, 3000];
export const TERBILANG = {
  15000: 'lima belas ribu', 12500: 'dua belas ribu lima ratus', 10000: 'sepuluh ribu', 8000: 'delapan ribu',
  6500: 'enam ribu lima ratus', 5000: 'lima ribu', 4000: 'empat ribu', 3000: 'tiga ribu'
};

export const KIDS = ['🧒', '👦', '👧', '🧒🏽', '👦🏾', '👧🏻', '🧒🏻', '👧🏽', '👦🏻'];
export const NAMES = ['Budi', 'Siti', 'Ucok', 'Dewi', 'Asep', 'Putu', 'Rina', 'Joko', 'Nining', 'Agus', 'Made', 'Tiara', 'Yohanes', 'Mei', 'Fajar', 'Intan', 'Bagas', 'Lala'];
export const CLASSES = ['1A', '2B', '3A', '3B', '4C', '5A', '5B', '6C'];

export const HAPPY = ['Kenyang! Eh, ini porsi anak TK?', 'Ayamnya tipis, tembus pandang!', 'Makasih! Pajak Ayahku nggak sia-sia', 'Lumayan, cukup buat tiga suap', 'Gizinya lengkap… di brosur', 'Kak, ini ayam atau kaldu bubuk?', 'Enak! Kayak di baliho'];
export const VISIT_HAPPY = ['Kok hari ini enak banget, Kak?', 'Ada kamera ya? Pantas ada udang', 'Besok pejabatnya datang lagi ya!'];
export const WRONG = ['Aku pesan gizi, bukan janji!', 'Itu menu baliho, Kak!', 'Salah ompreng, Kak!'];
export const LEAVE = ['pulang bawa bekal sendiri. Lagi.', 'ditraktir kantin sebelah.', 'makan di rumah. Gratis beneran.'];
export const STEAL = ['Disunat 10%!', 'Tikus berdasi ambil lauk!', 'Lauk "dikoordinasikan"!', 'Ada biaya administrasi!'];

export const RILIS = [
  'Itu bukan keracunan, hanya adaptasi pencernaan terhadap makanan bergizi.',
  'Oknum dapur sudah dibina. Dapurnya tetap beroperasi seperti biasa.',
  'Kasus ini hanya sebagian sangat kecil dari total porsi dan kebetulan viral saja.',
  'Kami prihatin. Anggaran tahun depan tetap naik.',
  'Sampel sudah dikirim ke lab. Hasilnya diumumkan setelah beritanya reda.'
];

export const NEWS = [
  'Anggaran program naik lagi. Porsi di ompreng belum dengar kabarnya.',
  'Badan Gizi Nanti: "Gizi anak prioritas utama, setelah baliho."',
  'Mitra dapur belum dibayar tiga bulan, diminta tetap semangat dan ikhlas.',
  'Survei internal: 100% pejabat puas dengan menu saat kunjungan.',
  'Ahli gizi bingung kenapa susu di ompreng bisa bening.',
  'Tender ompreng dimenangkan perusahaan yang berdiri kemarin sore.',
  'Efisiensi berhasil: ayam kini hadir dalam bentuk kaldu bubuk.',
  'Honor relawan bulan ini ditunda. Lagi.',
  'Rapat evaluasi program digelar di hotel bintang lima demi efisiensi.',
  'Juru bicara: "Kalau anaknya tidak kenyang, berarti makannya kurang ikhlas."'
];

// lines for "Pak Pejabat", a fictional official voiced by the browser's text-to-speech
export const PEJABAT = {
  start: ['Selamat siang anak-anak. Makan siang gratis sudah siap. Syarat dan ketentuan berlaku.',
    'Selamat siang. Hari ini kita makan bergizi. Gizinya ada di brosur.'],
  visit: ['Wah, menunya bagus sekali. Setiap hari seperti ini, kan?',
    'Luar biasa. Ini bukti program kita berhasil. Tolong difoto dari sisi kiri.',
    'Anak-anak, makan yang banyak ya. Kameranya sudah siap?'],
  leave: ['Baik, kami pamit. Rapat evaluasi sudah menunggu di hotel.',
    'Terima kasih. Kami lanjut ke lokasi foto berikutnya.'],
  cut: words => [`Demi efisiensi, jatah per porsi sekarang ${words} rupiah. Gizinya tetap, porsinya saja yang lebih hemat.`,
    `Mulai hari ini jatahnya ${words} rupiah. Ini bukan pemotongan, ini penyesuaian.`],
  over: ['Program ini sukses seratus persen. Hasil evaluasi: dilanjutkan, anggaran ditambah.',
    'Kami tidak melihat ada masalah. Yang ada hanya tantangan. Program jalan terus.']
};

export const RANKS = [[0, 'Relawan Tak Dibayar'], [300, 'Mitra Dapur (Nunggak 3 Bulan)'], [800, 'Kepala Dapur'], [1600, 'Konsultan Titipan'], [3000, 'Pejabat Kunjungan'], [5000, 'Wajah di Baliho']];
