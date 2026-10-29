# Penggaris Ceria - Media Pembelajaran Pengukuran Panjang (SD Kelas 3-4)

Proyek statis (HTML, CSS, JavaScript murni). Tanpa framework, tanpa npm.

## Cara menjalankan
1. Buka folder `penggaris-ceria` di VS Code.
2. Instal ekstensi **Live Server** (Ritwick Dey), klik **Go Live** di kanan bawah.
3. Atau jalankan `python -m http.server 5500` di dalam folder, lalu buka http://localhost:5500

## Cara mengubah soal
- Semua soal dibuat oleh generator di `js/calculator.js` (objek `GEN`, fungsi `a` sampai `i`). Ubah rentang angka di tiap fungsi.
- Daftar benda untuk soal "memilih satuan" ada di `GEN.h`. Daftar nama jenis soal ada di `TIPE`.
- Jawaban selalu dihitung oleh fungsi, tidak ditulis manual.

## Cara hosting nanti
Unggah seluruh folder ke hosting statis (GitHub Pages, Netlify, Cloudflare Pages). Tidak perlu build. `index.html` ada di akar folder.

## Catatan
- Progres tersimpan di localStorage browser (kunci `penggarisCeria.v1`). Reset ada di halaman Guru.
- Font Google Fonts bersifat opsional; saat offline dipakai font sistem.
