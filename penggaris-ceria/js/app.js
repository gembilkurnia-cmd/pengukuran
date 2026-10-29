/* app.js - navigasi, progres, localStorage, suara, konfeti, alat SVG bersama */
(() => {
  'use strict';
  const KUNCI = 'penggarisCeria.v1';
  const awal = () => ({ poin: 0, enaktif: [], ikonik: [], benar: 0, total: 0, evaluasi: null, guru: false, suara: true, besar: false });
  let s;
  try { s = Object.assign(awal(), JSON.parse(localStorage.getItem(KUNCI) || '{}')); } catch (e) { s = awal(); }
  const simpan = () => { try { localStorage.setItem(KUNCI, JSON.stringify(s)); } catch (e) { /* abaikan */ } };
  const persen = (t) => (t === 'enaktif' ? s.enaktif.length / 5 : t === 'ikonik' ? s.ikonik.length / 5 : Math.min(s.benar, 10) / 10);
  const buka = (t) => s.guru || t === 'enaktif' || (t === 'ikonik' && persen('enaktif') >= 1) || (t === 'simbolik' && persen('ikonik') >= 1) || (t === 'evaluasi' && persen('simbolik') >= 1);
  const TAHAP = [['enaktif', '🖐️ Enaktif', 'Belajar dengan melakukan', 'enaktif.html'], ['ikonik', '🖼️ Ikonik', 'Belajar dengan gambar', 'ikonik.html'],
    ['simbolik', '🔢 Simbolik', 'Belajar dengan angka', 'simbolik.html'], ['evaluasi', '🏆 Evaluasi', 'Tes akhir', 'evaluasi.html']];

  let ac;
  function bunyi(ok) { // suara pendek lewat Web Audio API
    if (!s.suara) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      (ok ? [523, 659, 784] : [300]).forEach((f, i) => {
        const o = ac.createOscillator(), v = ac.createGain(), t = ac.currentTime + i * 0.12;
        o.frequency.value = f; o.type = 'triangle'; v.gain.setValueAtTime(0.15, t); v.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        o.connect(v); v.connect(ac.destination); o.start(t); o.stop(t + 0.2);
      });
    } catch (e) { /* suara tidak tersedia */ }
  }
  function konfeti() {
    for (let i = 0; i < 30; i++) {
      const e = document.createElement('span');
      e.className = 'konfeti'; e.textContent = ['⭐', '🎉', '✨', '🌟'][i % 4];
      e.style.left = Math.random() * 100 + 'vw'; e.style.animationDelay = Math.random() * 0.5 + 's';
      document.body.appendChild(e); setTimeout(() => e.remove(), 2600);
    }
  }
  function tandai(t, k) { if (!s[t].includes(k)) { s[t].push(k); s.poin += 10; simpan(); konfeti(); bunyi(true); } segarkan(); }
  function jawab(ok) { s.total++; if (ok) { s.benar++; s.poin += 5; } simpan(); segarkan(); }
  function segarkan() {
    const p = document.getElementById('poin'); if (p) p.textContent = '⭐ ' + s.poin;
    document.querySelectorAll('[data-prog]').forEach((b) => { const v = Math.round(persen(b.dataset.prog) * 100); b.firstElementChild.style.width = v + '%'; b.setAttribute('aria-valuenow', v); b.nextElementSibling && (b.nextElementSibling.textContent = v + '%'); });
  }
  const bar = (t) => `<div class="prog" role="progressbar" aria-label="Progres ${t}" aria-valuemin="0" aria-valuemax="100" data-prog="${t}"><i></i></div><small></small>`;

  function pasangKepala() {
    const h = document.getElementById('atas'); if (!h) return;
    h.className = 'atas';
    h.innerHTML = `<a class="logo" href="index.html">📏 Penggaris Ceria</a><nav aria-label="Menu utama">${TAHAP.map((t) => `<a href="${t[3]}">${t[1]}</a>`).join('')}<a href="guru.html">👩‍🏫 Guru</a></nav>
      <div class="alat-bar"><span id="poin" class="poin" aria-live="polite"></span>
      <button id="bSuara" aria-pressed="${s.suara}" title="Suara">${s.suara ? '🔊' : '🔇'}</button><button id="bBesar" aria-pressed="${s.besar}" title="Perbesar teks">🔠</button>
      <button id="bGuru" aria-pressed="${s.guru}" title="Mode guru: buka semua tahap">${s.guru ? '🔓' : '🔒'} Mode guru</button></div>`;
    const t = (id, k, fn) => document.getElementById(id).addEventListener('click', () => { s[k] = !s[k]; simpan(); fn && fn(); location.reload(); });
    t('bSuara', 'suara'); t('bBesar', 'besar'); t('bGuru', 'guru');
  }
  function gerbang() { // kunci tahap
    const t = document.body.dataset.tahap;
    if (t && !buka(t)) {
      const prev = { ikonik: 'Enaktif', simbolik: 'Ikonik', evaluasi: 'Simbolik' }[t];
      document.getElementById('isi').innerHTML = `<section class="kartu tengah"><h1>🔒 Tahap ini masih terkunci</h1><p>Selesaikan tahap ${prev} dulu ya!</p><a class="tombol" href="index.html">Kembali ke Beranda</a></section>`;
      return false;
    }
    return true;
  }
  function beranda() {
    const k = document.getElementById('kartu'); if (!k) return;
    k.innerHTML = TAHAP.map((t) => `<a class="kartu tahap c-${t[0]} ${buka(t[0]) ? '' : 'terkunci'}" href="${buka(t[0]) ? t[3] : '#'}" aria-disabled="${!buka(t[0])}">
      <span class="ikon">${t[1].split(' ')[0]}</span><h2>${t[1].split(' ')[1]}</h2><p>${t[2]}</p>${t[0] === 'evaluasi' ? (s.evaluasi ? `<p>Skor terbaik: ${s.evaluasi.skor}/10 ${'⭐'.repeat(s.evaluasi.bintang)}</p>` : '') : bar(t[0])}${buka(t[0]) ? '' : '<p>🔒 Terkunci</p>'}</a>`).join('');
  }
  // alat SVG: penggaris akurat (1 mm = pxCm/10 piksel)
  const svgPenggaris = (cmMax, pxCm) => {
    let t = '';
    for (let i = 0; i <= cmMax * 10; i++) {
      const x = 10 + (i * pxCm) / 10, h = i % 10 === 0 ? 30 : i % 5 === 0 ? 22 : 14;
      t += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="#333" stroke-width="${i % 10 === 0 ? 1.6 : 1}"/>`;
      if (i % 10 === 0) t += `<text x="${x}" y="48" font-size="14" text-anchor="middle" font-weight="700">${i / 10}</text>`;
    }
    return `<svg width="${cmMax * pxCm + 20}" height="66" role="img" aria-label="Penggaris dalam cm dan mm"><rect width="${cmMax * pxCm + 20}" height="64" rx="6" fill="#ffd93d" stroke="#e0a800"/>${t}<text x="${cmMax * pxCm + 8}" y="60" font-size="11" text-anchor="end">cm</text></svg>`;
  };
  const svgMeteran = (cmMax, pxCm, tanda) => { // meteran pita, 1 cm = pxCm piksel
    let t = '';
    for (let i = 0; i <= cmMax; i++) {
      const x = 10 + i * pxCm, h = i % 100 === 0 ? 34 : i % 10 === 0 ? 24 : i % 5 === 0 ? 16 : 9;
      t += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="#222"/>`;
      if (i % 10 === 0) t += `<text x="${x}" y="${i % 100 === 0 ? 52 : 44}" font-size="${i % 100 === 0 ? 14 : 10}" text-anchor="middle" font-weight="${i % 100 === 0 ? 800 : 400}" fill="${i % 100 === 0 ? '#c1121f' : '#222'}">${i % 100 === 0 ? i / 100 + ' m' : i}</text>`;
    }
    const w = cmMax * pxCm + 20, tn = tanda == null ? '' : `<line x1="${10 + tanda * pxCm}" y1="-4" x2="${10 + tanda * pxCm}" y2="70" stroke="#e63946" stroke-width="3"/><polygon points="${5 + tanda * pxCm},70 ${15 + tanda * pxCm},70 ${10 + tanda * pxCm},60" fill="#e63946"/>`;
    return `<svg width="${w}" height="72" role="img" aria-label="Meteran pita"><rect width="${w}" height="62" rx="6" fill="#ffb703" stroke="#c98a00"/>${t}${tn}</svg>`;
  };
  window.App = { get s() { return s; }, simpan, tandai, jawab, bunyi, konfeti, segarkan, svgPenggaris, svgMeteran, bar,
    rand: (a, b) => Math.floor(Math.random() * (b - a + 1)) + a, acak: (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((x) => x[1]),
    seret(el, fn) { // seret dengan pointer events (mouse + sentuhan)
      el.style.touchAction = 'none';
      el.addEventListener('pointerdown', (e) => { el.setPointerCapture(e.pointerId); fn(e.clientX, 'mulai'); const m = (ev) => fn(ev.clientX, 'gerak'); const u = () => { el.removeEventListener('pointermove', m); el.removeEventListener('pointerup', u); fn(0, 'lepas'); }; el.addEventListener('pointermove', m); el.addEventListener('pointerup', u); });
    } };
  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.toggle('besar', s.besar);
    pasangKepala();
    if (gerbang()) { beranda(); document.dispatchEvent(new Event('siap')); }
    const r = document.getElementById('reset');
    if (r) r.addEventListener('click', () => { if (confirm('Hapus semua progres siswa?')) { s = awal(); simpan(); location.reload(); } });
    segarkan();
  });
})();
