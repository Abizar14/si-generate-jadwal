"use client";

import { forwardRef } from "react";
import type { Slide } from "@/lib/types";
import { findAirlineLogo, logoPath } from "@/lib/airlineLogos";
import LogoImg from "./LogoImg";

// ====================================================================
// OVERLAY DI ATAS TEMPLATE CANVA
// --------------------------------------------------------------------
// Template kosong (PNG 1080x1920 dari Canva) jadi LATAR. Kode hanya
// menstempel: tanggal + tiap baris (logo · no penerbangan · bandara · jam)
// pada KOORDINAT yang diukur langsung dari Canva (px Canva = px export).
//
// Nilai DIUKUR dari Canva. Baris data ke-1: X=147.4 Y=592.1 W=771 H=48.3
// → blockLeft 147, blockRight 918 (147.4+771), firstCenterY 616 (592.1+48.3/2).
// Font isi = Poppins (var(--font-body)). Kode penerbangan Bold 14, bandara
// Light 14, jam 18. Kalibrasi angka di DEFAULT_OVERLAY bila kurang pas.
// ====================================================================

const CANVAS_W = 1080;
const CANVAS_H = 1920;

/** Geometri & tipografi overlay (semua dalam px kanvas 1080x1920). */
export interface OverlayConfig {
  /** Pusat (Y) baris pertama. */
  firstCenterY: number;
  /** Jarak antar baris (selisih Y antar baris). */
  rowHeight: number;
  /** Tepi kiri & kanan area baris. */
  blockLeft: number;
  blockRight: number;

  /** Logo: pusat X + kotak maksimum (rasio dijaga). */
  logoCenterX: number;
  logoMaxW: number;
  logoMaxH: number;

  /** Kode penerbangan (baris atas): tepi kiri, ukuran, bobot. */
  flightX: number;
  flightSize: number;
  flightWeight: number;

  /** Nama bandara (baris bawah): tepi kiri, ukuran, bobot. */
  airportX: number;
  airportSize: number;
  airportWeight: number;

  /** Jam (rata kanan di rightX). */
  timeRightX: number;
  timeSize: number;
  timeWeight: number;

  /** Tanggal: tampil? + titik PUSAT (x,y) + ukuran. */
  showDate: boolean;
  dateX: number;
  dateY: number;
  dateSize: number;
}

// Geometri grid template BAWAAN. Garis baris DAN badan kotak (border + sudut
// bawah membulat) digambar oleh kode — PNG hanya berisi header, bar "AAP", &
// footer. Jadi KOTAK ikut MENYUSUT mengikuti jumlah baris (jarak baris tetap).
export const BUILTIN_GRID = {
  cardTop: 558, // tepi atas badan kotak (tepat di bawah bar "AAP")
  contentTop: 580, // pusat baris ke-1 = contentTop + rowHeight/2 (padding atas ~22px)
  rowPadBottom: 22, // jarak baris terakhir ke tepi bawah kotak
  emptyBottom: 1677, // tinggi kotak saat belum ada data (tampil seperti template penuh)
  cardLeft: 109,
  cardWidth: 862, // tepi kanan = 109 + 862 = 971
  cardRadius: 20, // radius sudut bawah kotak
  cardBorderColor: "#AEBFCD",
  lineX0: 114,
  lineX1: 966,
  lineColor: "#D8E1EA",
};

// Dua PRESET kepadatan baris. Di KEDUANYA kotak tetap digambar dinamis & ikut
// menyusut saat baris dihapus — yang beda hanya tinggi baris & batas maks.
export type GridPresetKey = "padat" | "lega";
export const GRID_PRESETS: Record<
  GridPresetKey,
  { label: string; maxRows: number; rowHeight: number }
> = {
  // Template 2 (default) — rapat, muat 15 baris sebelum footer (y≈1759).
  padat: { label: "Padat · 15 baris", maxRows: 15, rowHeight: 74 },
  // Template 1 — baris lebih tinggi/lega, 13 baris penuh tetap mengisi kanvas.
  lega: { label: "Lega · 13 baris", maxRows: 13, rowHeight: 85 },
};

/** Jarak baris KONSTAN per preset — yang menyusut adalah KOTAK-nya, bukan jaraknya. */
export function gridRowHeight(preset: GridPresetKey = "padat"): number {
  return GRID_PRESETS[preset].rowHeight;
}

/** Tepi bawah kotak menyesuaikan jumlah baris (menyusut saat data sedikit). */
export function cardBottomY(rowCount: number, preset: GridPresetKey = "padat"): number {
  if (rowCount <= 0) return BUILTIN_GRID.emptyBottom;
  return (
    BUILTIN_GRID.contentTop + rowCount * gridRowHeight(preset) + BUILTIN_GRID.rowPadBottom
  );
}

/** Default overlay untuk template UNGGAHAN sendiri (built-in pakai grid dinamis). */
export const DEFAULT_OVERLAY: OverlayConfig = {
  firstCenterY: 616,
  rowHeight: 84,
  blockLeft: 147,
  blockRight: 918,

  logoCenterX: 204, // pusat area logo = 147.4 + 112.6/2 (Canva)
  logoMaxW: 116, // lebar area logo (wordmark terlebar di asli ~112)
  logoMaxH: 44, // tinggi area logo — dinaikkan dari 30 agar logo kotak (mis. bintang) tidak setengah ukuran

  flightX: 320,
  flightSize: 20, // diukur dari desain asli: cap-height ~13px → ~20px
  flightWeight: 600, // SemiBold

  airportX: 320,
  airportSize: 19, // sedikit lebih kecil dari kode penerbangan (Regular)
  airportWeight: 400,

  timeRightX: 918,
  timeSize: 26, // diukur dari desain asli: tinggi digit ~18px → ~26px
  timeWeight: 400, // Regular (ramping, bukan tebal)

  showDate: true,
  dateX: 146, // tepi kiri (rata kiri) — Canva X=146.2
  dateY: 466, // pusat vertikal — Canva 452.3 + 27.9/2
  dateSize: 24, // Canva 17.8
};

// Semua teks dinamis memakai warna yang sama (#596A76) — tidak ada hitam pekat.
const TEXT_DARK = "#596A76";
const TEXT_MUTED = "#596A76";

interface TemplateSlideProps {
  slide: Slide;
  dateText: string;
  /** Sumber gambar template (path statis atau data URL upload). */
  templateSrc: string;
  overlay: OverlayConfig;
  /** Template bawaan → garis & jarak baris digambar otomatis (dinamis). */
  autoGrid?: boolean;
  /** Preset kepadatan baris untuk grid bawaan (padat 15 / lega 13). */
  gridPreset?: GridPresetKey;
}

const TemplateSlide = forwardRef<HTMLDivElement, TemplateSlideProps>(
  function TemplateSlide(
    { slide, dateText, templateSrc, overlay, autoGrid = false, gridPreset = "padat" },
    ref
  ) {
    const o = overlay;
    const n = slide.rows.length;
    // Grid dinamis (template bawaan): jarak baris tetap, KOTAK yang menyusut.
    const gridRH = gridRowHeight(gridPreset);
    const cardBottom = cardBottomY(n, gridPreset);
    // Semua baris seragam: pusat baris ke-i di tengah selnya masing-masing.
    const rowCenterY = (i: number) =>
      autoGrid
        ? BUILTIN_GRID.contentTop + (i + 0.5) * gridRH
        : o.firstCenterY + i * o.rowHeight;
    return (
      <div
        ref={ref}
        style={{
          position: "relative",
          width: CANVAS_W,
          height: CANVAS_H,
          overflow: "hidden",
          background: "#fff",
          fontFamily: "var(--font-body)",
        }}
      >
        {/* Latar: gambar template kosong */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={templateSrc}
          alt="Template desain"
          width={CANVAS_W}
          height={CANVAS_H}
          crossOrigin="anonymous"
          style={{
            position: "absolute",
            inset: 0,
            width: CANVAS_W,
            height: CANVAS_H,
            objectFit: "fill",
          }}
        />

        {/* Badan kotak (border + sudut bawah membulat) — digambar dinamis agar
            KOTAK menyusut mengikuti jumlah baris. Atas terbuka (menyatu ke bar AAP). */}
        {autoGrid && (
          <div
            style={{
              position: "absolute",
              left: BUILTIN_GRID.cardLeft,
              width: BUILTIN_GRID.cardWidth,
              top: BUILTIN_GRID.cardTop,
              height: cardBottom - BUILTIN_GRID.cardTop,
              boxSizing: "border-box",
              borderLeft: `2px solid ${BUILTIN_GRID.cardBorderColor}`,
              borderRight: `2px solid ${BUILTIN_GRID.cardBorderColor}`,
              borderBottom: `2px solid ${BUILTIN_GRID.cardBorderColor}`,
              borderBottomLeftRadius: BUILTIN_GRID.cardRadius,
              borderBottomRightRadius: BUILTIN_GRID.cardRadius,
            }}
          />
        )}

        {/* Garis pemisah baris (digambar dinamis — hanya untuk template bawaan).
            Jumlah garis = jumlah baris − 1, jadi area kosong tidak bergaris. */}
        {autoGrid &&
          Array.from({ length: Math.max(0, n - 1) }).map((_, i) => (
            <div
              key={`grid-line-${i}`}
              style={{
                position: "absolute",
                left: BUILTIN_GRID.lineX0,
                width: BUILTIN_GRID.lineX1 - BUILTIN_GRID.lineX0,
                top: BUILTIN_GRID.contentTop + (i + 1) * gridRH,
                height: 2,
                background: BUILTIN_GRID.lineColor,
              }}
            />
          ))}

        {/* Tanggal (pusat di dateX,dateY) */}
        {o.showDate && (
          <div
            style={{
              position: "absolute",
              left: o.dateX,
              top: o.dateY,
              transform: "translateY(-50%)",
              fontFamily: "var(--font-body)",
              fontSize: o.dateSize,
              fontWeight: 400,
              color: TEXT_DARK,
              whiteSpace: "nowrap",
            }}
          >
            {dateText}
          </div>
        )}

        {/* Baris data — tiap elemen diposisikan absolut sesuai koordinat Canva */}
        {slide.rows.map((r, i) => {
          const centerY = rowCenterY(i);
          const logo = findAirlineLogo(r.flightNo);
          return (
            <div key={i}>
              {/* Logo maskapai (pusat di logoCenterX, rata tengah vertikal) */}
              <div
                style={{
                  position: "absolute",
                  left: o.logoCenterX,
                  top: centerY,
                  transform: "translate(-50%, -50%)",
                  width: o.logoMaxW,
                  height: o.logoMaxH,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LogoImg
                  src={logo ? logoPath(logo.file) : null}
                  alt={logo?.name ?? r.flightNo}
                  size={o.logoMaxH}
                  width={o.logoMaxW}
                  height={o.logoMaxH}
                  placeholderLabel="logo"
                  fitBox
                />
              </div>

              {/* No penerbangan (baris atas, Bold) */}
              <div
                style={{
                  position: "absolute",
                  left: o.flightX,
                  top: centerY,
                  transform: "translateY(-50%)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  maxWidth: o.timeRightX - o.flightX - 24,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: o.flightSize,
                    fontWeight: o.flightWeight,
                    color: TEXT_DARK,
                    lineHeight: 1.15,
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.flightNo}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: o.airportSize,
                    fontWeight: o.airportWeight,
                    color: TEXT_MUTED,
                    lineHeight: 1.2,
                    letterSpacing: "0.4px",
                    marginLeft: o.airportX - o.flightX,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {r.airport || "-"}
                </span>
              </div>

              {/* Jam (rata kanan di timeRightX) */}
              <div
                style={{
                  position: "absolute",
                  right: CANVAS_W - o.timeRightX,
                  top: centerY,
                  transform: "translateY(-50%)",
                  fontFamily: "var(--font-body)",
                  fontSize: o.timeSize,
                  fontWeight: o.timeWeight,
                  color: TEXT_DARK,
                  whiteSpace: "nowrap",
                  textAlign: "right",
                }}
              >
                {r.time || "--:--"}
              </div>
            </div>
          );
        })}

        {/* Penanda halaman bila >1 slide */}
        {slide.pageCount > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: 48,
              right: 48,
              background: "#2563EB",
              color: "#fff",
              borderRadius: 999,
              padding: "8px 22px",
              fontFamily: "var(--font-body)",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {slide.pageIndex}/{slide.pageCount}
          </div>
        )}
      </div>
    );
  }
);

export default TemplateSlide;
