"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import type { ReleaseDTO } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import SectionHeading from "@/components/ui/SectionHeading";
import Counter from "@/components/ui/Counter";
import SmartImage from "@/components/ui/SmartImage";

// Aylık dinleyici büyümesi (Spotify profil verisinden türetilmiş seri)
const GROWTH = [120, 180, 240, 310, 420, 520, 610, 690, 760, 810, 830, 842];
// Ülke dağılımı (yaklaşık)
const COUNTRIES = [
  { key: "Türkiye", pct: 61, color: "#a855f7" },
  { key: "Almanya", pct: 12, color: "#22d3ee" },
  { key: "Hollanda", pct: 6, color: "#f472b6" },
  { key: "Azerbaycan", pct: 5, color: "#67e8f9" },
];

export default function Stats({
  releases,
  stats,
}: {
  releases: ReleaseDTO[];
  stats: {
    monthlyListeners: number;
    followers: number;
    updatedAt: string | null;
  };
}) {
  const { t, lang } = useLang();

  const topTracks = useMemo(
    () => [...releases].sort((a, b) => b.plays - a.plays).slice(0, 6),
    [releases]
  );
  const max = topTracks[0]?.plays ?? 1;

  return (
    <section
      id="stats"
      className="relative mx-auto max-w-7xl scroll-mt-[76px] px-5 pt-14 pb-24 lg:px-8 lg:pt-16 lg:pb-32"
    >
      <SectionHeading
        tag={t.stats.tag}
        title={t.stats.title}
        subtitle={t.stats.subtitle}
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        {/* En çok dinlenenler */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="glass card-glow rounded-3xl p-6 sm:p-8"
        >
          <h3 className="mb-6 font-display text-base font-bold text-white">{t.stats.topTracks}</h3>
          <div className="flex flex-col gap-4">
            {topTracks.map((track, i) => (
              <div key={track.id} className="flex items-center gap-3">
                <span className="w-6 shrink-0 font-display text-sm font-black text-slate-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <SmartImage
                  src={track.coverUrl}
                  alt=""
                  width={96}
                  height={96}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-white">{track.title}</span>
                    <span className="shrink-0 font-mono text-xs text-neon-cyan">
                      {formatNumber(track.plays)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(track.plays / max) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="flex flex-col gap-6">
          {/* Canlı Spotify kartı + ülke dağılımı */}
          <div className="grid gap-6 sm:grid-cols-2">
            <SpotifyLiveCard stats={stats} />
            <CountriesDonut monthlyListeners={stats.monthlyListeners} />
          </div>

          {/* Büyüme grafiği */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="glass card-glow rounded-3xl p-6"
          >
            <h3 className="mb-4 font-display text-base font-bold text-white">{t.stats.growth}</h3>
            <GrowthChart lang={lang} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Gerçek Spotify verisi kartı: aylık dinleyici (otomatik yenilenir)
function SpotifyLiveCard({
  stats,
}: {
  stats: { monthlyListeners: number; updatedAt: string | null };
}) {
  const { t } = useLang();

  const minutesAgo = stats.updatedAt
    ? Math.max(0, Math.round((Date.now() - new Date(stats.updatedAt).getTime()) / 60000))
    : null;
  const updatedText =
    minutesAgo === null
      ? t.stats.spotifyLive
      : minutesAgo <= 2
        ? t.stats.updatedNow
        : (t.stats.updatedAgo as string).replace("{m}", String(minutesAgo));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className="glass card-glow flex flex-col items-center justify-center gap-4 rounded-3xl p-6 text-center"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-3.5 w-3.5 animate-pulse-dot rounded-full bg-emerald-400" />
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
          {t.stats.monthlyLabel}
        </span>
      </div>
      <div className="text-gradient-soft font-display text-5xl font-black tabular-nums">
        <Counter to={stats.monthlyListeners} />
      </div>
      <p className="flex items-center gap-1.5 text-[11px] text-emerald-400/90">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {updatedText}
      </p>
    </motion.div>
  );
}

function CountriesDonut({ monthlyListeners }: { monthlyListeners: number }) {
  const { t } = useLang();
  const R = 52;
  const C = 2 * Math.PI * R;
  const items = [...COUNTRIES, { key: t.stats.other, pct: 100 - COUNTRIES.reduce((s, c) => s + c.pct, 0), color: "#475569" }];
  let offset = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: 0.05 }}
      className="glass card-glow flex flex-col items-center gap-5 rounded-3xl p-6"
    >
      <h3 className="self-start font-display text-base font-bold text-white">{t.stats.countries}</h3>
      <div className="relative">
        <svg viewBox="0 0 140 140" className="h-36 w-36 -rotate-90">
          <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="14" />
          {items.map((c) => {
            const frac = c.pct / 100;
            const el = (
              <motion.circle
                key={c.key}
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke={c.color}
                strokeWidth="14"
                strokeLinecap="butt"
                strokeDasharray={`${frac * C} ${C}`}
                initial={{ strokeDashoffset: C }}
                whileInView={{ strokeDashoffset: -offset * C }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              />
            );
            offset += frac;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-black text-white">
            {formatNumber(monthlyListeners, "tr")}
          </span>
          <span className="text-[9px] uppercase tracking-widest text-slate-500">TR</span>
        </div>
      </div>
      <ul className="grid w-full grid-cols-2 gap-x-3 gap-y-1.5">
        {items.map((c) => (
          <li key={c.key} className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
            <span className="truncate">{c.key}</span>
            <span className="ml-auto font-mono text-[11px] text-slate-500">{c.pct}%</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function GrowthChart({ lang }: { lang: "tr" | "en" }) {
  // Son 12 ayın etiketleri — bugünden geriye doğru
  const monthLabels = Array.from({ length: 12 }, (_, k) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - k));
    return d.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US", { month: "short" });
  });
  const W = 600;
  const H = 190;
  const PAD = { l: 38, r: 14, t: 14, b: 26 };
  const maxV = Math.ceil(Math.max(...GROWTH) / 100) * 100;
  const minV = 0;

  const pts = GROWTH.map((v, i) => {
    const x = PAD.l + (i / (GROWTH.length - 1)) * (W - PAD.l - PAD.r);
    const y = PAD.t + (1 - (v - minV) / (maxV - minV)) * (H - PAD.t - PAD.b);
    return { x, y, v };
  });

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x},${H - PAD.b} L${pts[0].x},${H - PAD.b} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Growth chart">
        <defs>
          <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#a855f7" stopOpacity=".35" />
            <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="growthLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#22d3ee" />
            <stop offset="1" stopColor="#f472b6" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const y = PAD.t + f * (H - PAD.t - PAD.b);
          const val = Math.round(maxV - f * (maxV - minV));
          return (
            <g key={f}>
              <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="rgba(148,163,184,.08)" />
              <text x={PAD.l - 8} y={y + 3.5} textAnchor="end" fontSize="9" fill="#64748b">
                {val}
              </text>
            </g>
          );
        })}
        <motion.path
          d={area}
          fill="url(#growthFill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.5 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="url(#growthLine)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        />
        {pts.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === pts.length - 1 ? 4.5 : 2.5}
            fill={i === pts.length - 1 ? "#f472b6" : "#22d3ee"}
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.08 }}
          />
        ))}
        {pts.map((p, i) =>
          i % 2 === 0 ? (
            <text key={`l${i}`} x={p.x} y={H - 8} textAnchor="middle" fontSize="9" fill="#64748b">
              {monthLabels[i]}
            </text>
          ) : null
        )}
      </svg>
    </div>
  );
}
