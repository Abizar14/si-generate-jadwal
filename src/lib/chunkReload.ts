// === PEMULIHAN ChunkLoadError (deploy basi di HP) ============================
// Saat Vercel deploy ulang, nama file chunk berubah & chunk lama dihapus. HP
// (terutama Safari iOS) sering memegang HTML versi lama di cache/bfcache, lalu
// gagal memuat chunk lama saat dibutuhkan (mis. `await import("pdfjs-dist")`
// ketika upload PDF) → "Loading chunk … failed (missing …)". Satu-satunya
// pemulihan adalah memuat ulang halaman agar dapat HTML + hash chunk terbaru.

const RELOAD_FLAG = "chunk-reloaded";

/** Apakah error ini kegagalan memuat chunk/modul dinamis (bukan error parsing)? */
export function isChunkLoadError(e: unknown): boolean {
  const msg =
    e instanceof Error
      ? `${e.name} ${e.message}`
      : typeof e === "string"
        ? e
        : "";
  return (
    /ChunkLoadError/i.test(msg) ||
    /Loading chunk [\w-]+ failed/i.test(msg) ||
    /Loading CSS chunk/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Importing a module script failed/i.test(msg) // Safari iOS
  );
}

/**
 * Muat ulang halaman sekali untuk memulihkan dari deploy basi. Dijaga
 * `sessionStorage` agar tidak loop kalau chunk-nya memang benar-benar hilang.
 * @returns true jika reload dipicu (pemanggil sebaiknya berhenti memproses).
 */
export function reloadOnceForStaleChunks(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(RELOAD_FLAG)) return false; // sudah pernah coba
    sessionStorage.setItem(RELOAD_FLAG, "1");
  } catch {
    // sessionStorage bisa diblokir (mode privat) — tetap reload sekali.
  }
  window.location.reload();
  return true;
}
