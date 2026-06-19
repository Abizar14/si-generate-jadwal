"use client";

import { motion, useReducedMotion } from "framer-motion";

type RevealTag = "div" | "section" | "li" | "ul" | "footer" | "span" | "p";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Jeda mulai (detik) — untuk efek stagger antar elemen. */
  delay?: number;
  /** Jarak geser-naik awal (px). */
  y?: number;
  /** Tag HTML yang dirender (default div). */
  as?: RevealTag;
  /** Porsi elemen yang harus terlihat sebelum animasi dipicu. */
  amount?: number;
}

/**
 * Pembungkus scroll-reveal reusable: fade + slide-up saat elemen PERTAMA KALI
 * masuk viewport (`once`), lalu diam. Menganimasikan hanya transform & opacity.
 * Otomatis dimatikan saat user mengaktifkan prefers-reduced-motion.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
  amount = 0.2,
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={
        reduce
          ? { duration: 0.25 }
          : { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }
      }
    >
      {children}
    </MotionTag>
  );
}
