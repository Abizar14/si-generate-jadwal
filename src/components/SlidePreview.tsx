"use client";

import { forwardRef } from "react";
import type { Slide } from "@/lib/types";
import DesignTemplate from "./DesignTemplate";
import TemplateSlide, { type OverlayConfig } from "./TemplateSlide";

interface SlidePreviewProps {
  slide: Slide;
  dateText: string;
  /** faktor skala untuk preview (1 = ukuran asli 1080x1920). */
  scale?: number;
  /** Data URL gambar template untuk jenis slide ini (opsional). */
  templateSrc?: string | null;
  /** Geometri overlay (dipakai bila templateSrc ada). */
  overlay?: OverlayConfig;
  /** Template bawaan → garis & jarak baris otomatis (dinamis). */
  autoGrid?: boolean;
}

/**
 * Membungkus konten ukuran asli (1080x1920) lalu menampilkannya dalam versi
 * yang di-scale untuk preview. Ref diteruskan ke node ukuran ASLI sehingga
 * hasil export tetap 1080x1920.
 *
 * Bila `templateSrc` diberikan, render di atas gambar template asli;
 * jika tidak, pakai desain bawaan (DesignTemplate).
 */
const SlidePreview = forwardRef<HTMLDivElement, SlidePreviewProps>(
  function SlidePreview({ slide, dateText, scale = 0.3, templateSrc, overlay, autoGrid }, ref) {
    return (
      <div
        style={{
          width: 1080 * scale,
          height: 1920 * scale,
          overflow: "hidden",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
        }}
      >
        <div
          style={{
            width: 1080,
            height: 1920,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {templateSrc && overlay ? (
            <TemplateSlide
              ref={ref}
              slide={slide}
              dateText={dateText}
              templateSrc={templateSrc}
              overlay={overlay}
              autoGrid={autoGrid}
            />
          ) : (
            <DesignTemplate ref={ref} slide={slide} dateText={dateText} />
          )}
        </div>
      </div>
    );
  }
);

export default SlidePreview;
