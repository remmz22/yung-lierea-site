export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDuration(sec?: number | null) {
  if (!sec || sec <= 0) return "--:--";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(iso: string | Date, locale: "tr" | "en" = "tr") {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatNumber(n: number, locale: "tr" | "en" = "tr") {
  return n.toLocaleString(locale === "tr" ? "tr-TR" : "en-US");
}

export function slugify(text: string) {
  const map: Record<string, string> = {
    ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", İ: "i",
    ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
  };
  return text
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || `release-${Date.now()}`;
}

export const SOCIALS = {
  spotify:
    "https://open.spotify.com/artist/4kL8Klr0ytaBD6HOZjmYO0",
  instagram: "https://www.instagram.com/lierea.wav",
  tiktok: "https://www.tiktok.com/@real.lierea",
  linkedin:
    "https://www.linkedin.com/in/ege-%C5%9Firin-bayrak-89b975366",
  email: "booking@yunglierea.com",
};
