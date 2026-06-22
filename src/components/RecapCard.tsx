"use client";

import {
  BarChart3,
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  Building2,
  Plane,
} from "lucide-react";
import { useMemo } from "react";
import type { FlightRow } from "@/lib/types";
import { buildDailyRecap } from "@/lib/recap";

/**
 * Kartu rekap harian — ringkasan jumlah penerbangan, sebaran per maskapai,
 * bandara terbanyak, dan jam tersibuk. Dihitung dari baris yang sedang diedit.
 */
export default function RecapCard({
  rows,
  dateText,
}: {
  rows: FlightRow[];
  dateText: string;
}) {
  const recap = useMemo(() => buildDailyRecap(rows), [rows]);
  const maxAirline = recap.airlines[0]?.total ?? 1;
  const maxHour = recap.busiestHour?.count ?? 1;

  if (recap.total === 0) return null;

  return (
    <section className="glass glass-hover p-5 sm:p-7">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-mint/10 text-mint ring-1 ring-mint/20">
          <BarChart3 className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-heading text-lg font-bold text-fg">Rekap Harian</h2>
          <p className="text-sm text-muted">{dateText}</p>
        </div>
      </div>

      {/* Angka utama */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatBox icon={<Plane className="h-4 w-4" style={{ transform: "rotate(45deg)" }} />} label="Total" value={recap.total} />
        <StatBox icon={<PlaneTakeoff className="h-4 w-4" />} label="Berangkat" value={recap.departures} />
        <StatBox icon={<PlaneLanding className="h-4 w-4" />} label="Datang" value={recap.arrivals} />
      </div>

      {/* Per maskapai */}
      <div className="mt-6">
        <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-fg">
          <Plane className="h-4 w-4 text-mint" style={{ transform: "rotate(45deg)" }} /> Per maskapai
        </h3>
        <ul className="space-y-2.5">
          {recap.airlines.map((a) => (
            <li key={a.name} className="flex items-center gap-3">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-white/[0.04] ring-1 ring-line">
                {a.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.logo} alt={a.name} className="h-full w-full object-contain p-0.5" />
                ) : (
                  <Plane className="h-3.5 w-3.5 text-muted" style={{ transform: "rotate(45deg)" }} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-fg">{a.name}</span>
                  <span className="flex-shrink-0 text-xs text-muted">
                    {a.departures}↑ · {a.arrivals}↓ ·{" "}
                    <span className="font-semibold text-mint">{a.total}</span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full bg-mint"
                    style={{ width: `${(a.total / maxAirline) * 100}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Jam tersibuk + sebaran */}
      {recap.busiestHour && (
        <div className="mt-6">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-fg">
            <Clock className="h-4 w-4 text-mint" /> Jam tersibuk
          </h3>
          <p className="mb-3 text-sm text-muted">
            <span className="font-semibold text-fg">{recap.busiestHour.hour}:00</span> —{" "}
            {recap.busiestHour.count} penerbangan
          </p>
          <div className="flex items-end gap-1">
            {recap.byHour.map((h) => (
              <div key={h.hour} className="flex flex-1 flex-col items-center gap-1" title={`${h.hour}:00 — ${h.count}`}>
                <div
                  className="w-full rounded-sm bg-mint/70"
                  style={{ height: `${Math.max(4, (h.count / maxHour) * 40)}px` }}
                />
                <span className="text-[9px] text-muted">{h.hour}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bandara terbanyak */}
      {recap.airports.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-fg">
            <Building2 className="h-4 w-4 text-mint" /> Bandara terbanyak
          </h3>
          <div className="flex flex-wrap gap-2">
            {recap.airports.slice(0, 6).map((a) => (
              <span
                key={a.airport}
                className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-muted ring-1 ring-line"
              >
                {a.airport} <span className="font-semibold text-mint">{a.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-line bg-white/[0.02] px-2 py-3 text-center">
      <span className="text-mint">{icon}</span>
      <span className="text-2xl font-bold text-fg">{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  );
}
