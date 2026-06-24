"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Slide } from "@/lib/types";
import SlidePreview from "./SlidePreview";
import type { OverlayConfig, GridPresetKey } from "./TemplateSlide";

interface SlideLightboxProps {
  slide: Slide;
  dateText: string;
  templateSrc?: string | null;
  overlay?: OverlayConfig;
  autoGrid?: boolean;
  gridPreset?: GridPresetKey;
  caption?: string;
  onClose: () => void;
}

/**
 * Tampilan layar penuh untuk MEMPERBESAR satu slide preview (terutama berguna
 * di HP, di mana preview di kartu terlalu kecil untuk dibaca). Skala dihitung
 * dari ukuran viewport agar slide 1080x1920 termuat utuh & sebesar mungkin.
 * Tutup dengan tombol X, klik latar gelap, atau tombol Esc.
 */
export default function SlideLightbox({
  slide,
  dateText,
  templateSrc,
  overlay,
  autoGrid,
  gridPreset,
  caption,
  onClose,
}: SlideLightboxProps) {
  // Skala agar slide muat di layar: dibatasi lebar & tinggi (sisakan ruang tepi
  // + tombol tutup). Dihitung ulang saat ukuran/orientasi layar berubah.
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    function fit() {
      const vw = window.innerWidth - 32; // sisa tepi kiri-kanan
      const vh = window.innerHeight - 96; // sisa untuk tombol tutup + tepi
      setScale(Math.min(vw / 1080, vh / 1920));
    }
    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
    };
  }, []);

  // Esc untuk menutup + kunci scroll latar selama terbuka.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pratinjau diperbesar"
      onClick={onClose}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-black/80 p-4 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Hentikan propagasi agar klik pada slide tidak menutup overlay. */}
      <div onClick={(e) => e.stopPropagation()}>
        <SlidePreview
          slide={slide}
          dateText={dateText}
          scale={scale}
          templateSrc={templateSrc}
          overlay={overlay}
          autoGrid={autoGrid}
          gridPreset={gridPreset}
        />
      </div>

      {caption && (
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/20">
          {caption}
        </span>
      )}
    </div>
  );
}
