"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";

export default function Loader() {
  const { t } = useLang();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("lierea-loaded")) {
      setShow(false);
      return;
    }
    const id = setTimeout(() => {
      sessionStorage.setItem("lierea-loaded", "1");
      setShow(false);
    }, 1700);
    return () => clearTimeout(id);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="loader"
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-ink-950"
          aria-label={t.loader.text}
          role="status"
        >
          <div className="flex items-end gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.span
                key={i}
                className="w-2 rounded-full bg-gradient-to-t from-neon-purple via-neon-violet to-neon-cyan"
                initial={{ height: 14 }}
                animate={{ height: [14, 52, 22, 44, 14] }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  delay: i * 0.09,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
          <div className="overflow-hidden">
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="font-display text-sm font-bold tracking-[0.55em] text-slate-400"
            >
              {t.loader.text}
            </motion.p>
          </div>
          <motion.div
            className="h-px w-40 bg-gradient-to-r from-transparent via-neon-purple to-transparent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
