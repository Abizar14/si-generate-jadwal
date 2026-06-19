"use client";

import { Plus, Trash2, Plane } from "lucide-react";
import type { FlightKind, FlightRow } from "@/lib/types";

interface EditableScheduleProps {
  rows: FlightRow[];
  onChange: (rows: FlightRow[]) => void;
}

/**
 * Editor tabel jadwal inline. Tiap baris bisa diedit (jenis, no penerbangan,
 * bandara, jam), ditambah, atau dihapus. Perubahan langsung memengaruhi preview.
 */
export default function EditableSchedule({ rows, onChange }: EditableScheduleProps) {
  function update(i: number, patch: Partial<FlightRow>) {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function remove(i: number) {
    onChange(rows.filter((_, idx) => idx !== i));
  }
  function add(kind: FlightKind) {
    onChange([...rows, { kind, flightNo: "", airport: "", time: "" }]);
  }

  const dep = rows.filter((r) => r.kind === "departure").length;
  const arr = rows.filter((r) => r.kind === "arrival").length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-fg">
          Edit Jadwal{" "}
          <span className="font-normal text-muted">
            ({dep} berangkat · {arr} datang)
          </span>
        </span>
      </div>

      {/* Header kolom */}
      <div className="hidden grid-cols-[110px_1fr_1.4fr_92px_36px] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted sm:grid">
        <span>Jenis</span>
        <span>No. Penerbangan</span>
        <span>Bandara</span>
        <span>Jam</span>
        <span />
      </div>

      <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {rows.map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-2 items-center gap-2 rounded-xl border border-line bg-white/[0.03] p-2 sm:grid-cols-[110px_1fr_1.4fr_92px_36px] sm:border-0 sm:bg-transparent sm:p-0"
          >
            <select
              value={r.kind}
              onChange={(e) => update(i, { kind: e.target.value as FlightKind })}
              className="rounded-lg border border-line bg-surface px-2 py-2 text-sm text-fg outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/30"
            >
              <option value="departure">Berangkat</option>
              <option value="arrival">Datang</option>
            </select>
            <input
              value={r.flightNo}
              onChange={(e) => update(i, { flightNo: e.target.value })}
              placeholder="WON 1472"
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg outline-none transition placeholder:text-muted/60 focus:border-mint focus:ring-2 focus:ring-mint/30"
            />
            <input
              value={r.airport}
              onChange={(e) => update(i, { airport: e.target.value })}
              placeholder="BANDAR UDARA …"
              className="col-span-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg outline-none transition placeholder:text-muted/60 focus:border-mint focus:ring-2 focus:ring-mint/30 sm:col-span-1"
            />
            <input
              value={r.time}
              onChange={(e) => update(i, { time: e.target.value })}
              placeholder="09:05"
              className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg outline-none transition placeholder:text-muted/60 focus:border-mint focus:ring-2 focus:ring-mint/30"
            />
            <button
              onClick={() => remove(i)}
              title="Hapus baris"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-danger/10 hover:text-danger"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-white/[0.02] py-8 text-center text-sm text-muted">
            <Plane className="h-6 w-6 text-mint" style={{ transform: "rotate(45deg)" }} />
            Belum ada baris. Tambahkan di bawah.
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => add("departure")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-mint/30 bg-mint/10 px-3 py-2 text-sm font-semibold text-mint transition hover:bg-mint hover:text-bg"
        >
          <Plus className="h-4 w-4" /> Keberangkatan
        </button>
        <button
          onClick={() => add("arrival")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-mint/30 bg-mint/10 px-3 py-2 text-sm font-semibold text-mint transition hover:bg-mint hover:text-bg"
        >
          <Plus className="h-4 w-4" /> Kedatangan
        </button>
      </div>
    </div>
  );
}
