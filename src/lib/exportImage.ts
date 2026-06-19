import { toPng, toJpeg } from "html-to-image";
import JSZip from "jszip";

export type ImageFormat = "png" | "jpg";

const CANVAS_W = 1080;
const CANVAS_H = 1920;

interface RenderOptions {
  format: ImageFormat;
  /** pixelRatio 1 = ukuran asli 1080x1920. Naikkan untuk hasil lebih tajam. */
  pixelRatio?: number;
}

/** Render satu node DOM (slide 1080x1920) menjadi dataURL gambar. */
async function nodeToDataUrl(
  node: HTMLElement,
  { format, pixelRatio = 1 }: RenderOptions
): Promise<string> {
  // Tunggu font siap agar teks tidak hilang saat di-export.
  if (typeof document !== "undefined" && (document as any).fonts?.ready) {
    try {
      await (document as any).fonts.ready;
    } catch {
      /* abaikan */
    }
  }

  const opts = {
    width: CANVAS_W,
    height: CANVAS_H,
    pixelRatio,
    cacheBust: true,
    // Bila ada gambar gagal dimuat (mis. template hilang), pakai pixel transparan
    // agar export tidak gagal total.
    imagePlaceholder:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
    // Latar putih untuk JPG (JPG tidak punya transparansi).
    backgroundColor: format === "jpg" ? "#ffffff" : undefined,
    style: {
      // Pastikan node ter-render pada ukuran penuh, bukan versi preview yang di-scale.
      transform: "none",
      margin: "0",
    },
  };

  return format === "png" ? toPng(node, opts) : toJpeg(node, { ...opts, quality: 0.95 });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)?.[1] ?? "image/png";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Download satu slide. */
export async function downloadSlide(
  node: HTMLElement,
  filename: string,
  format: ImageFormat
) {
  const dataUrl = await nodeToDataUrl(node, { format, pixelRatio: 2 });
  triggerDownload(dataUrlToBlob(dataUrl), filename);
}

/**
 * Download banyak slide. Jika lebih dari satu, dibungkus jadi satu file .zip.
 * @param nodes daftar elemen DOM slide
 * @param baseName nama dasar file, mis. "jadwal-penerbangan"
 */
export async function downloadAllSlides(
  nodes: HTMLElement[],
  baseName: string,
  format: ImageFormat
) {
  if (nodes.length === 0) return;

  if (nodes.length === 1) {
    await downloadSlide(nodes[0], `${baseName}.${format}`, format);
    return;
  }

  const zip = new JSZip();
  for (let i = 0; i < nodes.length; i++) {
    const dataUrl = await nodeToDataUrl(nodes[i], { format, pixelRatio: 2 });
    const b64 = dataUrl.split(",")[1];
    const num = String(i + 1).padStart(2, "0");
    zip.file(`${baseName}-${num}.${format}`, b64, { base64: true });
  }
  const blob = await zip.generateAsync({ type: "blob" });
  triggerDownload(blob, `${baseName}.zip`);
}
