"use client";

/**
 * Section "Contoh Hasil Story" — etalase contoh output Instagram Story (1080×1920)
 * dalam bentuk kartu kipas 3D (CardStack). Murni pajangan/visual; tidak terkait
 * proses export di panel Generate. Gambar memakai aset asli di /public.
 */

import { motion, useReducedMotion } from "framer-motion";
import { CardStack, type CardStackItem } from "@/components/ui/card-stack";

const VIEWPORT = { once: true, amount: 0.3 } as const;

// Contoh output asli SIGAP (potret 1080×1920) dari folder /public.
const STORIES: CardStackItem[] = [
  {
    id: "hasil-generate",
    title: "Hasil Generate",
    description: "Story keberangkatan langsung dari file jadwal.",
    imageSrc: "/jadwal-penerbangan-dari-generate.png",
  },
  {
    id: "template-berangkat",
    title: "Template Keberangkatan",
    description: "Desain bawaan siap diisi data.",
    imageSrc: "/template-jadwal/keberangkatan.png",
  },
  {
    id: "template-datang",
    title: "Template Kedatangan",
    description: "Tema biru-putih, konsisten & rapi.",
    imageSrc: "/template-jadwal/kedatangan.png",
  },
  {
    id: "desain-asli",
    title: "Desain Resmi",
    description: "Referensi desain jadwal keberangkatan asli.",
    imageSrc: "/DESIGN JADWAL PENERBANGAN KEBERANGKATAN ASLI.png",
  },
];

export default function StoryShowcase() {
  const reduce = useReducedMotion();

  return (
    <section
      id="contoh"
      className="snap-page relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 py-24 sm:px-6"
    >
      {/* Glow dekoratif */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-mint/10 blur-[120px]"
        animate={reduce ? undefined : { scale: [1, 1.18, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={reduce ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Judul */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 mb-10 text-center"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.45em] text-mint">
          Galeri
        </p>
        <h2 className="font-heading text-5xl font-extrabold leading-none text-fg sm:text-7xl">
          Contoh Hasil Story
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted sm:text-base">
          Geser atau klik kartunya — beginilah tampilan story yang dihasilkan SIGAP.
        </p>
        <motion.span
          className="mx-auto mt-6 block h-1 w-24 rounded-full bg-gradient-to-r from-mint to-cyan"
          initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={VIEWPORT}
          transition={reduce ? undefined : { duration: 0.6, delay: 0.25 }}
        />
      </motion.div>

      {/* Kartu kipas 3D — ukuran potret 9:16 menyerupai IG Story */}
      <div className="relative z-10 w-full max-w-4xl">
        <CardStack
          items={STORIES}
          cardWidth={288}
          cardHeight={512}
          maxVisible={5}
          overlap={0.55}
          spreadDeg={34}
          tiltXDeg={10}
          activeLiftPx={26}
          autoAdvance
          intervalMs={3000}
          pauseOnHover
          loop
          showDots
        />
      </div>
    </section>
  );
}
