# SIGAP — Brief & Modul

**SIGAP** = **S**istem **I**nformasi **G**enerate **A**PT **P**ranoto.
Web app **client-side penuh** (Next.js, tanpa backend) untuk membuat gambar
**jadwal penerbangan Instagram Story 1080×1920** Bandara APT Pranoto Samarinda
dari file **PDF AMC / Excel / CSV**, dengan metode **overlay** di atas template Canva.

- **Stack:** Next.js (App Router) + TypeScript + Tailwind + SheetJS + pdf.js +
  html-to-image + JSZip + GSAP + framer-motion.
- **Deploy:** Vercel (static/SSR, gratis, tanpa env var).
- **Prinsip:** semua proses di browser (file tidak dikirim ke server).

---

## Arsitektur (alur data)

```
Upload (PDF / XLSX / CSV)
  → parseFile()            src/lib/parseSchedule.ts  (PDF → parsePdf.ts)
  → { departures, arrivals, warnings }
  → Pilih jenis + edit     src/app/page.tsx, EditableSchedule.tsx
  → buildSlides()          src/lib/pagination.ts     (auto-split per 13 baris)
  → <TemplateSlide>        overlay teks/logo di atas /template-jadwal/*.png
  → downloadAllSlides()    src/lib/exportImage.ts    (PNG/JPG, >1 → .zip)
```

---

## Daftar Modul & Brief

| Modul | Brief | File utama | Status |
|---|---|---|---|
| **Parsing Excel/CSV** | Baca spreadsheet, deteksi kolom fleksibel, pisah keberangkatan/kedatangan | `lib/parseSchedule.ts` | ✅ |
| **Parsing PDF AMC** | Baca PDF jadwal AMC, ekstrak baris, rapikan nama bandara, mapping jam & logo | `lib/parsePdf.ts` | ✅ (khusus template AMC) |
| **Pilih jenis & template** | Tombol Keberangkatan/Kedatangan (bisa dua-duanya), template tampil otomatis | `app/page.tsx` | ✅ |
| **Render overlay** | Stempel logo/no penerbangan/bandara/jam/tanggal di atas template, koordinat Canva | `components/TemplateSlide.tsx` | ✅ |
| **Editor jadwal** | Edit/tambah/hapus baris inline, preview live | `components/EditableSchedule.tsx` | ✅ |
| **Mapping logo maskapai** | Prefix kode → logo (WON/SJV/CTV/GIA/BTK/PK SN*) | `lib/airlineLogos.ts` | ✅ |
| **Export gambar** | PNG/JPG, pixelRatio 2, multi-slide → zip, anti-gagal (imagePlaceholder) | `lib/exportImage.ts` | ✅ |
| **Pagination** | Auto-pecah > 13 baris jadi beberapa slide | `lib/pagination.ts` | ✅ |
| **Tanggal** | Format Indonesia, default hari ini, bisa diedit manual | `lib/formatDate.ts` | 🔶 (belum auto dari PDF) |
| **Tema (5 mode)** | Mint/Indigo/Ember/Sky/Light via CSS var + localStorage | `lib/theme.ts`, `globals.css` | ✅ |
| **Latar animatif** | Aurora blob + grid + pesawat ikut scroll + field logo parallax | `SkyBackground/PlaneScroll/LogoField` | ✅ |
| **Branding & UI** | SIGAP, navbar, scroll-snap per halaman, font Geist/Clash/Bricolage | `Navbar`, `layout`, `page` | ✅ |
| **Template bawaan manual (override)** | Upload desain sendiri per jenis (toggle) | `app/page.tsx` | ✅ |
| **Fallback desain kode** | Desain dibuat dari kode bila template tidak ada | `components/DesignTemplate.tsx` | 🔶 (jarang dipakai) |

---

## ✅ Checklist — Sudah dikerjakan

- [x] Upload & parse **Excel/CSV**
- [x] Upload & parse **PDF jadwal AMC** (28 baris contoh ter-parse benar)
- [x] Rapikan nama bandara dari PDF ke gaya desain (`BANDAR UDARA … (KODE)`)
- [x] Pisah & filter **keberangkatan / kedatangan**
- [x] Pilih jenis → **template langsung tampil** + tanggal hari ini
- [x] Render **overlay** sesuai koordinat Canva (font/bobot/warna #596A76)
- [x] Editor jadwal inline (tambah/edit/hapus)
- [x] Mapping **logo maskapai** otomatis (+ PK-SNH/PK-SNP, kode ber-strip)
- [x] Export **PNG/JPG**, **pixelRatio 2**, multi-slide → **.zip**
- [x] Auto-split **>13 baris** per slide
- [x] **Theme switcher 5 mode** + persist + no-flash
- [x] Latar hidup (aurora) + **pesawat ikut scroll** + **field logo** parallax
- [x] **Scroll-snap** per halaman (Hero/Generate/Palet/Panduan/Tips)
- [x] Rebrand **SIGAP** (navbar, judul tab, footer, hero)
- [x] Hormati **prefers-reduced-motion** di semua animasi

## ⬜ / 🔶 Checklist — Belum / belum lengkap

- [ ] **Auto-baca TANGGAL dari PDF** (PDF memuat "RABU, 17 JUNI 2026" — masih manual)
- [ ] **Tampilkan Conveyor bagasi & Boarding Gate** (data ada di PDF tapi dibuang)
- [ ] **Template kosong final** dari Canva untuk `keberangkatan.png` & `kedatangan.png` (pill tanggal benar-benar kosong, kalibrasi akhir koordinat)
- [ ] Parser PDF masih **terikat layout AMC** (pemisah "BOARDING GATE") — belum tahan kalau format berubah total
- [ ] **Peta bandara** baru terbatas 9 lokasi — bandara lain tampil apa adanya (+peringatan)
- [ ] **pdf.js worker dari CDN** (butuh internet saat runtime) — belum di-bundle lokal
- [ ] **Validasi data** (deteksi jam bentrok / gate dobel / format jam salah)
- [ ] **Tidak ada test otomatis** (unit test parser PDF/Excel)
- [ ] **Kerapian repo**: `preview-shots/`, `scripts/*-shot.mjs`, `public/logos/_orig/` belum di-`.gitignore`
- [ ] **Audit dependency**: 2 peringatan npm (dari `xlsx` CDN) — belum ditangani (jangan `audit fix --force`)
- [ ] **Header tabel "AAP"** & teks footer di `DesignTemplate` masih hardcoded
- [ ] **Aksesibilitas lanjutan**: kontras tema light di beberapa overlay belum diaudit menyeluruh

---

## 💡 Saran fitur lanjutan (selain generate jadwal)

### Prioritas tinggi (paling nyambung & cepat berdampak)
1. **Auto-isi tanggal dari PDF** — ambil tanggal di PDF AMC otomatis, hilangkan input manual.
2. **Tampilkan Conveyor & Boarding Gate** — datanya sudah ada; berguna untuk penumpang.
3. **Multi-ukuran export** — selain Story (9:16): **Feed IG (1:1)**, **poster A4 PDF**, **WhatsApp status**, **banner layar TV (16:9)**.
4. **Mode papan informasi (FIDS) live** — halaman fullscreen jam berjalan untuk ditampilkan di layar bandara/website (bukan gambar statis).

### Menengah
5. **Riwayat & simpan jadwal** — simpan jadwal harian (localStorage/Supabase) + buka lagi.
6. **Replika PDF resmi** — cetak ulang tabel AMC rapi (PDF) untuk pengumuman internal.
7. **QR code** ke website/jadwal online bandara di pojok desain.
8. **Multi-bahasa** (ID/EN) untuk teks desain & UI.
9. **Validasi & peringatan** — bentrok jam/gate, maskapai tak dikenal, baris ganda.
10. **Branding kustom** — ganti logo/warna brand & footer tanpa ngoding (panel admin).

### Lanjutan / ekosistem
11. **Auto-publish** — jadwalkan posting otomatis ke Instagram/Telegram/WhatsApp (perlu backend kecil/integrasi API).
12. **Statistik & insight** — penerbangan per maskapai, jam tersibuk, on-time, grafik harian.
13. **Integrasi sumber data** — tarik jadwal dari API/spreadsheet bersama (Google Sheets) alih-alih upload manual.
14. **Info tambahan di desain** — cuaca Samarinda, status (DELAY/ON TIME/BOARDING), nomor gate dinamis.
15. **Template berseri** — beberapa gaya desain (pagi/siang/malam, tema hari besar) yang bisa dipilih.

---

> Catatan: prioritas #1–#4 paling "low-effort, high-value" karena datanya sudah
> tersedia di PDF/aplikasi — tinggal ditampilkan/diekspor ulang.

---

## 🏛️ Roadmap PPID (pengembangan jangka panjang)

SIGAP bisa tumbuh jadi **bagian dari sistem PPID bandara** (Pejabat Pengelola
Informasi & Dokumentasi — mandat UU No. 14/2008 Keterbukaan Informasi Publik).
Jadwal penerbangan adalah salah satu informasi publik yang diurus PPID.

**Tugas PPID di bandara (UPBU/Kemenhub):** menyusun Daftar Informasi Publik (DIP);
publikasi info berkala/serta-merta/setiap saat; layani permohonan informasi
(SLA 10+7 hari) & sengketa; klasifikasi terbuka vs dikecualikan; dokumentasi &
arsip; publikasi (web/papan/medsos); pengaduan (SP4N-LAPOR); pelaporan layanan;
data publik (jadwal, tarif/PJP2U, fasilitas, statistik pax/kargo/pergerakan).

### Bisa dimasukkan ke sistem

**Reuse engine generator gambar (tetap client-side, paling ringan):**
- [ ] **Generator pengumuman/poster serbaguna** (cuaca, gangguan, jam operasi, event, hari besar) — template + overlay seperti jadwal
- [ ] **Papan informasi live (FIDS)** — halaman fullscreen jam berjalan untuk layar bandara/website
- [ ] **Arsip publikasi** — riwayat poster/jadwal yang dibuat

**Modul PPID inti (butuh backend kecil, mis. Supabase):**
- [ ] **Portal Informasi Publik + DIP** searchable (kategori berkala/serta-merta/setiap saat)
- [ ] **Permohonan informasi online** — registrasi + tracking status + timer SLA 10 hari
- [ ] **Pengaduan masyarakat** (form + tindak lanjut / tautan SP4N-LAPOR)
- [ ] **Repositori dokumen** (SOP, LAKIP, regulasi, maklumat pelayanan)
- [ ] **Dashboard statistik angkutan udara** (pax/kargo/pergerakan) + auto-infografis
- [ ] **Rekap & laporan layanan informasi** otomatis

**Pelengkap:** FAQ & kontak • info tarif/fasilitas • pengumuman serta-merta (push) • multi-bahasa.

> Keputusan arsitektur: fitur generator gambar & FIDS tetap bisa client-side
> (cepat, rendah risiko). Fitur permohonan/pengaduan/arsip/statistik butuh
> penyimpanan data → melewati batas "100% client-side" SIGAP saat ini.
