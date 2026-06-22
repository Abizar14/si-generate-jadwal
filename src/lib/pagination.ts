import type { FlightKind, FlightRow, Slide } from "./types";

// ===== BATAS BARIS PER SLIDE =====
// Kasus normal = 1 slide (muat penuh). Jika baris melebihi batas ini,
// otomatis dipecah jadi beberapa slide. Ubah angka ini sesuai kebutuhan.
export const MAX_ROWS_PER_SLIDE = 15;

const TITLE: Record<FlightKind, string> = {
  departure: "JADWAL KEBERANGKATAN",
  arrival: "JADWAL KEDATANGAN",
};

/** Pecah satu grup (departures atau arrivals) menjadi slide-slide. */
function paginateGroup(
  kind: FlightKind,
  rows: FlightRow[],
  maxRows: number
): Slide[] {
  if (rows.length === 0) return [];
  const chunks: FlightRow[][] = [];
  for (let i = 0; i < rows.length; i += maxRows) {
    chunks.push(rows.slice(i, i + maxRows));
  }
  return chunks.map((chunk, idx) => ({
    kind,
    title: TITLE[kind],
    rows: chunk,
    pageIndex: idx + 1,
    pageCount: chunks.length,
  }));
}

/**
 * Bangun semua slide dari departures + arrivals.
 * Keberangkatan tampil lebih dulu, lalu kedatangan.
 */
export function buildSlides(
  departures: FlightRow[],
  arrivals: FlightRow[],
  maxRows: number = MAX_ROWS_PER_SLIDE
): Slide[] {
  return [
    ...paginateGroup("departure", departures, maxRows),
    ...paginateGroup("arrival", arrivals, maxRows),
  ];
}
