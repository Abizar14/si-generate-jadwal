// Verifikasi: upload contoh, klik Download, pastikan .zip terbuat (bukan error).
import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, statSync, readFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = resolve(root, "preview-shots");
mkdirSync(outDir, { recursive: true });
const FILE = resolve(root, "public", "contoh-jadwal.csv");

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ acceptDownloads: true });
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.locator('input[type="file"]').setInputFiles(FILE);
await page.waitForSelector("text=/\\d+ slide/", { timeout: 30000 });
await page.waitForTimeout(2000);

let result = { ok: false };
try {
  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 60000 }),
    page.locator("button:has-text('Download')").click(),
  ]);
  const out = resolve(outDir, await download.suggestedFilename());
  await download.saveAs(out);
  const buf = readFileSync(out);
  const isZip = buf[0] === 0x50 && buf[1] === 0x4b; // "PK"
  result = { ok: true, file: out, sizeKB: Math.round(statSync(out).size / 1024), isZip };
} catch (e) {
  // Cek banner error di UI.
  const banner = await page.locator(".bg-red-50").allTextContents().catch(() => []);
  result = { ok: false, error: String(e.message || e), banner };
}

await browser.close();
console.log(JSON.stringify({ ...result, pageErrors: errors }, null, 2));
