"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import Counter from "@/components/ui/Counter";
import SmartImage from "@/components/ui/SmartImage";

type StatsProps = {
  monthlyListeners: number;
  followers: number;
  totalStreams: number;
  releaseCount: number;
};

const SKILLS = [
  { key: "production", pct: 92 },
  { key: "vocals", pct: 84 },
  { key: "mixing", pct: 78 },
  { key: "songwriting", pct: 88 },
  { key: "soundDesign", pct: 81 },
] as const;

export default function About({
  profileUrl,
  stats,
}: {
  profileUrl: string;
  stats: StatsProps;
}) {
  const { t } = useLang();

  const statItems = [
    { label: t.about.stats.monthly, value: stats.monthlyListeners },
    { label: t.about.stats.followers, value: stats.followers },
    { label: t.about.stats.streams, value: stats.totalStreams },
    { label: t.about.stats.releases, value: stats.releaseCount },
  ];

  const badges = [
    { label: t.about.badgeTrap, cls: "from-neon-purple/40 to-transparent text-neon-violet" },
    { label: t.about.badgeRnb, cls: "from-neon-cyan/40 to-transparent text-neon-aqua" },
    { label: t.about.badgeUnderground, cls: "from-neon-pink/40 to-transparent text-neon-rose" },
  ];

  return (
    <section
      id="about"
      className="relative mx-auto max-w-7xl scroll-mt-[76px] px-5 pt-14 pb-24 lg:px-8 lg:pt-16 lg:pb-32"
    >
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Profil görseli */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md"
        >
          <div
            aria-hidden
            className="absolute -inset-8 animate-spin-slow rounded-full border border-dashed border-neon-purple/25"
          />
          <div className="neon-ring relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-neon-purple/20 via-transparent to-neon-cyan/20 p-1.5">
            <div className="img-reveal overflow-hidden rounded-[calc(2rem-6px)]">
              <SmartImage
                src={profileUrl}
                alt="Yung Lierea portresi"
                width={800}
                height={800}
                eager
                className="aspect-square w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          {badges.map((b, i) => (
            <motion.span
              key={b.label}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 + i * 0.15, type: "spring", stiffness: 200 }}
              className={`glass absolute animate-floaty rounded-full bg-gradient-to-r px-4 py-2 text-xs font-bold ${b.cls}`}
              style={{
                animationDelay: `${i * 1.4}s`,
                ...(i === 0 && { top: "4%", right: "-2%" }),
                ...(i === 1 && { bottom: "18%", left: "0%" }),
                ...(i === 2 && { bottom: "-4%", right: "2%" }),
              }}
            >
              {b.label}
            </motion.span>
          ))}
        </motion.div>

        {/* Metin + istatistikler */}
        <div className="flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-4"
          >
            <span className="glass w-fit rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-neon-cyan">
              {t.about.tag}
            </span>
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              {t.about.title}
            </h2>
            <p className="text-sm leading-relaxed text-slate-400 sm:text-base">{t.about.p1}</p>
            <p className="text-sm leading-relaxed text-slate-400 sm:text-base">{t.about.p2}</p>
          </motion.div>

          {/* Sayaçlar */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statItems.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="glass card-glow rounded-2xl p-4 text-center"
              >
                <span className="text-gradient-soft font-display text-2xl font-black sm:text-3xl">
                  <Counter to={s.value} />
                </span>
                <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Yetkinlik çubukları */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-4"
          >
            <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
              {t.about.skillsTitle}
            </h3>
            {SKILLS.map((s, i) => (
              <div key={s.key} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">
                    {t.about.skills[s.key as keyof typeof t.about.skills]}
                  </span>
                  <span className="font-mono text-neon-cyan">{s.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${s.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
