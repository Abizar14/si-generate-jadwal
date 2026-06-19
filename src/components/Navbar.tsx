"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";

/** Logo bersayap "SIGAP — APT Pranoto". */
function WingLogo() {
  return (
    <svg width="40" height="34" viewBox="0 0 48 40" fill="none" aria-hidden>
      <path
        d="M2 22c10-2 16-3 22-9 3-3 5-7 6-11 1 4 1 8-1 12 6-1 12-2 17-5-3 5-8 9-14 12 4 1 8 1 12 0-5 4-12 6-19 6-8 0-16-2-23-5z"
        fill="url(#wing)"
      />
      <defs>
        <linearGradient id="wing" x1="2" y1="2" x2="46" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3CE8A0" />
          <stop offset="1" stopColor="#1FA9D6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Item menu yang dipetakan ke section halaman. */
const SECTIONS = [
  { id: "top", label: "Beranda" },
  { id: "upload", label: "Generate" },
  { id: "palette", label: "Palet" },
  { id: "panduan", label: "Panduan" },
  { id: "tips", label: "Tips" },
];

export default function Navbar() {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("top");

  // Satu handler scroll: latar solid saat turun dari Hero + section aktif.
  // Section aktif = section terakhir yang tepi atasnya sudah melewati garis acuan.
  useEffect(() => {
    const LINE = 140; // px dari atas viewport
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= LINE) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 border-b transition-all duration-300 ${
        scrolled
          ? "border-line bg-bg/80 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <button
          onClick={() => scrollToId("top")}
          className="group flex items-center gap-2.5"
        >
          <span className="animate-float-plane">
            <WingLogo />
          </span>
          <span className="text-left leading-none">
            <span className="block font-display text-xl font-bold tracking-tight text-fg">
              SI<span className="text-mint">GAP</span>
            </span>
            <span className="block text-[11px] font-semibold tracking-[0.3em] text-mint">
              APT PRANOTO
            </span>
          </span>
        </button>

        {/* Menu section dengan indikator mint yang bergeser */}
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollToId(s.id)}
              className="relative px-3 py-2 text-sm font-semibold outline-none transition-colors focus-visible:text-mint"
            >
              <span
                className={
                  active === s.id ? "text-mint" : "text-muted hover:text-fg"
                }
              >
                {s.label}
              </span>
              {active === s.id &&
                (reduce ? (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-mint" />
                ) : (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-mint"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ))}
            </button>
          ))}
        </div>

        {/* Kanan: pemilih tema + CTA */}
        <div className="flex items-center gap-2.5">
          <ThemeSwitcher />
          <button
            onClick={() => scrollToId("upload")}
            className="btn-navy flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold sm:px-5"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Mulai Membuat</span>
            <span className="sm:hidden">Mulai</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
