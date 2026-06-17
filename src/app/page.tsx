"use client";

import { useMemo, useRef, useState } from "react";
import { Download, Loader2, AlertTriangle, Info } from "lucide-react";
import UploadFile from "@/components/UploadFile";
import SlidePreview from "@/components/SlidePreview";
import { parseFile } from "@/lib/parseSchedule";
import { buildSlides, MAX_ROWS_PER_SLIDE } from "@/lib/pagination";
import { downloadAllSlides, type ImageFormat } from "@/lib/exportImage";
import { tanggalHariIni, isoToIndonesia, todayIso } from "@/lib/formatDate";
import type { ParseResult } from "@/lib/types";

export default function Home() {
  const [result, setResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [dateText, setDateText] = useState(tanggalHariIni());
  const [maxRows, setMaxRows] = useState(MAX_ROWS_PER_SLIDE);
  const [format, setFormat] = useState<ImageFormat>("png");

  // Ref ke tiap node slide ukuran asli (1080x1920) untuk export.
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const slides = useMemo(() => {
    if (!result) return [];
    return buildSlides(result.departures, result.arrivals, Math.max(1, maxRows));
  }, [result, maxRows]);

  async function handleFile(file: File) {
    setError(null);
    setParsing(true);
    setResult(null);
    try {
      const parsed = await parseFile(file);
      setResult(parsed);
      setFileName(file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan saat membaca file.");
      setFileName(file.name);
    } finally {
      setParsing(false);
    }
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
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Generator Jadwal Penerbangan
        </h1>
        <p className="mt-1 text-slate-500">
          Upload file Excel/CSV jadwal penerbangan, lalu unduh desainnya sebagai
          gambar Instagram Story (1080×1920).
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* ===== Panel kontrol ===== */}
        <section className="space-y-5">
          <UploadFile
            onFile={handleFile}
            disabled={parsing}
            currentFileName={fileName}
          />

          {parsing && (
            <div className="flex items-center gap-2 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Membaca file…
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && result.warnings.length > 0 && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <Info className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <ul className="list-disc space-y-1 pl-4">
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {result && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              {/* Tanggal */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Tanggal (tampil di desain)
                </label>
                <input
                  type="text"
                  value={dateText}
                  onChange={(e) => setDateText(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="date"
                    defaultValue={todayIso()}
                    onChange={(e) => {
                      const t = isoToIndonesia(e.target.value);
                      if (t) setDateText(t);
                    }}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                  />
                  <span className="text-xs text-slate-400">
                    pilih tanggal untuk isi otomatis
                  </span>
                </div>
              </div>

              {/* Maks baris per slide */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Maks baris per slide
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={maxRows}
                  onChange={(e) => setMaxRows(Number(e.target.value) || 1)}
                  className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Default 13. Jika baris lebih banyak, otomatis dipecah jadi
                  beberapa slide.
                </p>
              </div>

              {/* Format */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-600">
                  Format gambar
                </label>
                <div className="flex gap-2">
                  {(["png", "jpg"] as ImageFormat[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium uppercase ${
                        format === f
                          ? "border-brand bg-brand text-white"
                          : "border-slate-300 bg-white text-slate-600"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ringkasan + tombol download */}
              <div className="border-t border-slate-100 pt-4 text-sm text-slate-500">
                {result.departures.length} keberangkatan · {result.arrivals.length}{" "}
                kedatangan · {slides.length} slide
              </div>
              <button
                onClick={handleDownload}
                disabled={exporting || slides.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Membuat gambar…
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Download {slides.length > 1 ? "semua (.zip)" : `(.${format})`}
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* ===== Preview slide ===== */}
        <section>
          {slides.length === 0 ? (
            <div className="flex h-full min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 text-slate-400">
              Preview desain akan muncul di sini setelah file di-upload.
            </div>
          ) : (
            <div className="flex flex-wrap gap-6">
              {slides.map((slide, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <SlidePreview
                    slide={slide}
                    dateText={dateText}
                    scale={0.3}
                    ref={(el) => {
                      slideRefs.current[i] = el;
                    }}
                  />
                  <span className="text-xs text-slate-400">
                    {slide.title.replace("JADWAL ", "")}
                    {slide.pageCount > 1 ? ` ${slide.pageIndex}/${slide.pageCount}` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
