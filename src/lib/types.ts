// Tipe data inti aplikasi.

/** Jenis jadwal: keberangkatan atau kedatangan. */
export type FlightKind = "departure" | "arrival";

/** Satu baris jadwal penerbangan yang sudah dinormalisasi. */
export interface FlightRow {
  kind: FlightKind;
  /** Kode/no penerbangan apa adanya, mis. "WON 1472" atau "PK SNH". */
  flightNo: string;
  /** Nama bandara, mis. "BANDAR UDARA MELALAN (GHS)". */
  airport: string;
  /** Jam, mis. "09:05". */
  time: string;
  /** Conveyor bagasi (kedatangan) / boarding gate (keberangkatan), mis. "1" / "A 3". */
  info?: string;
}

/** Satu slide siap-render (1080x1920). */
export interface Slide {
  kind: FlightKind;
  /** Judul, mis. "JADWAL KEBERANGKATAN". */
  title: string;
  rows: FlightRow[];
  /** Index slide (1-based) dalam grup jenis yang sama. */
  pageIndex: number;
  /** Total slide dalam grup jenis yang sama. */
  pageCount: number;
}

/** Hasil parsing file. */
export interface ParseResult {
  departures: FlightRow[];
  arrivals: FlightRow[];
  /** Peringatan non-fatal (mis. baris dilewati karena kosong). */
  warnings: string[];
}
