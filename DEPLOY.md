1# Panduan Deploy ke Vercel

Aplikasi ini **client-side penuh** (tanpa backend/DB) → tidak butuh environment
variable apa pun. Konfigurasi ada di [`vercel.json`](vercel.json).

| Field di `vercel.json` | Arti |
|---|---|
| `framework: nextjs` | Vercel pakai preset Next.js (auto) |
| `buildCommand: next build` | Perintah build |
| `installCommand: npm install` | Pasang dependency |
| `outputDirectory: .next` | Hasil build Next.js |
| `regions: ["sin1"]` | Server region Singapura (terdekat ke Indonesia) |

## Opsi A — Lewat GitHub (paling mudah, rekomendasi)

1. Push project ini ke repository GitHub.
2. Buka <https://vercel.com> → **Add New… → Project** → import repo-nya.
3. Vercel auto-detect Next.js. Biarkan setting default, klik **Deploy**.
4. Setiap `git push` ke branch utama akan otomatis re-deploy.
1
## Opsi B — Lewat Vercel CLI

```bash
npm i -g vercel        # sekali saja
vercel login
vercel                 # deploy preview
vercel --prod          # deploy ke produksi
```

## Checklist sebelum deploy

- [ ] `npm run build` lolos di lokal.
- [ ] Aset logo final sudah ada di `public/logos/` (atau biarkan placeholder).
- [ ] File contoh `public/contoh-jadwal.*` ikut ter-commit (opsional, untuk demo).

## Catatan

- **Tidak ada** environment variable yang perlu diset.
- `node_modules`, `.next`, `docs/`, dan `.claude/` dikecualikan via
  [`.vercelignore`](.vercelignore) agar upload ringan.
- Region default `sin1` (Singapura) bisa diganti di `vercel.json`. Karena ini
  app statis/client-side, region nyaris tak berpengaruh ke performa.
