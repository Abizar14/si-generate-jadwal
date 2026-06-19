// Screenshot 3 kartu bawah (Palet/Cara Pakai/Tips) setelah animasi masuk.
import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const shotDir = resolve(root, "preview-shots");
mkdirSync(shotDir, { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
  permissions: ["clipboard-read", "clipboard-write"],
});
const page = await context.newPage();
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.locator("#tips").scrollIntoViewIfNeeded();
await page.waitForTimeout(1600); // tunggu entrance + stagger selesai
await page.locator("#tips").screenshot({ path: resolve(shotDir, "cards-row.png") });

// Hover swatch Mint untuk memunculkan ikon copy + state hover hex.
const mintSwatch = page.getByTitle("Salin #34E3A4");
await mintSwatch.hover();
await page.waitForTimeout(400);
await mintSwatch.click(); // copy → toast "Tersalin!"
await page.waitForTimeout(300);
await page.locator("#tips > div").first().screenshot({
  path: resolve(shotDir, "cards-palette-copied.png"),
});

await browser.close();
console.log(JSON.stringify({ errors }, null, 2));
