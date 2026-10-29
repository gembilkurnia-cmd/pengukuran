/* simbolik.js - kalkulator konversi, bank soal, dan evaluasi akhir */
(() => {
  'use strict';
  const A = window.App, C = window.Calc, $ = (s) => document.querySelector(s);
  const langkahHTML = (q) => `<div class="langkah"><b>Cara penyelesaian:</b>${q.langkah.map((l) => `<code>${l}</code>`).join('')}<small>Rumus: turun tangga x 10, naik tangga : 10; 1 m = 100 cm; 1 km = 1000 m.</small></div>`;

  function kalkulator() {
    if (!$('#kalk')) return;
    const o = C.URUT.map((u) => `<option>${u}</option>`).join('');
    $('#kalk').innerHTML = `<h2>🧮 Kalkulator konversi</h2><div class="baris"><input id="kv" type="text" inputmode="decimal" value="3" aria-label="Angka"><select id="kd" aria-label="Satuan asal">${o}</select> ke <select id="kk" aria-label="Satuan tujuan">${o}</select><button id="kb">Hitung</button></div><div id="kh" aria-live="polite"></div>`;
    $('#kd').value = 'm'; $('#kk').value = 'cm';
    $('#kb').onclick = () => { const v = C.parse($('#kv').value); if (isNaN(v) || v < 0) return ($('#kh').innerHTML = '<div class="umpan salah">Ketik angka (0 atau lebih) ya 😊</div>');
      const d = $('#kd').value, k = $('#kk').value; $('#kh').innerHTML = `<div class="hasilK">${C.fmt(v)} ${d} = ${C.fmt(C.konversi(v, d, k))} ${k}</div><div class="langkah">${C.langkahKonversi(v, d, k).map((l) => `<code>${l}</code>`).join('')}</div>`; };
  }
  // antarmuka soal dipakai bersama oleh latihan dan evaluasi
  function kotakSoal(el, q, { petunjuk, selesai }) {
    let salah = 0;
    const pilihan = q.jenis === 'simbol' ? ['>', '<', '='] : q.jenis === 'satuan' ? ['mm', 'cm', 'm', 'km'] : null;
    el.innerHTML = `<div class="soal" id="sq">${q.teks}</div><div class="baris">${pilihan ? `<span class="pilsimbol baris">${pilihan.map((p) => `<button type="button" data-p="${p}" class="sek">${p}</button>`).join('')}</span>` : ''}
      <input id="jw" type="text" inputmode="${q.jenis === 'num' ? 'decimal' : 'text'}" autocomplete="off" aria-label="Jawabanmu" placeholder="Jawabanmu">${q.satuan && q.jenis === 'num' ? `<b>${q.satuan}</b>` : ''}<button id="pk">Periksa ✅</button></div><div id="fb" aria-live="polite"></div>`;
    el.querySelectorAll('[data-p]').forEach((b) => (b.onclick = () => { $('#jw').value = b.dataset.p; }));
    const fb = $('#fb');
    const cek = () => {
      const r = C.periksa(q, $('#jw').value);
      if (!r.valid) return (fb.innerHTML = `<div class="umpan salah">${r.pesan}</div>`);
      if (r.ok) { A.bunyi(true); A.konfeti(); fb.innerHTML = '<div class="umpan ok">🌟 Hebat! Jawabanmu benar!</div>'; $('#pk').disabled = true; selesai(true, salah); return; }
      salah++; A.bunyi(false);
      if (!petunjuk) { fb.innerHTML = `<div class="umpan salah">Belum tepat. Jawaban yang benar: ${q.jenis === 'num' ? C.fmt(q.jawab) + ' ' + q.satuan : q.jawab}</div>${langkahHTML(q)}`; $('#pk').disabled = true; selesai(false, salah); return; }
      fb.innerHTML = `<div class="umpan salah">${r.pesan}</div><div class="umpan info">💡 Petunjuk ${Math.min(salah, 2)}: ${q.petunjuk[Math.min(salah, 2) - 1]}</div><div class="baris"><button id="lc" class="sek">Lihat Cara Penyelesaian</button><button id="ss" class="sek">Coba Soal Serupa</button></div><div id="cr"></div>`;
      $('#lc').onclick = () => { $('#cr').innerHTML = langkahHTML(q); }; $('#ss').onclick = () => selesai(null, salah);
    };
    $('#pk').onclick = cek; $('#jw').onkeydown = (e) => { if (e.key === 'Enter') cek(); };
  }
  function latihan() {
    const w = $('#bank'); if (!w) return;
    w.innerHTML = `<h2>📚 Bank soal</h2><div class="baris"><label>Tingkat <select id="lv"><option value="1">Mudah</option><option value="2">Sedang</option><option value="3">Sulit</option></select></label><label>Jenis <select id="tp"><option value="">Acak</option>${C.TIPE.map((t) => `<option value="${t[0]}">${t[1]}</option>`).join('')}</select></label><button id="mu">Soal baru</button></div><div id="area"></div><p id="sk"></p>`;
    const baru = () => { const q = C.generate($('#tp').value, +$('#lv').value); kotakSoal($('#area'), q, { petunjuk: true, selesai: (ok) => { if (ok !== null) { A.jawab(ok); $('#sk').textContent = `Soal benar: ${A.s.benar} (butuh 10 untuk membuka Evaluasi)`; $('#area').insertAdjacentHTML('beforeend', '<div class="baris"><button id="lg">Soal berikutnya ➡️</button></div>'); $('#lg').onclick = baru; } else baru(); } }); };
    $('#mu').onclick = baru; baru();
    $('#sk').textContent = `Soal benar: ${A.s.benar} (butuh 10 untuk membuka Evaluasi)`;
  }
  function evaluasi() {
    const w = $('#evl'); if (!w) return;
    const tk = [1, 1, 1, 1, 2, 2, 2, 2, 3, 3], hasil = []; let i = 0;
    const soal = () => { if (i >= 10) return akhir(); const q = C.generate(null, tk[i]);
      w.innerHTML = `<h2>Soal ${i + 1} dari 10</h2><div class="prog"><i style="width:${i * 10}%"></i></div><div id="ea"></div>`;
      kotakSoal($('#ea'), q, { petunjuk: false, selesai: (ok) => { hasil.push({ q, ok }); i++; $('#ea').insertAdjacentHTML('beforeend', `<div class="baris"><button id="en">${i >= 10 ? 'Lihat hasil 🏆' : 'Lanjut ➡️'}</button></div>`); $('#en').onclick = soal; } }); };
    const akhir = () => { const skor = hasil.filter((h) => h.ok).length, b = skor >= 9 ? 3 : skor >= 7 ? 2 : 1, lencana = ['🥉 Lencana Perunggu', '🥈 Lencana Perak', '🥇 Lencana Emas'][b - 1];
      if (!A.s.evaluasi || A.s.evaluasi.skor < skor) { A.s.evaluasi = { skor, bintang: b }; A.s.poin += skor * 5; A.simpan(); } A.konfeti(); A.bunyi(true);
      const s = A.s, p = (t, m) => Math.round(Math.min(t, m) / m * 100);
      w.innerHTML = `<div class="tengah"><div class="skor">${'⭐'.repeat(b)}${'☆'.repeat(3 - b)}</div><h2>Skormu: ${skor} / 10</h2><p><b>${lencana}</b></p></div>
        <div class="langkah"><b>Ringkasan:</b><code>Tahap Enaktif: ${p(s.enaktif.length, 5)}%</code><code>Tahap Ikonik: ${p(s.ikonik.length, 5)}%</code><code>Tahap Simbolik: ${s.benar} soal benar</code><code>Total poin: ${s.poin}</code></div>
        ${hasil.filter((h) => !h.ok).map((h) => `<div class="kartu"><b>${h.q.teks}</b>${langkahHTML(h.q)}</div>`).join('') || '<p class="umpan ok">Semua benar! Luar biasa! 🎉</p>'}<div class="baris"><button onclick="location.reload()">Ulangi evaluasi 🔁</button><a class="tombol" href="index.html">Beranda</a></div>`; };
    soal();
  }
  document.addEventListener('siap', () => { kalkulator(); latihan(); evaluasi(); });
})();
