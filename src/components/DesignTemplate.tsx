"use client";

import { forwardRef } from "react";
import { Plane, Instagram, Facebook, Youtube } from "lucide-react";
import type { Slide } from "@/lib/types";
import { findAirlineLogo, logoPath } from "@/lib/airlineLogos";
import LogoImg from "./LogoImg";
import { StarburstIcon, TikTokIcon, XIcon } from "./icons";

// ====================================================================
// SPESIFIKASI DESAIN — semua ukuran dalam PIXEL (kanvas tetap 1080x1920).
// Bagian yang sering diubah ditandai komentar.
// ====================================================================

// ----- WARNA (samakan dengan file Canva bila perlu) -----
const BRAND = "#1A6BFF"; // biru utama (judul, ikon, header tabel)
const BG = "#F5F8FC"; // background putih kebiruan
const TEXT_DARK = "#1F2937"; // teks utama gelap
const TEXT_MUTED = "#6B7280"; // teks sekunder (nama bandara)

const CANVAS_W = 1080;
const CANVAS_H = 1920;
const PAD_X = 72; // padding kiri-kanan

// ----- FOOTER STATIS (ubah teks akun di sini) -----
const FOOTER = {
  website: "www.aptpairport.id",
  socialHandle: "aptpranotoairport",
  xHandle: "aptp_airport",
};

interface DesignTemplateProps {
  slide: Slide;
  /** Teks tanggal yang sudah diformat, mis. "Rabu, 17 Juni 2026". */
  dateText: string;
}

/** Satu baris jadwal di dalam kartu putih. */
function FlightRowItem({
  flightNo,
  airport,
  time,
  showDivider,
}: {
  flightNo: string;
  airport: string;
  time: string;
  showDivider: boolean;
}) {
  const logo = findAirlineLogo(flightNo);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "16px 32px",
        borderTop: showDivider ? "1px solid #EEF1F6" : "none",
        minHeight: 78,
      }}
    >
      {/* Logo maskapai (otomatis dari kode penerbangan) */}
      <LogoImg
        src={logo ? logoPath(logo.file) : null}
        alt={logo?.name ?? flightNo}
        size={64}
        placeholderLabel="logo"
      />

      {/* No penerbangan + nama bandara */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            fontSize: 32,
            color: TEXT_DARK,
            lineHeight: 1.1,
          }}
        >
          {flightNo}
        </div>
        <div
          style={{
            fontSize: 22,
            color: TEXT_MUTED,
            lineHeight: 1.2,
            marginTop: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {airport || "-"}
        </div>
      </div>

      {/* Jam */}
      <div
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: 36,
          color: TEXT_DARK,
          whiteSpace: "nowrap",
        }}
      >
        {time || "--:--"}
      </div>
    </div>
  );
}

const DesignTemplate = forwardRef<HTMLDivElement, DesignTemplateProps>(
  function DesignTemplate({ slide, dateText }, ref) {
    const showPager = slide.pageCount > 1;

    return (
      <div
        ref={ref}
        style={{
          position: "relative",
          width: CANVAS_W,
          height: CANVAS_H,
          background: BG,
          fontFamily: "var(--font-body)",
          overflow: "hidden",
          color: TEXT_DARK,
        }}
      >
        {/* ===== Gradient blob dekoratif (atas & bawah) ===== */}
        <div
          style={{
            position: "absolute",
            top: -260,
            right: -200,
            width: 720,
            height: 720,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 30%, rgba(26,107,255,0.28), rgba(20,184,166,0.18) 45%, rgba(34,211,238,0.0) 72%)",
            filter: "blur(8px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -280,
            left: -220,
            width: 760,
            height: 760,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 60% 60%, rgba(34,211,238,0.26), rgba(20,184,166,0.16) 45%, rgba(26,107,255,0.0) 72%)",
            filter: "blur(8px)",
          }}
        />

        {/* ===== Konten (di atas blob) ===== */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: `0 ${PAD_X}px`,
          }}
        >
          {/* ---- HEADER: logo globe + logo airport ---- */}
          {/* paddingTop 110 menjaga jarak dari safe-zone IG Story atas */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: 110,
            }}
          >
            <LogoImg
              src="/logos/globe.png"
              alt="Globe"
              size={104}
              placeholderLabel="globe"
            />
            <LogoImg
              src="/logos/apt-pranoto.png"
              alt="APT Pranoto Airport"
              size={104}
              width={300}
              height={104}
              placeholderLabel="logo airport"
            />
          </div>

          {/* ---- JUDUL: lingkaran pesawat + teks 2 baris ---- */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 70 }}
          >
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: BRAND,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 10px 24px rgba(26,107,255,0.35)",
              }}
            >
              <Plane size={56} color="#ffffff" style={{ transform: "rotate(45deg)" }} />
            </div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: 60,
                lineHeight: 1.02,
                letterSpacing: "-0.5px",
                textTransform: "uppercase",
                color: TEXT_DARK,
              }}
            >
              {slide.title.split(" ").map((word, i) => (
                <div key={i} style={i === 0 ? undefined : { color: BRAND }}>
                  {word}
                </div>
              ))}
            </div>
          </div>

          {/* garis pemisah tipis */}
          <div style={{ height: 2, background: "#E2E8F0", marginTop: 28 }} />

          {/* ---- PILL TANGGAL ---- */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 32 }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                border: `2px solid ${BRAND}`,
                borderRadius: 999,
                padding: "12px 34px",
                fontSize: 30,
                fontWeight: 600,
                color: TEXT_DARK,
              }}
            >
              {dateText}
            </div>
            <StarburstIcon size={40} color={BRAND} />
          </div>

          {/* ---- HEADER TABEL (bar biru) ---- */}
          <div
            style={{
              marginTop: 40,
              background: BRAND,
              borderRadius: 22,
              height: 72,
              display: "flex",
              alignItems: "center",
              padding: "0 32px",
              position: "relative",
            }}
          >
            {/* 2 bulatan putih (titik window) di kiri */}
            <div style={{ display: "flex", gap: 12, position: "absolute", left: 32 }}>
              <span style={dot} />
              <span style={dot} />
            </div>
            <div
              style={{
                flex: 1,
                textAlign: "center",
                color: "#fff",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: 30,
                letterSpacing: 2,
              }}
            >
              {/* [ISI SENDIRI] teks header tabel */}
              AAP
            </div>
          </div>

          {/* ---- KARTU BARIS JADWAL ---- */}
          <div
            style={{
              marginTop: 22,
              background: "#fff",
              borderRadius: 24,
              boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
              padding: "8px 0",
              flex: 1,
              overflow: "hidden",
            }}
          >
            {slide.rows.map((r, i) => (
              <FlightRowItem
                key={i}
                flightNo={r.flightNo}
                airport={r.airport}
                time={r.time}
                showDivider={i > 0}
              />
            ))}
          </div>

          {/* ---- FOOTER STATIS ---- */}
          {/* paddingBottom 110 menjaga jarak dari safe-zone IG Story bawah */}
          <div style={{ paddingTop: 30, paddingBottom: 110 }}>
            <div style={{ height: 2, background: "#E2E8F0", marginBottom: 24 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
              <span style={{ color: BRAND, fontWeight: 700, fontSize: 26 }}>Website</span>
              <span style={{ fontSize: 26, color: TEXT_DARK }}>{FOOTER.website}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              <span style={{ color: BRAND, fontWeight: 700, fontSize: 26 }}>Social Media</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <Instagram size={30} color={TEXT_DARK} />
                <Facebook size={30} color={TEXT_DARK} />
                <Youtube size={30} color={TEXT_DARK} />
                <TikTokIcon size={28} color={TEXT_DARK} />
                <span style={{ fontSize: 26, color: TEXT_DARK }}>{FOOTER.socialHandle}</span>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <XIcon size={26} color={TEXT_DARK} />
                <span style={{ fontSize: 26, color: TEXT_DARK }}>{FOOTER.xHandle}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ---- PENANDA HALAMAN (mis. 1/2) ---- */}
        {showPager && (
          <div
            style={{
              position: "absolute",
              bottom: 48,
              right: 48,
              zIndex: 2,
              background: BRAND,
              color: "#fff",
              borderRadius: 999,
              padding: "8px 22px",
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

const dot: React.CSSProperties = {
  width: 16,
  height: 16,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.85)",
};

export default DesignTemplate;
