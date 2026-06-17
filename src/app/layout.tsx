import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";

// Font dimuat via next/font agar otomatis ter-embed & tetap muncul saat
// desain di-export menjadi gambar.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Generator Jadwal Penerbangan",
  description: "Generator desain jadwal penerbangan untuk Instagram Story",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${montserrat.variable} ${poppins.variable}`}
        style={{
          // Petakan variabel font agar bisa dipakai di inline style komponen.
          // @ts-expect-error CSS custom properties
          "--font-heading": "var(--font-montserrat)",
          "--font-body": "var(--font-poppins)",
        }}
      >
        {children}
      </body>
    </html>
  );
}
