"use client";

import { useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useLang } from "@/lib/i18n";
import type { ReleaseDTO } from "@/lib/data";
import { cn, formatDate, formatDuration, formatNumber } from "@/lib/utils";
import SectionHeading from "@/components/ui/SectionHeading";
import SmartImage from "@/components/ui/SmartImage";
import LyricsModal from "@/components/landing/LyricsModal";
import { ExternalIcon, MusicNoteIcon, PlayIcon } from "@/components/ui/Icons";

type Filter = "all" | "SINGLE" | "EP" | "ALBUM";
const PAGE_SIZE = 6;

export default function Discography({ releases }: { releases: ReleaseDTO[] }) {
  const { t, lang } = useLang();
  const [filter, setFilter] = useState<Filter>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [modalRelease, setModalRelease] = useState<ReleaseDTO | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? releases : releases.filter((r) => r.type === filter)),
    [filter, releases]
  );
  const shown = filtered.slice(0, visible);

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: t.discography.filters.all },
    { key: "SINGLE", label: t.discography.filters.SINGLE },
    { key: "EP", label: t.discography.filters.EP },
    { key: "ALBUM", label: t.discography.filters.ALBUM },
  ];

  return (
    <section
      id="discography"
      className="relative scroll-mt-[76px] pt-14 pb-24 lg:pt-16 lg:pb-32"
    >
      <div
        aria-hidden
        className="absolute left-1/2 top-0 h-[40rem] w-[70rem] max-w-full -translate-x-1/2 rounded-full bg-neon-purple/[0.07] blur-[130px]"
      />
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          tag={t.discography.tag}
          title={t.discography.title}
          subtitle={t.discography.subtitle}
        />

        {/* Filtreler */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 flex flex-wrap justify-center gap-2.5"
          role="tablist"
          aria-label={t.discography.tag}
        >
          {filters.map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => {
                setFilter(f.key);
                setVisible(PAGE_SIZE);
              }}
              className={cn(
                "rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300",
                filter === f.key
                  ? "bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink text-white shadow-glow"
                  : "glass text-slate-400 hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Kart ızgarası */}
        {shown.length === 0 ? (
          <p className="mt-16 text-center text-sm text-slate-500">{t.discography.empty}</p>
        ) : (
          <motion.div layout className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {shown.map((r, i) => (
                <ReleaseCard
                  key={r.id}
                  release={r}
                  index={i}
                  isLatest={i === 0 && filter === "all"}
                  onOpenModal={() => setModalRelease(r)}
                  lang={lang}
                  labels={{
                    listen: t.discography.listen,
                    lyrics: t.discography.lyrics,
                    plays: t.discography.plays,
                    latest: t.discography.latest,
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Daha fazla göster */}
        <div className="mt-12 flex justify-center">
          {visible < filtered.length ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setVisible((v) => v + 3)}
              className="glass card-glow rounded-full px-8 py-3.5 text-sm font-bold text-white"
            >
              {t.discography.showMore}
              <span className="ml-2 text-neon-cyan">+{filtered.length - visible}</span>
            </motion.button>
          ) : (
            shown.length > 0 && (
              <p className="text-xs uppercase tracking-[0.3em] text-slate-600">
                {t.discography.noMore}
              </p>
            )
          )}
        </div>
      </div>

      <LyricsModal
        release={modalRelease}
        onClose={() => setModalRelease(null)}
      />
    </section>
  );
}

// ── 3D tilt sarmalayıcı ──
function Tilt({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 20 });
  const sry = useSpring(ry, { stiffness: 180, damping: 20 });

  return (
    <div style={{ perspective: 900 }} className="h-full">
      <motion.div
        ref={ref}
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        onMouseMove={(e) => {
          const rect = ref.current?.getBoundingClientRect();
          if (!rect) return;
          const px = (e.clientX - rect.left) / rect.width;
          const py = (e.clientY - rect.top) / rect.height;
          ry.set((px - 0.5) * 10);
          rx.set(-(py - 0.5) * 10);
        }}
        onMouseLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
        className="h-full"
      >
        {children}
      </motion.div>
    </div>
  );
}

function ReleaseCard({
  release,
  index,
  isLatest,
  onOpenModal,
  lang,
  labels,
}: {
  release: ReleaseDTO;
  index: number;
  isLatest: boolean;
  onOpenModal: () => void;
  lang: "tr" | "en";
  labels: { listen: string; lyrics: string; plays: string; latest: string };
}) {
  const genres = release.genres.split(",").map((g) => g.trim()).filter(Boolean);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Tilt>
        <div className="glass card-glow card-sweep group flex h-full flex-col overflow-hidden rounded-3xl">
          {/* Kapak */}
          <div className="relative aspect-square overflow-hidden">
            <SmartImage
              src={release.coverUrl}
              alt={`${release.title} kapak`}
              width={640}
              height={640}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />

            {isLatest && (
              <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-glow-pink">
                {labels.latest}
              </span>
            )}
            {release.bpm != null && (
              <span className="glass absolute right-3 top-3 rounded-full px-2.5 py-1 font-mono text-[11px] font-bold text-neon-cyan">
                {release.bpm} BPM
              </span>
            )}

            {/* Hover çalma katmanı */}
            <a
              href={release.spotifyUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${labels.listen}: ${release.title}`}
              className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100"
            >
              <span className="flex h-16 w-16 scale-50 items-center justify-center rounded-full bg-emerald-500 text-ink-950 shadow-glow-cyan transition-transform duration-500 group-hover:scale-100">
                <PlayIcon className="ml-1 h-6 w-6" />
              </span>
            </a>
          </div>

          {/* İçerik */}
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display text-base font-extrabold leading-snug text-white">
                {release.title}
              </h3>
              <span className="shrink-0 font-mono text-xs text-slate-500">
                {formatDuration(release.durationSec)}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full border border-neon-purple/30 bg-neon-purple/10 px-2.5 py-0.5 text-[10px] font-semibold text-neon-violet"
                >
                  {g}
                </span>
              ))}
            </div>

            <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-slate-400">
              {release.description}
            </p>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{formatDate(release.releaseDate, lang)}</span>
              <span className="flex items-center gap-1">
                <MusicNoteIcon className="h-3 w-3" />
                {formatNumber(release.plays, lang)} {labels.plays}
              </span>
            </div>

            <div className="mt-1 flex gap-2">
              <a
                href={release.spotifyUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-neon-cyan px-3 py-2.5 text-xs font-bold text-ink-950 transition-transform duration-300 hover:scale-[1.03]"
              >
                <PlayIcon className="h-3.5 w-3.5" />
                {labels.listen}
              </a>
              <button
                onClick={onOpenModal}
                className="glass flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-200 transition-colors hover:border-neon-purple/50 hover:text-neon-violet"
              >
                <ExternalIcon className="h-3.5 w-3.5" />
                {labels.lyrics}
              </button>
            </div>
          </div>
        </div>
      </Tilt>
    </motion.article>
  );
}
