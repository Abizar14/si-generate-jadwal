"use client";

import { useEffect, useRef, useState } from "react";
import { Palette, Check } from "lucide-react";
import { THEMES, useTheme } from "@/lib/theme";

/** Tombol pemilih tema di navbar: buka deretan 5 swatch. */
export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Ganti tema"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-mint hover:text-mint"
      >
        <Palette className="h-4 w-4" />
      </button>

      {open && (
        <div className="slide-up-350 absolute right-0 top-11 z-50 w-52 rounded-2xl border border-line bg-surface p-2 shadow-card">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
              }}
              title={t.name}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm transition-colors ${
                theme === t.id
                  ? "bg-mint/10 text-mint"
                  : "text-muted hover:bg-mint/5 hover:text-fg"
              }`}
            >
              <span className="flex -space-x-1.5">
                <span className="h-4 w-4 rounded-full ring-2 ring-surface" style={{ background: t.bg }} />
                <span className="h-4 w-4 rounded-full ring-2 ring-surface" style={{ background: t.accent }} />
                <span className="h-4 w-4 rounded-full ring-2 ring-surface" style={{ background: t.accent2 }} />
              </span>
              <span className="flex-1 font-medium">{t.name}</span>
              {theme === t.id && <Check className="h-4 w-4 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
