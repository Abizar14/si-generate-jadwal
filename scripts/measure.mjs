// Ukur overflow kartu baris jadwal pada slide pertama (1080x1920).
import { chromium } from "playwright";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, "..", "public", "contoh-jadwal.csv");

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await browser.newPage();
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.locator('input[type="file"]').setInputFiles(FILE);
await page.waitForSelector("text=/\\d+ slide/", { timeout: 30000 });
await page.waitForTimeout(1500);

const data = await page.evaluate(() => {
  // Cari node DesignTemplate ukuran asli pertama (width 1080).
  const all = [...document.querySelectorAll("div")];
  const tmpl = all.find((d) => d.style.width === "1080px" && d.style.height === "1920px");
  if (!tmpl) return { error: "template node tidak ketemu" };
  // Kartu putih = div dengan borderRadius 24px & background putih di dalam tmpl.
  const card = [...tmpl.querySelectorAll("div")].find(
    (d) => d.style.borderRadius === "24px" && d.style.background.includes("255")
  );
  // Fallback: cari yang punya banyak anak (baris).
  const rowsCard = card || [...tmpl.querySelectorAll("div")].sort((a, b) => b.children.length - a.children.length)[0];
  return {
    cardClientH: rowsCard.clientHeight,
    cardScrollH: rowsCard.scrollHeight,
    overflowPx: rowsCard.scrollHeight - rowsCard.clientHeight,
    rowCount: rowsCard.children.length,
    firstRowH: rowsCard.children[0]?.getBoundingClientRect().height,
  };
});

await browser.close();
console.log(JSON.stringify(data, null, 2));
