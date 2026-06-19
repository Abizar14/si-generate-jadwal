// Membuat file contoh jadwal: public/contoh-jadwal.{xlsx,xls,csv}
// Data sesuai desain "JADWAL KEBERANGKATAN/KEDATANGAN" APT Pranoto Airport
// (Rabu, 17 Juni 2026). Jalankan: npm run sample
import * as XLSX from "xlsx";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, "..", "public");
mkdirSync(outDir, { recursive: true });

const rows = [
  ["Jenis", "No Penerbangan", "Bandara", "Jam"],

  // ===== KEBERANGKATAN =====
  ["Keberangkatan", "PK SNH", "BANDAR UDARA LONG APUNG (LPU)", "08:00"],
  ["Keberangkatan", "WON 1472", "BANDAR UDARA MELALAN (GHS)", "09:05"],
  ["Keberangkatan", "SJV 659", "BANDAR UDARA YOGYAKARTA (YIA)", "09:25"],
  ["Keberangkatan", "CTV 461", "BANDAR UDARA JUANDA (SUB)", "11:00"],
  ["Keberangkatan", "PK SNH", "BANDAR UDARA MARATUA (RTU)", "11:10"],
  ["Keberangkatan", "WON 1480", "BANDAR UDARA SYAMSUDIN NOOR (BDJ)", "11:25"],
  ["Keberangkatan", "GIA 581", "BANDAR UDARA SOEKARNO HATTA (CGK)", "12:20"],
  ["Keberangkatan", "SJV 653", "BANDAR UDARA JUANDA (SUB)", "12:30"],
  ["Keberangkatan", "BTK 6257", "BANDAR UDARA SOEKARNO HATTA (CGK)", "13:00"],
  ["Keberangkatan", "WON 1484", "BANDAR UDARA KALIMARAU (BEJ)", "14:05"],
  ["Keberangkatan", "SJV 641", "BANDAR UDARA JUANDA (SUB)", "14:40"],
  ["Keberangkatan", "CTV 423", "BANDAR UDARA SOEKARNO HATTA (CGK)", "15:00"],
  ["Keberangkatan", "BTK 6677", "BANDAR UDARA SOEKARNO HATTA (CGK)", "17:35"],

  // ===== KEDATANGAN =====
  ["Kedatangan", "WON 1481", "BANDAR UDARA SYAMSUDIN NOOR (BDJ)", "08:20"],
  ["Kedatangan", "SJV 640", "BANDAR UDARA JUANDA (SUB)", "08:40"],
  ["Kedatangan", "CTV 460", "BANDAR UDARA JUANDA (SUB)", "10:30"],
  ["Kedatangan", "PK SNH", "BANDAR UDARA LONG APUNG (LPU)", "10:50"],
  ["Kedatangan", "WON 1479", "BANDAR UDARA MELALAN (GHS)", "11:00"],
  ["Kedatangan", "GIA 580", "BANDAR UDARA SOEKARNO HATTA (CGK)", "11:20"],
  ["Kedatangan", "SJV 652", "BANDAR UDARA JUANDA (SUB)", "11:50"],
  ["Kedatangan", "BTK 6256", "BANDAR UDARA SOEKARNO HATTA (CGK)", "12:20"],
  ["Kedatangan", "WON 1485", "BANDAR UDARA KALIMARAU (BEJ)", "13:35"],
  ["Kedatangan", "PK SNH", "BANDAR UDARA MARATUA (RTU)", "13:50"],
  ["Kedatangan", "SJV 658", "BANDAR UDARA YOGYAKARTA (YIA)", "14:00"],
  ["Kedatangan", "CTV 422", "BANDAR UDARA SOEKARNO HATTA (CGK)", "14:30"],
  ["Kedatangan", "BTK 6676", "BANDAR UDARA SOEKARNO HATTA (CGK)", "16:55"],
];

// Satu sheet dengan kolom "Jenis" untuk memisahkan keberangkatan & kedatangan.
const ws = XLSX.utils.aoa_to_sheet(rows);
// Lebar kolom agar enak dibaca saat dibuka di Excel.
ws["!cols"] = [{ wch: 14 }, { wch: 16 }, { wch: 38 }, { wch: 8 }];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Jadwal");

// Build ESM SheetJS tidak otomatis menulis ke disk; pakai buffer + fs.
const xlsxBuf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
writeFileSync(resolve(outDir, "contoh-jadwal.xlsx"), xlsxBuf);

// Format .xls lama (BIFF8) — sebagian instansi masih memakainya.
const xlsBuf = XLSX.write(wb, { type: "buffer", bookType: "xls" });
writeFileSync(resolve(outDir, "contoh-jadwal.xls"), xlsBuf);

// CSV
const csv = XLSX.utils.sheet_to_csv(ws);
writeFileSync(resolve(outDir, "contoh-jadwal.csv"), csv, "utf8");

console.log(
  "Berhasil membuat public/contoh-jadwal.{xlsx,xls,csv} " +
    `(${rows.length - 1} baris penerbangan).`
);
