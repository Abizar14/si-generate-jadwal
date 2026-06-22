// Penyimpanan rekap harian ke localStorage untuk membangun rekap bulanan.
// Tanpa backend — data hanya ada di browser/perangkat ini.
//
// Bentuk data: satu objek berkunci tanggal ISO ("YYYY-MM-DD"). Menyimpan ulang
// tanggal yang sama akan MENIMPA data lama (sesuai pilihan UX).

import type { FlightRow } from "./types";
import type { DailyRecap, AirlineTally, AirportTally } from "./recap";
import { buildDailyRecap } from "./recap";

const STORAGE_KEY = "sigap:monthly:v1";

/** Satu hari tersimpan. */
export interface StoredDay {
  /** Kunci tanggal "YYYY-MM-DD". */
  dateIso: string;
  /** Tanggal versi teks Indonesia (untuk tampilan). */
  dateText: string;
  /** Epoch ms saat disimpan. */
  savedAt: number;
  recap: DailyRecap;
}

/** Rekap gabungan satu bulan. */
export interface MonthlyRecap {
  /** Bulan "YYYY-MM". */
  month: string;
  /** Jumlah hari yang punya data. */
  daysCount: number;
  total: number;
  departures: number;
  arrivals: number;
  /** Rata-rata penerbangan per hari terisi (dibulatkan 1 desimal). */
  avgPerDay: number;
  airlines: AirlineTally[];
  airports: AirportTally[];
  byHour: { hour: string; count: number }[];
  busiestHour: { hour: string; count: number } | null;
  /** Hari dengan penerbangan terbanyak. */
  busiestDay: { dateIso: string; dateText: string; total: number } | null;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/** Baca semua hari tersimpan, berkunci dateIso. */
export function loadAll(): Record<string, StoredDay> {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, StoredDay>) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, StoredDay>): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Simpan rekap satu hari (dihitung dari rows). Menimpa bila dateIso sudah ada.
 * @returns objek StoredDay yang disimpan.
 */
export function saveDay(
  dateIso: string,
  dateText: string,
  rows: FlightRow[],
  savedAt: number
): StoredDay {
  const day: StoredDay = {
    dateIso,
    dateText,
    savedAt,
    recap: buildDailyRecap(rows),
  };
  const all = loadAll();
  all[dateIso] = day;
  writeAll(all);
  return day;
}

/** Hapus satu hari. */
export function deleteDay(dateIso: string): void {
  const all = loadAll();
  delete all[dateIso];
  writeAll(all);
}

/** Hapus semua data tersimpan. */
export function clearAll(): void {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** Daftar hari di bulan "YYYY-MM", diurut menaik menurut tanggal. */
export function listMonth(all: Record<string, StoredDay>, month: string): StoredDay[] {
  return Object.values(all)
    .filter((d) => d.dateIso.startsWith(month + "-"))
    .sort((a, b) => a.dateIso.localeCompare(b.dateIso));
}

/** Daftar bulan unik yang punya data, terbaru dulu ("YYYY-MM"). */
export function availableMonths(all: Record<string, StoredDay>): string[] {
  const set = new Set<string>();
  for (const d of Object.values(all)) set.add(d.dateIso.slice(0, 7));
  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

/** Gabungkan beberapa hari menjadi rekap bulanan. */
export function aggregateMonth(month: string, days: StoredDay[]): MonthlyRecap {
  const airlineMap = new Map<string, AirlineTally>();
  const airportMap = new Map<string, number>();
  const hourMap = new Map<string, number>();
  let total = 0;
  let departures = 0;
  let arrivals = 0;
  let busiestDay: MonthlyRecap["busiestDay"] = null;

  for (const d of days) {
    const r = d.recap;
    total += r.total;
    departures += r.departures;
    arrivals += r.arrivals;

    if (!busiestDay || r.total > busiestDay.total) {
      busiestDay = { dateIso: d.dateIso, dateText: d.dateText, total: r.total };
    }

    for (const a of r.airlines) {
      const cur = airlineMap.get(a.name) ?? {
        name: a.name,
        logo: a.logo,
        total: 0,
        departures: 0,
        arrivals: 0,
      };
      cur.total += a.total;
      cur.departures += a.departures;
      cur.arrivals += a.arrivals;
      if (!cur.logo && a.logo) cur.logo = a.logo;
      airlineMap.set(a.name, cur);
    }
    for (const ap of r.airports) {
      airportMap.set(ap.airport, (airportMap.get(ap.airport) ?? 0) + ap.count);
    }
    for (const h of r.byHour) {
      hourMap.set(h.hour, (hourMap.get(h.hour) ?? 0) + h.count);
    }
  }

  const airlines = Array.from(airlineMap.values()).sort((a, b) => b.total - a.total);
  const airports = Array.from(airportMap.entries())
    .map(([airport, count]) => ({ airport, count }))
    .sort((a, b) => b.count - a.count);
  const byHour = Array.from(hourMap.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));
  const busiestHour = byHour.length
    ? byHour.reduce((max, x) => (x.count > max.count ? x : max), byHour[0])
    : null;

  return {
    month,
    daysCount: days.length,
    total,
    departures,
    arrivals,
    avgPerDay: days.length ? Math.round((total / days.length) * 10) / 10 : 0,
    airlines,
    airports,
    byHour,
    busiestHour,
    busiestDay,
  };
}
