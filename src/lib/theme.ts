"use client";

import { useSyncExternalStore } from "react";

// ===== 5 MODE TEMA UI =====
// Nilai warna lengkap ada di globals.css ([data-theme="..."]). Data di sini
// hanya untuk PRATINJAU di pemilih tema (swatch) — tidak dipakai merender app.
export interface ThemeDef {
  id: string;
  name: string;
  bg: string;
  surface: string;
  line: string;
  accent: string;
  accent2: string;
  text: string;
  muted: string;
}

export const THEMES: ThemeDef[] = [
  { id: "mint", name: "Midnight Mint", bg: "#0B0F14", surface: "#141A22", line: "#2A3340", accent: "#34E3A4", accent2: "#22D3EE", text: "#FFFFFF", muted: "#98A2B3" },
  { id: "indigo", name: "Indigo Night", bg: "#0C0F1A", surface: "#171B2E", line: "#2A3150", accent: "#7C6CFF", accent2: "#22D3EE", text: "#FFFFFF", muted: "#9AA0B5" },
  { id: "ember", name: "Sunset Ember", bg: "#14100E", surface: "#211A16", line: "#3A2C22", accent: "#FF7849", accent2: "#FFB13D", text: "#FFFFFF", muted: "#A89B92" },
  { id: "sky", name: "Royal Sky", bg: "#0A1B2E", surface: "#12293F", line: "#1C3A55", accent: "#38BDF8", accent2: "#3CE8A0", text: "#FFFFFF", muted: "#8DA6BD" },
  { id: "light", name: "Arctic Light", bg: "#F2F6FB", surface: "#FFFFFF", line: "#E4EAF1", accent: "#2563EB", accent2: "#22D3EE", text: "#1F2A37", muted: "#6B7280" },
];

export const DEFAULT_THEME = "mint";
const KEY = "theme";

const listeners = new Set<() => void>();

/** Set tema: ubah atribut <html>, simpan ke localStorage, beri tahu pelanggan. */
export function setTheme(id: string) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = id;
    try {
      localStorage.setItem(KEY, id);
    } catch {
      /* localStorage tidak tersedia */
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  if (typeof document !== "undefined") {
    return document.documentElement.dataset.theme || DEFAULT_THEME;
  }
  return DEFAULT_THEME;
}

/** Hook: tema aktif + setter, sinkron di semua komponen. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_THEME);
  return { theme, setTheme };
}
