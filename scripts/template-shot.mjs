// Uji mode template: upload CSV + gambar template keberangkatan, lalu screenshot.
import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const shotDir = resolve(root, "preview-shots");
mkdirSync(shotDir, { recursive: true });

const CSV = resolve(root, "public", "contoh-jadwal.csv");
const TPL = resolve(root, "public", "DESIGN JADWAL PENERBANGAN KEBERANGKATAN ASLI.png");

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1700 }, deviceScaleFactor: 4 });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

// 1) Upload data (CSV) ke input file Excel/CSV.
await page.locator('input[accept=".xlsx,.xls,.csv"]').setInputFiles(CSV);
await page.waitForSelector("text=/\\d+ slide/", { timeout: 30000 });

// 2) Upload gambar template ke input gambar pertama (keberangkatan).
await page.locator('input[accept="image/*"]').first().setInputFiles(TPL);
await page.waitForTimeout(2500); // tunggu FileReader + render overlay

// Screenshot slide pertama (keberangkatan, kini pakai template).
const boxes = page.locator("div.overflow-hidden.rounded-xl");
await boxes.first().screenshot({ path: resolve(shotDir, "template-slide-1.png") });

await browser.close();
console.log(JSON.stringify({ shot: "template-slide-1.png", errors }, null, 2));
