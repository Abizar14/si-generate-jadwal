import type { FlightKind, FlightRow, ParseResult } from "./types";

// ===== PARSER PDF JADWAL AMC (APT Pranoto) =====
// Template harian dari Apron Movement Control: dua tabel (KEDATANGAN lalu
// KEBERANGKATAN). Kita ambil: kode penerbangan + bandara + jam tiap baris.
// Nama bandara panjang dari PDF dirapikan ke gaya desain "BANDAR UDARA … (KODE)".

const AIRPORTS: [RegExp, string][] = [
  [/SYAMSUDIN\s*NOOR/i, "BANDAR UDARA SYAMSUDIN NOOR (BDJ)"],
  [/JUANDA/i, "BANDAR UDARA JUANDA (SUB)"],
  [/LONG\s*APUNG/i, "BANDAR UDARA LONG APUNG (LPU)"],
  [/MELALAN|MELAK/i, "BANDAR UDARA MELALAN (GHS)"],
  [/SOEKARNO/i, "BANDAR UDARA SOEKARNO HATTA (CGK)"],
  [/SEPINGGAN|BALIKPAPAN/i, "BANDAR UDARA SEPINGGAN (BPN)"],
  [/KALIMARAU|BERAU/i, "BANDAR UDARA KALIMARAU (BEJ)"],
  [/MARATUA/i, "BANDAR UDARA MARATUA (RTU)"],
  [/YOGYAKARTA/i, "BANDAR UDARA YOGYAKARTA (YIA)"],
  [/UYANG\s*LAHAI/i, "BANDAR UDARA UYANG LAHAI (MHU)"],
  [/DATAH\s*DAWAI/i, "BANDAR UDARA DATAH DAWAI (DTD)"],
];

function mapAirport(raw: string, warnings: string[]): string {
  for (const [re, name] of AIRPORTS) if (re.test(raw)) return name;
  const cleaned = raw.replace(/\s+/g, " ").trim();
  warnings.push(`Bandara belum dikenal: "${cleaned}" — silakan rapikan manual di tabel.`);
  return cleaned;
}

function fmtTime(t: string): string {
  const [h, m] = t.split(":");
  return `${h.padStart(2, "0")}:${m}`;
}

/** "PK-SNH" → "PK SNH" agar konsisten + cocok dgn pencocokan logo. */
function normFlight(code: string): string {
  return code.replace(/-/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
}

// Baris = KODE (WON 1481 / PK-SNH) + NAMA BANDARA + JAM (8:20:00) + (opsional)
// kolom terakhir: kedatangan → conveyor (angka), keberangkatan → gate ("A 3"/"-").
const FLIGHT = "(PK-?[A-Z]{2,3}|[A-Z]{2,3}\\s\\d{3,4})";
const TIME = "(\\d{1,2}:\\d{2}:\\d{2})";
const ARR_RE = new RegExp(`${FLIGHT}\\s+(.+?)\\s+${TIME}(?:\\s+(\\d))?`, "g");
const DEP_RE = new RegExp(`${FLIGHT}\\s+(.+?)\\s+${TIME}(?:\\s+([AB]\\s?\\d|-))?`, "g");

function parseSection(text: string, kind: FlightKind, warnings: string[]): FlightRow[] {
  const out: FlightRow[] = [];
  const re = kind === "arrival" ? ARR_RE : DEP_RE;
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out.push({
      kind,
      flightNo: normFlight(m[1]),
      airport: mapAirport(m[2], warnings),
      time: fmtTime(m[3]),
      info: (m[4] ?? "").replace(/\s+/g, " ").trim(),
    });
  }
  return out;
}

/** Baca PDF jadwal AMC menjadi ParseResult (client-side, pakai pdf.js). */
export async function parsePdfFile(file: File): Promise<ParseResult> {
  const pdfjs: any = await import("pdfjs-dist");
  // Worker dari CDN, versinya disamakan dgn paket terpasang.
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  let fullText = "";
  try {
    const buf = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data: buf }).promise;
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      fullText +=
        content.items
          .map((it: { str?: string }) => (typeof it.str === "string" ? it.str : ""))
          .join(" ") + " ";
    }
  } catch {
    throw new Error(
      "Gagal membaca PDF. Pastikan file tidak rusak dan berupa PDF teks (bukan hasil scan gambar)."
    );
  }

  const text = fullText.replace(/\s+/g, " ");
  const warnings: string[] = [];

  // Catatan: pdf.js menaruh JUDUL bagian (ARRIVAL/DEPARTURE) di AKHIR aliran teks,
  // tapi HEADER KOLOM tiap tabel muncul tepat sebelum barisnya:
  //   tabel kedatangan → "( NOMOR CONVEYOR )", tabel keberangkatan → "( BOARDING GATE )".
  // Jadi pemisah yang andal = "BOARDING GATE".
  const depIdx = text.search(/BOARDING\s*GATE/i);

  let arrivals: FlightRow[] = [];
  let departures: FlightRow[] = [];

  if (depIdx >= 0) {
    arrivals = parseSection(text.slice(0, depIdx), "arrival", warnings);
    departures = parseSection(text.slice(depIdx), "departure", warnings);
  } else {
    departures = parseSection(text, "departure", warnings);
    warnings.push(
      'Penanda tabel keberangkatan ("BOARDING GATE") tidak ditemukan — semua baris dianggap KEBERANGKATAN.'
    );
  }

  if (arrivals.length === 0 && departures.length === 0) {
    throw new Error(
      "Tidak ada baris penerbangan terbaca dari PDF. Pastikan ini PDF jadwal AMC (tabel teks), bukan hasil scan."
    );
  }

  return { departures, arrivals, warnings: Array.from(new Set(warnings)) };
}
