import * as XLSX from "xlsx";
import type { FlightKind, FlightRow, ParseResult } from "./types";

// ===== MAPPING NAMA KOLOM =====
// Aplikasi mencocokkan nama kolom secara fleksibel (huruf besar/kecil bebas,
// spasi diabaikan). Tambah alias di sini jika spreadsheet asli pakai nama lain.
const COLUMN_ALIASES = {
  kind: ["jenis", "tipe", "type", "kategori"],
  flightNo: ["nopenerbangan", "nomorpenerbangan", "flightno", "flight", "kode", "kodepenerbangan"],
  airport: ["bandara", "airport", "tujuan", "asal", "destinasi"],
  time: ["jam", "waktu", "time", "jadwal", "pukul"],
} as const;

type FieldKey = keyof typeof COLUMN_ALIASES;

/** Buang spasi & non-alfanumerik, lowercase — untuk mencocokkan header. */
function normKey(s: string): string {
  return String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Rapikan spasi berlebih pada nilai sel. */
function clean(v: unknown): string {
  return String(v ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Format nilai sel jam menjadi "HH:MM".
 *
 * SheetJS sering menyimpan jam sebagai PECAHAN HARI (mis. CSV "08:00" -> 0.3333,
 * atau file Excel dengan kolom bertipe waktu). Bila nilainya angka, konversi
 * balik ke "HH:MM"; selain itu rapikan apa adanya (mis. teks "08:00").
 */
function formatTimeCell(v: unknown): string {
  if (typeof v === "number" && Number.isFinite(v)) {
    const frac = v - Math.floor(v); // buang bagian tanggal bila ada
    let mins = Math.round(frac * 24 * 60);
    if (mins >= 24 * 60) mins -= 24 * 60;
    const hh = Math.floor(mins / 60);
    const mm = mins % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }
  return clean(v);
}

/** Tebak FlightKind dari teks kolom "Jenis" atau nama sheet. */
function detectKind(text: string): FlightKind | null {
  const t = text.toLowerCase();
  if (/(berangkat|departure|depart|keluar|out)/.test(t)) return "departure";
  if (/(datang|arrival|arrive|masuk|in)/.test(t)) return "arrival";
  return null;
}

/** Petakan header baris pertama -> indeks kolom untuk tiap field. */
function mapHeaders(header: string[]): Partial<Record<FieldKey, number>> {
  const map: Partial<Record<FieldKey, number>> = {};
  header.forEach((h, idx) => {
    const nk = normKey(h);
    (Object.keys(COLUMN_ALIASES) as FieldKey[]).forEach((field) => {
      if (map[field] !== undefined) return;
      const aliases = COLUMN_ALIASES[field] as readonly string[];
      if (aliases.some((a) => nk === a || nk.includes(a))) {
        map[field] = idx;
      }
    });
  });
  return map;
}

/**
 * Parse satu worksheet menjadi baris penerbangan.
 * @param defaultKind dipakai bila tidak ada kolom "Jenis" (mis. dari nama sheet).
 */
function parseSheet(
  ws: XLSX.WorkSheet,
  defaultKind: FlightKind | null,
  warnings: string[],
  sheetLabel: string
): FlightRow[] {
  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    blankrows: false,
    defval: "",
  });
  if (rows.length === 0) return [];

  // Cari baris header (baris pertama yang mengandung minimal kolom flightNo+time).
  let headerIdx = -1;
  let colMap: Partial<Record<FieldKey, number>> = {};
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const candidate = (rows[i] as unknown[]).map((c) => clean(c));
    const m = mapHeaders(candidate);
    if (m.flightNo !== undefined && (m.time !== undefined || m.airport !== undefined)) {
      headerIdx = i;
      colMap = m;
      break;
    }
  }

  if (headerIdx === -1) {
    warnings.push(`Sheet "${sheetLabel}": tidak menemukan baris header yang cocok, dilewati.`);
    return [];
  }
  if (colMap.flightNo === undefined) {
    warnings.push(`Sheet "${sheetLabel}": kolom "No Penerbangan" tidak ditemukan.`);
    return [];
  }

  const out: FlightRow[] = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i] as unknown[];
    const flightNo = clean(r[colMap.flightNo!]);
    const airport = colMap.airport !== undefined ? clean(r[colMap.airport]) : "";
    const time = colMap.time !== undefined ? formatTimeCell(r[colMap.time]) : "";

    // Lewati baris kosong (toleransi).
    if (!flightNo && !airport && !time) continue;
    if (!flightNo) {
      warnings.push(`Sheet "${sheetLabel}" baris ${i + 1}: tanpa no penerbangan, dilewati.`);
      continue;
    }

    let kind: FlightKind | null = defaultKind;
    if (colMap.kind !== undefined) {
      const k = detectKind(clean(r[colMap.kind]));
      if (k) kind = k;
    }
    if (!kind) {
      warnings.push(
        `Sheet "${sheetLabel}" baris ${i + 1}: jenis (kedatangan/keberangkatan) tidak jelas, dilewati.`
      );
      continue;
    }

    out.push({ kind, flightNo, airport, time });
  }
  return out;
}

/** Cek apakah worksheet punya kolom "Jenis". */
function sheetHasKindColumn(ws: XLSX.WorkSheet): boolean {
  const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: "" });
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const m = mapHeaders((rows[i] as unknown[]).map((c) => clean(c)));
    if (m.kind !== undefined) return true;
  }
  return false;
}

/**
 * Parse seluruh workbook menjadi daftar departures & arrivals.
 *
 * Aturan penentuan jenis:
 *  - Jika ada kolom "Jenis", pakai itu.
 *  - Kalau tidak, coba tebak dari NAMA SHEET (mis. sheet "Kedatangan").
 *  - Kalau workbook hanya 1 sheet tanpa kolom Jenis & nama sheet netral,
 *    semua dianggap keberangkatan + beri peringatan.
 */
export function parseWorkbook(wb: XLSX.WorkBook): ParseResult {
  const warnings: string[] = [];
  const departures: FlightRow[] = [];
  const arrivals: FlightRow[] = [];

  wb.SheetNames.forEach((name) => {
    const ws = wb.Sheets[name];
    if (!ws) return;

    const hasKindCol = sheetHasKindColumn(ws);
    let defaultKind: FlightKind | null = detectKind(name);

    if (!hasKindCol && !defaultKind && wb.SheetNames.length === 1) {
      defaultKind = "departure";
      warnings.push(
        `Tidak ada kolom "Jenis" dan nama sheet netral — semua baris dianggap KEBERANGKATAN. ` +
          `Tambahkan kolom "Jenis" atau beri nama sheet "Kedatangan"/"Keberangkatan" untuk memisahkan.`
      );
    }

    const rows = parseSheet(ws, defaultKind, warnings, name);
    for (const row of rows) {
      if (row.kind === "departure") departures.push(row);
      else arrivals.push(row);
    }
  });

  return { departures, arrivals, warnings };
}

/** Baca File (dari input upload) menjadi ParseResult. Throw Error jika gagal. */
export async function parseFile(file: File): Promise<ParseResult> {
  const name = file.name.toLowerCase();
  if (!/\.(xlsx|xls|csv)$/.test(name)) {
    throw new Error(
      `Format file tidak didukung: "${file.name}". Gunakan .xlsx, .xls, atau .csv.`
    );
  }

  let wb: XLSX.WorkBook;
  try {
    const buf = await file.arrayBuffer();
    wb = XLSX.read(buf, { type: "array" });
  } catch {
    throw new Error("Gagal membaca file. Pastikan file tidak rusak dan formatnya benar.");
  }

  if (!wb.SheetNames.length) {
    throw new Error("File tidak berisi sheet apa pun.");
  }

  const result = parseWorkbook(wb);
  if (result.departures.length === 0 && result.arrivals.length === 0) {
    throw new Error(
      "Tidak ada data penerbangan yang terbaca. Pastikan ada kolom: " +
        "Jenis, No Penerbangan, Bandara, Jam."
    );
  }
  return result;
}
