"use client";

// Hero altında akan marka şeridi — iki kopya sonsuz kayar
const ITEMS = [
  "TRAP × ALTERNATIVE R&B",
  "BURSA, TÜRKİYE",
  "TURKISH UNDERGROUND",
  "YUNG LIEREA",
  "ATMOSPHERIC SOUNDSCAPES",
  "HEAVY 808s",
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div
      className="relative overflow-hidden border-y border-white/10 bg-ink-900/40 py-4 backdrop-blur-sm"
      aria-hidden
    >
      <div
        className="flex w-max animate-marquee items-center gap-8 whitespace-nowrap pr-8"
        style={{ animationDuration: "30s" }}
      >
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center gap-8">
            {row.map((item, i) => (
              <span key={`${half}-${i}`} className="flex items-center gap-8">
                <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-slate-400">
                  {item}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-pink" />
              </span>
            ))}
          </div>
        ))}
      </div>
      {/* Kenar solmaları */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-ink-950 to-transparent" />
    </div>
  );
}
