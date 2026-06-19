import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== TEMA UI "DARK + MINT" (hanya untuk antarmuka aplikasi) =====
        // Catatan: warna desain gambar hasil export TIDAK memakai palet ini —
        // lihat DesignTemplate/TemplateSlide (warna template tetap biru-putih).
        // Mengikuti tema aktif (channel R G B di globals.css, dipilih via [data-theme]).
        // Format rgb(var(--x) / <alpha-value>) agar modifier opacity (mis. bg-mint/10) jalan.
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        mint: "rgb(var(--accent) / <alpha-value>)", // nama "mint" tetap untuk kompat kelas
        cyan: "rgb(var(--accent2) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        fg: "rgb(var(--text) / <alpha-value>)",

        // Palet lama "SkyRoute" tetap ada (dipakai sebagian komponen warisan).
        brand: { DEFAULT: "#1E6BB8", dark: "#155A9E" },
        navy: { DEFAULT: "#0D2B4D", dark: "#0A2038" },
        sky: { soft: "#E6F2FF", pale: "#F5F7FA" },
      },
      backgroundImage: {
        // Gradient tombol utama (CTA): mengikuti tema aktif.
        cta: "linear-gradient(135deg, var(--cta-from) 0%, var(--cta-to) 100%)",
      },
      boxShadow: {
        card: "0 18px 45px -15px rgba(0, 0, 0, 0.55)",
        "card-hover": "0 28px 60px -18px rgba(0, 0, 0, 0.65)",
        mint: "0 14px 34px -12px rgb(var(--accent) / 0.45)",
      },
      fontFamily: {
        // UI: Clash Display (hero) + Bricolage (judul section) + Geist (body).
        display: ["var(--font-display)", "sans-serif"],
        heading: ["var(--font-heading)", "sans-serif"],
        sans: ["var(--font-geist-sans)", "sans-serif"],
        // DIPAKAI OLEH GAMBAR EXPORT (Poppins) — jangan ubah.
        body: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
