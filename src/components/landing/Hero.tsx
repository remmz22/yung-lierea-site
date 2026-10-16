"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { useLang } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/data";
import ParticleField from "@/components/landing/ParticleField";
import Equalizer from "@/components/ui/Equalizer";
import {
  ChevronDownIcon,
  InstagramIcon,
  LinkedInIcon,
  MapPinIcon,
  MusicNoteIcon,
  SpotifyIcon,
  TikTokIcon,
} from "@/components/ui/Icons";

const socialLinks = (s: SiteSettings) => [
  { href: s.spotify, label: "Spotify", Icon: SpotifyIcon, color: "hover:text-emerald-400" },
  { href: s.instagram, label: "Instagram", Icon: InstagramIcon, color: "hover:text-neon-pink" },
  { href: s.tiktok, label: "TikTok", Icon: TikTokIcon, color: "hover:text-white" },
  { href: s.linkedin, label: "LinkedIn", Icon: LinkedInIcon, color: "hover:text-sky-400" },
];

const NOW_PLAYING = ["oluk oluk", "ZIGZAG", "DÖNDÜR"];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 1.85 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 34 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
};

// Başlık harfleri — maske içinde yukarı kayarak açılır
const letterContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 1.9 } },
};
const letter: Variants = {
  hidden: { y: "110%", rotate: 6 },
  show: {
    y: "0%",
    rotate: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

function RevealTitle({ text }: { text: string }) {
  return (
    <span aria-label={text} role="text" className="flex flex-wrap justify-center">
      {text.split("").map((ch, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span variants={letter} className="inline-block">
            {ch === " " ? "\u00A0" : ch}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export default function Hero({ settings }: { settings: SiteSettings }) {
  const { t } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const [npIndex, setNpIndex] = useState(0);

  // Scroll parallax: içerik yukarı kayıp solar
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  // "Şu an çalıyor" parçası 4 sn'de bir döner
  useEffect(() => {
    const id = setInterval(() => setNpIndex((i) => (i + 1) % NOW_PLAYING.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden"
    >
      {/* Aurora arka plan */}
      <motion.div aria-hidden className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute -left-[15%] top-[-20%] h-[55vmax] w-[55vmax] animate-aurora rounded-full bg-neon-purple/20 blur-[110px]" />
        <div className="absolute -right-[15%] bottom-[-25%] h-[50vmax] w-[50vmax] animate-aurora-rev rounded-full bg-neon-cyan/15 blur-[120px]" />
        <div className="absolute left-[30%] top-[45%] h-[35vmax] w-[35vmax] animate-aurora rounded-full bg-neon-pink/10 blur-[100px]" />
        <div className="bg-grid absolute inset-0" />
      </motion.div>
      <ParticleField className="absolute inset-0 h-full w-full" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex flex-col items-center gap-7 px-5 text-center"
      >
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col items-center gap-7">
          <motion.div variants={item} className="flex items-center gap-2">
            <span className="glass flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-slate-300">
              <MapPinIcon className="h-3.5 w-3.5 text-neon-pink" />
              {t.hero.chip}
            </span>
          </motion.div>

          <motion.h1
            variants={letterContainer}
            initial="hidden"
            animate="show"
            className="font-display text-[clamp(2rem,9.5vw,7.5rem)] font-black leading-[1.05] tracking-tight text-white"
            aria-label="YUNG LIEREA"
          >
            <RevealTitle text="YUNG LIEREA" />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.9em" }}
            animate={{ opacity: 1, letterSpacing: "0.45em" }}
            transition={{ delay: 2.7, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-gradient font-display text-xs font-bold uppercase tracking-[0.28em] sm:text-base sm:tracking-[0.45em]"
          >
            {t.hero.tagline}
          </motion.p>

          <motion.p
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-xl text-balance text-sm leading-relaxed text-slate-400 sm:text-base"
          >
            <motion.span variants={item} className="block">{t.hero.sub}</motion.span>
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#discography"
              className="group relative overflow-hidden rounded-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink px-7 py-3.5 text-sm font-bold text-white shadow-glow transition-transform duration-300 hover:scale-105"
            >
              <span className="relative z-10">{t.hero.ctaPrimary}</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </a>
            <a
              href={settings.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="glass flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:border-emerald-400/50 hover:text-emerald-300"
            >
              <SpotifyIcon className="h-5 w-5" />
              {t.hero.ctaSecondary}
            </a>
          </motion.div>

          <motion.div variants={item} className="flex items-center gap-4">
            {socialLinks(settings).map(({ href, label, Icon, color }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                whileHover={{ y: -4, scale: 1.12, rotate: -3 }}
                transition={{ type: "spring", stiffness: 320, damping: 14 }}
                className={`glass flex h-11 w-11 items-center justify-center rounded-full text-slate-300 hover:shadow-glow ${color}`}
              >
                <Icon className="h-5 w-5" />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Sol alt: şu an çalıyor kartı (parça döner) */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2.6, duration: 0.8 }}
        className="glass absolute bottom-24 left-5 z-10 hidden items-center gap-3 rounded-2xl p-3 pr-5 md:flex lg:left-10"
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-purple/30 to-neon-cyan/20">
          <MusicNoteIcon className="h-5 w-5 text-neon-violet" />
        </span>
        <div className="flex h-10 flex-col justify-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            {t.hero.nowPlaying}
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={npIndex}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="text-sm font-semibold text-white"
            >
              {NOW_PLAYING[npIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
        <Equalizer bars={5} className="ml-2 h-6" />
      </motion.div>

      {/* Alt: scroll göstergesi */}
      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.9, duration: 1 }}
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-slate-500 transition-colors hover:text-neon-cyan"
        aria-label={t.hero.scroll}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.35em]">{t.hero.scroll}</span>
        <span className="flex h-9 w-6 items-start justify-center rounded-full border-2 border-current p-1.5">
          <motion.span
            className="h-2 w-1 rounded-full bg-current"
            animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
        <ChevronDownIcon className="h-4 w-4 animate-bounce-soft" />
      </motion.a>

      {/* En alt: equalizer şeridi */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex h-10 items-end justify-center gap-[3px] overflow-hidden opacity-30" aria-hidden>
        {Array.from({ length: 48 }).map((_, i) => (
          <span
            key={i}
            className="eq-bar w-1 rounded-t-sm bg-gradient-to-t from-neon-purple/60 to-neon-cyan/60"
            style={{
              height: `${10 + ((i * 17) % 34)}px`,
              animationDelay: `${(i % 9) * 0.11}s`,
              animationDuration: `${0.8 + ((i * 5) % 6) * 0.13}s`,
            }}
          />
        ))}
      </div>
    </section>
  );
}
