"use client";

import { useMemo, useState } from "react";
import { InstagramIcon, LinkedInIcon, SpotifyIcon } from "@/components/ui/Icons";

// Sosyal medya paylaşım kompozitörü:
// Caption + hashtag üretir; X ve LinkedIn için resmi paylaşım intent'lerini açar.
// Instagram için caption'ı kopyalayıp uygulamaya yönlendirir.
// (Tam otomatik paylaşım API anahtarlarıyla: Instagram Graph API, X API v2,
//  LinkedIn Marketing API — bkz. README)

const HASHTAGS = [
  "#YungLierea",
  "#TurkishTrap",
  "#AlternativeRnB",
  "#TurkishUnderground",
  "#Bursa",
  "#NewMusic",
];

const TEMPLATES = [
  {
    id: "energetic",
    name: "Enerjik",
    build: (t: string) =>
      `🔥 YENİ ÇIKTI: "${t}" 🔊\n\nBursa'dan atmosferik sesler, ağır baslar. Şimdi Spotify'da dinle 👇`,
  },
  {
    id: "moody",
    name: "Atmosferik",
    build: (t: string) =>
      `gece modu: "${t}"\n\nmelankolik melodiler · ağır 808'ler · Bursa, TR\nSpotify'da:`,
  },
  {
    id: "professional",
    name: "Profesyonel (LinkedIn)",
    build: (t: string) =>
      `Yeni single'ım "${t}" yayında. Prodüksiyondan mastering'e kadar tüm süreçleri kendi stüdyomda yönettim — 2020'de yatak odasında başlayan yolculuğun yeni adımı.\n\nTüm platformlarda dinlenebilir. Yorumlarınız ve paylaşımınız çok değerli.`,
  },
];

export default function ShareComposer({ releases }: { releases: { id: string; title: string }[] }) {
  const [releaseId, setReleaseId] = useState(releases[0]?.id ?? "");
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [copied, setCopied] = useState(false);
  const [scheduled, setScheduled] = useState("");

  const release = releases.find((r) => r.id === releaseId);
  const template = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0];
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  const spotifyUrl = "https://open.spotify.com/artist/4kL8Klr0ytaBD6HOZjmYO0";

  const caption = useMemo(() => {
    const base = release ? template.build(release.title) : "";
    const tags = templateId === "professional" ? "\n\n#YeniMüzik #Prodüksiyon #KendiİşininSahibi" : `\n\n${HASHTAGS.slice(0, 4).join(" ")}`;
    return `${base}${tags}\n${spotifyUrl}`;
  }, [release, template, templateId, spotifyUrl]);

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(spotifyUrl)}`;

  async function copy() {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function schedule() {
    if (!scheduled) return;
    // Kuyruğa al (SocialPost kaydı) — gönderim API anahtarları bağlanınca otomatikleşir
    try {
      await fetch("/api/social-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: templateId === "professional" ? "linkedin" : "instagram",
          content: caption,
          scheduledAt: new Date(scheduled).toISOString(),
          releaseId: releaseId || null,
        }),
      });
      setScheduled("");
    } catch {
      /* sessiz geç */
    }
  }

  return (
    <section className="glass rounded-3xl p-6">
      <h2 className="font-display text-sm font-bold text-white">Sosyal Medya Paylaşımı</h2>
      <p className="mt-1 text-xs text-slate-500">
        Yeni release için caption üret, şablona göre özelleştir, tek tıkla paylaş veya zamanla.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-[11px] uppercase tracking-wider text-slate-500">
              Release
              <select
                value={releaseId}
                onChange={(e) => setReleaseId(e.target.value)}
                className="field !pt-2.5"
              >
                {releases.map((r) => (
                  <option key={r.id} value={r.id} className="bg-ink-900">
                    {r.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-[11px] uppercase tracking-wider text-slate-500">
              Şablon
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="field !pt-2.5"
              >
                {TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-ink-900">
                    {t.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <textarea
            value={caption}
            onChange={(e) => void e}
            readOnly
            rows={7}
            className="field resize-none font-mono text-xs leading-relaxed"
          />
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glass flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:text-white"
            >
              𝕏 Paylaş
            </a>
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="glass flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-sky-300 transition-colors hover:text-sky-200"
            >
              <LinkedInIcon className="h-3.5 w-3.5" /> LinkedIn
            </a>
            <button
              onClick={copy}
              className="glass flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-neon-pink transition-colors hover:text-neon-rose"
            >
              <InstagramIcon className="h-3.5 w-3.5" />
              {copied ? "Kopyalandı ✓" : "Caption Kopyala → IG"}
            </button>
          </div>
        </div>

        {/* Önizleme kartı */}
        <div className="glass rounded-2xl p-4">
          <p className="mb-3 text-[10px] uppercase tracking-widest text-slate-500">Önizleme</p>
          <div className="rounded-xl border border-white/10 bg-ink-950/60 p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink font-display text-[10px] font-black text-ink-950">
                YL
              </span>
              <div>
                <p className="text-xs font-bold text-white">yunglierea</p>
                <p className="text-[10px] text-slate-500">Bursa, Türkiye</p>
              </div>
              <SpotifyIcon className="ml-auto h-4 w-4 text-emerald-400" />
            </div>
            <pre className="mt-3 whitespace-pre-wrap font-body text-xs leading-relaxed text-slate-300">
              {caption}
            </pre>
          </div>

          <div className="mt-4 flex items-end gap-2">
            <label className="flex flex-1 flex-col gap-1.5 text-[11px] uppercase tracking-wider text-slate-500">
              Zamanla (SocialPost kuyruğu)
              <input
                type="datetime-local"
                value={scheduled}
                onChange={(e) => setScheduled(e.target.value)}
                className="field !pt-2.5 text-xs"
              />
            </label>
            <button
              onClick={schedule}
              disabled={!scheduled}
              className="rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"
            >
              Zamanla
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
