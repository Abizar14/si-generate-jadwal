"use client";

import { useState } from "react";

interface LogoImgProps {
  src: string | null;
  alt: string;
  /** ukuran kotak (px). Dipakai sebagai lebar & tinggi bila width/height tak diisi. */
  size: number;
  /** lebar khusus (px) untuk logo non-kotak, mis. logo airport. */
  width?: number;
  /** tinggi khusus (px). */
  height?: number;
  /** label kecil yang tampil di placeholder */
  placeholderLabel?: string;
  className?: string;
}

/**
 * Menampilkan gambar logo. Jika file belum ada / gagal dimuat (atau src null),
 * tampilkan kotak placeholder berukuran sama agar layout tidak rusak.
 * Pakai <img> biasa (bukan next/image) supaya html-to-image bisa mengekspornya.
 */
export default function LogoImg({
  src,
  alt,
  size,
  width,
  height,
  placeholderLabel,
  className,
}: LogoImgProps) {
  const [failed, setFailed] = useState(false);
  const show = src && !failed;
  const w = width ?? size;
  const h = height ?? size;

  if (show) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={w}
        height={h}
        crossOrigin="anonymous"
        onError={() => setFailed(true)}
        style={{ width: w, height: h, objectFit: "contain" }}
        className={className}
      />
    );
  }

  return (
    <div
      style={{ width: w, height: h }}
      className={`flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-100 text-center text-slate-400 ${className ?? ""}`}
      title={`Placeholder: ${alt}`}
    >
      <span style={{ fontSize: Math.max(10, Math.min(w, h) * 0.16), lineHeight: 1.1 }}>
        {placeholderLabel ?? "logo"}
      </span>
    </div>
  );
}
