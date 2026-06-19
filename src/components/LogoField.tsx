"use client";

import { useEffect, useRef } from "react";
import { logoPath } from "@/lib/airlineLogos";

/**
 * Field logo maskapai melayang di latar (UI saja, bukan gambar export).
 * Efek: kedalaman (depth → ukuran/opacity/blur), sway organik tiap logo
 * (GSAP, durasi acak, tak seragam), + parallax halus mengikuti kursor.
 * Hormati prefers-reduced-motion (diam, tanpa parallax).
 */

const LOGOS = [
  "wings-air.png",
  "super-air-jet.png",
  "citilink.png",
  "garuda.png",
  "batik-air.png",
  "smart-aviation.png",
];

// Posisi tetap (deterministik → tak ada mismatch hidrasi). d = kedalaman 0..1.
const FIELD = [
  { l: 8, t: 17, d: 0.95 },
  { l: 83, t: 12, d: 0.7 },
  { l: 19, t: 71, d: 1.0 },
  { l: 71, t: 63, d: 0.85 },
  { l: 45, t: 26, d: 0.5 },
  { l: 91, t: 45, d: 0.6 },
  { l: 4, t: 47, d: 0.68 },
  { l: 61, t: 86, d: 0.95 },
  { l: 33, t: 49, d: 0.42 },
  { l: 87, t: 79, d: 0.8 },
  { l: 13, t: 90, d: 0.72 },
  { l: 51, t: 7, d: 0.58 },
];

export default function LogoField() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const outers = Array.from(root.querySelectorAll<HTMLElement>(".lf-outer"));
    const inners = Array.from(root.querySelectorAll<HTMLElement>(".lf-inner"));

    let ctx: any;
    let onMove: ((e: MouseEvent) => void) | null = null;

    (async () => {
      const gsapMod: any = await import("gsap");
      const gsap = gsapMod.gsap ?? gsapMod.default;

      ctx = gsap.context(() => {
        // Entrance: muncul dengan pop halus, ber-stagger.
        inners.forEach((el, i) => {
          gsap.from(el, {
            opacity: 0,
            scale: 0.4,
            duration: 0.9,
            delay: i * 0.07,
            ease: "back.out(1.6)",
          });
          if (reduce) return;
          // Sway organik (oscillate ke satu arah acak, bolak-balik tak seragam).
          gsap.to(el, {
            x: gsap.utils.random(-46, 46),
            y: gsap.utils.random(-38, 38),
            rotation: gsap.utils.random(-12, 12),
            duration: gsap.utils.random(14, 26),
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: i * 0.2,
          });
        });

        if (reduce) return;
        // Parallax kursor: tiap lapisan bergeser sesuai kedalaman.
        const qx = outers.map((el) => gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }));
        const qy = outers.map((el) => gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }));
        onMove = (e: MouseEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          outers.forEach((el, i) => {
            const d = Number(el.dataset.depth) || 0.6;
            qx[i](-nx * d * 64);
            qy[i](-ny * d * 64);
          });
        };
        window.addEventListener("mousemove", onMove, { passive: true });
      }, root);
    })();

    return () => {
      if (onMove) window.removeEventListener("mousemove", onMove);
      if (ctx?.revert) ctx.revert();
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {FIELD.map((p, i) => {
        const size = 40 + p.d * 64; // px
        const opacity = 0.16 + p.d * 0.34;
        const blur = (1 - p.d) * 4; // px — yang jauh lebih kabur
        const file = LOGOS[i % LOGOS.length];
        return (
          <div
            key={i}
            className="lf-outer absolute"
            data-depth={p.d}
            style={{ left: `${p.l}%`, top: `${p.t}%` }}
          >
            <div
              className="lf-inner flex items-center justify-center rounded-full"
              style={{
                width: size,
                height: size,
                opacity,
                filter: blur ? `blur(${blur}px)` : undefined,
                background: "rgb(var(--surface) / 0.55)",
                boxShadow:
                  "inset 0 0 0 1px rgb(var(--accent) / 0.2), 0 10px 30px -12px rgb(0 0 0 / 0.5)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoPath(file)}
                alt=""
                draggable={false}
                style={{
                  width: size * 0.62,
                  height: size * 0.62,
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
