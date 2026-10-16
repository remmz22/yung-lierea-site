"use client";

// Animasyonlu equalizer çubukları — reduce-motion durumunda CSS devralır
export default function Equalizer({
  bars = 12,
  className = "",
  barClassName = "",
}: {
  bars?: number;
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={`flex items-end gap-[3px] ${className}`} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={`eq-bar w-[4px] rounded-full bg-gradient-to-t from-neon-purple to-neon-cyan ${barClassName}`}
          style={{
            height: `${18 + ((i * 13) % 30)}px`,
            animationDelay: `${(i % 5) * 0.13}s`,
            animationDuration: `${0.9 + ((i * 7) % 5) * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}
