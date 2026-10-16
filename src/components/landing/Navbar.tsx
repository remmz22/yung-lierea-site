"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/data";
import { cn } from "@/lib/utils";
import { CloseIcon, MenuIcon, SpotifyIcon } from "@/components/ui/Icons";

const LINKS = [
  { href: "#about", key: "about" },
  { href: "#discography", key: "discography" },
  { href: "#stats", key: "stats" },
  { href: "#contact", key: "contact" },
] as const;

export default function Navbar({ settings }: { settings: SiteSettings }) {
  const { t, lang, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.75, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "glass-strong py-3 shadow-card" : "bg-transparent py-5"
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 lg:px-8">
        <a href="#" className="group flex items-center gap-3" aria-label="Yung Lierea — ana sayfa">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink font-display text-xs font-black text-ink-950 transition-transform duration-300 group-hover:rotate-6">
            YL
          </span>
          <span className="font-display text-sm font-bold tracking-[0.3em] text-white">
            YUNG LIEREA
          </span>
        </a>

        <ul className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <li key={l.key}>
              <a
                href={l.href}
                className="text-sm text-slate-300 transition-colors hover:text-neon-cyan"
              >
                {t.nav[l.key as keyof typeof t.nav] as string}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="glass rounded-full px-3 py-1.5 text-xs font-bold tracking-widest text-slate-300 transition-colors hover:text-neon-cyan"
            aria-label={t.common.language}
          >
            {lang === "tr" ? "EN" : "TR"}
          </button>
          <a
            href={settings.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-neon-cyan px-4 py-2 text-xs font-bold text-ink-950 transition-transform hover:scale-105 sm:flex"
          >
            <SpotifyIcon className="h-4 w-4" />
            Spotify
          </a>
          <button
            className="glass rounded-lg p-2 text-white lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menü"
            aria-expanded={open}
          >
            {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-strong overflow-hidden lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 py-4">
              {LINKS.map((l) => (
                <li key={l.key}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 text-sm text-slate-200 transition-colors hover:bg-white/5 hover:text-neon-cyan"
                  >
                    {t.nav[l.key as keyof typeof t.nav] as string}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={settings.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-neon-cyan px-4 py-3 text-sm font-bold text-ink-950"
                >
                  <SpotifyIcon className="h-4 w-4" />
                  {t.nav.listen}
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
