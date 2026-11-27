// Generates the abstract cover art / gallery tiles used on the site.
// Run: node tools/generate-visuals.mjs   (writes into assets/visuals/)
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'assets', 'visuals');
mkdirSync(out, { recursive: true });

const F = `font-family="Inter, 'Segoe UI', Helvetica, Arial, sans-serif"`;
const MONO = `font-family="'JetBrains Mono', Consolas, 'Courier New', monospace"`;
const ORANGE = '#ff5a0a';

// seeded random so output is stable between runs
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const svg = (w, h, body, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
  `<defs>${defs}</defs>${body}</svg>`;

const t = (x, y, s, txt, o = {}) =>
  `<text x="${x}" y="${y}" font-size="${s}" ${o.mono ? MONO : F} font-weight="${o.w || 500}" fill="${o.c || '#111'}"` +
  `${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.ls ? ` letter-spacing="${o.ls}"` : ''}${o.op ? ` opacity="${o.op}"` : ''}>${txt}</text>`;

const rect = (x, y, w, h, r, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`;

const studio = (id, a, b) =>
  `<radialGradient id="${id}" cx="50%" cy="35%" r="85%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;

const shadow = `<filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="30" stdDeviation="35" flood-color="#000" flood-opacity=".28"/></filter>`;
const glow = (id, c) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60"/></filter>`;

// ---------- reusable widgets ----------
function windowChrome(x, y, w, h, dark = true) {
  const bg = dark ? '#111214' : '#ffffff';
  const bar = dark ? '#1b1c1f' : '#f1f1f1';
  return (
    rect(x, y, w, h, 22, bg, 'filter="url(#sh)"') +
    `<path d="M${x} ${y + 22}a22 22 0 0 1 22-22h${w - 44}a22 22 0 0 1 22 22v24h-${w}z" fill="${bar}"/>` +
    [0, 1, 2].map(i => `<circle cx="${x + 28 + i * 20}" cy="${y + 23}" r="6" fill="${['#ff5f57', '#febc2e', '#28c840'][i]}"/>`).join('')
  );
}

function bars(x, y, w, h, n, color, dim) {
  let s = '';
  const bw = w / n;
  for (let i = 0; i < n; i++) {
    const v = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.3 + 0.6)) * (0.6 + rnd() * 0.4);
    const bh = h * v;
    s += rect(x + i * bw + bw * 0.18, y + h - bh, bw * 0.64, bh, 4, i === n - 3 ? color : dim);
  }
  return s;
}

function linePath(x, y, w, h, pts) {
  return pts.map((p, i) => `${i ? 'L' : 'M'}${(x + (i / (pts.length - 1)) * w).toFixed(1)} ${(y + h - p * h).toFixed(1)}`).join(' ');
}

function kpi(x, y, w, label, value, delta, dark) {
  const c = dark ? '#fff' : '#111';
  const sub = dark ? '#8b8d93' : '#888';
  return (
    rect(x, y, w, 120, 14, dark ? '#1a1b1e' : '#f6f6f4') +
    t(x + 22, y + 38, 17, label, { c: sub }) +
    t(x + 22, y + 88, 40, value, { c, w: 600, ls: -1 }) +
    t(x + w - 22, y + 88, 17, delta, { c: '#3ecf8e', anchor: 'end', w: 600 })
  );
}

// ---------- covers for experience ----------
function coverAccenture() {
  const W = 1380, H = 1020;
  const wx = 150, wy = 150, ww = 1080, wh = 720;
  let b = rect(0, 0, W, H, 0, 'url(#bg)');
  b += windowChrome(wx, wy, ww, wh, true);
  b += t(wx + 40, wy + 100, 15, 'LAKEVIEW  /  DATA AUTOMATION', { c: '#8b8d93', w: 600, ls: 1.5 });
  b += t(wx + 40, wy + 145, 34, 'Pipeline Health', { c: '#fff', w: 600, ls: -0.6 });
  b += kpi(wx + 40, wy + 180, 320, 'Jobs succeeded', '1,284', '+12%', true);
  b += kpi(wx + 380, wy + 180, 320, 'Avg. runtime', '6.2m', '-31%', true);
  b += kpi(wx + 720, wy + 180, 320, 'Delta tables', '312', '+48', true);
  b += rect(wx + 40, wy + 320, 600, 360, 14, '#1a1b1e');
  b += t(wx + 64, wy + 360, 16, 'Rows processed / day', { c: '#8b8d93' });
  b += bars(wx + 64, wy + 390, 552, 260, 14, ORANGE, '#2c2e33');
  b += rect(wx + 660, wy + 320, 380, 360, 14, '#1a1b1e');
  b += t(wx + 684, wy + 360, 16, 'Medallion flow', { c: '#8b8d93' });
  const tiers = [['Bronze', '#b0693a'], ['Silver', '#a9adb5'], ['Gold', '#e9b949']];
  tiers.forEach(([n, c], i) => {
    const yy = wy + 395 + i * 95;
    b += rect(wx + 684, yy, 332, 70, 12, '#232428');
    b += `<circle cx="${wx + 718}" cy="${yy + 35}" r="12" fill="${c}"/>`;
    b += t(wx + 745, yy + 42, 20, n, { c: '#fff', w: 600 });
    b += t(wx + 994, yy + 42, 16, ['raw', 'clean', 'serve'][i], { c: '#8b8d93', anchor: 'end' });
    if (i < 2) b += `<path d="M${wx + 718} ${yy + 70}v25" stroke="#3a3c42" stroke-width="2" stroke-dasharray="4 4"/>`;
  });
  return svg(W, H, b, studio('bg', '#f2f2f0', '#cfcfcb') + shadow);
}

function coverDadata() {
  const W = 1380, H = 1020;
  let b = rect(0, 0, W, H, 0, '#0b0c0e');
  b += `<circle cx="1050" cy="820" r="380" fill="${ORANGE}" opacity=".55" filter="url(#g1)"/>`;
  b += `<circle cx="250" cy="180" r="260" fill="#7a1d00" opacity=".55" filter="url(#g1)"/>`;
  // grid
  for (let i = 0; i < 24; i++) b += `<path d="M${i * 60} 0V${H}" stroke="#fff" stroke-opacity=".035"/>`;
  for (let i = 0; i < 18; i++) b += `<path d="M0 ${i * 60}H${W}" stroke="#fff" stroke-opacity=".035"/>`;
  const nodes = [
    [230, 330, 'Amazon S3', 'raw landing'],
    [560, 230, 'Databricks', 'PySpark jobs'],
    [560, 520, 'Delta Lake', 'ACID tables'],
    [900, 380, 'Collibra', 'governance'],
    [1150, 600, 'Analytics', 'BI &amp; reports'],
  ];
  const edges = [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [3, 4]];
  edges.forEach(([a, c]) => {
    const [x1, y1] = nodes[a], [x2, y2] = nodes[c];
    const mx = (x1 + x2) / 2;
    b += `<path d="M${x1 + 95} ${y1 + 40}C${mx + 40} ${y1 + 40} ${mx - 40} ${y2 + 40} ${x2 - 95} ${y2 + 40}" fill="none" stroke="${ORANGE}" stroke-width="2.5" stroke-opacity=".8"/>`;
  });
  nodes.forEach(([x, y, n, s], i) => {
    b += rect(x - 95, y, 190, 80, 16, '#16171a', 'stroke="#ffffff" stroke-opacity=".12"');
    b += `<circle cx="${x - 65}" cy="${y + 40}" r="9" fill="${i === 3 ? '#3ecf8e' : ORANGE}"/>`;
    b += t(x - 45, y + 38, 19, n, { c: '#fff', w: 600 });
    b += t(x - 45, y + 62, 14, s, { c: '#8b8d93' });
  });
  b += t(90, 900, 16, 'AWS  ·  DATABRICKS  ·  COLLIBRA', { c: '#ffffff', op: 0.6, w: 600, ls: 2 });
  b += t(90, 120, 46, 'ETL, governed.', { c: '#fff', w: 600, ls: -1.5 });
  return svg(W, H, b, glow('g1') + shadow);
}

function trajectory(x, y, w, h, color, labelColor) {
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const p = i / 60;
    pts.push(Math.sin(Math.min(p * 1.12, 1) * Math.PI) * (p < 0.9 ? 1 : 1 - (p - 0.9) * 2.2) * 0.92);
  }
  let s = '';
  for (let i = 0; i <= 5; i++) s += `<path d="M${x} ${y + (h / 5) * i}H${x + w}" stroke="${labelColor}" stroke-opacity=".12"/>`;
  s += `<path d="${linePath(x, y, w, h, pts)}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round"/>`;
  const ax = x + w * 0.446, ay = y + h - 0.92 * h;
  s += `<circle cx="${ax}" cy="${ay}" r="9" fill="${color}"/><circle cx="${ax}" cy="${ay}" r="22" fill="${color}" opacity=".2"/>`;
  s += `<path d="M${ax} ${ay + 26}V${y + h}" stroke="${color}" stroke-dasharray="6 8" stroke-opacity=".6"/>`;
  s += t(ax + 30, ay - 14, 22, 'Apogee 1,358 ft', { c: labelColor, w: 600 });
  s += t(ax + 30, ay + 14, 17, 'Mach 0.35 · OpenRocket sim', { c: labelColor, op: 0.6 });
  return s;
}

function coverSpaceLab() {
  const W = 1380, H = 1020;
  let b = rect(0, 0, W, H, 0, 'url(#bg)');
  for (let i = 0; i < 140; i++) b += `<circle cx="${rnd() * W}" cy="${rnd() * H * 0.7}" r="${rnd() * 1.8 + 0.3}" fill="#fff" opacity="${0.2 + rnd() * 0.6}"/>`;
  b += `<ellipse cx="690" cy="1350" rx="1100" ry="520" fill="#ff7a2d" opacity=".35" filter="url(#g1)"/>`;
  b += trajectory(140, 240, 1100, 560, '#ffffff', '#ffffff');
  b += t(140, 150, 15, 'INDIA SPACE LAB  /  FLIGHT PROFILE', { c: '#fff', op: 0.6, w: 600, ls: 2 });
  b += t(140, 200, 44, 'High-power rocket, simulated.', { c: '#fff', w: 600, ls: -1.2 });
  b += t(140, 900, 16, 'SOLIDWORKS  ·  OPENROCKET  ·  ESP32  ·  PID', { c: '#fff', op: 0.6, w: 600, ls: 2 });
  return svg(W, H, b, `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070f"/><stop offset="1" stop-color="#15213f"/></linearGradient>` + glow('g1'));
}

function circuit(x, y, w, dark) {
  const c = dark ? '#fff' : '#111';
  let s = '';
  const qs = 4, gap = 95;
  for (let q = 0; q < qs; q++) {
    s += t(x - 70, y + q * gap + 8, 22, `q${q}`, { c, mono: true, op: 0.7 });
    s += `<path d="M${x} ${y + q * gap}H${x + w}" stroke="${c}" stroke-opacity=".35" stroke-width="2"/>`;
  }
  const gate = (gx, q, label, fill) =>
    rect(gx - 30, y + q * gap - 30, 60, 60, 10, fill) + t(gx, y + q * gap + 9, 24, label, { c: '#fff', anchor: 'middle', w: 700 });
  const cnot = (gx, cq, tq) =>
    `<path d="M${gx} ${y + cq * gap}V${y + tq * gap}" stroke="${c}" stroke-width="2.5"/>` +
    `<circle cx="${gx}" cy="${y + cq * gap}" r="9" fill="${c}"/>` +
    `<circle cx="${gx}" cy="${y + tq * gap}" r="22" fill="none" stroke="${c}" stroke-width="2.5"/>` +
    `<path d="M${gx - 22} ${y + tq * gap}h44M${gx} ${y + tq * gap - 22}v44" stroke="${c}" stroke-width="2.5"/>`;
  s += gate(x + 80, 0, 'H', ORANGE);
  s += cnot(x + 200, 0, 1);
  s += cnot(x + 320, 1, 2);
  s += gate(x + 440, 3, 'X', '#3a3c42');
  s += cnot(x + 560, 2, 3);
  s += gate(x + 680, 0, 'Z', '#3a3c42');
  s += gate(x + 680, 2, 'H', ORANGE);
  for (let q = 0; q < qs; q++) {
    const mx = x + w - 40;
    s += rect(mx - 34, y + q * gap - 28, 68, 56, 10, dark ? '#1c1d21' : '#fff', `stroke="${c}" stroke-opacity=".3"`);
    s += `<path d="M${mx - 20} ${y + q * gap + 12}a20 20 0 0 1 40 0" fill="none" stroke="${c}" stroke-width="2"/><path d="M${mx} ${y + q * gap + 12}l14-20" stroke="${c}" stroke-width="2"/>`;
  }
  return s;
}

function coverQuantum() {
  const W = 1380, H = 1020;
  let b = rect(0, 0, W, H, 0, 'url(#bg)');
  b += windowChrome(130, 140, 1120, 740, false);
  b += t(180, 250, 15, 'THE QUANTUM COMPUTING CLUB  /  WORKSHOP 03', { c: '#888', w: 600, ls: 1.5 });
  b += t(180, 300, 38, 'Entanglement, hands-on.', { c: '#111', w: 600, ls: -0.8 });
  b += circuit(290, 400, 880, false);
  b += t(180, 830, 17, '|ψ⟩ = (|0000⟩ + |1111⟩) / √2', { c: '#111', mono: true, op: 0.7 });
  return svg(W, H, b, studio('bg', '#f5f3ef', '#d6d2cb') + shadow);
}

// ---------- gallery tiles (1600 x 1000) ----------
function tileCode() {
  const W = 1600, H = 1000;
  let b = rect(0, 0, W, H, 0, 'url(#bg)');
  b += windowChrome(170, 120, 1260, 760, true);
  const lines = [
    ['#c678dd', 'from', '#fff', ' pyspark.sql ', '#c678dd', 'import', '#fff', ' functions ', '#c678dd', 'as', '#fff', ' F'],
    ['#7f848e', '# bronze -> silver: dedupe + type-cast'],
    ['#fff', 'silver = (spark.read.table(', '#98c379', '"bronze.events"', '#fff', ')'],
    ['#fff', '    .dropDuplicates([', '#98c379', '"event_id"', '#fff', '])'],
    ['#fff', '    .withColumn(', '#98c379', '"ts"', '#fff', ', F.to_timestamp(', '#98c379', '"ts"', '#fff', '))'],
    ['#fff', '    .filter(F.col(', '#98c379', '"status"', '#fff', ').isNotNull()))'],
    [''],
    ['#fff', '(silver.write.format(', '#98c379', '"delta"', '#fff', ')'],
    ['#fff', '    .mode(', '#98c379', '"overwrite"', '#fff', ')'],
    ['#fff', '    .saveAsTable(', '#98c379', '"silver.events"', '#fff', '))'],
    [''],
    ['#7f848e', '# ✓ 4,812,019 rows  ·  2m 14s  ·  Unity Catalog lineage recorded'],
  ];
  lines.forEach((ln, i) => {
    let tsp = '';
    for (let k = 0; k < ln.length; k += 2) if (ln[k + 1] !== undefined) tsp += `<tspan fill="${ln[k]}">${ln[k + 1].replace(/ /g, '&#160;')}</tspan>`;
    b += t(250, 240 + i * 50, 25, '', { mono: true }).replace('></text>', `>${tsp}</text>`);
    b += t(215, 240 + i * 50, 20, String(i + 1), { mono: true, c: '#4b4e55', anchor: 'end' });
  });
  return svg(W, H, b, `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a1205"/><stop offset=".55" stop-color="#0c0c0d"/><stop offset="1" stop-color="#0c0c0d"/></linearGradient>` + shadow);
}

function tileQuad() {
  const W = 1600, H = 1000;
  let b = rect(0, 0, W, H, 0, '#e8ebef');
  for (let i = 0; i < 40; i++) b += `<path d="M${i * 40} 0V${H}" stroke="#2b5fd9" stroke-opacity=".08"/>`;
  for (let i = 0; i < 26; i++) b += `<path d="M0 ${i * 40}H${W}" stroke="#2b5fd9" stroke-opacity=".08"/>`;
  const cx = 800, cy = 500, c = '#1d3f9a';
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => {
    const ax = cx + sx * 230, ay = cy + sy * 230;
    b += `<path d="M${cx + sx * 60} ${cy + sy * 60}L${ax} ${ay}" stroke="${c}" stroke-width="18" stroke-linecap="round"/>`;
    b += `<circle cx="${ax}" cy="${ay}" r="150" fill="none" stroke="${c}" stroke-width="3" stroke-dasharray="10 10" opacity=".55"/>`;
    b += `<circle cx="${ax}" cy="${ay}" r="34" fill="#fff" stroke="${c}" stroke-width="5"/>`;
    b += `<ellipse cx="${ax}" cy="${ay}" rx="140" ry="16" fill="${c}" opacity=".25" transform="rotate(${sx * sy * 35} ${ax} ${ay})"/>`;
  });
  b += rect(cx - 95, cy - 95, 190, 190, 34, '#fff', `stroke="${c}" stroke-width="5"`);
  b += rect(cx - 55, cy - 40, 110, 80, 10, c);
  b += t(cx, cy + 9, 22, 'ESP32', { c: '#fff', anchor: 'middle', w: 700, mono: true });
  b += t(90, 120, 16, 'MODULAR QUADCOPTER  /  TOP VIEW', { c, w: 700, ls: 2 });
  b += t(90, 900, 22, 'payload 2.5 kg  ·  GPS waypoint PID', { c, mono: true });
  b += `<path d="M1300 860h200M1300 850v20M1500 850v20" stroke="${c}" stroke-width="3"/>` + t(1400, 900, 18, '500 mm', { c, anchor: 'middle', mono: true });
  return svg(W, H, b);
}

function tileTelemetry() {
  const W = 1600, H = 1000;
  let b = rect(0, 0, W, H, 0, '#06140f');
  b += `<circle cx="1300" cy="150" r="300" fill="#1fbf75" opacity=".25" filter="url(#g1)"/>`;
  const series = [['ACCEL Z', '#3ef0a0'], ['GYRO X', '#ffffff'], ['ALT (m)', ORANGE]];
  series.forEach(([n, c], k) => {
    const y = 170 + k * 260;
    const pts = [];
    for (let i = 0; i < 90; i++) pts.push(0.5 + 0.35 * Math.sin(i * (0.18 + k * 0.07) + k) * Math.cos(i * 0.05) + (rnd() - 0.5) * 0.12);
    b += t(120, y - 20, 16, n, { c, w: 700, ls: 2, mono: true });
    b += `<path d="M120 ${y + 180}H1480" stroke="#fff" stroke-opacity=".1"/>`;
    b += `<path d="${linePath(120, y, 1360, 180, pts)}" fill="none" stroke="${c}" stroke-width="3"/>`;
  });
  b += t(1480, 80, 16, '● LIVE  ·  115200 baud', { c: '#3ef0a0', anchor: 'end', mono: true });
  return svg(W, H, b, glow('g1'));
}

function tileFlySight(W = 1600, H = 1000, compact = false) {
  let b = rect(0, 0, W, H, 0, 'url(#sky)');
  const s = compact ? 0.6 : 1;
  const wx = compact ? 40 : 150, wy = compact ? 220 : 110, ww = W - wx * 2, wh = compact ? 470 : 780;
  b += windowChrome(wx, wy, ww, wh, false);
  b += t(wx + 40, wy + 100, 15 * (compact ? 1.3 : 1), 'FLYSIGHT  /  SKYTRAX REVIEWS', { c: '#888', w: 600, ls: 1.5 });
  b += t(wx + 40, wy + (compact ? 150 : 150), compact ? 34 : 36, 'Sentiment over time', { c: '#111', w: 600, ls: -0.8 });
  const cy = wy + (compact ? 190 : 200), ch = compact ? 230 : 380, cw = compact ? ww - 80 : 700;
  const pos = [], neg = [];
  for (let i = 0; i < 40; i++) {
    pos.push(0.55 + 0.25 * Math.sin(i * 0.3) + rnd() * 0.08);
    neg.push(0.25 + 0.12 * Math.cos(i * 0.25) + rnd() * 0.06);
  }
  b += `<path d="${linePath(wx + 40, cy, cw, ch, pos)} L${wx + 40 + cw} ${cy + ch} L${wx + 40} ${cy + ch}Z" fill="#3ecf8e" opacity=".12"/>`;
  b += `<path d="${linePath(wx + 40, cy, cw, ch, pos)}" fill="none" stroke="#21a86b" stroke-width="${4 * s + 1}"/>`;
  b += `<path d="${linePath(wx + 40, cy, cw, ch, neg)}" fill="none" stroke="${ORANGE}" stroke-width="${4 * s + 1}"/>`;
  if (!compact) {
    const dx = wx + 800;
    b += rect(dx, wy + 200, 260, 170, 14, '#f6f6f4') + t(dx + 22, wy + 240, 17, 'Classifier accuracy', { c: '#888' }) + t(dx + 22, wy + 320, 64, '85%', { c: '#111', w: 600, ls: -2 });
    b += rect(dx, wy + 390, 260, 190, 14, '#f6f6f4') + t(dx + 22, wy + 430, 17, 'Models', { c: '#888' });
    ['VADER', 'BERT', 'NLTK'].forEach((m, i) => (b += rect(dx + 22, wy + 450 + i * 40, 200 - i * 40, 26, 6, i ? '#dcdcd8' : ORANGE) + t(dx + 232 - i * 40, wy + 470 + i * 40, 15, m, { c: '#555', w: 600 })));
    b += t(wx + 40, wy + 700, 17, '● positive   ● negative   — daily reviews, scraped with BeautifulSoup', { c: '#666' });
  }
  return svg(W, H, b, `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe3ff"/><stop offset="1" stop-color="#f4f1ea"/></linearGradient>` + shadow);
}

function tileNeuroGrid(W = 1600, H = 1000, compact = false) {
  let b = rect(0, 0, W, H, 0, '#07080a');
  b += `<ellipse cx="${W / 2}" cy="${H * 0.75}" rx="${W * 0.5}" ry="${H * 0.3}" fill="${ORANGE}" opacity=".35" filter="url(#g1)"/>`;
  // isometric grid
  const cx = W / 2, cy = H * (compact ? 0.52 : 0.5), sz = compact ? 34 : 46, n = 9;
  const iso = (i, j) => [cx + (i - j) * sz, cy + (i + j - n) * sz * 0.5];
  for (let i = 0; i <= n; i++) {
    const [a1, b1] = iso(i, 0), [a2, b2] = iso(i, n);
    const [c1, d1] = iso(0, i), [c2, d2] = iso(n, i);
    b += `<path d="M${a1} ${b1}L${a2} ${b2}M${c1} ${d1}L${c2} ${d2}" stroke="#fff" stroke-opacity=".12"/>`;
  }
  const nodes = [];
  for (let k = 0; k < 14; k++) nodes.push(iso(Math.floor(rnd() * n), Math.floor(rnd() * n)));
  nodes.forEach((p, k) => {
    const q = nodes[(k * 5 + 3) % nodes.length];
    b += `<path d="M${p[0]} ${p[1]}L${q[0]} ${q[1]}" stroke="${k % 4 ? '#ffb38a' : '#ff3b30'}" stroke-width="2" stroke-opacity=".7"/>`;
  });
  nodes.forEach(([x, y], k) => {
    const hgt = (compact ? 30 : 50) + rnd() * (compact ? 50 : 90);
    b += `<path d="M${x} ${y}V${y - hgt}" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`;
    b += `<circle cx="${x}" cy="${y - hgt}" r="${compact ? 7 : 9}" fill="${k === 6 ? '#ff3b30' : '#fff'}"/>`;
    if (k === 6) b += `<circle cx="${x}" cy="${y - hgt}" r="${compact ? 22 : 30}" fill="none" stroke="#ff3b30" stroke-width="2"/>`;
  });
  const fs = compact ? 1.25 : 1;
  b += t(compact ? 40 : 90, compact ? 90 : 110, 16 * fs, 'NEUROGRID  /  DIGITAL TWIN', { c: '#fff', op: 0.6, w: 600, ls: 2 });
  if (!compact) {
    b += t(90, 165, 44, 'Smart grid, simulated.', { c: '#fff', w: 600, ls: -1.2 });
    b += rect(1150, 760, 360, 150, 16, '#16171a', 'stroke="#fff" stroke-opacity=".12"');
    b += t(1175, 800, 16, 'Fault prediction', { c: '#8b8d93' }) + t(1175, 870, 56, '81%', { c: '#fff', w: 600, ls: -2 }) + t(1485, 870, 18, '-65% downtime', { c: '#3ecf8e', anchor: 'end', w: 600 });
  } else {
    b += t(40, H - 60, 18 * fs, 'LangGraph · XGBoost · Three.js', { c: '#fff', op: 0.7, w: 600 });
  }
  return svg(W, H, b, glow('g1'));
}

function tileCerts() {
  const W = 1600, H = 1000;
  let b = rect(0, 0, W, H, 0, 'url(#bg)');
  const badge = (x, title, sub, c1, c2, mark) => {
    let s = `<g transform="translate(${x} 230)" filter="url(#sh)">`;
    s += `<path d="M180 0L350 98V294L180 392L10 294V98Z" fill="url(#${c1})"/>`;
    s += `<path d="M180 26L327 111V281L180 366L33 281V111Z" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`;
    s += t(180, 175, 64, mark, { c: '#fff', anchor: 'middle', w: 700, ls: -1 });
    s += t(180, 225, 18, sub, { c: '#fff', anchor: 'middle', w: 600, ls: 1.5, op: 0.9 });
    s += rect(40, 400, 280, 60, 30, c2) + t(180, 438, 20, title, { c: '#fff', anchor: 'middle', w: 700, ls: 1 });
    return s + '</g>';
  };
  b += badge(380, 'CERTIFIED', 'CLOUD PRACTITIONER', 'aws', '#1d2633', 'AWS');
  b += badge(860, 'YELLOW BELT', 'ASQ · SOUTH ASIA', 'ss', '#8a6a00', 'σ6');
  return svg(W, H,
    b,
    studio('bg', '#ffffff', '#e2e2df') + shadow +
      `<linearGradient id="aws" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9a3c"/><stop offset="1" stop-color="#d9480f"/></linearGradient>` +
      `<linearGradient id="ss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe066"/><stop offset="1" stop-color="#e8a400"/></linearGradient>`
  );
}

function tileMedallion() {
  const W = 1600, H = 1000;
  let b = rect(0, 0, W, H, 0, '#f4f4f2');
  const cols = [['Bronze', '#b0693a', 'raw · append-only'], ['Silver', '#8f949c', 'cleaned · conformed'], ['Gold', '#d9a420', 'aggregated · served']];
  cols.forEach(([n, c, s], i) => {
    const x = 140 + i * 460;
    b += rect(x, 260, 400, 480, 26, '#fff', 'filter="url(#sh)"');
    b += `<circle cx="${x + 60}" cy="320" r="18" fill="${c}"/>`;
    b += t(x + 95, 330, 30, n, { c: '#111', w: 600 });
    b += t(x + 40, 390, 18, s, { c: '#888' });
    for (let r = 0; r < 6; r++) b += rect(x + 40, 430 + r * 45, 320 - ((r * 37 + i * 50) % 120), 22, 6, r === 0 ? c : '#ececea');
    if (i < 2) b += `<path d="M${x + 410} 500h40" stroke="#111" stroke-width="3"/><path d="M${x + 440} 490l12 10-12 10" fill="none" stroke="#111" stroke-width="3"/>`;
  });
  b += t(140, 170, 46, 'Delta Lake medallion', { c: '#111', w: 600, ls: -1.4 });
  b += t(140, 850, 18, 'Unity Catalog  ·  MLflow  ·  Workflows  ·  Snowflake share', { c: '#666', w: 500 });
  return svg(W, H, b, shadow);
}

function tileLakeview() {
  // re-use the Accenture cover at gallery proportions
  const W = 1600, H = 1000;
  const inner = coverAccenture().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#d9d9d6"/><svg x="0" y="-50" width="${W}" height="${H + 100}" viewBox="0 0 1380 1020" preserveAspectRatio="xMidYMid slice">${inner}</svg></svg>`;
}

function tileRocket() {
  const W = 1600, H = 1000;
  const inner = coverSpaceLab().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><svg width="${W}" height="${H}" viewBox="0 0 1380 1020" preserveAspectRatio="xMidYMid slice">${inner}</svg></svg>`;
}

function tileCircuitDark() {
  const W = 1600, H = 1000;
  let b = rect(0, 0, W, H, 0, '#0b0b0d');
  b += `<circle cx="300" cy="900" r="360" fill="#6b2bff" opacity=".35" filter="url(#g1)"/>`;
  b += `<circle cx="1350" cy="120" r="300" fill="${ORANGE}" opacity=".35" filter="url(#g1)"/>`;
  b += circuit(260, 330, 1100, true);
  b += t(120, 170, 16, 'QUANTUM COMPUTING CLUB  ·  NCU', { c: '#fff', op: 0.6, w: 600, ls: 2 });
  b += t(120, 850, 22, 'GHZ state  ·  4 qubits  ·  1024 shots', { c: '#fff', mono: true, op: 0.7 });
  return svg(W, H, b, glow('g1'));
}

// ---------- polaroids ----------
function portrait() {
  const W = 600, H = 830;
  let b = rect(0, 0, W, H, 0, 'url(#bg)');
  b += `<circle cx="300" cy="330" r="130" fill="#2a2a2c"/>`;
  b += `<path d="M60 ${H}C80 600 180 520 300 520S520 600 540 ${H}Z" fill="#2a2a2c"/>`;
  b += t(300, 365, 96, 'PG', { c: '#fff', anchor: 'middle', w: 700, ls: -4 });
  b += t(300, 790, 16, 'drop assets/headshot.jpg to replace', { c: '#fff', anchor: 'middle', op: 0.45 });
  return svg(W, H, b, `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8d8d8f"/><stop offset="1" stop-color="#4a4a4c"/></linearGradient>`);
}

const files = {
  'exp-accenture.svg': coverAccenture(),
  'exp-dadata.svg': coverDadata(),
  'exp-spacelab.svg': coverSpaceLab(),
  'exp-quantum.svg': coverQuantum(),
  'g-lakeview.svg': tileLakeview(),
  'g-pyspark.svg': tileCode(),
  'g-medallion.svg': tileMedallion(),
  'g-rocket.svg': tileRocket(),
  'g-quadcopter.svg': tileQuad(),
  'g-telemetry.svg': tileTelemetry(),
  'g-flysight.svg': tileFlySight(),
  'g-neurogrid.svg': tileNeuroGrid(),
  'g-certs.svg': tileCerts(),
  'g-circuit.svg': tileCircuitDark(),
  'p-flysight.svg': tileFlySight(600, 750, true),
  'p-neurogrid.svg': tileNeuroGrid(600, 750, true),
  'portrait.svg': portrait(),
};

for (const [name, content] of Object.entries(files)) writeFileSync(join(out, name), content);
console.log(`wrote ${Object.keys(files).length} visuals to ${out}`);
