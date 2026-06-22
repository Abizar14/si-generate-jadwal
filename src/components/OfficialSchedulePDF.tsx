"use client";

import type { FlightRow } from "@/lib/types";
import { findAirlineLogo, logoPath } from "@/lib/airlineLogos";

/**
 * Dokumen jadwal RESMI gaya AMC (A4 portrait) — replika format Bandara APT
 * Pranoto. Dipakai untuk dicetak/disimpan jadi PDF via window.print().
 * Warna ditulis eksplisit (bukan token tema) agar konsisten saat dicetak.
 */

const NAVY = "#1F4E79";
const SECTION_BG = "#9DC3E6";
const HEAD_BG = "#DDEBF7";
const BORDER = "#9BB8D3";

const KETERANGAN = [
  "Jadwal Penerbangan dalam Waktu Indonesia Tengah ( WITA )",
  "Informasi Jadwal Penerbangan berdasarkan pemberitahuan maskapai terkait",
  "Alokasi Penggunaan Conveyor Pengambilan Bagasi adalah Nomor 1 2 3",
  "Alokasi Penggunaan Ruang Tunggu beserta Boarding Gate",
];

function withSeconds(t: string): string {
  return /^\d{1,2}:\d{2}$/.test(t) ? `${t}:00` : t;
}

// Jumlah baris tetap per tabel — kekurangannya diisi baris kosong agar
// bentuk formulir konsisten, tetap dalam satu halaman A4.
const ROWS_PER_TABLE = 15;

function Table({
  title,
  rows,
  fromLabel,
  timeLabel,
  lastLabel,
}: {
  title: string;
  rows: FlightRow[];
  fromLabel: string;
  timeLabel: string;
  lastLabel: string;
}) {
  const th: React.CSSProperties = {
    background: HEAD_BG,
    color: NAVY,
    border: `1px solid ${BORDER}`,
    padding: "4px 6px",
    fontWeight: 700,
    fontSize: 9,
    textAlign: "center",
    verticalAlign: "middle",
  };
  const td: React.CSSProperties = {
    border: `1px solid ${BORDER}`,
    padding: "2.5px 6px",
    fontSize: 9.5,
    verticalAlign: "middle",
    height: 17,
  };
  // Selalu tampilkan minimal 15 baris — sisanya baris kosong.
  const padCount = Math.max(0, ROWS_PER_TABLE - rows.length);
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}>
      <thead>
        <tr>
          <th colSpan={6} style={{ background: SECTION_BG, color: "#0B3C5D", border: `1px solid ${BORDER}`, padding: "5px", fontWeight: 800, fontSize: 11, letterSpacing: 1 }}>
            {title}
          </th>
        </tr>
        <tr>
          <th style={{ ...th, width: 28 }}>NO</th>
          <th style={{ ...th, width: 92 }}>MASKAPAI</th>
          <th style={{ ...th, width: 86 }}>NOMOR PENERBANGAN</th>
          <th style={th}>{fromLabel}</th>
          <th style={{ ...th, width: 64 }}>{timeLabel}</th>
          <th style={{ ...th, width: 96 }}>{lastLabel}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const logo = findAirlineLogo(r.flightNo);
          return (
            <tr key={i}>
              <td style={{ ...td, textAlign: "center" }}>{i + 1}</td>
              <td style={{ ...td, textAlign: "center" }}>
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPath(logo.file)}
                    alt={logo.name}
                    style={{ height: 16, maxWidth: 78, objectFit: "contain", display: "inline-block" }}
                  />
                ) : (
                  ""
                )}
              </td>
              <td style={{ ...td, textAlign: "center", fontWeight: 700, color: NAVY }}>{r.flightNo}</td>
              <td style={{ ...td, color: NAVY }}>{r.airport || "-"}</td>
              <td style={{ ...td, textAlign: "center", color: NAVY, fontWeight: 700 }}>{withSeconds(r.time)}</td>
              <td style={{ ...td, textAlign: "center" }}>{r.info || "-"}</td>
            </tr>
          );
        })}
        {Array.from({ length: padCount }).map((_, i) => (
          <tr key={`pad-${i}`}>
            <td style={{ ...td, textAlign: "center" }}>{rows.length + i + 1}</td>
            <td style={td}>&nbsp;</td>
            <td style={td}>&nbsp;</td>
            <td style={td}>&nbsp;</td>
            <td style={td}>&nbsp;</td>
            <td style={td}>&nbsp;</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function OfficialSchedulePDF({
  dateText,
  departures,
  arrivals,
}: {
  dateText: string;
  departures: FlightRow[];
  arrivals: FlightRow[];
}) {
  return (
    <div
      style={{
        fontFamily: '"Times New Roman", Georgia, serif',
        color: "#111",
        background: "#fff",
        padding: "4mm 2mm",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* ---- HEADER ---- */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/globe.png" alt="" style={{ height: 52, width: 52, objectFit: "contain" }} />
        <div style={{ flex: 1, textAlign: "center", lineHeight: 1.25 }}>
          <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: 3 }}>J A D W A L &nbsp; P E N E R B A N G A N</div>
          <div style={{ fontWeight: 700, fontSize: 11 }}>
            BANDAR UDARA AJI PANGERAN TUMENGGUNG PRANOTO SAMARINDA
          </div>
          <div style={{ fontWeight: 700, fontSize: 11 }}>{dateText.toUpperCase()}</div>
        </div>
        <div
          style={{
            width: 52,
            height: 52,
            border: "2px solid #111",
            borderRadius: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 7,
            lineHeight: 1.1,
            textAlign: "center",
            fontWeight: 700,
          }}
        >
          <span style={{ fontSize: 13 }}>AMC</span>
        </div>
      </div>

      <Table
        title="ARRIVAL / KEDATANGAN"
        rows={arrivals}
        fromLabel="D A R I"
        timeLabel="DATANG"
        lastLabel="PENGAMBILAN BAGASI ( NOMOR CONVEYOR )"
      />
      <Table
        title="DEPARTURE / KEBERANGKATAN"
        rows={departures}
        fromLabel="T U J U A N"
        timeLabel="BERANGKAT"
        lastLabel="RUANG TUNGGU ( BOARDING GATE )"
      />

      {/* ---- KETERANGAN ---- */}
      <div style={{ marginTop: 6, fontSize: 9, fontStyle: "italic", lineHeight: 1.5 }}>
        <div style={{ fontWeight: 700 }}>KETERANGAN :</div>
        {KETERANGAN.map((k, i) => (
          <div key={i}>- {k}</div>
        ))}
        <div style={{ paddingLeft: 8 }}>
          Batik Air (A1) Super Air Jet (A2 A3) Wings Air (A3) Garuda Indonesia (B1) Citilink (B1) Smart Cakrawala Aviation (B1)
        </div>
      </div>

      <div style={{ marginTop: 10, textAlign: "right", fontWeight: 800, fontStyle: "italic", fontSize: 11 }}>
        APRON MOVEMENT CONTROL
      </div>
    </div>
  );
}
