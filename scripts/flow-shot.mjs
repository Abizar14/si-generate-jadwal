// Uji alur: upload template dulu (preview tampil), lalu CSV (ter-overlay).
import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const shotDir = resolve(root, "preview-shots");
const CSV = resolve(root, "public", "contoh-jadwal.csv");
const TPL = resolve(root, "public", "DESIGN JADWAL PENERBANGAN KEBERANGKATAN ASLI.png");

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1500 }, deviceScaleFactor: 2 });
const errors = [];
page.on("console", (m) => errors.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
await page.waitForSelector('input[accept="image/*"]', { state: "attached", timeout: 30000 });
const preview = page.locator("section", { hasText: "Preview Instagram Story" });

// 1) Upload template keberangkatan dulu (lewat filechooser, paling realistis).
const [chooser] = await Promise.all([
  page.waitForEvent("filechooser"),
  page.locator('label:has-text("Keberangkatan")').first().click(),
]);
await chooser.setFiles(TPL);
await page.waitForTimeout(1500);
const diag = await page.evaluate(() => {
  const inp = document.querySelector('input[accept="image/*"]');
  return {
    filesInInput: inp?.files?.length ?? -1,
    fileName: inp?.files?.[0]?.name ?? null,
    fileType: inp?.files?.[0]?.type ?? null,
    terpasang: document.body.innerText.includes("terpasang"),
  };
});
console.log("DIAG:", JSON.stringify(diag));
let step1ImgOk = true;
try {
  await preview.locator("img").first().waitFor({ state: "visible", timeout: 12000 });
} catch {
  step1ImgOk = false;
}
await page.waitForTimeout(800);
const step1Text = await preview.innerText();
await preview.screenshot({ path: resolve(shotDir, "flow-1-template-only.png") });

// 2) Lalu upload CSV.
await page.locator('input[accept=".xlsx,.xls,.csv"]').setInputFiles(CSV);
await page.waitForSelector("text=/\\d+ slide/", { timeout: 30000 });
await page.waitForTimeout(2000);
await preview.screenshot({ path: resolve(shotDir, "flow-2-with-data.png") });

// 3) Buktikan editor jadwal muncul di kartu upload.
const uploadCard = page.locator("section", { hasText: "Upload Jadwal" });
await uploadCard.scrollIntoViewIfNeeded();
const editorVisible = await page.locator("text=Edit Jadwal").count();
await uploadCard.screenshot({ path: resolve(shotDir, "flow-3-editor.png") });

await browser.close();
console.log("editorVisible:", editorVisible > 0);
console.log(JSON.stringify({ step1ImgOk, step1PreviewText: step1Text.slice(0, 160), errors }, null, 2));
