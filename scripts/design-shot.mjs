import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const shotDir = resolve(root, "preview-shots");
const FILE = resolve(root, "public", "contoh-jadwal.xlsx");

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1700 }, deviceScaleFactor: 4 });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.locator('input[type="file"]').first().setInputFiles(FILE);
await page.waitForSelector("text=/\\d+ slide/", { timeout: 30000 });
await page.waitForTimeout(2500);
const box = page.locator("div.overflow-hidden.rounded-xl").first();
await box.screenshot({ path: resolve(shotDir, "design-slide1.png") });
await browser.close();
console.log("ok");
