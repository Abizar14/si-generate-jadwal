"use client";

import { useEffect, useRef } from "react";

/**
 * Pesawat yang terbang mengikuti jalur (motion path) seiring scroll halaman.
 * Jalur titik-titik & pesawat memakai var(--accent) (ikut tema). Fixed di
 * belakang konten. Hormati prefers-reduced-motion (statis di ujung jalur).
 */
export default function PlaneScroll() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};

    (async () => {
      // Muat GSAP + plugin hanya di klien (hindari SSR).
      const gsapMod: any = await import("gsap");
      const stMod: any = await import("gsap/ScrollTrigger");
      const mpMod: any = await import("gsap/MotionPathPlugin");
      if (cancelled) return;

      const gsap = gsapMod.gsap ?? gsapMod.default;
      const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default;
      const MotionPathPlugin = mpMod.MotionPathPlugin ?? mpMod.default;
      gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

      const svg = svgRef.current;
      if (!svg) return;
      const path = svg.querySelector<SVGPathElement>("#flightPath");
      const plane = svg.querySelector<SVGGElement>("#plane");
      if (!path || !plane) return;

      const len = path.getTotalLength();
      const mm = gsap.matchMedia();

      // Gerak penuh
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tween = gsap.to(plane, {
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
          motionPath: {
            path,
            align: path,
            autoRotate: true,
            alignOrigin: [0.5, 0.5],
          },
        });
        // Pastikan posisi benar setelah font/layout siap.
        ScrollTrigger.refresh();
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });

      // Reduced-motion: tempatkan pesawat statis di ujung jalur.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        const end = path.getPointAtLength(len);
        const prev = path.getPointAtLength(Math.max(0, len - 2));
        const angle = (Math.atan2(end.y - prev.y, end.x - prev.x) * 180) / Math.PI;
        gsap.set(plane, { x: end.x, y: end.y, rotation: angle, xPercent: -50, yPercent: -50 });
        return () => {};
      });

      cleanup = () => mm.revert();
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Jalur penerbangan titik-titik (serasi dgn jejak di desain jadwal) */}
      <path
        id="flightPath"
        d="M -60 150 C 260 40 470 320 660 360 C 880 430 1010 600 1320 650"
        fill="none"
        stroke="rgb(var(--accent) / 0.45)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeDasharray="2 13"
      />
      {/* Pesawat (dart) menghadap +x; autoRotate memutarnya ke arah terbang */}
      <g id="plane" style={{ filter: "drop-shadow(0 4px 10px rgb(var(--accent) / 0.5))" }}>
        <circle r="15" fill="rgb(var(--accent) / 0.16)" />
        <path d="M-14 -9 L20 0 L-14 9 L-5 0 Z" fill="rgb(var(--accent))" />
      </g>
    </svg>
  );
}
