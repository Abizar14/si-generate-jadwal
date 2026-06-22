"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarRange,
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  Building2,
  TrendingUp,
  Trash2,
  Database,
} from "lucide-react";
import {
  loadAll,
  listMonth,
  availableMonths,
  aggregateMonth,
  deleteDay,
  clearAll,
  type StoredDay,
} from "@/lib/monthlyStore";
import { bulanLabel } from "@/lib/formatDate";

/**
 * Rekap bulanan — menggabungkan ringkasan harian yang tersimpan di localStorage.
 * `reloadKey` dinaikkan oleh halaman tiap kali ada hari baru disimpan supaya
 * komponen ini membaca ulang datanya.
 */
export default function MonthlyRecap({ reloadKey }: { reloadKey: number }) {
  const [all, setAll] = useState<Record<string, StoredDay>>({});
  const [month, setMonth] = useState<string>("");

  // Baca ulang dari localStorage saat mount & tiap kali ada penyimpanan baru.
  useEffect(() => {
    const data = loadAll();
    setAll(data);
    const months = availableMonths(data);
    setMonth((cur) => (cur && months.includes(cur) ? cur : months[0] ?? ""));
  }, [reloadKey]);

  const months = useMemo(() => availableMonths(all), [all]);
  const days = useMemo(() => (month ? listMonth(all, month) : []), [all, month]);
  const recap = useMemo(() => aggregateMonth(month, days), [month, days]);

  const maxAirline = recap.airlines[0]?.total ?? 1;
  const maxHour = recap.busiestHour?.count ?? 1;

  function handleDeleteDay(dateIso: string) {
    deleteDay(dateIso);
    setAll(loadAll());
  }

  function handleClearAll() {
    if (!window.confirm("Hapus SEMUA data rekap bulanan yang tersimpan? Tindakan ini tidak bisa dibatalkan.")) {
      return;
    }
    clearAll();
    setAll({});
    setMonth("");
  }

  // Belum ada data sama sekali.
  if (months.length === 0) {
    return (
      <section className="glass p-5 sm:p-7">
        <div className="mb-3 flex items-start gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-mint/10 text-mint ring-1 ring-mint/20">
            <CalendarRange className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-bold text-fg">Rekap Bulanan</h2>
            <p className="text-sm text-muted">Gabungan rekap dari hari-hari yang Anda simpan.</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-muted ring-1 ring-line">
          <Database className="h-5 w-5 flex-shrink-0 text-mint" />
          Belum ada data tersimpan. Generate jadwal harian lalu klik{" "}
          <b className="text-fg">&ldquo;Simpan ke rekap bulanan&rdquo;</b> untuk mulai mengumpulkan.
        </div>
      </section>
    );
  }

  return (
    <section className="glass glass-hover p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-mint/10 text-mint ring-1 ring-mint/20">
            <CalendarRange className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-heading text-lg font-bold text-fg">Rekap Bulanan</h2>
            <p className="text-sm text-muted">
              {recap.daysCount} hari terisi · {bulanLabel(month)}
            </p>
          </div>
        </div>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold text-fg outline-none transition [color-scheme:dark] focus:border-mint focus:ring-2 focus:ring-mint/30"
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {bulanLabel(m)}
            </option>
          ))}
        </select>
      </div>

      {/* Angka utama */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatBox icon={<Plane className="h-4 w-4" style={{ transform: "rotate(45deg)" }} />} label="Total sebulan" value={recap.total} />
        <StatBox icon={<PlaneTakeoff className="h-4 w-4" />} label="Berangkat" value={recap.departures} />
        <StatBox icon={<PlaneLanding className="h-4 w-4" />} label="Datang" value={recap.arrivals} />
        <StatBox icon={<TrendingUp className="h-4 w-4" />} label="Rata-rata/hari" value={recap.avgPerDay} />
      </div>

      {/* Hari & jam tersibuk */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {recap.busiestDay && (
          <Highlight
            icon={<CalendarRange className="h-4 w-4" />}
            label="Hari tersibuk"
            value={recap.busiestDay.dateText}
            sub={`${recap.busiestDay.total} penerbangan`}
          />
        )}
        {recap.busiestHour && (
          <Highlight
            icon={<Clock className="h-4 w-4" />}
            label="Jam tersibuk"
            value={`${recap.busiestHour.hour}:00`}
            sub={`${recap.busiestHour.count} penerbangan`}
          />
        )}
      </div>

      {/* Per maskapai */}
      {recap.airlines.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-fg">
            <Plane className="h-4 w-4 text-mint" style={{ transform: "rotate(45deg)" }} /> Per maskapai (sebulan)
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
                    <div className="h-full rounded-full bg-mint" style={{ width: `${(a.total / maxAirline) * 100}%` }} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sebaran per jam */}
      {recap.byHour.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-fg">
            <Clock className="h-4 w-4 text-mint" /> Sebaran per jam (sebulan)
          </h3>
          <div className="flex items-end gap-1">
            {recap.byHour.map((h) => (
              <div key={h.hour} className="flex flex-1 flex-col items-center gap-1" title={`${h.hour}:00 — ${h.count}`}>
                <div className="w-full rounded-sm bg-mint/70" style={{ height: `${Math.max(4, (h.count / maxHour) * 40)}px` }} />
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
            <Building2 className="h-4 w-4 text-mint" /> Bandara terbanyak (sebulan)
          </h3>
          <div className="flex flex-wrap gap-2">
            {recap.airports.slice(0, 8).map((a) => (
              <span key={a.airport} className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-muted ring-1 ring-line">
                {a.airport} <span className="font-semibold text-mint">{a.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Kelola hari tersimpan */}
      <div className="mt-6 border-t border-line pt-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-fg">
            <Database className="h-4 w-4 text-mint" /> Hari tersimpan ({days.length})
          </h3>
          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> Hapus semua
          </button>
        </div>
        <ul className="space-y-1.5">
          {days.map((d) => (
            <li
              key={d.dateIso}
              className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.02] px-3 py-2 text-sm ring-1 ring-line"
            >
              <span className="truncate text-fg">{d.dateText || d.dateIso}</span>
              <span className="flex flex-shrink-0 items-center gap-3">
                <span className="text-xs text-muted">{d.recap.total} penerbangan</span>
                <button
                  onClick={() => handleDeleteDay(d.dateIso)}
                  title="Hapus hari ini"
                  className="text-muted transition hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>
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

function Highlight({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] px-4 py-3">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-mint/10 text-mint">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted">{label}</p>
        <p className="truncate text-sm font-semibold text-fg">{value}</p>
        <p className="text-xs text-mint">{sub}</p>
      </div>
    </div>
  );
}
