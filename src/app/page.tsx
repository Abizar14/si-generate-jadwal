"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Download,
  Loader2,
  AlertTriangle,
  Info,
  Plane,
  Eye,
  ShieldCheck,
  UploadCloud,
  CalendarDays,
  Rows3,
  ImageIcon,
  Pencil,
  ImagePlus,
  SlidersHorizontal,
  X,
  ChevronDown,
  Instagram,
  Mail,
  Github,
  FileText,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import UploadFile from "@/components/UploadFile";
import SlidePreview from "@/components/SlidePreview";
import SkyBackground from "@/components/SkyBackground";
import LogoField from "@/components/LogoField";
import PlaneScroll from "@/components/PlaneScroll";
import Navbar from "@/components/Navbar";
import EditableSchedule from "@/components/EditableSchedule";
import { PaletteSection, PanduanSection, TipsSection } from "@/components/BottomCards";
import OfficialSchedulePDF from "@/components/OfficialSchedulePDF";
import { type OverlayConfig, DEFAULT_OVERLAY } from "@/components/TemplateSlide";
import { parseFile } from "@/lib/parseSchedule";
import { buildSlides, MAX_ROWS_PER_SLIDE } from "@/lib/pagination";
import { downloadAllSlides, type ImageFormat } from "@/lib/exportImage";
import { tanggalHariIni, isoToIndonesia, todayIso } from "@/lib/formatDate";
import type { ParseResult, FlightRow, FlightKind, Slide } from "@/lib/types";

// Template kosong bawaan per jenis (PNG 1080x1920 di public/template-jadwal/).
const STATIC_TEMPLATE: Record<FlightKind, string> = {
  departure: "/template-jadwal/keberangkatan.png",
  arrival: "/template-jadwal/kedatangan.png",
};

const TITLE: Record<FlightKind, string> = {
  departure: "JADWAL KEBERANGKATAN",
  arrival: "JADWAL KEDATANGAN",
};

const TYPE_LABEL: Record<FlightKind, string> = {
  departure: "Keberangkatan",
  arrival: "Kedatangan",
};

export default function Home() {
  const [result, setResult] = useState<ParseResult | null>(null);
  const [rows, setRows] = useState<FlightRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [dateText, setDateText] = useState(tanggalHariIni());
  const [maxRows, setMaxRows] = useState(MAX_ROWS_PER_SLIDE);
  const [format, setFormat] = useState<ImageFormat>("png");

  // Jenis jadwal yang dipilih — bisa dua-duanya (menentukan template & filter data).
  const [selectedKinds, setSelectedKinds] = useState<FlightKind[]>([]);
  function toggleKind(k: FlightKind) {
    setSelectedKinds((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  }

  // Override template manual: default OFF → pakai template bawaan.
  const [overrideEnabled, setOverrideEnabled] = useState(false);

  // Gambar template asli per jenis (data URL) + geometri overlay.
  const [templates, setTemplates] = useState<{
    departure: string | null;
    arrival: string | null;
  }>({ departure: null, arrival: null });
  const [overlay, setOverlay] = useState<OverlayConfig>(DEFAULT_OVERLAY);
  const [showPos, setShowPos] = useState(false);

  // Cek apakah template bawaan benar-benar ada (hindari 404 yang bikin export gagal).
  const [staticAvail, setStaticAvail] = useState<Record<FlightKind, boolean>>({
    departure: false,
    arrival: false,
  });
  useEffect(() => {
    (["departure", "arrival"] as FlightKind[]).forEach((kind) => {
      const img = new window.Image();
      img.onload = () => setStaticAvail((s) => ({ ...s, [kind]: true }));
      img.onerror = () => setStaticAvail((s) => ({ ...s, [kind]: false }));
      img.src = STATIC_TEMPLATE[kind];
    });
  }, []);

  /** Sumber template untuk satu jenis: upload manual → bawaan (bila ada) → null (pakai desain bawaan kode). */
  function templateFor(kind: FlightKind): string | null {
    const uploaded = overrideEnabled ? templates[kind] : null;
    return uploaded ?? (staticAvail[kind] ? STATIC_TEMPLATE[kind] : null);
  }

  // Ref ke tiap node slide ukuran asli (1080x1920) untuk export.
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const slides = useMemo(() => {
    const departures = rows.filter((r) => r.kind === "departure");
    const arrivals = rows.filter((r) => r.kind === "arrival");
    return buildSlides(departures, arrivals, Math.max(1, maxRows));
  }, [rows, maxRows]);

  // Slide yang tampil = jenis terpilih saja. Bila belum ada data untuk jenis itu,
  // tampilkan 1 slide kosong (template + tanggal) agar bisa dipratinjau/diunduh.
  const visibleSlides = useMemo<Slide[]>(() => {
    // urutan tetap: keberangkatan dulu, lalu kedatangan
    const kinds = (["departure", "arrival"] as FlightKind[]).filter((k) =>
      selectedKinds.includes(k)
    );
    return kinds.flatMap((kind) => {
      const forType = slides.filter((s) => s.kind === kind);
      if (forType.length > 0) return forType;
      // belum ada data untuk jenis ini → tampilkan template kosong + tanggal
      return [
        { kind, title: TITLE[kind], rows: [], pageIndex: 1, pageCount: 1 } as Slide,
      ];
    });
  }, [selectedKinds, slides]);

  // Untuk PDF resmi (selalu semua data, kedua tabel).
  const allDepartures = useMemo(() => rows.filter((r) => r.kind === "departure"), [rows]);
  const allArrivals = useMemo(() => rows.filter((r) => r.kind === "arrival"), [rows]);

  async function handleFile(file: File) {
    setError(null);
    setParsing(true);
    setResult(null);
    setRows([]);
    try {
      const parsed = await parseFile(file);
      setResult(parsed);
      setRows([...parsed.departures, ...parsed.arrivals]);
      setFileName(file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan saat membaca file.");
      setFileName(file.name);
    } finally {
      setParsing(false);
    }
  }

  /** Baca gambar template (PNG/JPG) jadi data URL untuk jenis tertentu. */
  function handleTemplateImage(kind: FlightKind, file: File | null) {
    if (!file) {
      setTemplates((t) => ({ ...t, [kind]: null }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Template harus berupa gambar (PNG/JPG).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setTemplates((t) => ({ ...t, [kind]: reader.result as string }));
    reader.readAsDataURL(file);
  }

  async function handleDownload() {
    const nodes = slideRefs.current.filter((n): n is HTMLDivElement => n !== null);
    if (nodes.length === 0) return;
    setExporting(true);
    try {
      await downloadAllSlides(nodes, "jadwal-penerbangan", format);
    } catch (e) {
      setError(
        "Gagal membuat gambar: " +
          (e instanceof Error ? e.message : "kesalahan tak terduga.")
      );
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <Navbar />
      <SkyBackground />
      <LogoField />
      <PlaneScroll />

      <main id="top" className="relative">
        {/* ===================== HERO (halaman penuh) ===================== */}
        <section className="snap-page relative mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center justify-center px-4 text-center sm:px-6">
          <HeroPlane />

          <Reveal delay={0} className="mb-5 inline-flex items-center gap-2 rounded-full bg-mint/10 px-4 py-1.5 text-sm font-semibold text-mint ring-1 ring-mint/20">
            <Plane className="h-4 w-4" style={{ transform: "rotate(45deg)" }} />
            Instagram Story 1080×1920
          </Reveal>

          <Reveal delay={0.12}>
            <h1 className="font-display text-7xl font-bold leading-none tracking-tight text-fg sm:text-8xl">
              SI
              <span
                className="text-mint"
                style={{ textShadow: "0 0 36px rgba(52,227,164,0.45)" }}
              >
                GAP
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-6 font-heading text-2xl font-bold leading-snug tracking-tight text-fg sm:text-3xl">
              <span className="text-mint">S</span>istem{" "}
              <span className="text-mint">I</span>nformasi{" "}
              <span className="text-mint">G</span>enerate
              <br />
              <span className="text-mint">A</span>PT{" "}
              <span className="text-mint">P</span>ranoto
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
              Jadwal penerbangan Bandara APT Pranoto Samarinda jadi gambar Instagram
              Story siap posting — cukup upload PDF jadwal AMC (atau Excel/CSV).
            </p>
          </Reveal>

          {/* Chevron pemantul di dasar layar pertama. */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <Reveal delay={0.36}>
              <ScrollChevron />
            </Reveal>
          </div>
        </section>

        {/* ===================== GENERATE (halaman penuh) ===================== */}
        <section id="upload" className="snap-page flex min-h-[100svh] items-center px-4 py-24 sm:px-6">
          <div className="mx-auto w-full max-w-6xl">
            <div className="grid gap-6 lg:grid-cols-2">
          {/* ---------- KARTU 1: UPLOAD ---------- */}
          <Reveal>
          <section className="card card-hover p-6 sm:p-7">
            <CardHeader
              step="1"
              icon={<UploadCloud className="h-5 w-5" />}
              title="Pilih Jenis & Upload"
              desc="Pilih jenis jadwal dulu, lalu upload file untuk mengisinya."
            />

            {/* Pilih jenis → template langsung tampil di preview (boleh dua-duanya) */}
            <Field icon={<Plane className="h-4 w-4" style={{ transform: "rotate(45deg)" }} />} label="Jenis jadwal (bisa pilih dua-duanya)">
              <div className="grid grid-cols-2 gap-2">
                {(["departure", "arrival"] as FlightKind[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => toggleKind(k)}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition ${
                      selectedKinds.includes(k)
                        ? "border-mint bg-mint/10 text-mint shadow-mint"
                        : "border-line bg-surface text-muted hover:border-mint hover:text-mint"
                    }`}
                  >
                    {TYPE_LABEL[k]}
                  </button>
                ))}
              </div>
              {selectedKinds.length > 0 && (
                <p className="mt-2 text-xs text-mint">
                  Template siap — upload data untuk mengisi jadwal.
                </p>
              )}
            </Field>

            <div className="mt-5">
              <UploadFile
                onFile={handleFile}
                disabled={parsing || selectedKinds.length === 0}
                currentFileName={fileName}
              />
              {selectedKinds.length === 0 && (
                <p className="mt-2 text-xs text-muted">
                  Pilih jenis jadwal di atas untuk mengaktifkan upload.
                </p>
              )}
            </div>

            {parsing && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin" /> Membaca file…
              </div>
            )}

            {error && (
              <div className="slide-up-350 mt-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && result.warnings.length > 0 && (
              <div className="slide-up-350 mt-4 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-300">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <ul className="list-disc space-y-1 pl-4">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Catatan keamanan (saat belum ada hasil) */}
            {!result && (
              <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-muted ring-1 ring-line">
                <ShieldCheck className="h-5 w-5 flex-shrink-0 text-mint" />
                File Anda aman dan diproses di perangkat Anda — tidak disimpan ke
                server.
              </div>
            )}

            {/* Template gambar sendiri (opsional) — toggle on/off */}
            <div className="mt-5 border-t border-line pt-5">
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-fg">
                  <span className="text-mint"><ImagePlus className="h-4 w-4" /></span>
                  Template gambar sendiri (opsional)
                </label>
                <Toggle checked={overrideEnabled} onChange={setOverrideEnabled} />
              </div>

              {!overrideEnabled && (
                <p className="mt-2 text-xs text-muted">
                  Mati — memakai template bawaan (Keberangkatan/Kedatangan).
                </p>
              )}

              {overrideEnabled && (
              <div className="mt-3">
                <p className="mb-2 text-xs text-muted">
                  Timpa template bawaan dengan desainmu sendiri per jenis. Jika diisi, baris
                  &amp; tanggal ditumpuk di atas gambar itu (header/judul/footer ikut gambar).
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <TemplateInput
                    label="Keberangkatan"
                    active={!!templates.departure}
                    onPick={(f) => handleTemplateImage("departure", f)}
                    onClear={() => handleTemplateImage("departure", null)}
                  />
                  <TemplateInput
                    label="Kedatangan"
                    active={!!templates.arrival}
                    onPick={(f) => handleTemplateImage("arrival", f)}
                    onClear={() => handleTemplateImage("arrival", null)}
                  />
                </div>

                {(templates.departure || templates.arrival) && (
                  <div className="mt-3">
                    <button
                      onClick={() => setShowPos((s) => !s)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-mint"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      {showPos ? "Sembunyikan" : "Atur"} posisi overlay
                    </button>
                    {showPos && (
                      <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border border-line bg-white/[0.02] p-3">
                        <PosInput label="Baris ke-1 pusat Y (px)" value={overlay.firstCenterY} onChange={(v) => setOverlay((o) => ({ ...o, firstCenterY: v }))} />
                        <PosInput label="Jarak antar baris (px)" value={overlay.rowHeight} onChange={(v) => setOverlay((o) => ({ ...o, rowHeight: v }))} />
                        <PosInput label="Logo pusat X (px)" value={overlay.logoCenterX} onChange={(v) => setOverlay((o) => ({ ...o, logoCenterX: v }))} />
                        <PosInput label="Teks kiri X (px)" value={overlay.flightX} onChange={(v) => setOverlay((o) => ({ ...o, flightX: v, airportX: v }))} />
                        <PosInput label="Jam kanan X (px)" value={overlay.timeRightX} onChange={(v) => setOverlay((o) => ({ ...o, timeRightX: v }))} />
                        <PosInput label="Tanggal pusat X (px)" value={overlay.dateX} onChange={(v) => setOverlay((o) => ({ ...o, dateX: v }))} />
                        <PosInput label="Tanggal pusat Y (px)" value={overlay.dateY} onChange={(v) => setOverlay((o) => ({ ...o, dateY: v }))} />
                        <label className="col-span-2 flex items-center gap-2 text-xs text-muted">
                          <input
                            type="checkbox"
                            checked={overlay.showDate}
                            onChange={(e) => setOverlay((o) => ({ ...o, showDate: e.target.checked }))}
                            className="accent-mint"
                          />
                          Timpa tanggal lama di gambar
                        </label>
                        <button
                          onClick={() => setOverlay(DEFAULT_OVERLAY)}
                          className="col-span-2 rounded-lg border border-line bg-surface py-1.5 text-xs font-semibold text-muted transition hover:border-mint hover:text-mint"
                        >
                          Reset posisi
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              )}
            </div>

            {/* Kontrol — aktif setelah jenis dipilih */}
            {selectedKinds.length > 0 && (
              <div className="slide-up-350 mt-5 space-y-5 border-t border-line pt-5">
                {result && <EditableSchedule rows={rows} onChange={setRows} />}

                {/* Tanggal */}
                <Field icon={<CalendarDays className="h-4 w-4" />} label="Tanggal (tampil di desain)">
                  <input
                    type="text"
                    value={dateText}
                    onChange={(e) => setDateText(e.target.value)}
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/30"
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="date"
                      defaultValue={todayIso()}
                      onChange={(e) => {
                        const t = isoToIndonesia(e.target.value);
                        if (t) setDateText(t);
                      }}
                      className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg outline-none transition [color-scheme:dark] focus:border-mint focus:ring-2 focus:ring-mint/30"
                    />
                    <span className="text-xs text-muted">pilih untuk isi otomatis</span>
                  </div>
                </Field>

                {/* Maks baris */}
                {result && (
                  <Field icon={<Rows3 className="h-4 w-4" />} label="Maks baris per slide">
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={maxRows}
                      onChange={(e) => setMaxRows(Number(e.target.value) || 1)}
                      className="w-24 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/30"
                    />
                    <p className="mt-1 text-xs text-muted">
                      Default 15 — lebih dari itu otomatis dipecah jadi beberapa slide.
                    </p>
                  </Field>
                )}

                {/* Format */}
                <Field icon={<ImageIcon className="h-4 w-4" />} label="Format gambar">
                  <div className="flex gap-2">
                    {(["png", "jpg"] as ImageFormat[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={`rounded-lg border px-4 py-2 text-sm font-semibold uppercase transition ${
                          format === f
                            ? "border-mint bg-mint text-bg shadow-mint"
                            : "border-line bg-surface text-muted hover:border-mint hover:text-mint"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Ringkasan */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {(["departure", "arrival"] as FlightKind[])
                    .filter((k) => selectedKinds.includes(k))
                    .map((k) => (
                      <Stat key={k}>
                        {TYPE_LABEL[k]}: {rows.filter((r) => r.kind === k).length} baris
                      </Stat>
                    ))}
                  <Stat>{visibleSlides.length} slide</Stat>
                </div>

                {!result && (
                  <p className="text-xs text-muted">
                    Belum ada data — unduhan menghasilkan template + tanggal tanpa baris.
                  </p>
                )}

                <button
                  onClick={handleDownload}
                  disabled={exporting || visibleSlides.length === 0}
                  className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-semibold text-bg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {exporting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Membuat gambar…
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Download {visibleSlides.length > 1 ? "semua (.zip)" : `(.${format})`}
                    </>
                  )}
                </button>

                {result && (
                  <>
                    <button
                      onClick={() => window.print()}
                      className="btn-ghost flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold"
                    >
                      <FileText className="h-5 w-5" />
                      Unduh PDF Resmi (A4)
                    </button>
                    <p className="text-center text-xs text-muted">
                      Pakai semua data ({allArrivals.length} datang · {allDepartures.length} berangkat).
                      Di dialog cetak pilih <b>Simpan sebagai PDF</b> &amp; matikan header/footer.
                    </p>
                  </>
                )}
              </div>
            )}
          </section>
          </Reveal>

          {/* ---------- KARTU 2: PREVIEW ---------- */}
          <Reveal delay={0.12}>
          <section className="card card-hover p-6 sm:p-7">
            <CardHeader
              step="2"
              icon={<Eye className="h-5 w-5" />}
              title="Preview Instagram Story"
              desc="Pratinjau desain tampil otomatis sebelum diunduh."
            />

            {parsing ? (
              <PreviewSkeleton />
            ) : selectedKinds.length === 0 ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-white/[0.02] text-center">
                <span className="animate-float inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-mint/10 ring-1 ring-mint/20">
                  <Plane className="h-8 w-8 text-mint" style={{ transform: "rotate(45deg)" }} />
                </span>
                <p className="max-w-[240px] text-sm text-muted">
                  Pilih jenis jadwal dulu — template-nya langsung muncul di sini.
                </p>
              </div>
            ) : (
              <div className="slide-up-350 flex flex-wrap justify-center gap-6">
                {visibleSlides.map((slide, i) => (
                  <div key={`${slide.kind}-${i}`} className="flex flex-col items-center gap-2">
                    <div className="overflow-hidden rounded-xl shadow-card ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                      <SlidePreview
                        slide={slide}
                        dateText={dateText}
                        scale={0.3}
                        templateSrc={templateFor(slide.kind)}
                        overlay={overlay}
                        autoGrid={templateFor(slide.kind) === STATIC_TEMPLATE[slide.kind]}
                        ref={(el) => {
                          slideRefs.current[i] = el;
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted">
                      {slide.rows.length === 0
                        ? "Template siap — upload data untuk mengisi"
                        : `${slide.title.replace("JADWAL ", "")}${
                            slide.pageCount > 1 ? ` ${slide.pageIndex}/${slide.pageCount}` : ""
                          }`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
          </Reveal>
            </div>
          </div>
        </section>

        {/* ============ HALAMAN: PALET · PANDUAN · TIPS ============ */}
        <PaletteSection />
        <PanduanSection />
        <TipsSection />

        <Reveal as="footer" className="mt-16 flex flex-col items-center gap-5 text-center" amount={0.4}>
          <div id="kontak" className="flex items-center gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-all duration-200 hover:scale-110 hover:border-mint hover:text-mint"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="text-sm text-muted">
            © 2026 SIGAP · APT Pranoto Samarinda. Semua hak dilindungi.
          </p>
        </Reveal>
      </main>

      {/* Dokumen PDF resmi (A4) — hanya tampil saat cetak (lihat globals.css). */}
      <div id="print-root">
        <OfficialSchedulePDF
          dateText={dateText}
          departures={allDepartures}
          arrivals={allArrivals}
        />
      </div>
    </>
  );
}

/** Tombol chevron pemantul di Hero — menggulir ke section upload. */
function ScrollChevron() {
  const reduce = useReducedMotion();
  return (
    <motion.button
      onClick={() =>
        document.getElementById("upload")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      aria-label="Gulir ke bawah"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-mint hover:text-mint"
      animate={reduce ? undefined : { y: [0, 6, 0] }}
      transition={reduce ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    >
      <ChevronDown className="h-5 w-5" />
    </motion.button>
  );
}

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "GitHub", href: "https://github.com", icon: Github },
  { label: "Email", href: "mailto:elbandapp@gmail.com", icon: Mail },
];

/* ===================== KOMPONEN KECIL ===================== */

function CardHeader({
  step,
  icon,
  title,
  desc,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-mint/10 text-mint ring-1 ring-mint/20">
        {icon}
      </span>
      <div>
        <h2 className="font-heading text-lg font-bold text-fg">
          <span className="text-mint">{step}.</span> {title}
        </h2>
        <p className="text-sm text-muted">{desc}</p>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-fg">
        <span className="text-mint">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

function Stat({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-mint/10 px-3 py-1 font-semibold text-mint ring-1 ring-mint/20">
      {children}
    </span>
  );
}

/** Toggle on/off bergaya switch. */
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition ${
        checked ? "bg-mint" : "bg-line"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/** Tombol upload gambar template untuk satu jenis (keberangkatan/kedatangan). */
function TemplateInput({
  label,
  active,
  onPick,
  onClear,
}: {
  label: string;
  active: boolean;
  onPick: (file: File | null) => void;
  onClear: () => void;
}) {
  return (
    <label
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-3 py-4 text-center text-xs transition ${
        active
          ? "border-mint bg-mint/10 text-mint"
          : "border-line text-muted hover:border-mint hover:text-mint"
      }`}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
      <ImagePlus className="h-5 w-5" />
      <span className="font-semibold">{label}</span>
      <span className="text-[10px] opacity-70">{active ? "✓ terpasang — klik ganti" : "klik pilih gambar"}</span>
      {active && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onClear();
          }}
          title="Hapus template"
          className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface text-muted shadow ring-1 ring-line hover:text-danger"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </label>
  );
}

/** Input angka kecil untuk mengatur posisi overlay (px). */
function PosInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-[11px] font-medium text-muted">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="rounded-md border border-line bg-surface px-2 py-1.5 text-sm text-fg outline-none transition focus:border-mint focus:ring-2 focus:ring-mint/30"
      />
    </label>
  );
}

/** Skeleton bergaya story saat memproses file. */
function PreviewSkeleton() {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="w-[200px] space-y-3 rounded-2xl bg-surface p-4 shadow-card ring-1 ring-line">
        <div className="shimmer h-28 w-full rounded-xl" />
        <div className="shimmer h-3 w-3/4 rounded" />
        <div className="shimmer h-3 w-1/2 rounded" />
        <div className="shimmer h-3 w-2/3 rounded" />
        <div className="mt-4 flex justify-center gap-1.5">
          <span className="shimmer h-2 w-6 rounded-full" />
          <span className="shimmer h-2 w-3 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Pesawat hero dengan jejak melengkung putus-putus. */
function HeroPlane() {
  return (
    <div className="pointer-events-none absolute -top-2 left-0 hidden h-48 w-80 lg:block">
      <svg viewBox="0 0 320 200" className="h-full w-full" fill="none" aria-hidden>
        <path
          d="M10 190 C 60 150, 90 120, 180 70 C 220 48, 260 40, 300 30"
          stroke="#34E3A4"
          strokeOpacity="0.4"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="2 10"
          style={{ animation: "dash-move 14s linear infinite" }}
        />
      </svg>
      <div className="animate-float absolute right-3 top-3">
        <Plane
          className="h-12 w-12 text-mint"
          strokeWidth={1.4}
          style={{ transform: "rotate(35deg)", filter: "drop-shadow(0 8px 16px rgba(52,227,164,0.35))" }}
        />
      </div>
    </div>
  );
}
