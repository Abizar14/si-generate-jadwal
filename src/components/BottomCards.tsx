"use client";

import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  Lightbulb,
  FileSpreadsheet,
  SlidersHorizontal,
  Download,
  Check,
  Quote,
} from "lucide-react";
import { THEMES, useTheme } from "@/lib/theme";

/* =====================================================================
   HALAMAN BAWAH — Palet Warna · Panduan · Tips
   Tiap bagian = satu layar penuh (scroll-snap), layout besar + animasi.
   Semua gerak menghormati prefers-reduced-motion.
   ===================================================================== */

const STEPS = [
  {
    icon: FileSpreadsheet,
    title: "Upload File",
    desc: "Pilih jenis jadwal, lalu unggah file Excel/CSV penerbangan.",
  },
  {
    icon: SlidersHorizontal,
    title: "Atur Tampilan",
    desc: "Sesuaikan tanggal & jumlah baris — preview berubah langsung.",
  },
  {
    icon: Download,
    title: "Unduh Story",
    desc: "Simpan gambar Instagram Story 1080×1920 siap posting.",
  },
];

/** Tiap tip = array segmen; segmen ber-em ditandai mint. */
const TIPS: { t: string; em?: boolean }[][] = [
  [
    { t: "Gunakan " },
    { t: "template yang konsisten", em: true },
    { t: " dengan identitas maskapai agar story tampil profesional." },
  ],
  [
    { t: "Jaga maksimal " },
    { t: "±13 baris per slide", em: true },
    { t: " supaya teks tetap terbaca jelas di layar HP." },
  ],
  [
    { t: "Periksa ejaan nama bandara — " },
    { t: "perubahan langsung tampil", em: true },
    { t: " di panel preview sebelum diunduh." },
  ],
  [
    { t: "Pilih " },
    { t: "PNG untuk hasil paling tajam", em: true },
    { t: ", atau JPG bila butuh ukuran file lebih kecil." },
  ],
];

const VIEWPORT = { once: true, amount: 0.3 } as const;

/* ---------- Hook: deteksi reduce-motion + mobile ---------- */
function useEntrance() {
  const reduce = useReducedMotion();
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return { reduce: !!reduce, mobile };
}

/* ---------- Bingkai halaman penuh + judul + glow ---------- */
function PageShell({
  id,
  eyebrow,
  title,
  sub,
  reduce,
  glow,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  sub: string;
  reduce: boolean;
  glow: string; // posisi+warna blob, mis. "left-1/4 top-1/3 bg-mint/10"
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="snap-page relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 py-24 sm:px-6"
    >
      {/* Glow dekoratif yang bernapas */}
      <motion.div
        aria-hidden
        className={`pointer-events-none absolute h-[40rem] w-[40rem] rounded-full blur-[120px] ${glow}`}
        animate={
          reduce ? undefined : { scale: [1, 1.18, 1], opacity: [0.5, 0.8, 0.5] }
        }
        transition={
          reduce ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut" }
        }
      />

      {/* Judul halaman */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 mb-12 text-center"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.45em] text-mint">
          {eyebrow}
        </p>
        <h2 className="font-heading text-5xl font-extrabold leading-none text-fg sm:text-7xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted sm:text-base">{sub}</p>
        <motion.span
          className="mx-auto mt-6 block h-1 w-24 rounded-full bg-gradient-to-r from-mint to-cyan"
          initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={VIEWPORT}
          transition={reduce ? undefined : { duration: 0.6, delay: 0.25 }}
        />
      </motion.div>

      <div className="relative z-10 w-full max-w-5xl">{children}</div>
    </section>
  );
}

/* ===================== 1. PALET WARNA ===================== */

export function PaletteSection() {
  const { reduce } = useEntrance();
  const { theme, setTheme } = useTheme();
  const [copied, setCopied] = useState<string | null>(null);

  const active = THEMES.find((t) => t.id === theme) ?? THEMES[0];
  const swatches = [
    { name: "Background", hex: active.bg },
    { name: "Surface", hex: active.surface },
    { name: "Aksen", hex: active.accent },
    { name: "Aksen 2", hex: active.accent2 },
    { name: "Teks", hex: active.text },
    { name: "Muted", hex: active.muted },
  ];

  async function copy(hex: string) {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      window.setTimeout(() => setCopied((c) => (c === hex ? null : c)), 1500);
    } catch {
      /* clipboard tidak tersedia */
    }
  }

  const grid: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
  };
  const item: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 24, scale: 0.97 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: "spring", stiffness: 260, damping: 24 },
        },
      };

  return (
    <PageShell
      id="palette"
      eyebrow="Tema"
      title="Palet Warna"
      sub="Pilih satu dari 5 mode — seluruh tampilan langsung menyesuaikan."
      reduce={reduce}
      glow="left-[8%] top-[18%] bg-mint/10"
    >
      {/* ---- Pemilih mode (5 tema) ---- */}
      <motion.div
        variants={grid}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {THEMES.map((t) => {
          const isActive = t.id === theme;
          return (
            <motion.button
              key={t.id}
              variants={item}
              type="button"
              onClick={() => setTheme(t.id)}
              whileHover={reduce ? undefined : { y: -6 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              title={t.name}
              className={`group relative overflow-hidden rounded-2xl border p-4 text-left shadow-card outline-none transition-colors focus-visible:ring-2 focus-visible:ring-mint ${
                isActive ? "border-mint ring-2 ring-mint" : "border-line hover:border-mint"
              }`}
              style={{ background: t.surface }}
            >
              {/* mini preview kanvas */}
              <div
                className="mb-3 flex h-16 items-end gap-1.5 rounded-xl p-2"
                style={{ background: t.bg }}
              >
                <span className="h-6 w-6 rounded-full" style={{ background: t.accent }} />
                <span className="h-5 w-5 rounded-full" style={{ background: t.accent2 }} />
                <span
                  className="ml-auto h-2 w-10 self-center rounded-full"
                  style={{ background: t.line }}
                />
              </div>
              <p className="text-sm font-bold" style={{ color: t.text }}>
                {t.name}
              </p>
              {isActive && (
                <span className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-mint text-bg">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      {/* ---- Warna mode aktif (klik salin) ---- */}
      <div className="mt-10">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          Warna mode “{active.name}” · klik untuk salin
        </p>
        <motion.div
          variants={grid}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
        >
          {swatches.map((c) => (
            <motion.button
              key={c.name}
              variants={item}
              type="button"
              onClick={() => copy(c.hex)}
              whileHover={reduce ? undefined : { y: -6 }}
              title={`Salin ${c.hex}`}
              className="overflow-hidden rounded-2xl border border-line bg-surface text-left shadow-card outline-none transition-colors focus-visible:ring-2 focus-visible:ring-mint"
            >
              <span className="block h-16 w-full" style={{ background: c.hex }} />
              <span className="block px-3 py-2">
                <span className="block text-sm font-semibold text-fg">{c.name}</span>
                <span className="block font-mono text-xs text-muted">{c.hex}</span>
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Toast "Tersalin!" */}
      <div
        aria-live="polite"
        className="pointer-events-none absolute left-1/2 top-6 z-20 -translate-x-1/2"
      >
        <AnimatePresence>
          {copied && (
            <motion.span
              key={copied}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3.5 py-1.5 text-sm font-bold text-bg shadow-mint"
            >
              <Check className="h-4 w-4" /> {copied} tersalin
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </PageShell>
  );
}

/* ===================== 2. PANDUAN ===================== */

export function PanduanSection() {
  const { reduce } = useEntrance();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.16, delayChildren: 0.1 } },
  };
  const step: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 48 },
        show: {
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 230, damping: 22 },
        },
      };

  return (
    <PageShell
      id="panduan"
      eyebrow="Langkah"
      title="Panduan"
      sub="Tiga langkah dari file mentah jadi story yang siap diunggah."
      reduce={reduce}
      glow="right-[8%] top-[30%] bg-cyan/10"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT}
        className="relative grid gap-6 md:grid-cols-3"
      >
        {/* Garis penghubung horizontal (desktop) */}
        <motion.span
          aria-hidden
          className="absolute left-10 right-10 top-[3.25rem] hidden h-0.5 origin-left bg-gradient-to-r from-mint/70 via-mint/40 to-cyan/30 md:block"
          initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={VIEWPORT}
          transition={reduce ? undefined : { duration: 0.9, ease: "easeOut", delay: 0.2 }}
        />

        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              variants={step}
              whileHover={reduce ? undefined : { y: -8 }}
              className="group relative overflow-hidden rounded-[28px] border border-line bg-surface p-8 shadow-card transition-colors duration-200 hover:border-mint"
            >
              {/* nomor watermark besar */}
              <span className="pointer-events-none absolute -right-2 -top-4 font-heading text-8xl font-extrabold text-fg/[0.04]">
                {i + 1}
              </span>
              <div className="relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-mint/10 text-mint ring-1 ring-mint/20 transition-colors duration-200 group-hover:bg-mint group-hover:text-bg">
                <Icon className="h-7 w-7" strokeWidth={2} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-fg">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </PageShell>
  );
}

/* ===================== 3. TIPS ===================== */

export function TipsSection() {
  const { reduce } = useEntrance();
  const [idx, setIdx] = useState(0);

  // Auto-rotate tiap 5s — mati saat reduce-motion.
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % TIPS.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <PageShell
      id="tips"
      eyebrow="Saran"
      title="Tips"
      sub="Trik singkat agar hasil story selalu rapi dan terbaca."
      reduce={reduce}
      glow="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-mint/[0.07]"
    >
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-[36px] border border-line bg-surface p-8 shadow-card sm:p-14"
      >
        {/* Ikon kutipan besar */}
        <Quote
          className="absolute -left-3 -top-3 h-28 w-28 text-mint/10"
          strokeWidth={1.5}
          aria-hidden
        />

        <div className="relative min-h-[10rem] sm:min-h-[12rem]">
          <AnimatePresence mode="wait">
            <motion.p
              key={idx}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -24 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="font-heading text-3xl font-bold leading-snug text-fg sm:text-5xl sm:leading-tight"
            >
              {TIPS[idx].map((seg, i) => (
                <span key={i} className={seg.em ? "text-mint" : ""}>
                  {seg.t}
                </span>
              ))}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Footer: nomor + progress + dot */}
        <div className="mt-10 flex items-center gap-5">
          <span className="font-mono text-sm text-muted">
            {String(idx + 1).padStart(2, "0")}
            <span className="text-muted/50"> / {String(TIPS.length).padStart(2, "0")}</span>
          </span>

          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-line">
            {reduce ? (
              <span className="absolute inset-y-0 left-0 w-full bg-mint" />
            ) : (
              <motion.span
                key={idx}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-mint to-cyan"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            {TIPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Tampilkan tips ${i + 1}`}
                aria-current={i === idx}
                className={`h-2.5 rounded-full outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-mint ${
                  i === idx ? "w-7 bg-mint" : "w-2.5 bg-line hover:bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Lampu kecil di pojok */}
        <motion.span
          className="absolute right-8 top-8 flex h-12 w-12 items-center justify-center rounded-full bg-mint/15 text-mint ring-1 ring-mint/20"
          animate={reduce ? undefined : { scale: [1, 1.12, 1] }}
          transition={reduce ? undefined : { duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        >
          <Lightbulb className="h-6 w-6" strokeWidth={2} />
        </motion.span>
      </motion.div>
    </PageShell>
  );
}
