// Render slide KEBERANGKATAN (template overlay) pada resolusi penuh 1080x1920.
import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const CSV = resolve(root, "public", "contoh-jadwal.csv");
const TPL = resolve(root, "public", "DESIGN JADWAL PENERBANGAN KEBERANGKATAN ASLI.png");

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 2100 } });
await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
await page.waitForSelector('label:has-text("Keberangkatan")', { state: "visible", timeout: 30000 });

const [chooser] = await Promise.all([
  page.waitForEvent("filechooser"),
  page.locator('label:has-text("Keberangkatan")').first().click(),
]);
await chooser.setFiles(TPL);
await page.locator('input[accept=".xlsx,.xls,.csv"]').setInputFiles(CSV);
await page.waitForSelector("text=/\\d+ slide/", { timeout: 30000 });
await page.waitForTimeout(2500);

// Unscale: matikan transform scale agar node tampil 1080x1920 penuh.
await page.evaluate(() => {
  document.querySelectorAll("div").forEach((d) => {
    if (d.style.transform && d.style.transform.includes("scale(")) {
      d.style.transform = "none";
      const p = d.parentElement;
      if (p) { p.style.width = "1080px"; p.style.height = "1920px"; p.style.overflow = "visible"; }
    }
  });
});
await page.waitForTimeout(400);

const node = page.locator('div:has(> img[alt="Template desain"])').first();
await node.screenshot({ path: resolve(root, "preview-shots", "fullres-keberangkatan.png") });
await browser.close();
console.log("done");
