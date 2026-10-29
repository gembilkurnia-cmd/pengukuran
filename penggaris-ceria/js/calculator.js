/* calculator.js - rumus konversi, generator soal, pemeriksa jawaban, langkah pembahasan */
(function (g) {
  'use strict';
  const F = { mm: 1, cm: 10, dm: 100, m: 1000, dam: 10000, hm: 100000, km: 1000000 }; // faktor ke mm
  const URUT = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm']; // tangga satuan
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[rand(0, a.length - 1)];
  const bulat = (x) => Math.round(x * 1e6) / 1e6;
  const fmt = (x) => String(bulat(x)).replace('.', ',');
  const konversi = (v, d, k) => bulat((v * F[d]) / F[k]);

  function langkahKonversi(v, d, k) {
    const n = URUT.indexOf(k) - URUT.indexOf(d); // positif = turun tangga
    if (n === 0) return [`${fmt(v)} ${d} = ${fmt(v)} ${k}`];
    const f = Math.pow(10, Math.abs(n));
    const tg = n > 0 ? `Turun ${n} anak tangga, tiap anak tangga x 10` : `Naik ${-n} anak tangga, tiap anak tangga : 10`;
    return [tg, `${fmt(v)} ${d} = ${fmt(v)} ${n > 0 ? 'x' : ':'} ${f} = ${fmt(konversi(v, d, k))} ${k}`];
  }
  function parse(s) {
    if (s == null) return NaN;
    s = String(s).replace(/\s/g, '').replace(',', '.');
    return /^-?\d+(\.\d+)?$/.test(s) ? parseFloat(s) : NaN;
  }
  const mc = (m, c) => `${m} m ${c} cm`;
  const cmDari = (m, c) => m * 100 + c;

  /* ---------- generator: jawaban DIHITUNG oleh fungsi, bukan di-hardcode ---------- */
  const GEN = {
    a(l) { // besar -> kecil
      const [d, k] = pick(l === 1 ? [['m', 'cm'], ['cm', 'mm']] : [['km', 'm'], ['m', 'mm'], ['m', 'cm'], ['dm', 'mm']]);
      const v = l === 3 ? rand(12, 95) : rand(2, l === 1 ? 9 : 20);
      const j = konversi(v, d, k), f = j / v;
      return { teks: `${v} ${d} = ... ${k}`, jenis: 'num', jawab: j, satuan: k, langkah: langkahKonversi(v, d, k),
        petunjuk: [`${d} ke ${k}: kamu turun ${URUT.indexOf(k) - URUT.indexOf(d)} anak tangga.`, 'Turun tangga berarti dikali 10 tiap anak tangga.'],
        diag: { kali: v / f, arah: 'kecil' } };
    },
    b(l) { // kecil -> besar
      const [d, k] = pick(l === 1 ? [['cm', 'm'], ['mm', 'cm']] : [['m', 'km'], ['mm', 'm'], ['cm', 'm'], ['mm', 'cm']]);
      const f = F[k] / F[d];
      const v = l === 3 ? rand(2, 9) * f + pick([f / 2, f / 4, f / 5]) : rand(2, 9) * f;
      const j = konversi(v, d, k);
      return { teks: `${fmt(v)} ${d} = ... ${k}`, jenis: 'num', jawab: j, satuan: k, langkah: langkahKonversi(v, d, k),
        petunjuk: [`${d} ke ${k}: kamu naik ${URUT.indexOf(d) - URUT.indexOf(k)} anak tangga.`, 'Naik tangga berarti dibagi 10 tiap anak tangga.'],
        diag: { kali: v * f, arah: 'besar' } };
    },
    c(l) { // bentuk campuran -> cm
      const m = rand(1, l === 3 ? 20 : 9), c = l === 1 ? rand(1, 9) * 10 : l === 2 ? rand(1, 19) * 5 : rand(1, 99), j = cmDari(m, c);
      return { teks: `${mc(m, c)} = ... cm`, jenis: 'num', jawab: j, satuan: 'cm',
        langkah: [`${m} m = ${m} x 100 = ${m * 100} cm`, `${m * 100} cm + ${c} cm = ${j} cm`],
        petunjuk: [`Ubah dulu ${m} m menjadi cm.`, 'Lalu jumlahkan dengan sisa cm-nya.'], diag: { salahTambah: m + c } };
    },
    d(l) { // membandingkan
      let kiri, kanan, a, b, su;
      if (l === 3) { const k = rand(1, 9); kiri = `${k} km`; a = k * 1000; b = a + pick([-500, 0, 0, 250, -250, 1000]); kanan = `${b} m`; su = 'm'; }
      else { const m = rand(1, 9), c = l === 2 ? pick([10, 25, 40, 50, 75]) : 0; kiri = c ? mc(m, c) : `${m} m`; a = cmDari(m, c); b = a + pick([-50, -20, 0, 0, 30, 70]); kanan = `${b} cm`; su = 'cm'; }
      const j = a > b ? '>' : a < b ? '<' : '=';
      return { teks: `${kiri} ... ${kanan}`, jenis: 'simbol', jawab: j,
        langkah: [`Samakan satuan dulu: ${kiri} = ${a} ${su}`, `Bandingkan ${a} ${su} dan ${b} ${su}: ${a} ${j} ${b}`, `Jadi tandanya: ${j}`],
        petunjuk: ['Samakan satuannya dulu sebelum membandingkan.', `Ubah ${kiri} ke ${su}.`] };
    },
    e(l) { // penjumlahan bersusun -> cm
      const a1 = rand(1, l === 3 ? 12 : 6), a2 = rand(1, l === 3 ? 12 : 6);
      let b1 = rand(5, 40), b2 = rand(5, 40);
      if (l === 1) { b1 = Math.round(b1 / 5) * 5; b2 = Math.round(b2 / 5) * 5; }
      else { b1 = rand(40, 95); b2 = rand(30, 99); }
      const s = b1 + b2, j = cmDari(a1 + a2, s);
      const st = [`Jumlahkan cm dengan cm: ${b1} + ${b2} = ${s} cm`];
      let M = a1 + a2, C = s;
      if (s >= 100) { st.push(`${s} cm = 1 m ${s - 100} cm (100 cm = 1 m)`); M += 1; C = s - 100; }
      st.push(`Jumlahkan m dengan m: ${a1} + ${a2}${s >= 100 ? ' + 1' : ''} = ${M} m`, `Hasil: ${mc(M, C)} = ${M} x 100 + ${C} = ${j} cm`);
      return { teks: `${mc(a1, b1)} + ${mc(a2, b2)} = ... cm`, jenis: 'num', jawab: j, satuan: 'cm', langkah: st,
        petunjuk: ['Jumlahkan m dengan m, cm dengan cm.', 'Jika cm lebih dari 99, ubah 100 cm menjadi 1 m.'], diag: { lupaUbah: a1 + a2 + s } };
    },
    f(l) { // pengurangan bersusun -> cm
      let a1, b1, a2, b2;
      if (l === 1) { a1 = rand(4, 9); a2 = rand(1, a1 - 1); b1 = rand(5, 9) * 10; b2 = rand(1, b1 / 10 - 1) * 10; }
      else if (l === 2) { a1 = rand(4, 9); a2 = rand(1, a1 - 1); b2 = rand(35, 90); b1 = rand(5, b2 - 5); }
      else { a1 = rand(3, 9); a2 = rand(1, a1 - 1); b1 = 0; b2 = rand(10, 90); }
      const j = cmDari(a1, b1) - cmDari(a2, b2), st = [];
      if (b1 < b2) st.push(`cm tidak cukup (${b1} < ${b2}), pinjam 1 m = 100 cm`, `${a1} m ${b1} cm menjadi ${a1 - 1} m ${b1 + 100} cm`, `cm: ${b1 + 100} - ${b2} = ${b1 + 100 - b2} cm`, `m: ${a1 - 1} - ${a2} = ${a1 - 1 - a2} m`);
      else st.push(`cm: ${b1} - ${b2} = ${b1 - b2} cm`, `m: ${a1} - ${a2} = ${a1 - a2} m`);
      st.push(`Hasil: ${j} cm`);
      return { teks: `${l === 3 ? a1 + ' m' : mc(a1, b1)} - ${mc(a2, b2)} = ... cm`, jenis: 'num', jawab: j, satuan: 'cm', langkah: st,
        petunjuk: ['Kurangi m dengan m, cm dengan cm.', 'Jika cm kurang, pinjam 1 m = 100 cm.'], diag: {} };
    },
    g(l) { // soal cerita
      const nama = pick(['Ayah', 'Ibu', 'Dina', 'Budi']), b = pick(['tali', 'pita', 'kain']);
      if (Math.random() < 0.5) {
        const q = GEN.e(l === 3 ? 2 : l), x = /^(.+?) \+ (.+?) = /.exec(q.teks);
        return { ...q, teks: `${nama} punya ${b} ${x[1]}, lalu membeli lagi ${x[2]}. Berapa cm panjang ${b} sekarang?`, petunjuk: ['Ini soal penjumlahan: panjang awal + tambahan.', q.petunjuk[1]] };
      }
      const q = GEN.f(l === 3 ? 2 : l), x = /^(.+?) - (.+?) = /.exec(q.teks);
      return { ...q, teks: `${nama} membeli ${b} ${x[1]}, lalu dipakai ${x[2]}. Berapa cm sisa ${b}?`, petunjuk: ['Ini soal pengurangan: panjang awal - yang dipakai.', q.petunjuk[1]] };
    },
    h(l) { // memilih satuan
      const B = [['panjang pensil sekitar 15', 'cm'], ['jarak rumah ke sekolah sekitar 2', 'km'], ['tinggi pintu sekitar 2', 'm'], ['panjang sepatu sekitar 20', 'cm'],
        ['panjang lapangan sepak bola sekitar 100', 'm'], ['tebal koin sekitar 2', 'mm'], ['jarak Bogor ke Jakarta sekitar 60', 'km'], ['tinggi tiang bendera sekitar 10', 'm'], ['tebal kertas sekitar 1', 'mm']];
      const [t, u] = pick(l === 1 ? B.filter((x) => x[1] !== 'mm') : B);
      return { teks: `${t[0].toUpperCase() + t.slice(1)} ... (mm / cm / m / km)`, jenis: 'satuan', jawab: u,
        langkah: [`Bayangkan bendanya: ${t} ${u}.`, `Satuan yang tepat adalah ${u}.`],
        petunjuk: ['Lebar jari kita sekitar 1 cm. Satu langkah kaki sekitar 50 cm.', 'Benda kecil: mm/cm. Benda besar: m. Jarak jauh: km.'] };
    },
    i(l) { // mencari x
      const b = rand(1, 9) * 5 + (l > 1 ? rand(1, 4) : 0), a = l === 1 ? 1 : rand(2, 5);
      if (l < 3) { const j = a * 100 - b; return { teks: `x + ${b} cm = ${a} m. Berapa x (cm)?`, jenis: 'num', jawab: j, satuan: 'cm',
        langkah: [`${a} m = ${a * 100} cm`, 'Operasi kebalikan dari tambah adalah kurang', `x = ${a * 100} - ${b} = ${j} cm`], petunjuk: [`Samakan satuan: ubah ${a} m ke cm.`, 'x + b = c, maka x = c - b.'] }; }
      const m = rand(1, 3), c = rand(1, 9) * 10, j = cmDari(m, c) + b;
      return { teks: `x - ${b} cm = ${mc(m, c)}. Berapa x (cm)?`, jenis: 'num', jawab: j, satuan: 'cm',
        langkah: [`${mc(m, c)} = ${cmDari(m, c)} cm`, 'Operasi kebalikan dari kurang adalah tambah', `x = ${cmDari(m, c)} + ${b} = ${j} cm`], petunjuk: ['Samakan satuan dulu.', 'x - b = c, maka x = c + b.'] };
    },
  };
  const TIPE = [['a', 'Konversi ke satuan lebih kecil'], ['b', 'Konversi ke satuan lebih besar'], ['c', 'Bentuk campuran'], ['d', 'Membandingkan (>, <, =)'],
    ['e', 'Penjumlahan panjang'], ['f', 'Pengurangan panjang'], ['g', 'Soal cerita'], ['h', 'Memilih satuan tepat'], ['i', 'Mencari x']];

  function generate(tipe, tingkat) {
    tipe = tipe && GEN[tipe] ? tipe : pick(TIPE)[0];
    tingkat = tingkat || rand(1, 3);
    return { ...GEN[tipe](tingkat), tipe, tingkat };
  }
  /* periksa jawaban -> {valid, ok, pesan} */
  function periksa(q, masuk) {
    const s = String(masuk == null ? '' : masuk).trim();
    if (!s) return { valid: false, pesan: 'Jawabanmu masih kosong. Ayo isi dulu ya! 😊' };
    if (q.jenis === 'simbol') {
      if (!['>', '<', '='].includes(s)) return { valid: false, pesan: 'Pilih tanda >, < atau = ya.' };
      return { valid: true, ok: s === q.jawab, pesan: 'Hampir! Samakan satuannya dulu, lalu bandingkan angkanya.' };
    }
    if (q.jenis === 'satuan') {
      const u = s.toLowerCase().replace(/\./g, '');
      if (!['mm', 'cm', 'm', 'km'].includes(u)) return { valid: false, pesan: 'Tulis salah satu: mm, cm, m, atau km.' };
      return { valid: true, ok: u === q.jawab, pesan: 'Coba bayangkan benda pembandingnya, ya.' };
    }
    const v = parse(s);
    if (isNaN(v)) return { valid: false, pesan: 'Tulis angka saja ya (tanpa huruf). Contoh: 250 😊' };
    if (Math.abs(v - q.jawab) <= 0.005) return { valid: true, ok: true, pesan: '' };
    const d = q.diag || {};
    let p = 'Belum tepat, tidak apa-apa. Coba lagi ya!';
    if (d.kali !== undefined && Math.abs(v - d.kali) < 0.005) p = d.arah === 'besar' ? 'Kamu mengubah ke satuan yang lebih besar, jadi dibagi ya.' : 'Kamu mengubah ke satuan yang lebih kecil, jadi dikali ya.';
    else if (d.salahTambah !== undefined && v === d.salahTambah) p = 'Ingat, 1 m = 100 cm. Ubah dulu m ke cm sebelum dijumlahkan.';
    else if (d.lupaUbah !== undefined && v === d.lupaUbah) p = 'Satuannya belum disamakan. Jumlahkan m dengan m, cm dengan cm, lalu ubah ke cm.';
    else if (q.jawab !== 0 && v !== 0 && [10, 100, 1000].some((r) => Math.abs(v / q.jawab - r) < 1e-9 || Math.abs(q.jawab / v - r) < 1e-9)) p = 'Jumlah nol-nya belum pas. Hitung lagi anak tangganya: tiap anak tangga = satu nol (x 10).';
    return { valid: true, ok: false, pesan: p };
  }
  g.Calc = { F, URUT, TIPE, konversi, langkahKonversi, parse, fmt, generate, periksa };
})(typeof window !== 'undefined' ? window : globalThis);
