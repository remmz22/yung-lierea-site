"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

const KEY = "lierea-consent";

export default function CookieConsent() {
  const { t } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!localStorage.getItem(KEY)) setShow(true);
    }, 2400);
    return () => clearTimeout(id);
  }, []);

  const decide = (v: "accepted" | "essential") => {
    localStorage.setItem(KEY, v);
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          role="dialog"
          aria-live="polite"
          className="glass-strong fixed inset-x-4 bottom-4 z-[70] mx-auto flex max-w-xl flex-col gap-4 rounded-2xl p-5 shadow-card sm:flex-row sm:items-center"
        >
          <p className="flex-1 text-xs leading-relaxed text-slate-300">{t.cookie.text}</p>
          <div className="flex gap-2">
            <button
              onClick={() => decide("essential")}
              className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5"
            >
              {t.cookie.reject}
            </button>
            <button
              onClick={() => decide("accepted")}
              className="rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink px-4 py-2 text-xs font-bold text-white transition-transform hover:scale-105"
            >
              {t.cookie.accept}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
