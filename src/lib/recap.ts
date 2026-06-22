// Hitung rekap harian dari daftar penerbangan yang sudah di-parse.
// Murni client-side, tanpa dependensi eksternal — aman dipanggil di render.

import type { FlightRow } from "./types";
import { findAirlineLogo, logoPath } from "./airlineLogos";

/** Ringkasan satu maskapai dalam rekap. */
export interface AirlineTally {
  /** Nama maskapai (atau prefix kode bila tak dikenal). */
  name: string;
  /** Path logo bila dikenal, selain itu null (tampilkan placeholder). */
  logo: string | null;
  total: number;
  departures: number;
  arrivals: number;
}

/** Ringkasan satu bandara (tujuan/asal). */
export interface AirportTally {
  airport: string;
  count: number;
}

/** Hasil rekap harian lengkap. */
export interface DailyRecap {
  total: number;
  departures: number;
  arrivals: number;
  /** Maskapai diurut dari yang terbanyak. */
  airlines: AirlineTally[];
  /** Bandara terbanyak (gabungan tujuan & asal), diurut menurun. */
  airports: AirportTally[];
  /** Jam tersibuk "HH" beserta jumlahnya; null bila tak ada jam valid. */
  busiestHour: { hour: string; count: number } | null;
  /** Sebaran per jam (0–23), hanya jam yang punya penerbangan. */
  byHour: { hour: string; count: number }[];
}

/** Ambil label maskapai: nama dikenal, atau token pertama kode sebagai fallback. */
function airlineLabel(flightNo: string): { name: string; logo: string | null } {
  const found = findAirlineLogo(flightNo);
  if (found) return { name: found.name, logo: logoPath(found.file) };
  const prefix = flightNo.trim().split(/\s+/)[0]?.toUpperCase() || "Lainnya";
  return { name: prefix, logo: null };
}

/** Ambil jam ("HH") dari nilai waktu "HH:MM"; null bila tak valid. */
function hourOf(time: string): string | null {
  const m = /^(\d{1,2}):/.exec(time.trim());
  if (!m) return null;
  const h = Number(m[1]);
  if (!Number.isFinite(h) || h < 0 || h > 23) return null;
  return String(h).padStart(2, "0");
}

/** Susun rekap harian dari baris penerbangan. */
export function buildDailyRecap(rows: FlightRow[]): DailyRecap {
  const departures = rows.filter((r) => r.kind === "departure").length;
  const arrivals = rows.filter((r) => r.kind === "arrival").length;

  const airlineMap = new Map<string, AirlineTally>();
  const airportMap = new Map<string, number>();
  const hourMap = new Map<string, number>();

  for (const r of rows) {
    const { name, logo } = airlineLabel(r.flightNo);
    const a = airlineMap.get(name) ?? { name, logo, total: 0, departures: 0, arrivals: 0 };
    a.total += 1;
    if (r.kind === "departure") a.departures += 1;
    else a.arrivals += 1;
    airlineMap.set(name, a);

    const airport = r.airport.trim();
    if (airport) airportMap.set(airport, (airportMap.get(airport) ?? 0) + 1);

    const h = hourOf(r.time);
    if (h) hourMap.set(h, (hourMap.get(h) ?? 0) + 1);
  }

  const airlines = Array.from(airlineMap.values()).sort((a, b) => b.total - a.total);
  const airports = Array.from(airportMap.entries())
    .map(([airport, count]) => ({ airport, count }))
    .sort((a, b) => b.count - a.count);
  const byHour = Array.from(hourMap.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour.localeCompare(b.hour));
  const busiestHour = byHour.length
    ? byHour.reduce((max, x) => (x.count > max.count ? x : max))
    : null;

  return {
    total: rows.length,
    departures,
    arrivals,
    airlines,
    airports,
    busiestHour,
    byHour,
  };
}
