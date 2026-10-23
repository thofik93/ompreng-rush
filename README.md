# Ompreng Rush

Game arcade satire bertema program makan siang gratis. Kamu relawan dapur yang harus melengkapi ompreng pesanan murid, sambil menghadapi efisiensi anggaran, tikus berdasi, lauk kemarin yang dibantah lewat rilis resmi, dan kunjungan pejabat yang bikin menu mendadak mewah.

**Main langsung:** https://thofik93.github.io/ompreng-rush/

## Cara main
- Geser jari atau mouse untuk menggerakkan ompreng. Di keyboard pakai ← → atau A D, dan P untuk jeda.
- Tangkap yang dilingkari hijau, hindari yang dilingkari merah, ambil yang bercahaya.
- Nyalakan suara untuk mendengar sambutan Pak Pejabat (text-to-speech browser).

## Pengembangan

```bash
npm install
npm run dev      # server lokal dengan hot reload
npm run build    # hasil produksi di dist/
```

Setiap push ke `main` otomatis di-build dan dideploy ke GitHub Pages lewat `.github/workflows/deploy.yml`.

### Struktur

| File | Isi |
|---|---|
| `index.html` | Markup HUD dan overlay (header, pesanan, ticker, layar awal, jeda, game over) |
| `src/main.js` | Boot Phaser, tombol, jeda, suara, salin skor |
| `src/data.js` | Semua teks satire dan tabel tuning (menu, rintangan, anggaran, berita, kalimat Pak Pejabat) |
| `src/state.js` | State ronde, preferensi pemain, helper |
| `src/hud.js` | Pembaruan HUD di luar canvas, subtitle, ticker berita |
| `src/audio.js` | Efek suara sintetis (WebAudio) dan suara Pak Pejabat (Web Speech) |
| `src/scenes/CanteenScene.js` | Aturan main: spawn, tangkap, combo, level, kunjungan pejabat |
| `src/scenes/textures.js` | Emoji dipanggang jadi texture, cincin hijau/merah, partikel |
| `src/scenes/backdrop.js` | Dinding kantin, bendera, baliho, meja, karpet merah |

Dibuat dengan [Phaser 3](https://phaser.io) dan [Vite](https://vitejs.dev).

*Satire. Semua lembaga, tokoh, dan berita di game ini fiktif.*
