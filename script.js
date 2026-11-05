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
        const ab = await f.arrayBuffer(); buf = await new Promise((res, rej) => { const p = actx.decodeAudioData(ab, res, rej); if (p && p.catch) p.catch(rej) });
        const d = Math.ceil(buf.duration); $('len').value = Math.min(90, d); $('len').max = Math.min(90, d); $('start').value = 0; $('start').max = Math.max(0, d - 1);
        $('fmsg').textContent = `Loaded ${f.name} (${d}s).${d > 90 ? ' It is longer than 90s, so choose the part you want (max 90s).' : ' The full clip is selected. You can trim it below.'}`;
        $('prev').disabled = $('make').disabled = false;
        if (!$('title').value) $('title').value = f.name.replace(/\.[^.]+$/, ''); idle();
    } catch (err) { $('fmsg').textContent = 'Could not read that file. Try an MP3 or WAV.' }
};
$('bg').onchange = e => {
    const f = e.target.files[0]; if (!f) return; const r = new FileReader();
    r.onload = () => { const im = new Image(); im.onload = () => { bgImg = im; clearVideo(); idle() }; im.src = r.result }; r.readAsDataURL(f)
};

function drawBg() {
    const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, theme.a); gr.addColorStop(1, theme.b); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    if (bgVid) { if (bgv.readyState >= 2 && bgv.videoWidth) coverTo(g, bgv, bgv.videoWidth, bgv.videoHeight); else if (vHold) g.drawImage(vsnap, 0, 0); g.fillStyle = `rgba(10,5,20,${(+$('vdim').value || 0) / 100})`; g.fillRect(0, 0, W, H) }
    else if (bgImg) {
        const s = Math.max(W / bgImg.width, H / bgImg.height), w = bgImg.width * s, h = bgImg.height * s; g.drawImage(bgImg, (W - w) / 2, (H - h) / 2, w, h);
        g.fillStyle = 'rgba(10,5,20,.55)'; g.fillRect(0, 0, W, H)
    }
}
function drawText(p) {
    if (style === 'insta') return;
    g.textAlign = 'center'; g.fillStyle = '#fff'; g.font = `${FNT.w} ${Math.round(44 * FNT.s)}px "${FNT.f}",sans-serif`;
    const ty = wrap($('title').value || 'Your song', W / 2, (style === 'circle' && !($('sub').value || (lyrMode !== 'off' && $('lyr').value.trim()))) ? H - 210 : 130, W - 80, 52); if ($('sub').value) { g.font = `${FNT.w === 800 ? 600 : FNT.w} 26px "${FNT.f}",sans-serif`; g.fillStyle = 'rgba(255,255,255,.8)'; wrap($('sub').value, W / 2, ty + 42, W - 100, 32) }
    g.font = `${FNT.w === 800 ? 600 : FNT.w} 24px "${FNT.f}",sans-serif`; g.fillStyle = theme.d; g.fillText($('name').value || '', W / 2, H - 90);
    g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(60, H - 55, W - 120, 5); g.fillStyle = theme.c; g.fillRect(60, H - 55, (W - 120) * p, 5)
}
function wrap(t, x, y, mw, lh) {
    const ws = t.split(' '); let l = '', yy = y; for (const w of ws) {
        const n = l ? l + ' ' + w : w;
        if (g.measureText(n).width > mw && l) { g.fillText(l, x, yy); l = w; yy += lh } else l = n
    } g.fillText(l, x, yy); return yy
}
function frame(freq, time, p) {
    drawBg(); const N = 40; const bins = []; for (let i = 0; i < N; i++) { bins.push((freq ? freq[2 + i * 2] : 12 + 10 * Math.sin(i)) / 255) }
    bgAnim(bins); const gr = g.createLinearGradient(0, H / 2 - 200, 0, H / 2 + 200); gr.addColorStop(0, theme.d); gr.addColorStop(1, theme.c); g.fillStyle = gr; g.strokeStyle = gr; g.lineCap = 'round';
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
    drawText(p); overlays(p)
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
function endPreview() { stop(); previewing = false; $('prev').textContent = 'Preview'; $('prev').disabled = $('make').disabled = false; $('msg').textContent = ''; finishSync(); idle() }
function stop() { cancelAnimationFrame(raf); pauseVideo(); if (cur) { try { cur.src.stop() } catch (e) { } cur = null } }
async function run(record) {
    stop(); await actx.resume();
    const start = Math.max(0, +$('start').value || 0), len = Math.min(90, Math.max(1, +$('len').value || 30), buf.duration - start);
    const src = actx.createBufferSource(); src.buffer = buf; const an = actx.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = .78; lyr = parseLyrics(len); curLen = len; src.connect(an); const out = buildChain(src, len);
    const fb = new Uint8Array(an.frequencyBinCount), tb = new Uint8Array(an.fftSize); let rec = null, chunks = [], mime = '';
    if (record) {
        const dest = actx.createMediaStreamDestination(); out.connect(dest);
        const st = cv.captureStream(30); dest.stream.getAudioTracks().forEach(t => st.addTrack(t));
        mime = ['video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'].find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || '';
        rec = new MediaRecorder(st, mime ? { mimeType: mime, videoBitsPerSecond: 5e6 } : {}); rec.ondataavailable = e => e.data.size && chunks.push(e.data);
        rec.onstop = () => {
            const ext = (rec.mimeType || mime).includes('mp4') ? 'mp4' : 'webm'; const url = URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || mime }));
            $('vid').src = url; $('dl').href = url; $('dl').download = (($('title').value || 'my-reel').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') || 'my-reel') + '.' + ext; $('d-fmt').textContent = ext.toUpperCase(); $('d-len').textContent = Math.round(len) + ' sec'; $('d-size').textContent = (chunks.reduce((a, c) => a + c.size, 0) / 1048576).toFixed(1) + ' MB'; $('d-title').textContent = $('title').value || 'Your reel'; $('done').showModal(); $('vid').play().catch(() => { });
            $('fmt').textContent = ext === 'mp4' ? 'MP4 is ready to post.' : 'Your browser made a WebM file. Open this page in Chrome on a computer for MP4, or convert it free at cloudconvert.com before posting.';
            $('msg').textContent = 'Done! Your reel is ready.'; $('reset').disabled = false; $('sync').disabled = false; $('rec').disabled = false; $('make').disabled = $('prev').disabled = false
        };
        rec.start(); if ($('done').open) $('done').close()
    }
    else out.connect(actx.destination);
    if (record) { $('rec').disabled = $('sync').disabled = $('make').disabled = $('prev').disabled = $('reset').disabled = true } else { $('make').disabled = true; previewing = true; $('prev').textContent = 'Stop preview' }
    $('msg').textContent = record ? 'Recording in real time. Keep this tab open.' : 'Playing preview…';
    const t0 = actx.currentTime; runT0 = t0; cur = { src }; src.start(0, start, len); startVideo();
    const tick = () => {
        const t = actx.currentTime - t0; syncVideo(t); an.getByteFrequencyData(fb); an.getByteTimeDomainData(tb); frame(fb, tb, Math.min(1, t / len));
        if (t >= len) { cur = null; frame(fb, tb, 1); pauseVideo(); if (rec) rec.stop(); else { endPreview() } return }
        raf = requestAnimationFrame(tick)
    }; tick()
}
$('prev').onclick = () => { if (previewing) endPreview(); else run(false) }; $('make').onclick = () => run(true);
let lyrLook = 'classic', lyrAnim = 'fade', lyrPos = 'bottom', bgVid = false, vUrl = null, vHold = false, lyrMode = 'karaoke', bgMode = 'none', lyr = [], curLen = 30, syncing = false, syncIdx = 0, syncLines = [], syncStamps = [], runT0 = 0;
const bgv = $('bgv'), vsnap = document.createElement('canvas'); vsnap.width = W; vsnap.height = H;
const R = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x) };
const fnt = s => `${FNT.w} ${s}px "${FNT.f}",sans-serif`;
function clipLen() { const s = Math.max(0, +$('start').value || 0); return Math.min(90, Math.max(1, +$('len').value || 30), buf ? buf.duration - s : 90) }
function parseLyrics(len) {
    const rows = $('lyr').value.split('\n').map(s => s.trim()).filter(Boolean), out = []; let any = false;
    rows.forEach(r => { const m = r.match(/^\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/); if (m) { any = true; out.push({ t: +m[1] * 60 + +m[2], text: m[3] }) } else out.push({ t: null, text: r }) });
    if (!any) { const st = len / Math.max(1, out.length); out.forEach((o, i) => o.t = i * st) } else { let i = 0; while (i < out.length) { if (out[i].t !== null) { i++; continue } let j = i; while (j < out.length && out[j].t === null) j++; const a = i ? out[i - 1].t : 0, b = j < out.length ? out[j].t : len, c = j - i; for (let k = 0; k < c; k++)out[i + k].t = a + (b - a) * (k + 1) / (c + 1); i = j } }
    return out.sort((a, b) => a.t - b.t)
}
function bgAnim(bins) {
    if (bgMode === 'none') return;
    const t = performance.now() / 1000, bass = (bins[1] + bins[2] + bins[3]) / 3;
    g.save();
    if (bgMode === 'particles') { g.fillStyle = theme.d; for (let i = 0; i < 48; i++) { const sp = 14 + R(i, 2) * 34, x = R(i, 1) * W + Math.sin(t * .6 + i) * 18, y = H - ((t * sp + R(i, 3) * H) % (H + 20)); g.globalAlpha = .18 + R(i, 5) * .4; g.beginPath(); g.arc(x, y, 1.5 + R(i, 4) * 3.2, 0, 7); g.fill() } }
    else if (bgMode === 'notes') { g.fillStyle = theme.c; g.textAlign = 'center'; for (let i = 0; i < 14; i++) { const sp = 22 + R(i, 2) * 30, sz = 22 + R(i, 4) * 30, x = R(i, 1) * W + Math.sin(t * .8 + i) * 24, y = H + 40 - ((t * sp + R(i, 3) * H) % (H + 80)); g.globalAlpha = .16 + R(i, 5) * .25; g.font = `${sz}px sans-serif`; g.fillText(i % 2 ? '♪' : '♫', x, y) } }
    else if (bgMode === 'bokeh') { for (let i = 0; i < 12; i++) { const r = (40 + R(i, 2) * 80) * (1 + bass * .35), x = R(i, 1) * W + Math.sin(t * .3 + i * 2) * 40, y = R(i, 3) * H + Math.cos(t * .25 + i) * 50; g.fillStyle = i % 2 ? theme.c : theme.d; for (let k = 0; k < 4; k++) { g.globalAlpha = .05; g.beginPath(); g.arc(x, y, r * (1 - k * .22), 0, 7); g.fill() } } }
    else if (bgMode === 'aurora') { g.lineCap = 'round'; const cols = [theme.c, theme.d, theme.b]; for (let b = 0; b < 3; b++) { g.strokeStyle = cols[b]; for (const wd of [130, 85, 40]) { g.globalAlpha = .07; g.lineWidth = wd; g.beginPath(); for (let x = -20; x <= W + 20; x += 20) { const y = H * .32 + b * 150 + Math.sin(x * .011 + t * (.35 + b * .2) + b * 2) * 60 + bass * 50; x < 0 ? g.moveTo(x, y) : g.lineTo(x, y) } g.stroke() } } }
    else if (bgMode === 'pulse') { const q = g.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, 560); q.addColorStop(0, theme.c); q.addColorStop(1, theme.a); g.globalAlpha = .1 + bass * .45; g.fillStyle = q; g.fillRect(0, 0, W, H) }
    g.restore()
}
function lum(h) { const n = parseInt(h.slice(1), 16); return (.299 * (n >> 16 & 255) + .587 * (n >> 8 & 255) + .114 * (n & 255)) / 255 }
function drawLine(t, y, size, o) {
    o = o || {}; const a = o.a == null ? 1 : o.a, pr = o.prog, full = o.full || t, vis = o.vis == null ? t : o.vis;
    let s = size; g.font = fnt(s); while (g.measureText(full).width > W - 90 && s > 18) { s -= 2; g.font = fnt(s) }
    const w = g.measureText(full).width, x = W / 2 - w / 2, cy = y + (o.dy || 0), pad = 18, look = lyrLook, bx = x - pad, by = cy - s * 1.05, bw = w + pad * 2, bh = s * 1.5, tc = lum(theme.c) > .6 ? '#111' : '#fff';
    g.save(); g.globalAlpha = a;
    if (o.sc && o.sc !== 1) { const oy = cy - s * .3; g.translate(W / 2, oy); g.scale(o.sc, o.sc); g.translate(-W / 2, -oy) }
    g.textAlign = 'left'; g.lineJoin = 'round';
    if (look === 'boxed') { g.fillStyle = 'rgba(0,0,0,.58)'; g.beginPath(); g.roundRect(bx, by, bw, bh, 14); g.fill() }
    if (look === 'highlight') {
        g.fillStyle = theme.c; g.globalAlpha = a * (pr == null ? 1 : .4); g.beginPath(); g.roundRect(bx, by, bw, bh, 14); g.fill(); g.globalAlpha = a;
        if (pr != null) { g.save(); g.beginPath(); g.rect(bx, by, bw * pr, bh); g.clip(); g.fillStyle = theme.c; g.beginPath(); g.roundRect(bx, by, bw, bh, 14); g.fill(); g.restore() }
    }
    const paint = c => {
        if (look === 'neon') { g.shadowColor = theme.c; g.shadowBlur = 22; g.fillStyle = c; g.fillText(vis, x, cy); g.shadowBlur = 8; g.fillText(vis, x, cy); g.shadowBlur = 0 }
        else if (look === 'outline') { g.lineWidth = 3.5; g.strokeStyle = c; g.strokeText(vis, x, cy) }
        else if (look === 'highlight') { g.fillStyle = tc; g.fillText(vis, x, cy) }
        else if (look === 'boxed') { g.fillStyle = c; g.fillText(vis, x, cy) }
        else { g.lineWidth = 7; g.strokeStyle = 'rgba(0,0,0,.55)'; g.strokeText(vis, x, cy); g.fillStyle = c; g.fillText(vis, x, cy) }
    };
    paint(o.kar ? 'rgba(255,255,255,.6)' : '#fff');
    if (o.kar && pr != null && look !== 'highlight') { g.save(); g.beginPath(); g.rect(x - pad, cy - s * 1.3, w * pr + pad, s * 1.8); g.clip(); paint(theme.c); g.restore() }
    g.restore(); return { x, w, s }
}
function lyrY() { return lyrPos === 'top' ? 300 : lyrPos === 'middle' ? H / 2 + 10 : 775 }
function drawLyrics(tm, L, len) {
    if (lyrMode === 'off' || !L.length) return;
    let i = -1; for (let k = 0; k < L.length; k++)if (L[k].t <= tm + .001) i = k;
    if (i < 0) return;
    const ln = L[i], nx = L[i + 1]; if (!ln.text) return;
    const base = Math.min(40, Math.max(26, 34 * FNT.s)), y = lyrY(), age = cur ? tm - ln.t : 10;
    const end = nx ? nx.t : len, dur = Math.max(.8, Math.min(end - ln.t, 5)), T = Math.max(.4, Math.min(dur * .6, 1.6));
    const o = { full: ln.text, kar: lyrMode === 'karaoke' };
    if (o.kar) o.prog = Math.min(1, Math.max(0, (tm - ln.t) / dur));
    const an = lyrAnim, kk = Math.min(1, age / .4);
    if (an === 'fade') o.a = Math.min(1, age / .3);
    else if (an === 'slide') { const q = Math.min(1, age / .35); o.a = Math.min(1, age / .25); o.dy = Math.pow(1 - q, 3) * 45 }
    else if (an === 'pop') { const e = 1 + 2.70158 * Math.pow(kk - 1, 3) + 1.70158 * Math.pow(kk - 1, 2); o.sc = .6 + .4 * e; o.a = Math.min(1, age / .12) }
    else if (an === 'type') o.vis = ln.text.slice(0, Math.ceil(ln.text.length * Math.min(1, age / T)));
    else if (an === 'words') { const ws = ln.text.split(' '); o.vis = ws.slice(0, Math.ceil(ws.length * Math.min(1, age / T))).join(' ') }
    drawLine(ln.text, y, base, o);
    if (o.kar && nx && nx.text) drawLine(nx.text, y + (lyrLook === 'boxed' || lyrLook === 'highlight' ? 64 : 48), Math.max(20, base * .7), { a: .45 })
}
function drawSync() { const nxt = syncLines[syncIdx], y = lyrY(); g.textAlign = 'center'; g.font = '600 22px sans-serif'; g.fillStyle = theme.d; g.fillText(nxt ? 'Tap as you sing this line' : 'All lines tapped', W / 2, y - 62); if (nxt) drawLine(nxt, y, 34) }
function overlays(p) {
    const len = cur ? curLen : clipLen(), L = cur ? lyr : parseLyrics(len);
    if (style === 'insta' && $('sub').value) { g.textAlign = 'center'; g.font = `${FNT.w === 800 ? 600 : FNT.w} 26px "${FNT.f}",sans-serif`; g.fillStyle = 'rgba(255,255,255,.85)'; wrap($('sub').value, W / 2, 690, W - 100, 32) }
    if (syncing) drawSync(); else drawLyrics(p * len, L, len)
}
function plainLines() { return $('lyr').value.split('\n').map(s => s.trim().replace(/^\[\d+:\d+(?:\.\d+)?\]\s*/, '')).filter(Boolean) }
function updSyncBtn() { $('sync').textContent = syncing ? `Tap now: line ${Math.min(syncIdx + 1, syncLines.length)} of ${syncLines.length}` : 'Tap to sync lyrics' }
function tapSync() { if (!syncing || !cur || syncIdx >= syncLines.length) return; syncStamps[syncIdx] = Math.max(0, actx.currentTime - runT0); syncIdx++; updSyncBtn() }
function finishSync() {
    if (!syncing) return; syncing = false;
    if (syncStamps.length) {
        const n = syncLines.length, tapped = syncStamps.length, last = syncStamps[tapped - 1];
        for (let i = tapped; i < n; i++)syncStamps[i] = last + (curLen - last) * (i - tapped + 1) / (n - tapped + 1);
        const tf = t => { const m = Math.floor(t / 60), s = (t - m * 60).toFixed(1); return `[${m}:${s.padStart(4, '0')}]` };
        $('lyr').value = syncLines.map((l, i) => tf(syncStamps[i]) + ' ' + l).join('\n');
        $('msg').textContent = `Timed ${tapped} of ${n} lines by tapping${tapped < n ? ', the rest were spread evenly' : ''}. You can edit the times in the box.`
    }
    updSyncBtn()
}
$('sync').onclick = () => {
    if (syncing) { tapSync(); return }
    if (!buf) { $('msg').textContent = 'Upload your audio first.'; return }
    syncLines = plainLines(); if (!syncLines.length) { $('msg').textContent = 'Type your lyrics first, one line per row.'; return }
    syncing = true; syncIdx = 0; syncStamps = []; updSyncBtn(); run(false)
};
cv.onclick = tapSync;
$('sub').oninput = $('lyr').oninput = idle;
$('lyrmode').onclick = e => { const b = e.target.closest('button'); if (!b) return; lyrMode = b.dataset.m;[...$('lyrmode').children].forEach(x => x.setAttribute('aria-pressed', x === b)); idle() };
$('bganim').onclick = e => { const b = e.target.closest('button'); if (!b) return; bgMode = b.dataset.b;[...$('bganim').children].forEach(x => x.setAttribute('aria-pressed', x === b)); idle() };
function idleLoop() { if (!cur && bgMode !== 'none') idle(); requestAnimationFrame(idleLoop) }
idleLoop();
let customInit = false;
const cbtn = document.createElement('button'); cbtn.className = 'chip sw'; cbtn.type = 'button'; cbtn.title = 'Create your own colors'; cbtn.setAttribute('aria-label', 'Create your own colors'); cbtn.setAttribute('aria-pressed', 'false'); cbtn.textContent = '+';
cbtn.style.cssText = 'background:conic-gradient(#ff5c8a,#ffc24b,#7dffb0,#3de0c5,#9b8cff,#ff5c8a);color:#fff;font-weight:800;font-size:1.3rem;text-shadow:0 1px 3px rgba(0,0,0,.6)';
$('themes').appendChild(cbtn);
function applyCustom() { theme = { n: 'Custom', a: $('c-a').value, b: $('c-b').value, c: $('c-c').value, d: $('c-d').value }; idle() }
cbtn.onclick = () => {
    if (!customInit) { customInit = true; $('c-a').value = theme.a; $('c-b').value = theme.b; $('c-c').value = theme.c; $('c-d').value = theme.d }
    $('custom').hidden = false;[...$('themes').children].forEach(x => x.setAttribute('aria-pressed', x === cbtn)); applyCustom()
};
['c-a', 'c-b', 'c-c', 'c-d'].forEach(i => $(i).oninput = applyCustom);
$('themes').addEventListener('click', e => { const b = e.target.closest('button'); if (b && b !== cbtn) $('custom').hidden = true });
function hsl(h, s, l) { h = ((h % 360) + 360) % 360; s /= 100; l /= 100; const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l), f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('') }
$('c-rand').onclick = () => { const h = Math.random() * 360; $('c-a').value = hsl(h, 55, 8); $('c-b').value = hsl(h + 20, 60, 22); $('c-c').value = hsl(h + 10, 90, 66); $('c-d').value = hsl(h + 50, 95, 76); applyCustom() };
let recSt = null;
const fmtT = s => { s = Math.floor(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') };
async function startRec() {
    if (previewing) endPreview();
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) { $('fmsg').textContent = 'Recording is not supported here. Use an up-to-date browser on a secure (https) page.'; return }
    let stream;
    try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume();
        stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: false, autoGainControl: false, noiseSuppression: $('rec-ns').checked } });
        await actx.resume()
    } catch (err) { const n = err && err.name; $('fmsg').textContent = (n === 'NotAllowedError' || n === 'SecurityError') ? 'Microphone access was blocked. Allow it in your browser or site settings, then try again.' : n === 'NotFoundError' ? 'No microphone was found.' : 'Could not start the microphone.'; return }
    const src = actx.createMediaStreamSource(stream), proc = actx.createScriptProcessor(4096, 1, 1), mute = actx.createGain();
    mute.gain.value = 0; src.connect(proc); proc.connect(mute); mute.connect(actx.destination);
    const st = recSt = { stream, src, proc, mute, chunks: [], total: 0 };
    proc.onaudioprocess = e => {
        const d = e.inputBuffer.getChannelData(0); st.chunks.push(new Float32Array(d)); st.total += d.length;
        let s = 0; for (let i = 0; i < d.length; i += 8)s += d[i] * d[i];
        $('meter').firstElementChild.style.transform = `scaleX(${Math.min(1, Math.sqrt(s / (d.length / 8)) * 4)})`;
        const secs = st.total / actx.sampleRate; $('rec-t').textContent = fmtT(secs); if (secs >= 300) stopRec()
    };
    $('rec').textContent = '■ Stop recording'; $('rec').classList.add('recording');
    $('prev').disabled = $('make').disabled = $('sync').disabled = $('reset').disabled = $('file').disabled = true;
    $('fmsg').textContent = 'Recording... sing now and press stop when you are done.'
}
function stopRec() {
    const st = recSt; if (!st) return; recSt = null;
    st.proc.onaudioprocess = null; try { st.src.disconnect(); st.proc.disconnect(); st.mute.disconnect() } catch (e) { }
    st.stream.getTracks().forEach(t => t.stop());
    $('rec').textContent = '● Record voice'; $('rec').classList.remove('recording');
    $('meter').firstElementChild.style.transform = 'scaleX(0)'; $('file').disabled = false; $('reset').disabled = false; $('sync').disabled = false;
    const n = st.chunks.reduce((a, c) => a + c.length, 0);
    if (n < actx.sampleRate * .5) { $('rec-t').textContent = ''; $('prev').disabled = $('make').disabled = !buf; $('fmsg').textContent = 'That was too short. Please try again.'; return }
    const ab = actx.createBuffer(1, n, actx.sampleRate), ch = ab.getChannelData(0); let o = 0; st.chunks.forEach(c => { ch.set(c, o); o += c.length });
    buf = ab; $('file').value = '';
    const d = Math.ceil(ab.duration); $('len').value = Math.min(90, d); $('len').max = Math.min(90, d); $('start').value = 0; $('start').max = Math.max(0, d - 1);
    $('prev').disabled = $('make').disabled = false;
    if (!$('title').value) $('title').value = 'My recording';
    $('fmsg').textContent = `Recorded ${d}s.${d > 90 ? ' It is longer than 90s, so choose the part you want (max 90s).' : ' The full clip is selected. You can trim it below.'}`;
    idle()
}
$('rec').onclick = () => recSt ? stopRec() : startRec();
const sp = (id, k, v) => [...$(id).children].forEach(x => x.setAttribute('aria-pressed', x.dataset[k] === v));
[['lyrlook', 'l', v => lyrLook = v], ['lyranim', 'a', v => lyrAnim = v], ['lyrpos', 'p', v => lyrPos = v]].forEach(([id, k, f]) => { $(id).onclick = e => { const b = e.target.closest('button'); if (!b) return; f(b.dataset[k]); sp(id, k, b.dataset[k]); idle() } });
bgv.muted = true;
function coverTo(c, src, sw, sh) { const q = Math.max(W / sw, H / sh); c.drawImage(src, (W - sw * q) / 2, (H - sh * q) / 2, sw * q, sh * q) }
function vStart() { return Math.min(Math.max(0, +$('vs').value || 0), Math.max(0, (bgv.duration || 0) - .5)) }
function vEnd() { const d = bgv.duration || 0, e = +$('ve').value || d; return Math.min(d, Math.max(e, vStart() + .5)) }
function snapVideo() { if (bgv.readyState >= 2 && bgv.videoWidth) { coverTo(vsnap.getContext('2d'), bgv, bgv.videoWidth, bgv.videoHeight); vHold = true } }
function startVideo() { if (!bgVid) return; snapVideo(); bgv.currentTime = vStart(); bgv.play().catch(() => { }) }
function syncVideo(t) {
    if (!bgVid) return; const vs = vStart(), ve = vEnd(), seg = Math.max(.5, ve - vs), want = vs + (t % seg);
    if (bgv.paused) bgv.play().catch(() => { });
    if (Math.abs(bgv.currentTime - want) > .6 || bgv.currentTime >= ve) { snapVideo(); bgv.currentTime = want }
}
function pauseVideo() { if (!bgVid) return; snapVideo(); bgv.pause(); bgv.currentTime = vStart() }
function clearVideo() { if (vUrl) URL.revokeObjectURL(vUrl); vUrl = null; bgVid = false; vHold = false; bgv.pause(); bgv.removeAttribute('src'); bgv.load(); $('vctl').hidden = true; $('bgvf').value = ''; $('vmsg').textContent = 'Shorter than the clip? It loops. Its own sound is not used.' }
$('bgvf').onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    if (vUrl) URL.revokeObjectURL(vUrl); vUrl = URL.createObjectURL(f); vHold = false; $('vmsg').textContent = 'Loading video...';
    bgv.onerror = () => { clearVideo(); $('vmsg').textContent = 'Could not read that video. Try an MP4 (H.264).' };
    bgv.onloadedmetadata = () => {
        const d = bgv.duration; if (!isFinite(d) || d < .5) { clearVideo(); $('vmsg').textContent = 'Could not read that video. Try an MP4 (H.264).'; return }
        bgVid = true; $('vs').value = 0; $('ve').value = +d.toFixed(1); $('vs').max = $('ve').max = +d.toFixed(1); $('vctl').hidden = false;
        $('vmsg').textContent = `Video loaded (${d.toFixed(1)}s). If it is shorter than your clip it loops, and if it is longer only the part that fits is used. Set the start and end below to pick a section.`;
        bgv.currentTime = Math.min(.05, d / 2)
    };
    bgv.src = vUrl; bgv.load()
};
bgv.addEventListener('loadeddata', () => { if (!cur) idle() });
bgv.addEventListener('seeked', () => { if (!cur) idle() });
$('vs').onchange = $('ve').onchange = () => { if (bgVid && !cur) bgv.currentTime = vStart() };
$('vdim').oninput = () => { $('vdim-o').textContent = $('vdim').value + '%'; idle() };
$('vrm').onclick = () => { clearVideo(); idle() };
document.fonts.ready.then(idle); idle();
$('x').onclick = $('back').onclick = () => $('done').close();
function resetAll() {
    stop(); previewing = false; buf = null; bgImg = null;
    $('file').value = ''; $('bg').value = ''; $('title').value = ''; $('name').value = ''; $('start').value = 0; $('len').value = 30; $('len').max = 90; $('start').removeAttribute('max');
    $('fmsg').textContent = 'MP3, WAV, M4A or similar.'; $('msg').textContent = '';
    $('prev').textContent = 'Preview'; $('prev').disabled = $('make').disabled = true;
    if ($('done').open) $('done').close(); $('vid').removeAttribute('src'); $('vid').load();
    theme = THEMES[0]; style = 'bars'; FNT = FONTS[0]; $('vol').value = 100; $('bass').value = 0; $('fin').value = 0; $('fout').value = 0; $('loud').checked = false; syncOut(); $('lyr').value = ''; $('sub').value = ''; syncing = false; $('custom').hidden = true; customInit = false; $('rec-t').textContent = ''; clearVideo(); $('vdim').value = 35; $('vdim-o').textContent = '35%'; lyrLook = 'classic'; lyrAnim = 'fade'; lyrPos = 'bottom'; sp('lyrlook', 'l', 'classic'); sp('lyranim', 'a', 'fade'); sp('lyrpos', 'p', 'bottom'); bgMode = 'none'; lyrMode = 'karaoke';[...$('bganim').children].forEach((x, i) => x.setAttribute('aria-pressed', i == 0));[...$('lyrmode').children].forEach(x => x.setAttribute('aria-pressed', x.dataset.m === 'karaoke')); updSyncBtn();
    [...$('themes').children].forEach((x, i) => x.setAttribute('aria-pressed', i == 0));
    [...$('styles').children].forEach(x => x.setAttribute('aria-pressed', x.dataset.v === 'bars'));
    [...$('fonts').children].forEach((x, i) => x.setAttribute('aria-pressed', i == 0));
    idle()
}
function syncOut() { [['vol', '%'], ['bass', ' dB'], ['fin', ' s'], ['fout', ' s']].forEach(([i, u]) => $(i + '-o').textContent = $(i).value + u) }
['vol', 'bass', 'fin', 'fout'].forEach(i => $(i).oninput = syncOut); syncOut();
$('start').oninput = () => { if (!buf) return; const r = Math.ceil(buf.duration - (+$('start').value || 0)); if (+$('len').value > r) $('len').value = Math.max(1, r) };
function buildChain(src, len) {
    const vol = (+$('vol').value || 100) / 100, t = actx.currentTime, fi = Math.min(+$('fin').value || 0, len / 2), fo = Math.min(+$('fout').value || 0, len / 2), g1 = actx.createGain();
    g1.gain.setValueAtTime(fi > 0 ? 0 : vol, t);
    if (fi > 0) g1.gain.linearRampToValueAtTime(vol, t + fi);
    if (fo > 0) { g1.gain.setValueAtTime(vol, t + len - fo); g1.gain.linearRampToValueAtTime(0, t + len) }
    src.connect(g1); let n = g1;
    const bass = +$('bass').value || 0;
    if (bass) { const f = actx.createBiquadFilter(); f.type = 'lowshelf'; f.frequency.value = 150; f.gain.value = bass; n.connect(f); n = f }
    if ($('loud').checked) { const c = actx.createDynamicsCompressor(); c.threshold.value = -30; c.knee.value = 20; c.ratio.value = 6; c.attack.value = .003; c.release.value = .2; n.connect(c); const mk = actx.createGain(); mk.gain.value = 1.8; c.connect(mk); n = mk }
    const lim = actx.createDynamicsCompressor(); lim.threshold.value = -2; lim.knee.value = 0; lim.ratio.value = 20; lim.attack.value = .001; lim.release.value = .1; n.connect(lim);
    return lim
}
$('reset').onclick = resetAll;
$('done').addEventListener('close', () => $('vid').pause());
$('done').addEventListener('click', e => { if (e.target === $('done')) $('done').close() });