import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const shotDir = resolve(__dirname, "..", "preview-shots");

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, deviceScaleFactor: 2 });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
// Scroll persis satu layar penuh.
await page.evaluate(() => window.scrollTo({ top: window.innerHeight, behavior: "instant" }));
await page.waitForTimeout(1000);
await page.screenshot({ path: resolve(shotDir, "after-scroll.png") });
await browser.close();
console.log("ok");
