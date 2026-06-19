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

/** Default hasil ukur template APT Pranoto 1080x1920 (13 slot baris). */
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
}

const TemplateSlide = forwardRef<HTMLDivElement, TemplateSlideProps>(
  function TemplateSlide({ slide, dateText, templateSrc, overlay }, ref) {
    const o = overlay;
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
          const centerY = o.firstCenterY + i * o.rowHeight;
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
