/* ikonik.js - visual penggaris/meteran, tangga satuan, slider, bar, peta, jodohkan, urutkan */
(() => {
  'use strict';
  const A = window.App, C = window.Calc, $ = (s) => document.querySelector(s), R = A.rand;
  const umpan = (el, t, c) => { el.className = 'umpan ' + c; el.textContent = t; };

  function baca() { // baca penggaris
    const w = $('#i1'); let mm;
    const baru = () => { mm = R(15, 130); w.innerHTML = `<h2>1. Baca penggaris 📏</h2><div class="gulir" style="position:relative"><div class="benda" style="width:${mm * 4.8}px;margin:0 0 6px 10px;background:var(--hijau)">✏️ benda</div>${A.svgPenggaris(15, 48)}</div>
      <div class="baris">Panjang benda: <input id="a1" type="number" min="0" aria-label="cm"> cm <input id="a2" type="number" min="0" max="9" aria-label="mm"> mm <button id="b1">Periksa</button> <button id="n1" class="sek">Soal baru</button></div><div id="u1" class="umpan info">Mulai dari angka 0!</div>`;
      $('#n1').onclick = baru; $('#b1').onclick = () => { const c = parseInt($('#a1').value, 10), m = parseInt($('#a2').value || '0', 10); if (isNaN(c)) return umpan($('#u1'), 'Isi angka cm dulu ya 😊', 'salah');
        if (c === Math.floor(mm / 10) && m === mm % 10) { umpan($('#u1'), `Benar! ${Math.floor(mm / 10)} cm ${mm % 10} mm = ${mm} mm. 🎉`, 'ok'); A.bunyi(true); A.tandai('ikonik', 'penggaris'); } else { umpan($('#u1'), 'Belum tepat. Lihat garis cm terakhir, lalu hitung garis mm-nya.', 'salah'); A.bunyi(false); } }; };
    baru();
  }
  function meteran() {
    const w = $('#i2'); let cm;
    const baru = () => { cm = R(10, 49) * 5; w.innerHTML = `<h2>2. Baca meteran 🧵</h2><div class="gulir">${A.svgMeteran(250, 4, cm)}</div><div class="baris">Penunjuk di: <input id="p1" type="number" min="0" aria-label="m"> m <input id="p2" type="number" min="0" max="99" aria-label="cm"> cm <button id="bb">Periksa</button> <button id="nb" class="sek">Soal baru</button></div><div id="u2" class="umpan info">Garis merah besar = 1 m, 2 m.</div>`;
      $('#nb').onclick = baru; $('#bb').onclick = () => { const m = parseInt($('#p1').value, 10), c = parseInt($('#p2').value || '0', 10); if (isNaN(m)) return umpan($('#u2'), 'Isi angka m dulu ya 😊', 'salah');
        if (m * 100 + c === cm) { umpan($('#u2'), `Benar! ${m} m ${c} cm = ${cm} cm.`, 'ok'); A.bunyi(true); A.tandai('ikonik', 'meteran'); } else { umpan($('#u2'), 'Coba lagi: lihat dulu angka meter terakhir yang terlewati.', 'salah'); A.bunyi(false); } }; };
    baru();
  }
  function tangga() {
    const w = $('#i3'), W = ['#e63946', '#f77f00', '#fcbf49', '#52b788', '#4cc9f0', '#9d4edd', '#ff70a6'];
    w.innerHTML = `<h2>3. Tangga satuan panjang 🪜</h2><div class="dua"><div class="tangga">${C.URUT.map((u, i) => `<div class="anak" id="s${i}" style="background:${W[i]};margin-left:${i * 14}px">${u} ${i < 6 ? '<small>↓ x 10 &nbsp; ↑ : 10</small>' : ''}</div>`).join('')}</div>
      <div><div class="baris"><input id="tv" type="number" value="3" min="0" aria-label="Nilai"><select id="td" aria-label="Dari">${C.URUT.map((u) => `<option ${u === 'm' ? 'selected' : ''}>${u}</option>`).join('')}</select> ke <select id="tk" aria-label="Ke">${C.URUT.map((u) => `<option ${u === 'cm' ? 'selected' : ''}>${u}</option>`).join('')}</select></div><button id="tp">Peragakan 🧗</button><div id="ut" class="umpan info"></div></div></div>`;
    $('#tp').onclick = async () => { const v = C.parse($('#tv').value), d = $('#td').value, k = $('#tk').value; if (isNaN(v)) return umpan($('#ut'), 'Isi angka dulu ya 😊', 'salah');
      const i = C.URUT.indexOf(d), j = C.URUT.indexOf(k), st = j >= i ? 1 : -1; document.querySelectorAll('.anak').forEach((e) => e.classList.remove('aktif'));
      for (let x = i; x !== j + st; x += st) { $('#s' + x).classList.add('aktif'); await new Promise((r) => setTimeout(r, 450)); if (x !== j) $('#s' + x).classList.remove('aktif'); }
      $('#ut').innerHTML = C.langkahKonversi(v, d, k).join('<br>'); A.bunyi(true); A.tandai('ikonik', 'tangga'); };
  }
  function slider() {
    $('#i4').innerHTML = `<h2>4. Garis bilangan: 1 m = 100 cm = 1000 mm 🎚️</h2><input type="range" id="sl" min="0" max="1000" step="10" value="500" style="width:100%" aria-label="Geser panjang"><div class="gulir"><div class="benda" id="sb" style="background:var(--oranye);transition:width .1s">🪢 tali</div></div><div id="ul" class="umpan info"></div>`;
    const f = () => { const mm = +$('#sl').value; $('#sb').style.width = Math.max(30, mm * 0.8) + 'px'; $('#ul').innerHTML = `<b>${mm} mm</b> = <b>${C.fmt(mm / 10)} cm</b> = <b>${C.fmt(mm / 1000)} m</b>`; };
    $('#sl').oninput = f; f();
  }
  function bars() {
    const D = [['✏️ Pensil', 15], ['📏 Penggaris', 30], ['🏑 Tongkat', 90], ['🪢 Tali', 150]];
    $('#i5').innerHTML = `<h2>5. Diagram batang panjang benda 📊</h2>${D.map((d) => `<div class="bar"><span style="width:7.5rem">${d[0]}</span><i style="width:${d[1] * 2}px" aria-hidden="true"></i><b>${d[1]} cm</b></div>`).join('')}<p>Paling pendek: pensil. Paling panjang: tali. Selisih tali dan tongkat: 60 cm.</p>`;
  }
  function peta() {
    $('#i6').innerHTML = `<h2>6. Peta soal cerita 🗺️</h2><div class="gulir"><svg viewBox="0 0 600 130" width="600" role="img" aria-label="Peta rumah, sekolah, pasar"><path d="M50 80 H300 H550" stroke="#868e96" stroke-width="10" fill="none"/><text x="50" y="60" font-size="34" text-anchor="middle">🏠</text><text x="300" y="60" font-size="34" text-anchor="middle">🏫</text><text x="550" y="60" font-size="34" text-anchor="middle">🛒</text>
      <text x="175" y="110" text-anchor="middle" font-weight="700">450 m</text><text x="425" y="110" text-anchor="middle" font-weight="700">1 km 200 m</text></svg></div>
      <div class="baris">Jarak rumah ke pasar = <input id="pj" type="text" inputmode="numeric" aria-label="Jawaban"> m <button id="pc">Periksa</button></div><div id="up" class="umpan info">Ubah 1 km 200 m menjadi m dulu.</div>`;
    $('#pc').onclick = () => { const v = C.parse($('#pj').value); if (isNaN(v)) return umpan($('#up'), 'Tulis angka saja ya 😊', 'salah'); v === 1650 ? umpan($('#up'), '1 km 200 m = 1200 m. 450 + 1200 = 1650 m. Benar!', 'ok') : umpan($('#up'), 'Coba lagi: 1 km 200 m = 1200 m, lalu jumlahkan dengan 450 m.', 'salah'); if (v === 1650) { A.bunyi(true); A.tandai('ikonik', 'peta'); } };
  }
  function jodoh() {
    const P = [['✏️ Pensil', '15 cm'], ['🛣️ Jalan raya', '2 km'], ['🚪 Pintu', '2 m'], ['🍚 Butir beras', '7 mm']]; let kiri = null, sisa = 4;
    const kn = A.acak(P.map((p) => p[1]));
    $('#i7').innerHTML = `<h2>7. Jodohkan gambar dengan panjangnya 🔗</h2><div class="dua"><div>${P.map((p, i) => `<button class="pil" data-k="${i}">${p[0]}</button>`).join('')}</div><div>${kn.map((p) => `<button class="pil" data-v="${p}">${p}</button>`).join('')}</div></div><div id="uj" class="umpan info">Pilih gambar, lalu pilih panjangnya.</div>`;
    document.querySelectorAll('#i7 .pil').forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.k !== undefined) { document.querySelectorAll('#i7 [data-k]').forEach((x) => x.classList.remove('pilih')); b.classList.add('pilih'); kiri = b; return; }
      if (!kiri) return umpan($('#uj'), 'Pilih gambarnya dulu ya.', 'salah');
      if (P[kiri.dataset.k][1] === b.dataset.v) { kiri.classList.add('cocok'); b.classList.add('cocok'); kiri = null; sisa--; A.bunyi(true); umpan($('#uj'), 'Cocok! 🎉', 'ok'); if (!sisa) A.tandai('ikonik', 'jodoh'); } else { A.bunyi(false); umpan($('#uj'), 'Belum cocok, coba lagi ya.', 'salah'); }
    }));
  }
  function urut() {
    const P = [['🐜 Semut', 2, '2 mm'], ['✏️ Pensil', 15, '15 cm'], ['🚪 Pintu', 200, '2 m'], ['🛣️ Jalan', 2000000, '2 km']]; let pil = [];
    $('#i8').innerHTML = `<h2>8. Urutkan dari paling pendek 🔢</h2><p>Tekan benda dalam urutan dari yang paling pendek.</p><div class="baris" id="ub">${A.acak(P).map((p) => `<button class="pil" data-n="${p[1]}">${p[0]}<br>${p[2]}</button>`).join('')}</div><div class="baris"><button id="ur" class="sek">Ulangi</button></div><div id="uu" class="umpan info"></div>`;
    $('#ur').onclick = urut;
    document.querySelectorAll('#ub .pil').forEach((b) => b.addEventListener('click', () => { if (b.classList.contains('pilih')) return; b.classList.add('pilih'); pil.push(+b.dataset.n);
      if (pil.length === 4) { const ok = pil.every((x, i) => i === 0 || pil[i - 1] <= x); ok ? (umpan($('#uu'), 'Urutan benar! Dari mm sampai km. 🎉', 'ok'), A.tandai('ikonik', 'urut')) : umpan($('#uu'), 'Urutannya belum tepat. Samakan dulu ke satuan yang sama, lalu coba lagi.', 'salah'); pil = []; } }));
  }
  document.addEventListener('siap', () => { baca(); meteran(); tangga(); slider(); bars(); peta(); jodoh(); urut(); });
})();
