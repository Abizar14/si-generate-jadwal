// ===== MAPPING LOGO MASKAPAI =====
// Logo dipilih otomatis dari PREFIX kode penerbangan.
// Tambah maskapai baru cukup dengan menambah entri di array di bawah.
// Taruh file logo (PNG transparan) di folder: public/logos/
//
// PENTING soal urutan: prefix dicek dari yang TERPANJANG dulu, jadi
// "PK SNH" akan menang atas (seandainya ada) "PK". Tidak perlu repot
// mengurutkan manual — pencocokan sudah menangani itu.

export interface AirlineLogo {
  /** Prefix kode penerbangan (uppercase, boleh mengandung spasi). */
  prefix: string;
  /** Nama maskapai (untuk alt text). */
  name: string;
  /** Nama file di public/logos/. */
  file: string;
}

export const AIRLINE_LOGOS: AirlineLogo[] = [
  { prefix: "WON", name: "Wings Air", file: "wings-air.png" },
  { prefix: "SJV", name: "Super Air Jet", file: "super-air-jet.png" },
  { prefix: "CTV", name: "Citilink", file: "citilink.png" },
  { prefix: "GIA", name: "Garuda Indonesia", file: "garuda.png" },
  { prefix: "BTK", name: "Batik Air", file: "batik-air.png" },
  { prefix: "PK SNH", name: "Smart Aviation", file: "smart-aviation.png" },
  { prefix: "PK SNP", name: "Smart Aviation", file: "smart-aviation.png" },
  // Tambah di sini:
  // { prefix: "QG", name: "Citilink (alt)", file: "citilink.png" },
];

/** Normalisasi kode untuk pencocokan: uppercase + rapikan spasi. */
function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/-/g, " ").replace(/\s+/g, " ");
}

/**
 * Cari logo berdasarkan kode penerbangan.
 * Mengembalikan path lengkap (mis. "/logos/wings-air.png") atau null
 * jika prefix tidak dikenal (komponen akan menampilkan placeholder).
 */
export function findAirlineLogo(flightNo: string): AirlineLogo | null {
  const code = normalizeCode(flightNo);
  // Cocokkan prefix terpanjang lebih dulu agar "PK SNH" > "PK".
  const sorted = [...AIRLINE_LOGOS].sort(
    (a, b) => b.prefix.length - a.prefix.length
  );
  for (const logo of sorted) {
    const p = normalizeCode(logo.prefix);
    if (code === p || code.startsWith(p + " ") || code.startsWith(p)) {
      return logo;
    }
  }
  return null;
}

export function logoPath(file: string): string {
  return `/logos/${file}`;
}
