// Salin worker pdf.js ke /public agar dilayani lokal (bukan CDN) dan versinya
// selalu sinkron dgn paket pdfjs-dist terpasang. Dipanggil otomatis lewat
// script predev/prebuild di package.json.
import { copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Pakai worker dari "legacy" build (pdf.js v3, ES5 .js) agar jalan di Safari
// iOS lama / in-app browser HP. Harus sepasang dgn import legacy di parsePdf.ts.
const src = resolve(root, "node_modules/pdfjs-dist/legacy/build/pdf.worker.min.js");
const dest = resolve(root, "public/pdf.worker.min.js");

if (!existsSync(src)) {
  console.error(`[copy-pdf-worker] Tidak ditemukan: ${src}\nJalankan "npm install" dulu.`);
  process.exit(1);
}

await mkdir(dirname(dest), { recursive: true });
await copyFile(src, dest);
console.log(`[copy-pdf-worker] Worker disalin → public/pdf.worker.min.js`);
