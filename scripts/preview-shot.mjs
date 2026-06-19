// Driver Playwright: buka app, upload contoh-jadwal.xlsx, screenshot hasil.
// Jalankan: node scripts/preview-shot.mjs   (dev server harus jalan di :3000)
import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const shotDir = resolve(root, "preview-shots");
mkdirSync(shotDir, { recursive: true });

const URL = "http://localhost:3000";
const FILE = resolve(root, "public", "contoh-jadwal.xlsx");

const browser = await chromium.launch({ args: ["--no-sandbox"] });
// deviceScaleFactor tinggi → screenshot tiap slide tajam meski preview di-scale 0.3.
const page = await browser.newPage({
  viewport: { width: 1440, height: 1700 },
  deviceScaleFactor: 4,
});
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto(URL, { waitUntil: "networkidle" });
await page.locator('input[type="file"]').setInputFiles(FILE);
await page.waitForSelector("text=/\\d+ slide/", { timeout: 30000 });
await page.waitForTimeout(2500); // tunggu logo & font selesai

// Kartu preview (kedua slide tampak).
const previewCard = page.locator("section", { hasText: "Preview Instagram Story" });
await previewCard.screenshot({ path: resolve(shotDir, "preview-card.png") });

// Tiap slide (wadah scale 0.3) di-screenshot apa adanya — DSF 4 bikin tajam.
const boxes = page.locator("div.overflow-hidden.rounded-xl");
const n = await boxes.count();
for (let i = 0; i < n; i++) {
  await boxes.nth(i).screenshot({ path: resolve(shotDir, `slide-${i + 1}.png`) });
}

await browser.close();
console.log(JSON.stringify({ slidesShot: n, errors }, null, 2));
