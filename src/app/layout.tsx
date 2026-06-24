import type { Metadata } from "next";
import { Montserrat, Poppins, Bricolage_Grotesque } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

// === FONT GAMBAR EXPORT (jangan ubah) =================================
// Montserrat & Poppins dipakai oleh desain hasil export (DesignTemplate /
// TemplateSlide). Dimuat via next/font agar ter-embed saat di-export ke gambar.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// === FONT UI (tema dark + mint) =======================================
// Geist Sans = body/UI/tombol/label. Bricolage Grotesque = judul section.
// Clash Display = judul hero (1 saja) via link Fontshare di <head>.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIGAP — Jadwal Penerbangan APT Pranoto",
  description:
    "SIGAP — Sistem Informasi Generate APT Pranoto. Buat desain jadwal penerbangan Bandara APT Pranoto Samarinda siap posting ke Instagram Story.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        {/* Set tema sedini mungkin agar tidak ada "flash" tema salah saat refresh. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{document.documentElement.dataset.theme=localStorage.getItem('theme')||'mint'}catch(e){document.documentElement.dataset.theme='mint'}",
          }}
        />
        {/* Jaring pengaman: muat ulang sekali bila chunk/modul dinamis gagal
            dimuat (deploy basi di HP). Dijaga sessionStorage agar tak loop. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){function isChunk(m){return /ChunkLoadError|Loading chunk [\\w-]+ failed|Loading CSS chunk|Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(m||'')}function reload(){try{if(sessionStorage.getItem('chunk-reloaded'))return;sessionStorage.setItem('chunk-reloaded','1')}catch(e){}location.reload()}addEventListener('error',function(e){var t=e&&e.error;if(isChunk(t&&t.message||e.message))reload()});addEventListener('unhandledrejection',function(e){var r=e&&e.reason;if(isChunk(r&&r.message||String(r||'')))reload()})})()",
          }}
        />
        {/* Clash Display (judul UI) — tidak tersedia di next/font/google. */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${montserrat.variable} ${poppins.variable} ${bricolage.variable} ${GeistSans.variable} bg-bg font-sans text-fg antialiased`}
        style={{
          // Petakan variabel font agar bisa dipakai di inline style komponen.
          // --font-body = GAMBAR EXPORT (Poppins, jangan diubah).
          // --font-heading = judul section UI (Bricolage).
          // --font-display = judul hero UI (Clash Display dari Fontshare).
          // @ts-expect-error CSS custom properties
          "--font-heading": "var(--font-bricolage)",
          "--font-body": "var(--font-poppins)",
          "--font-display": "'Clash Display', var(--font-geist-sans), sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
