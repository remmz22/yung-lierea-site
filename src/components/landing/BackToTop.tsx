"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useLang } from "@/lib/i18n";

// İlerleme halkalı "başa dön" butonu
export default function BackToTop() {
  const { t } = useLang();
  const [show, setShow] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  const R = 22;
  const C = 2 * Math.PI * R;
  const dashOffset = useTransform(progress, (v) => C * (1 - v));

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={t.common.backTop}
          className="glass-strong fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full text-neon-cyan shadow-card"
        >
          <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="24" cy="24" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2.5" />
            <motion.circle
              cx="24"
              cy="24"
              r={R}
              fill="none"
              stroke="url(#bttGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={C}
              style={{ strokeDashoffset: dashOffset }}
            />
            <defs>
              <linearGradient id="bttGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#22d3ee" />
                <stop offset="1" stopColor="#f472b6" />
              </linearGradient>
            </defs>
          </svg>
          <svg
            viewBox="0 0 24 24"
            className="relative h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5m-7 7 7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
