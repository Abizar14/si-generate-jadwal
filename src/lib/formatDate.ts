// Format tanggal gaya Indonesia: "Rabu, 17 Juni 2026".

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatTanggalIndonesia(d: Date): string {
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

/** Tanggal hari ini dalam format Indonesia. */
export function tanggalHariIni(): string {
  return formatTanggalIndonesia(new Date());
}

/** Untuk <input type="date"> (YYYY-MM-DD) -> teks Indonesia. */
export function isoToIndonesia(iso: string): string {
  if (!iso) return "";
  const [y, m, day] = iso.split("-").map(Number);
  if (!y || !m || !day) return "";
  return formatTanggalIndonesia(new Date(y, m - 1, day));
}

/** Date hari ini -> "YYYY-MM-DD" untuk default <input type="date">. */
export function todayIso(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** "YYYY-MM" -> "Juni 2026" untuk judul rekap bulanan. */
export function bulanLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) return month;
  return `${BULAN[m - 1]} ${y}`;
}
