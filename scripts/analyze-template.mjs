// Analisis piksel template kosong: deteksi AAP bar, garis baris tabel,
// tepi kartu, dan pill tanggal. Output dipakai untuk menyetel overlay.
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = resolve(__dirname, "..", "public", "DESIGN JADWAL PENERBANGAN KEBERANGKATAN ASLI.png");
const dataUrl = "data:image/png;base64," + readFileSync(file).toString("base64");

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.setContent("<canvas id='c' width='1080' height='1920'></canvas>");

const result = await page.evaluate(async (url) => {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const c = document.getElementById("c");
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, 1080, 1920);
  const d = ctx.getImageData(0, 0, 1080, 1920).data;
  const at = (x, y) => { const i = (y * 1080 + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };

  // Brightness rata-rata per baris-y (kolom tengah 150..930).
  const bright = [];
  for (let y = 0; y < 1920; y++) {
    let s = 0, n = 0;
    for (let x = 150; x < 930; x += 4) { const [r, g, b] = at(x, y); s += (r + g + b) / 3; n++; }
    bright[y] = s / n;
  }

  // AAP bar: rentang y dengan piksel biru kuat.
  let aapTop = -1, aapBottom = -1;
  for (let y = 450; y < 650; y++) {
    let blue = 0;
    for (let x = 150; x < 930; x += 8) { const [r, g, b] = at(x, y); if (b > 170 && r < 110 && g > 60 && g < 180) blue++; }
    if (blue > 60) { if (aapTop < 0) aapTop = y; aapBottom = y; }
  }

  // Brightness kartu (abaikan garis): persentil tinggi dari sampel area kartu.
  const cs = [];
  for (let y = aapBottom + 15; y < 1650; y += 6) for (let x = 250; x < 830; x += 16) { const [r, g, b] = at(x, y); cs.push((r + g + b) / 3); }
  cs.sort((a, b) => a - b);
  const cardBg = cs[Math.floor(cs.length * 0.65)];

  // Skor garis per-y: piksel abu-abu yang lebih gelap dari kartu.
  const score = [];
  for (let y = aapBottom + 12; y < 1720; y++) {
    let cnt = 0;
    for (let x = 200; x < 880; x += 2) {
      const [r, g, b] = at(x, y);
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), v = (r + g + b) / 3;
      if (mx - mn < 24 && v > 165 && v < cardBg - 5) cnt++;
    }
    score[y] = cnt;
  }
  const lineYs = [];
  const TH = 180; // dari ~340 sampel
  for (let y = aapBottom + 12; y < 1720; y++) {
    if (score[y] > TH) {
      let yy = y, best = y;
      while (yy < 1720 && score[yy] > TH) { if (score[yy] > score[best]) best = yy; yy++; }
      lineYs.push(best);
      y = yy + 10;
    }
  }

  // Lebar garis (tepi kiri/kanan) di beberapa garis → margin kartu.
  let lineLeft = 1080, lineRight = 0;
  for (const y of lineYs.slice(2, 8)) {
    for (let x = 60; x < 1020; x++) {
      const [r, g, b] = at(x, y);
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), v = (r + g + b) / 3;
      if (mx - mn < 24 && v > 150 && v < cardBg - 5) { if (x < lineLeft) lineLeft = x; if (x > lineRight) lineRight = x; }
    }
  }

  // Pill tanggal: kotak abu-abu di band y 420..515, x 80..520.
  let pT = 9999, pB = 0, pL = 9999, pR = 0;
  for (let y = 415; y < 520; y++) {
    for (let x = 80; x < 540; x++) {
      const [r, g, b] = at(x, y);
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), v = (r + g + b) / 3;
      if (mx - mn < 18 && v > 160 && v < 222) { if (y < pT) pT = y; if (y > pB) pB = y; if (x < pL) pL = x; if (x > pR) pR = x; }
    }
  }

  const gaps = [];
  for (let i = 1; i < lineYs.length; i++) gaps.push(lineYs[i] - lineYs[i - 1]);
  gaps.sort((a, b) => a - b);
  const rowHeight = gaps.length ? gaps[Math.floor(gaps.length / 2)] : null;

  return { aapTop, aapBottom, lineYs, lineCount: lineYs.length, rowHeight, lineLeft, lineRight, datePill: { top: pT, bottom: pB, left: pL, right: pR } };
}, dataUrl);

await browser.close();
console.log(JSON.stringify(result, null, 2));
