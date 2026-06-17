// Ikon brand yang tidak tersedia di lucide-react (TikTok & X) dibuat manual
// sebagai SVG agar tampil benar saat di-export jadi gambar.

interface IconProps {
  size?: number;
  color?: string;
}

export function TikTokIcon({ size = 24, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.78.12v-3.2a5.78 5.78 0 0 0-.78-.05A5.78 5.78 0 1 0 15.64 15.4V9.01a7.3 7.3 0 0 0 4.27 1.36V7.28a4.28 4.28 0 0 1-3.31-1.46z" />
    </svg>
  );
}

export function XIcon({ size = 24, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M18.9 2H22l-7.1 8.12L23.27 22H16.7l-5.14-6.72L5.66 22H2.55l7.6-8.69L1.05 2h6.74l4.65 6.14L18.9 2zm-1.15 18.16h1.71L7.36 3.75H5.52l12.23 16.41z" />
    </svg>
  );
}

/** Starburst 4 titik (di samping pill tanggal). */
export function StarburstIcon({ size = 24, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M12 0c.6 5.2 6.8 11.4 12 12-5.2.6-11.4 6.8-12 12-.6-5.2-6.8-11.4-12-12C5.2 11.4 11.4 5.2 12 0z" />
    </svg>
  );
}
