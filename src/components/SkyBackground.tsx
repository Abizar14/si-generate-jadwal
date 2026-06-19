"use client";

/**
 * Latar "hidup" untuk UI halaman (bukan desain export):
 * grid titik samar + 3 blob aurora yang bergerak pelan, warnanya mengikuti
 * tema aktif (var(--accent)/var(--accent2)). Opacity blob diatur per tema
 * lewat --blob-opacity (lihat globals.css). Fixed di belakang konten.
 */
export default function SkyBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Tekstur titik samar */}
      <div className="bg-dotgrid absolute inset-0" />

      {/* Blob aurora — warna ikut tema, gerak pelan, durasi beda */}
      <div
        className="blob animate-drift1 h-[42rem] w-[42rem]"
        style={{
          top: "-14%",
          left: "-8%",
          background: "radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)",
        }}
      />
      <div
        className="blob animate-drift2 h-[40rem] w-[40rem]"
        style={{
          top: "28%",
          right: "-12%",
          background: "radial-gradient(circle, rgb(var(--accent2)) 0%, transparent 70%)",
        }}
      />
      <div
        className="blob animate-drift3 h-[44rem] w-[44rem]"
        style={{
          bottom: "-18%",
          left: "22%",
          background: "radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}
