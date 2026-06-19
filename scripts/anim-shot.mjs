// Screenshot animasi/scroll: navbar transparan vs solid + indikator section, footer.
import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const shotDir = resolve(root, "preview-shots");
mkdirSync(shotDir, { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({
  viewport: { width: 1280, height: 820 },
  deviceScaleFactor: 2,
});
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(1300); // hero stagger selesai

// 1) Navbar transparan + hero (di paling atas).
await page.screenshot({ path: resolve(shotDir, "anim-hero-top.png") });

// 2) Scroll ke #upload → navbar solid + indikator "Generate" aktif.
await page.locator("#upload").scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await page.locator("header").screenshot({ path: resolve(shotDir, "anim-navbar-solid.png") });

// 3) Footer (social icons).
await page.locator("#kontak").scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await page.locator("footer").screenshot({ path: resolve(shotDir, "anim-footer.png") });

await browser.close();
console.log(JSON.stringify({ errors }, null, 2));
