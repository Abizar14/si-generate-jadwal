"use client";

import { Plus, Trash2, Plane, PlaneTakeoff, PlaneLanding } from "lucide-react";
import type { FlightKind, FlightRow } from "@/lib/types";

interface EditableScheduleProps {
  rows: FlightRow[];
  onChange: (rows: FlightRow[]) => void;
}

/**
 * Editor jadwal — tiap penerbangan jadi KARTU agar semua field tampil penuh
 * (tidak ada kolom terpotong). Dipisah dua grup: Keberangkatan & Kedatangan.
 * Operasi tetap memakai INDEKS asli pada array `rows` sehingga preview selaras.
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

  // Pasangkan tiap baris dengan indeks aslinya, lalu pisah per jenis.
  const indexed = rows.map((row, index) => ({ row, index }));
  const departures = indexed.filter((x) => x.row.kind === "departure");
  const arrivals = indexed.filter((x) => x.row.kind === "arrival");

  return (
    <div className="space-y-4">
      <span className="text-sm font-semibold text-fg">
        Edit Jadwal{" "}
        <span className="font-normal text-muted">
          ({departures.length} berangkat · {arrivals.length} datang)
        </span>
      </span>

      <Group
        kind="departure"
        items={departures}
        onUpdate={update}
        onRemove={remove}
        onAdd={() => add("departure")}
      />
      <Group
        kind="arrival"
        items={arrivals}
        onUpdate={update}
        onRemove={remove}
        onAdd={() => add("arrival")}
      />
    </div>
  );
}

/** Satu grup (Keberangkatan / Kedatangan) dengan judul, daftar kartu, & tombol tambah. */
function Group({
  kind,
  items,
  onUpdate,
  onRemove,
  onAdd,
}: {
  kind: FlightKind;
  items: { row: FlightRow; index: number }[];
  onUpdate: (i: number, patch: Partial<FlightRow>) => void;
  onRemove: (i: number) => void;
  onAdd: () => void;
}) {
  const isDep = kind === "departure";
  const Icon = isDep ? PlaneTakeoff : PlaneLanding;
  const title = isDep ? "Keberangkatan" : "Kedatangan";

  return (
    <section className="rounded-2xl border border-line bg-white/[0.02] p-3">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-mint/10 text-mint">
          <Icon className="h-4 w-4" />
        </span>
        <h4 className="text-sm font-semibold text-fg">{title}</h4>
        <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-xs font-medium text-muted">
          {items.length}
        </span>
      </div>

      <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
        {items.map(({ row, index }) => (
          <RowCard
            key={index}
            row={row}
            onUpdate={(patch) => onUpdate(index, patch)}
            onRemove={() => onRemove(index)}
          />
        ))}

        {items.length === 0 && (
          <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-line py-6 text-center text-sm text-muted">
            <Plane className="h-5 w-5 text-mint" style={{ transform: "rotate(45deg)" }} />
            Belum ada {title.toLowerCase()}.
          </div>
        )}
      </div>

      <button
        onClick={onAdd}
        className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-mint/30 bg-mint/10 px-3 py-2 text-sm font-semibold text-mint transition hover:bg-mint hover:text-bg"
      >
        <Plus className="h-4 w-4" /> Tambah {title}
      </button>
    </section>
  );
}

/** Kartu satu penerbangan: jenis + no. penerbangan + hapus, bandara, jam & conv/gate. */
function RowCard({
  row,
  onUpdate,
  onRemove,
}: {
  row: FlightRow;
  onUpdate: (patch: Partial<FlightRow>) => void;
  onRemove: () => void;
}) {
  const infoLabel = row.kind === "arrival" ? "Conv" : "Gate";
  const infoPlaceholder = row.kind === "arrival" ? "1" : "A 3";

  return (
    <div className="space-y-2 rounded-xl border border-line bg-white/[0.03] p-2.5">
      {/* Baris 1: jenis · no. penerbangan · hapus */}
      <div className="flex items-center gap-2">
        <select
          value={row.kind}
          onChange={(e) => onUpdate({ kind: e.target.value as FlightKind })}
          title="Pindah jenis"
          className="rounded-lg border border-line bg-surface px-2 py-2 text-sm text-fg outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/30"
        >
          <option value="departure">Berangkat</option>
          <option value="arrival">Datang</option>
        </select>
        <input
          value={row.flightNo}
          onChange={(e) => onUpdate({ flightNo: e.target.value })}
          placeholder="WON 1472"
          className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold text-fg outline-none transition placeholder:font-normal placeholder:text-muted/60 focus:border-mint focus:ring-2 focus:ring-mint/30"
        />
        <button
          onClick={onRemove}
          title="Hapus baris"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Baris 2: bandara (lebar penuh) */}
      <input
        value={row.airport}
        onChange={(e) => onUpdate({ airport: e.target.value })}
        placeholder="BANDAR UDARA …"
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg outline-none transition placeholder:text-muted/60 focus:border-mint focus:ring-2 focus:ring-mint/30"
      />

      {/* Baris 3: jam · conv/gate */}
      <div className="grid grid-cols-2 gap-2">
        <FieldBox label="Jam">
          <input
            value={row.time}
            onChange={(e) => onUpdate({ time: e.target.value })}
            placeholder="09:05"
            className="w-full min-w-0 bg-transparent py-2 text-sm text-fg outline-none placeholder:text-muted/60"
          />
        </FieldBox>
        <FieldBox label={infoLabel}>
          <input
            value={row.info ?? ""}
            onChange={(e) => onUpdate({ info: e.target.value })}
            placeholder={infoPlaceholder}
            className="w-full min-w-0 bg-transparent py-2 text-sm text-fg outline-none placeholder:text-muted/60"
          />
        </FieldBox>
      </div>
    </div>
  );
}

/** Kotak field berlabel (label di kiri, input mengisi sisanya). */
function FieldBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 transition focus-within:border-mint focus-within:ring-2 focus-within:ring-mint/30">
      <span className="flex-shrink-0 text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </div>
  );
}
