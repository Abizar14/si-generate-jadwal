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
  /**
   * Mode "isi kotak": img memakai max-width/max-height (bukan width/height tetap)
   * + aspek natural, sehingga logo membesar memenuhi area sampai sisi pertama
   * menyentuh batas. Dipakai overlay template agar logo tidak mengecil.
   */
  fitBox?: boolean;
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
  fitBox,
}: LogoImgProps) {
  const [failed, setFailed] = useState(false);
  const show = src && !failed;
  const w = width ?? size;
  const h = height ?? size;

  if (show) {
    // fitBox: max-width/max-height + aspek natural (logo membesar memenuhi area).
    // default: width/height tetap (perilaku lama untuk desain bawaan).
    const style: React.CSSProperties = fitBox
      ? {
          maxWidth: w,
          maxHeight: h,
          width: "auto",
          height: "auto",
          objectFit: "contain",
          display: "block",
          opacity: 1,
        }
      : { width: w, height: h, objectFit: "contain" };
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        onError={() => setFailed(true)}
        style={style}
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
