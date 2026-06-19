// Screenshot UI tema dark+mint: keadaan awal & setelah upload contoh.
// Jalankan: node scripts/theme-shot.mjs   (dev server di :3000)
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
const page = await browser.newPage({
  viewport: { width: 1440, height: 1200 },
  deviceScaleFactor: 2,
});
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await page.screenshot({ path: resolve(shotDir, "theme-empty.png"), fullPage: true });

await page.locator('input[type="file"]').first().setInputFiles(FILE);
await page.waitForSelector("text=/\\d+ slide/", { timeout: 30000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: resolve(shotDir, "theme-filled.png"), fullPage: true });

await browser.close();
console.log(JSON.stringify({ errors }, null, 2));
