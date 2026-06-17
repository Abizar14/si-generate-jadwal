// Membuat file contoh: public/contoh-jadwal.xlsx dan public/contoh-jadwal.csv
// Jalankan: npm run sample
import * as XLSX from "xlsx";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "..", "public");
mkdirSync(outDir, { recursive: true });

const rows = [
  ["Jenis", "No Penerbangan", "Bandara", "Jam"],
  // Keberangkatan
  ["Keberangkatan", "PK SNH", "BANDAR UDARA LONG APUNG (LPU)", "08:00"],
  ["Keberangkatan", "WON 1472", "BANDAR UDARA MELALAN (GHS)", "09:05"],
  ["Keberangkatan", "SJV 659", "BANDAR UDARA YOGYAKARTA (YIA)", "09:25"],
  ["Keberangkatan", "CTV 461", "BANDAR UDARA JUANDA (SUB)", "11:00"],
  ["Keberangkatan", "GIA 581", "BANDAR UDARA SOEKARNO HATTA (CGK)", "12:20"],
  ["Keberangkatan", "BTK 6257", "BANDAR UDARA SOEKARNO HATTA (CGK)", "13:00"],
  // Kedatangan
  ["Kedatangan", "WON 1481", "BANDAR UDARA SYAMSUDIN NOOR (BDJ)", "08:20"],
  ["Kedatangan", "SJV 640", "BANDAR UDARA JUANDA (SUB)", "08:40"],
  ["Kedatangan", "CTV 460", "BANDAR UDARA JUANDA (SUB)", "10:30"],
  ["Kedatangan", "GIA 580", "BANDAR UDARA SOEKARNO HATTA (CGK)", "11:20"],
  ["Kedatangan", "BTK 6256", "BANDAR UDARA SOEKARNO HATTA (CGK)", "12:20"],
];

// XLSX (satu sheet dengan kolom "Jenis")
const ws = XLSX.utils.aoa_to_sheet(rows);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Jadwal");
// Build ESM SheetJS tidak otomatis menulis ke disk; pakai buffer + fs.
const xlsxBuf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
writeFileSync(resolve(outDir, "contoh-jadwal.xlsx"), xlsxBuf);

// CSV
const csv = XLSX.utils.sheet_to_csv(ws);
writeFileSync(resolve(outDir, "contoh-jadwal.csv"), csv, "utf8");

console.log("Berhasil membuat public/contoh-jadwal.xlsx dan public/contoh-jadwal.csv");
