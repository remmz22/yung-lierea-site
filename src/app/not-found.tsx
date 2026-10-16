import Link from "next/link";

export const metadata = { title: "Sayfa Bulunamadı" };

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute -left-[10%] top-[-15%] h-[45vmax] w-[45vmax] animate-aurora rounded-full bg-neon-purple/20 blur-[110px]" />
        <div className="absolute -right-[10%] bottom-[-20%] h-[40vmax] w-[40vmax] animate-aurora-rev rounded-full bg-neon-cyan/15 blur-[110px]" />
        <div className="bg-grid absolute inset-0" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex items-end gap-1.5" aria-hidden>
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              className="eq-bar w-2 rounded-full bg-gradient-to-t from-neon-purple via-neon-violet to-neon-cyan"
              style={{
                height: 14 + ((i * 13) % 30),
                animationDelay: `${i * 0.09}s`,
                animationDuration: `${1 + (i % 4) * 0.15}s`,
              }}
            />
          ))}
        </div>
        <p className="font-display text-[clamp(4rem,14vw,9rem)] font-black leading-none tracking-tight text-white">
          4<span className="text-gradient">0</span>4
        </p>
        <p className="max-w-sm text-sm leading-relaxed text-slate-400">
          Bu parça kütüphanede yok — belki de henüz yayınlanmadı. 🎧
        </p>
        <Link
          href="/"
          className="rounded-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink px-7 py-3.5 text-sm font-bold text-white shadow-glow transition-transform hover:scale-105"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}
