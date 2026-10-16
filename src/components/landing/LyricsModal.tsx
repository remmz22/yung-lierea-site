"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import type { ReleaseDTO } from "@/lib/data";
import { formatDate, formatDuration, formatNumber } from "@/lib/utils";
import { CloseIcon, SpotifyIcon } from "@/components/ui/Icons";
import SmartImage from "@/components/ui/SmartImage";

export default function LyricsModal({
  release,
  onClose,
}: {
  release: ReleaseDTO | null;
  onClose: () => void;
}) {
  const { t, lang } = useLang();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!release) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [release, onClose]);

  const meta = release
    ? [
        { label: t.modal.meta.type, value: t.modal.types[release.type as "SINGLE" | "EP" | "ALBUM"] ?? release.type },
        { label: t.modal.meta.date, value: formatDate(release.releaseDate, lang) },
        { label: t.modal.meta.duration, value: formatDuration(release.durationSec) },
        { label: "BPM", value: release.bpm != null ? String(release.bpm) : "—" },
        { label: t.modal.meta.genres, value: release.genres || "—" },
        {
          label: "Spotify",
          value: `${formatNumber(release.plays, lang)} ${t.discography.plays}`,
        },
      ]
    : [];

  return (
    <AnimatePresence>
      {release && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-end justify-center bg-ink-950/70 backdrop-blur-md sm:items-center sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${release.title} — ${t.modal.lyricsTitle}`}
        >
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl sm:rounded-3xl"
          >
            {/* Başlık */}
            <div className="sticky top-0 z-10 flex items-center gap-4 border-b border-white/10 bg-ink-900/90 p-5 backdrop-blur-xl">
              <SmartImage
                src={release.coverUrl}
                alt=""
                width={128}
                height={128}
                eager
                className="h-16 w-16 rounded-xl object-cover shadow-card"
              />
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-lg font-extrabold text-white">
                  {release.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.modal.types[release.type as "SINGLE" | "EP" | "ALBUM"] ?? release.type} ·{" "}
                  {formatDate(release.releaseDate, lang)}
                </p>
              </div>
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label={t.modal.close}
                className="glass rounded-full p-2.5 text-slate-300 transition-colors hover:text-white"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-6 p-6">
              {/* Künye */}
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-neon-cyan">
                  {t.modal.creditsTitle}
                </h4>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {meta.map((m) => (
                    <div key={m.label} className="glass rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500">{m.label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-white">{m.value}</p>
                    </div>
                  ))}
                </div>
                {release.credits && (
                  <pre className="glass mt-3 whitespace-pre-wrap rounded-xl p-4 font-body text-xs leading-relaxed text-slate-300">
                    {release.credits}
                  </pre>
                )}
              </div>

              {/* Sözler */}
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-neon-pink">
                  {t.modal.lyricsTitle}
                </h4>
                {release.lyrics ? (
                  <pre className="glass whitespace-pre-wrap rounded-xl p-4 font-body text-sm leading-7 text-slate-200">
                    {release.lyrics}
                  </pre>
                ) : (
                  <p className="glass rounded-xl p-4 text-sm italic text-slate-500">
                    {t.modal.lyricsEmpty}
                  </p>
                )}
              </div>

              {release.spotifyUrl && (
                <a
                  href={release.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-neon-cyan px-4 py-3 text-sm font-bold text-ink-950 transition-transform hover:scale-[1.02]"
                >
                  <SpotifyIcon className="h-4 w-4" />
                  {t.modal.openSpotify}
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
