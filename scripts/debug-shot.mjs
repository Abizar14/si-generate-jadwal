import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1400 }, deviceScaleFactor: 2 });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

// Screenshot kartu Upload (kartu 1) — pastikan slot template tampil sejak awal.
const card = page.locator("section", { hasText: "Upload Jadwal" });
await card.screenshot({ path: resolve(root, "preview-shots", "initial-card.png") });

const hasTemplate = await page.locator("text=Template gambar asli").count();
await browser.close();
console.log(JSON.stringify({ templateSectionVisible: hasTemplate > 0, errors }, null, 2));
