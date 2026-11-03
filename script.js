const $ = id => document.getElementById(id);
const cv = $('cv'), g = cv.getContext('2d'), W = 540, H = 960;
const THEMES = [
    { n: 'Sunset', a: '#1b1028', b: '#6b1f55', c: '#ff5c8a', d: '#ffc24b' },
    { n: 'Ocean', a: '#04141f', b: '#0b4a5c', c: '#3de0c5', d: '#a8f0ff' },
    { n: 'Midnight', a: '#0a0a1a', b: '#2a1a6b', c: '#9b8cff', d: '#ff9be0' },
    { n: 'Mango', a: '#2a1400', b: '#8a3b00', c: '#ffb02e', d: '#fff1cc' },
    { n: 'Black', a: '#000000', b: '#000000', c: '#ffffff', d: '#a8a8a8' },
    { n: 'Neon', a: '#05010f', b: '#1a0840', c: '#00f0ff', d: '#ff2fd0' },
    { n: 'Forest', a: '#04140c', b: '#0d4a2c', c: '#7dffb0', d: '#e6ffd0' },
    { n: 'Rose', a: '#2a0a14', b: '#7a1f3f', c: '#ffb3c7', d: '#fff0f4' },
    { n: 'Gold', a: '#120d02', b: '#3a2a05', c: '#ffd34d', d: '#fff3c4' },
    { n: 'Ice', a: '#061426', b: '#1b4f8a', c: '#8fd3ff', d: '#ffffff' },
    { n: 'Candy', a: '#2b0f3f', b: '#e0388a', c: '#ffe14d', d: '#7ff5ff' },
    { n: 'Crimson', a: '#120003', b: '#6b0a1a', c: '#ff3b4e', d: '#ffd1d6' }];
let theme = THEMES[0], style = 'bars', buf = null, actx = null, bgImg = null, cur = null, raf = 0;

THEMES.forEach((t, i) => {
    const b = document.createElement('button'); b.className = 'chip sw'; b.title = t.n; b.setAttribute('aria-label', t.n);
    b.style.background = `linear-gradient(135deg,${t.b},${t.c})`; b.setAttribute('aria-pressed', i == 0);
    b.onclick = () => { theme = t;[...$('themes').children].forEach(x => x.setAttribute('aria-pressed', x === b)); idle() }; $('themes').appendChild(b)
});
$('styles').onclick = e => {
    const b = e.target.closest('button'); if (!b) return; style = b.dataset.v;
    [...$('styles').children].forEach(x => x.setAttribute('aria-pressed', x === b)); idle()
};
['title', 'name'].forEach(i => $(i).oninput = idle);
const FONTS = [{ n: 'Classic', f: 'Bricolage Grotesque', w: 800, s: 1 }, { n: 'Script', f: 'Pacifico', w: 400, s: .9 }, { n: 'Bold caps', f: 'Bebas Neue', w: 400, s: 1.3 }, { n: 'Elegant', f: 'Playfair Display', w: 800, s: 1 }, { n: 'Handwritten', f: 'Caveat', w: 700, s: 1.25 }, { n: 'Modern', f: 'Poppins', w: 800, s: .9 }, { n: 'Retro', f: 'Lobster', w: 400, s: 1.05 }, { n: 'Impact', f: 'Anton', w: 400, s: 1.15 }, { n: 'Groovy', f: 'Righteous', w: 400, s: 1 }, { n: 'Cursive', f: 'Dancing Script', w: 700, s: 1.2 }, { n: 'Marker', f: 'Permanent Marker', w: 400, s: .85 }, { n: 'Techno', f: 'Orbitron', w: 800, s: .75 }, { n: 'Poster', f: 'Abril Fatface', w: 400, s: .95 }];
let FNT = FONTS[0];
FONTS.forEach((t, i) => {
    const b = document.createElement('button'); b.className = 'chip'; b.textContent = t.n; b.style.fontFamily = `"${t.f}",sans-serif`; b.setAttribute('aria-pressed', i == 0);
    document.fonts.load(`${t.w} 30px "${t.f}"`);
    b.onclick = () => { FNT = t;[...$('fonts').children].forEach(x => x.setAttribute('aria-pressed', x === b)); document.fonts.load(`${t.w} 30px "${t.f}"`).then(idle) }; $('fonts').appendChild(b)
});

$('file').onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    $('fmsg').textContent = 'Reading audio…';
    try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        buf = await actx.decodeAudioData(await f.arrayBuffer());
        const d = Math.floor(buf.duration); $('len').value = Math.min(30, d); $('len').max = Math.min(90, d); $('start').max = Math.max(0, d - 1);
        $('fmsg').textContent = `Loaded ${f.name} (${d}s). Pick the part you want.`;
        $('prev').disabled = $('make').disabled = false;
        if (!$('title').value) $('title').value = f.name.replace(/\.[^.]+$/, ''); idle();
    } catch (err) { $('fmsg').textContent = 'Could not read that file. Try an MP3 or WAV.' }
};
$('bg').onchange = e => {
    const f = e.target.files[0]; if (!f) return; const r = new FileReader();
    r.onload = () => { const im = new Image(); im.onload = () => { bgImg = im; idle() }; im.src = r.result }; r.readAsDataURL(f)
};

function drawBg() {
    const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, theme.a); gr.addColorStop(1, theme.b); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (bgImg) {
        const s = Math.max(W / bgImg.width, H / bgImg.height), w = bgImg.width * s, h = bgImg.height * s; g.drawImage(bgImg, (W - w) / 2, (H - h) / 2, w, h);
        g.fillStyle = 'rgba(10,5,20,.55)'; g.fillRect(0, 0, W, H)
    }
}
function drawText(p) {
    if (style === 'insta') return;
    g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = `${FNT.w} ${Math.round(44 * FNT.s)}px "${FNT.f}",sans-serif`;
    wrap($('title').value || 'Your song', W / 2, style === 'circle' ? H - 210 : 130, W - 80, 52);
    g.font = `${FNT.w === 800 ? 600 : FNT.w} 24px "${FNT.f}",sans-serif`; g.fillStyle = theme.d; g.fillText($('name').value || '', W / 2, H - 90);
    g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(60, H - 55, W - 120, 5); g.fillStyle = theme.c; g.fillRect(60, H - 55, (W - 120) * p, 5)
}
function wrap(t, x, y, mw, lh) {
    const ws = t.split(' '); let l = '', yy = y; for (const w of ws) {
        const n = l ? l + ' ' + w : w;
        if (g.measureText(n).width > mw && l) { g.fillText(l, x, yy); l = w; yy += lh } else l = n
    } g.fillText(l, x, yy)
}
function frame(freq, time, p) {
    drawBg(); const N = 40; const bins = []; for (let i = 0; i < N; i++) { bins.push((freq ? freq[2 + i * 2] : 12 + 10 * Math.sin(i)) / 255) }
    const gr = g.createLinearGradient(0, H / 2 - 200, 0, H / 2 + 200); gr.addColorStop(0, theme.d); gr.addColorStop(1, theme.c); g.fillStyle = gr; g.strokeStyle = gr; g.lineCap = 'round';
    if (style === 'bars') { const bw = (W - 100) / N; for (let i = 0; i < N; i++) { const h = Math.max(8, bins[i] * 340); g.fillRect(50 + i * bw + 2, H / 2 - h / 2, bw - 4, h) } }
    else if (style === 'circle') {
        const cx = W / 2, cy = H / 2 - 20, r = 110; g.lineWidth = 6;
        for (let i = 0; i < N * 2; i++) {
            const a = i / (N * 2) * Math.PI * 2 - Math.PI / 2, v = bins[i < N ? i : N * 2 - 1 - i], l = 8 + v * 120;
            g.beginPath(); g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); g.lineTo(cx + Math.cos(a) * (r + l), cy + Math.sin(a) * (r + l)); g.stroke()
        }
        g.beginPath(); g.arc(cx, cy, r - 14, 0, 7); g.fillStyle = 'rgba(255,255,255,.12)'; g.fill()
    }
    else if (style === 'dots') { const C = 20, sp = (W - 100) / C, dot = (x, y) => { g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill() }; for (let i = 0; i < C; i++) { const v = (bins[i * 2] + bins[i * 2 + 1]) / 2, k = Math.max(1, Math.round(v * 9)), x = 50 + sp * (i + .5); for (let j = 0; j < k; j++) { dot(x, H / 2 - 12 - j * 24); dot(x, H / 2 + 12 + j * 24) } } }
    else if (style === 'rings') { const cx = W / 2, cy = H / 2; g.lineWidth = 5; for (let k = 0; k < 6; k++) { g.globalAlpha = 1 - k * .14; g.beginPath(); g.arc(cx, cy, 50 + k * 42 + bins[k * 5] * 70, 0, 7); g.stroke() } g.globalAlpha = 1; g.beginPath(); g.arc(cx, cy, 34 + bins[1] * 40, 0, 7); g.fill() }
    else if (style === 'hill') { const pts = []; for (let i = 0; i < N; i++)pts.push([40 + i / (N - 1) * (W - 80), bins[i] * 300]); for (const s of [1, -1]) { g.globalAlpha = s > 0 ? 1 : .35; g.beginPath(); g.moveTo(40, H / 2); pts.forEach(q => g.lineTo(q[0], H / 2 - s * q[1])); g.lineTo(W - 40, H / 2); g.closePath(); g.fill() } g.globalAlpha = 1 }
    else if (style === 'vinyl') { const cx = W / 2, cy = H / 2 - 10, r = 170 + bins[2] * 26; g.save(); g.translate(cx, cy); g.rotate(performance.now() / 1800); g.fillStyle = '#0c0c0c'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,255,255,.12)'; for (let q = 60; q < r; q += 14) { g.beginPath(); g.arc(0, 0, q, 0, 7); g.stroke() } g.fillStyle = theme.c; g.beginPath(); g.arc(0, 0, 58, 0, 7); g.fill(); g.fillStyle = theme.a; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillRect(r - 34, -3, 26, 6); g.restore(); g.strokeStyle = theme.d; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, r + 14, 0, 7); g.stroke() }
    else if (style === 'insta') { instaCard(bins, p) }
    else { g.lineWidth = 5; g.beginPath(); const n = time ? time.length : 64; for (let i = 0; i < n; i++) { const x = 40 + i / (n - 1) * (W - 80), y = H / 2 + ((time ? time[i] : 128) - 128) * 2.4; i ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke() }
    drawText(p)
}
function fit(t, mw) { if (g.measureText(t).width <= mw) return t; while (t.length > 1 && g.measureText(t + '…').width > mw) t = t.slice(0, -1); return t + '…' }
function instaCard(bins, p) {
    const x = 36, w = W - 72, h = 290, y = H / 2 - h / 2;
    g.fillStyle = 'rgba(18,10,28,.78)'; g.beginPath(); g.roundRect(x, y, w, h, 32); g.fill();
    const cs = 104, cx = x + 28, cy = y + 28;
    g.save(); g.beginPath(); g.roundRect(cx, cy, cs, cs, 18); g.clip();
    if (bgImg) { const s = Math.max(cs / bgImg.width, cs / bgImg.height); g.drawImage(bgImg, cx + (cs - bgImg.width * s) / 2, cy + (cs - bgImg.height * s) / 2, bgImg.width * s, bgImg.height * s) }
    else { const gr = g.createLinearGradient(cx, cy, cx + cs, cy + cs); gr.addColorStop(0, theme.b); gr.addColorStop(1, theme.c); g.fillStyle = gr; g.fillRect(cx, cy, cs, cs); g.fillStyle = '#fff'; g.font = '56px sans-serif'; g.textAlign = 'center'; g.fillText('♪', cx + cs / 2, cy + cs / 2 + 19) }
    g.restore();
    const tx = cx + cs + 20, mw = x + w - 28 - tx; g.textAlign = 'left';
    g.fillStyle = '#fff'; g.font = `${FNT.w} ${Math.round(30 * FNT.s)}px "${FNT.f}",sans-serif`; g.fillText(fit($('title').value || 'Your song', mw), tx, cy + 46);
    g.fillStyle = theme.d; g.font = `${FNT.w === 800 ? 600 : FNT.w} 22px "${FNT.f}",sans-serif`; g.fillText(fit($('name').value || '', mw), tx, cy + 84);
    const n = 44, bx = x + 28, bw = (w - 56) / n, mid = y + h - 80;
    for (let i = 0; i < n; i++) {
        const v = bins[Math.floor(i / n * bins.length)], bh = 10 + v * 84;
        g.fillStyle = i / n <= p ? theme.c : 'rgba(255,255,255,.35)'; g.beginPath(); g.roundRect(bx + i * bw + 1.5, mid - bh / 2, bw - 3, bh, 3); g.fill()
    }
    g.textAlign = 'center'
}
function idle() { if (!cur) frame(null, null, 0) }

let previewing = false;
function endPreview() { stop(); previewing = false; $('prev').textContent = 'Preview'; $('prev').disabled = $('make').disabled = false; $('msg').textContent = ''; idle() }
function stop() { cancelAnimationFrame(raf); if (cur) { try { cur.src.stop() } catch (e) { } cur = null } }
async function run(record) {
    stop(); await actx.resume();
    const start = Math.max(0, +$('start').value || 0), len = Math.min(90, Math.max(1, +$('len').value || 30), buf.duration - start);
    const src = actx.createBufferSource(); src.buffer = buf; const an = actx.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = .78; src.connect(an);
    const fb = new Uint8Array(an.frequencyBinCount), tb = new Uint8Array(an.fftSize); let rec = null, chunks = [], mime = '';
    if (record) {
        const dest = actx.createMediaStreamDestination(); an.connect(dest);
        const st = cv.captureStream(30); dest.stream.getAudioTracks().forEach(t => st.addTrack(t));
        mime = ['video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'].find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
        rec = new MediaRecorder(st, mime ? { mimeType: mime, videoBitsPerSecond: 5e6 } : {}); rec.ondataavailable = e => e.data.size && chunks.push(e.data);
        rec.onstop = () => {
            const ext = (rec.mimeType || mime).includes('mp4') ? 'mp4' : 'webm'; const url = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || mime }));
            $('vid').src = url; $('dl').href = url; $('dl').download = (($('title').value || 'my-reel').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || 'my-reel') + '.' + ext; $('d-fmt').textContent = ext.toUpperCase(); $('d-len').textContent = Math.round(len) + ' sec'; $('d-size').textContent = (chunks.reduce((a, c) => a + c.size, 0) / 1048576).toFixed(1) + ' MB'; $('d-title').textContent = $('title').value || 'Your reel'; $('done').showModal(); $('vid').play().catch(() => { });
            $('fmt').textContent = ext === 'mp4' ? 'MP4 is ready to post.' : 'Your browser made a WebM file. Open this page in Chrome on a computer for MP4, or convert it free at cloudconvert.com before posting.';
            $('msg').textContent = 'Done! Your reel is ready.'; $('reset').disabled = false; $('make').disabled = $('prev').disabled = false
        };
        rec.start(); if ($('done').open) $('done').close()
    }
    else an.connect(actx.destination);
    if (record) { $('make').disabled = $('prev').disabled = $('reset').disabled = true } else { $('make').disabled = true; previewing = true; $('prev').textContent = 'Stop preview' }
    $('msg').textContent = record ? 'Recording in real time. Keep this tab open.' : 'Playing preview…';
    const t0 = actx.currentTime; cur = { src }; src.start(0, start, len);
    const tick = () => {
        const t = actx.currentTime - t0; an.getByteFrequencyData(fb); an.getByteTimeDomainData(tb); frame(fb, tb, Math.min(1, t / len));
        if (t >= len) { cur = null; frame(fb, tb, 1); if (rec) rec.stop(); else { endPreview() } return }
        raf = requestAnimationFrame(tick)
    }; tick()
}
$('prev').onclick = () => { if (previewing) endPreview(); else run(false) }; $('make').onclick = () => run(true);
document.fonts.ready.then(idle); idle();
$('x').onclick = $('back').onclick = () => $('done').close();
function resetAll() {
    stop(); previewing = false; buf = null; bgImg = null;
    $('file').value = ''; $('bg').value = ''; $('title').value = ''; $('name').value = ''; $('start').value = 0; $('len').value = 30; $('len').max = 90; $('start').removeAttribute('max');
    $('fmsg').textContent = 'MP3, WAV, M4A or similar.'; $('msg').textContent = '';
    $('prev').textContent = 'Preview'; $('prev').disabled = $('make').disabled = true;
    if ($('done').open) $('done').close(); $('vid').removeAttribute('src'); $('vid').load();
    theme = THEMES[0]; style = 'bars'; FNT = FONTS[0];
    [...$('themes').children].forEach((x, i) => x.setAttribute('aria-pressed', i == 0));
    [...$('styles').children].forEach(x => x.setAttribute('aria-pressed', x.dataset.v === 'bars'));
    [...$('fonts').children].forEach((x, i) => x.setAttribute('aria-pressed', i == 0));
    idle()
}
$('reset').onclick = resetAll;
$('done').addEventListener('close', () => $('vid').pause());
$('done').addEventListener('click', e => { if (e.target === $('done')) $('done').close() });