---
name: jadwal-penerbangan
description: >-
  Panduan merawat & mengembangkan web app Generator Jadwal Penerbangan (Next.js
  client-side, export desain Instagram Story 1080x1920 dari Excel/CSV). Gunakan
  skill ini saat menambah maskapai/logo baru, mengubah warna/font/layout desain,
  menyesuaikan parsing kolom, mengatur batas baris per slide, atau menjalankan &
  men-deploy aplikasi.
---

# Skill: Generator Jadwal Penerbangan

Web app **client-side penuh** (tanpa backend) yang membaca file Excel/CSV jadwal
penerbangan lalu menghasilkan desain **Instagram Story 1080×1920** siap unduh
(PNG/JPG). Stack: Next.js (App Router) + TypeScript + Tailwind + SheetJS +
`html-to-image` + `jszip` + `lucide-react`.

## Peta file (mana mengubah apa)

| Mau ubah… | File |
|---|---|
| Warna, font, layout, teks footer, ukuran px desain | `src/components/DesignTemplate.tsx` |
| Mapping prefix kode penerbangan → logo maskapai | `src/lib/airlineLogos.ts` |
| Nama/alias kolom yang dikenali dari file | `src/lib/parseSchedule.ts` (`COLUMN_ALIASES`) |
| Batas baris per slide / aturan auto-split | `src/lib/pagination.ts` (`MAX_ROWS_PER_SLIDE`) |
| Logika export PNG/JPG/zip | `src/lib/exportImage.ts` |
| Format tanggal Indonesia | `src/lib/formatDate.ts` |
| Halaman utama / state / kontrol UI | `src/app/page.tsx` |
| Font (next/font) | `src/app/layout.tsx` |
| Aset gambar (logo) | `public/logos/` |

## Alur data (penting saat debugging)

```
File upload
  → parseFile()           (src/lib/parseSchedule.ts)  → { departures, arrivals, warnings }
  → buildSlides()         (src/lib/pagination.ts)     → Slide[]  (auto-split per MAX_ROWS_PER_SLIDE)
  → <SlidePreview>        (render DesignTemplate ukuran asli, ditampilkan ter-scale)
  → downloadAllSlides()   (src/lib/exportImage.ts)    → PNG/JPG, >1 slide jadi .zip
```

`SlidePreview` meneruskan `ref` ke node **ukuran asli 1080×1920** (bukan versi
preview yang di-scale) supaya hasil export selalu pixel-perfect.

## Tugas umum

### Menambah maskapai baru
1. Taruh PNG transparan di `public/logos/<nama>.png`.
2. Tambah entri di `AIRLINE_LOGOS` (`src/lib/airlineLogos.ts`):
   ```ts
   { prefix: "QG", name: "Citilink", file: "citilink.png" },
   ```
3. Pencocokan otomatis pakai **prefix terpanjang dulu** (mis. "PK SNH" menang
   atas "PK"), jadi urutan array tidak masalah.
4. Kode tak dikenal → placeholder kosong, **tidak error**.

### Mengubah warna/tema
Edit konstanta di atas `src/components/DesignTemplate.tsx`:
`BRAND`, `BG`, `TEXT_DARK`, `TEXT_MUTED`. Warna brand Tailwind juga di
`tailwind.config.ts` (`colors.brand`).

### Menyesuaikan nama kolom file
Tambah alias di `COLUMN_ALIASES` (`src/lib/parseSchedule.ts`). Pencocokan
mengabaikan huruf besar/kecil & spasi.

### Mengubah batas baris per slide
Ubah `MAX_ROWS_PER_SLIDE` di `src/lib/pagination.ts` (atau lewat input di UI).

## Aturan & batasan yang WAJIB dijaga

- **Tetap client-side** — jangan tambah backend/route API/DB. Harus jalan
  sebagai static/SSR di Vercel gratis.
- **Ukuran export tetap** 1080×1920 px (jangan pakai persen pada node export).
- **Font via next/font** + tunggu `document.fonts.ready` sebelum export, supaya
  teks tidak hilang di gambar.
- **Pakai `<img>` biasa** (bukan `next/image`) untuk logo — `next/image` tak
  ter-render oleh `html-to-image`.
- **Hormati safe zone IG Story** — jangan taruh info penting di ~110–250px
  paling atas/bawah.
- Selalu sediakan **placeholder** bila aset/logo belum ada (jangan biarkan error).
- SheetJS dipasang dari **CDN tarball** (lihat `package.json`), bukan registry
  npm (versi npm usang). Build ESM perlu buffer untuk tulis file (lihat
  `scripts/generate-sample.mjs`).

## Perintah

```bash
npm install            # pasang dependency
npm run sample         # buat public/contoh-jadwal.xlsx & .csv untuk testing
npm run dev            # http://localhost:3000
npm run build          # verifikasi produksi (selalu jalankan sebelum deploy)
```

> Catatan lingkungan: jika `npm install` gagal `ENOSPC` karena disk C: penuh,
> arahkan cache ke drive lain: `npm install --cache D:\npm-cache`.

## Deploy (Vercel)

Konfigurasi ada di `vercel.json`. Vercel auto-detect Next.js. Cek `DEPLOY.md`
untuk langkah lengkap. Tidak perlu environment variable apa pun (full client-side).

## Verifikasi setelah perubahan

1. `npm run build` harus lolos (type-check + lint).
2. `npm run dev`, upload `public/contoh-jadwal.xlsx`.
3. Pastikan: 2 grup (keberangkatan/kedatangan) terpisah, logo/placeholder muncul,
   tanggal benar, dan download menghasilkan gambar 1080×1920 (atau .zip).
