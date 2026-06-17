# Generator Jadwal Penerbangan

Web app **client-side** (tanpa backend) untuk membuat desain jadwal penerbangan
(kedatangan & keberangkatan) format **Instagram Story 1080×1920** dari file
Excel/CSV, lalu mengunduhnya sebagai PNG/JPG. Siap deploy gratis di Vercel.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- SheetJS (`xlsx`) — baca Excel/CSV
- `html-to-image` + `jszip` — export PNG/JPG (zip bila banyak slide)
- `lucide-react` — ikon

## Cara menjalankan

```bash
npm install
npm run sample   # buat public/contoh-jadwal.xlsx & .csv untuk testing (opsional)
npm run dev      # buka http://localhost:3000
```

## Alur pakai

1. Upload file `.xlsx` / `.xls` / `.csv`.
2. Data otomatis dibaca & dipisah jadi **Keberangkatan** dan **Kedatangan**.
3. Preview semua slide muncul real-time. Atur tanggal, maks baris/slide, format.
4. Klik **Download** (satu file, atau `.zip` bila >1 slide).

## Struktur data file

Kolom yang dikenali (nama fleksibel — huruf besar/kecil & spasi bebas):

| Kolom | Contoh |
|---|---|
| Jenis | Keberangkatan / Kedatangan |
| No Penerbangan | WON 1472 |
| Bandara | BANDAR UDARA MELALAN (GHS) |
| Jam | 09:05 |

Pemisahan kedatangan/keberangkatan: lewat **kolom "Jenis"**, atau lewat **nama
sheet** ("Kedatangan"/"Keberangkatan"). Keduanya didukung.

## File yang sering diubah

| Hal | File |
|---|---|
| Warna & layout desain | [src/components/DesignTemplate.tsx](src/components/DesignTemplate.tsx) |
| Mapping logo maskapai | [src/lib/airlineLogos.ts](src/lib/airlineLogos.ts) |
| Nama kolom / alias | [src/lib/parseSchedule.ts](src/lib/parseSchedule.ts) |
| Maks baris per slide | [src/lib/pagination.ts](src/lib/pagination.ts) |
| Logo (aset gambar) | [public/logos/](public/logos/) |
