# PRD — Generator Desain Jadwal Penerbangan

| | |
|---|---|
| **Produk** | Generator Desain Jadwal Penerbangan (Web App) |
| **Versi dokumen** | 1.0 |
| **Tanggal** | 17 Juni 2026 |
| **Pemilik** | Tim Media / Humas Bandara APT Pranoto |
| **Status** | MVP selesai (siap pakai dengan data contoh) |

---

## 1. Latar Belakang & Masalah

Tim media bandara rutin membuat desain **jadwal penerbangan** (kedatangan &
keberangkatan) untuk diposting sebagai **Instagram Story**. Saat ini desain
dibuat manual di Canva — setiap perubahan jadwal harus diketik ulang satu per
satu, rawan typo, dan memakan waktu.

**Tujuan:** mengubah file Excel/CSV jadwal menjadi desain siap-posting (PNG/JPG
1080×1920) secara otomatis, konsisten, dan cepat — tanpa perlu desainer.

## 2. Tujuan & Metrik Sukses

| Tujuan | Metrik |
|---|---|
| Mempercepat pembuatan desain | Dari ~15 menit/desain → < 1 menit |
| Konsistensi visual | 100% slide pakai 1 template tetap |
| Mandiri (tanpa desainer) | Operator non-desain bisa pakai sendiri |
| Biaya operasional nol | Deploy gratis (Vercel), tanpa server/DB |

## 3. Ruang Lingkup

### 3.1 In-Scope (MVP)
- Upload file `.xlsx` / `.xls` / `.csv`.
- Parsing otomatis & pemisahan **Kedatangan** vs **Keberangkatan**.
- Render ke **template desain tetap** ukuran Instagram Story (1080×1920).
- Preview semua slide real-time.
- Auto-split jadi beberapa slide bila baris melebihi batas (default 13/slide).
- Logo maskapai otomatis dari prefix kode penerbangan.
- Tanggal otomatis (hari ini) + bisa diedit manual.
- Export PNG/JPG; banyak slide dibungkus `.zip`.
- Pesan error & peringatan yang jelas.

### 3.2 Out-of-Scope (MVP)
- Login / multi-user / penyimpanan riwayat.
- Backend, database, atau API.
- Editor desain bebas (warna/posisi diatur lewat kode, bukan UI).
- Penjadwalan/auto-post ke Instagram.
- Multi-template / multi-bandara.

## 4. Pengguna & Use Case

**Persona:** Operator media bandara (non-teknis).

**User journey:**
1. Buka web.
2. Upload file jadwal hari itu.
3. Lihat preview, cek benar/tidaknya, sesuaikan tanggal bila perlu.
4. Download gambar.
5. Posting ke Instagram Story.

## 5. Kebutuhan Fungsional

| ID | Kebutuhan | Prioritas |
|---|---|---|
| F-1 | Upload file via klik atau drag-and-drop | Must |
| F-2 | Parse Excel/CSV; nama kolom fleksibel (huruf besar/kecil & spasi bebas) | Must |
| F-3 | Pisahkan jenis via kolom "Jenis" **atau** nama sheet | Must |
| F-4 | Toleransi baris kosong & spasi berlebih | Must |
| F-5 | Render template 1080×1920 sesuai spek desain | Must |
| F-6 | Auto-split slide bila baris > batas (batas mudah diubah) | Must |
| F-7 | Penanda halaman antar-slide (mis. "1/2") | Must |
| F-8 | Logo maskapai otomatis dari prefix kode; placeholder bila tak dikenal | Must |
| F-9 | Tanggal otomatis + editable | Must |
| F-10 | Export PNG & JPG; multi-slide → zip | Must |
| F-11 | Pesan error format/kolom salah + warning non-fatal | Must |
| F-12 | Placeholder bila aset logo belum tersedia | Must |

## 6. Kebutuhan Non-Fungsional

- **Client-side penuh** — semua proses di browser, tidak ada data ke server.
- **Gratis di-deploy** (Vercel, static/SSR Next.js).
- **Konsisten pixel-perfect** — komponen export berukuran tetap (px).
- **Font ter-embed** agar tetap muncul saat export gambar.
- **Mudah dirawat** — warna, font, mapping kolom & logo terpusat & berkomentar.
- **Safe zone IG Story** — info penting tidak di ~110–250px atas/bawah.

## 7. Struktur Data Input

| Kolom | Wajib | Contoh |
|---|---|---|
| Jenis | Ya* | Keberangkatan / Kedatangan |
| No Penerbangan | Ya | WON 1472 |
| Bandara | Ya | BANDAR UDARA MELALAN (GHS) |
| Jam | Ya | 09:05 |

\* Bila tak ada kolom "Jenis", jenis ditentukan dari **nama sheet**
("Kedatangan"/"Keberangkatan"). Bila keduanya tak ada & hanya 1 sheet, semua
dianggap Keberangkatan + diberi peringatan.

## 8. Spesifikasi Desain (ringkas)

- Kanvas **1080×1920** (9:16).
- Background `#F5F8FC` + gradient blob biru–teal–cyan.
- Warna utama biru `#1A6BFF`.
- Header: logo globe (kiri atas) + logo APT Pranoto (kanan atas).
- Judul: lingkaran biru + ikon pesawat, teks 2 baris uppercase.
- Pill tanggal + ikon starburst.
- Header tabel bar biru ("AAP").
- Baris: logo maskapai • no penerbangan + bandara • jam.
- Footer statis: website + sosial media.

> Detail lengkap & nilai px ada di `src/components/DesignTemplate.tsx`.

## 9. Tech Stack

Next.js (App Router) + TypeScript · Tailwind CSS · SheetJS (`xlsx`) ·
`html-to-image` + `jszip` · `lucide-react`. Tanpa backend/DB.

## 10. Asumsi & Risiko

| Asumsi / Risiko | Mitigasi |
|---|---|
| Nama kolom asli bisa berbeda dari contoh | Alias kolom mudah ditambah di `parseSchedule.ts` |
| Aset logo belum final | Placeholder otomatis, layout tetap rapi |
| Hex warna/font final dari Canva belum pasti | Terpusat di konstanta `DesignTemplate.tsx` |
| Browser membatasi ukuran canvas saat export | Ukuran tetap 1080×1920, sudah diuji |

## 11. Rencana Selanjutnya (Backlog)

- Masukkan aset logo & font final dari Canva.
- Konfirmasi arti teks header tabel "AAP".
- (Opsional) pilihan tema warna ganda, multi-bandara.
- (Opsional) preview zoom & atur urutan baris.
