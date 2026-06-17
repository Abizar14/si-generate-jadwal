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
        // ===== UBAH WARNA TEMA DI SINI =====
        // Biru utama untuk judul, ikon, header tabel.
        brand: {
          DEFAULT: "#1A6BFF",
          dark: "#2563EB",
        },
      },
      fontFamily: {
        // Dipetakan ke variabel next/font (lihat src/app/layout.tsx)
        heading: ["var(--font-montserrat)", "sans-serif"],
        body: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
