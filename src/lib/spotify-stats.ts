// Spotify sanatçı istatistikleri — ücretsiz kaynaklardan otomatik çekim.
// Kaynak 1: Sanatçı sayfasının render edilmiş metni (ücretsiz proxy: r.jina.ai)
//   → aylık dinleyici + popüler şarkı dinlenmeleri + süreler + track linkleri
// Kaynak 2 (opsiyonel): Spotify Web API (Client Credentials, .env anahtarları)
//   → takipçi sayısı (sayfada görünmez)
// Başarısızlıkta DB'deki son değerler korunur.

import { prisma } from "@/lib/prisma";
import { getArtist, spotifyConfigured } from "@/lib/spotify";

const ARTIST_ID = () => process.env.SPOTIFY_ARTIST_ID || "4kL8Klr0ytaBD6HOZjmYO0";
const STALE_MS = 30 * 60 * 1000; // 30 dakika
let refreshing = false;

// ── Yardımcılar ──
function fixMojibake(s: string) {
  // Render proxy Türkçe karakterleri bozuk gönderebilir: "DÃ-N" → "DÖN"
  try {
    const fixed = Buffer.from(s, "latin1").toString("utf8");
    return fixed.includes("\uFFFD") ? s : fixed;
  } catch {
    return s;
  }
}

function normalizeTitle(s: string) {
  const map: Record<string, string> = {
    ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
    Ç: "c", Ğ: "g", İ: "i", I: "i", Ö: "o", Ş: "s", Ü: "u",
  };
  return s
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseCount(s: string): number {
  return Number(s.replace(/[.,\s]/g, "")) || 0;
}

function parseDuration(s: string): number | null {
  const m = s.match(/(\d+):(\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

type PopularTrack = {
  title: string;
  plays: number | null; // Spotify anonim görünümde yalnızca ilk birkaç şarkıda gösterir
  durationSec: number | null;
  trackUrl: string | null;
};

function parseRenderedPage(text: string) {
  const mlMatch = text.match(/monthly listeners\D{0,20}([\d.,]+)/i);
  const monthlyListeners = mlMatch ? parseCount(mlMatch[1]) : null;

  // Popüler şarkılar: [Başlık](track-link) ... dinlenme ... süre
  const tracks: PopularTrack[] = [];
  const trackRe =
    /\[([^\]]+)\]\((https:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+)\)/g;
  for (const m of text.matchAll(trackRe)) {
    const title = fixMojibake(m[1]).trim();
    if (title.toLowerCase() === "yung lierea") continue;
    // Blok yapısı: [başlık](link) → [sanatçı](link) → dinlenme → süre
    // Dinlenme, süre çizgisinden ÖNCEKI tek-başına sayı satırıdır;
    // sonraki şarkının sıra numarasına denkmemek için bölge sürede kesilir.
    const after = text.slice(m.index! + m[0].length, m.index! + m[0].length + 400);
    const durMatch = after.match(/(\d{1,2}:\d{2})/);
    const region = after.slice(0, durMatch?.index ?? after.length);
    const countLine = region
      .split("\n")
      .map((l) => l.trim())
      .find((l) => /^[\d.,]{1,12}$/.test(l) && /\d/.test(l));
    const existing = tracks.find((t) => normalizeTitle(t.title) === normalizeTitle(title));
    if (existing) continue;
    tracks.push({
      title,
      plays: countLine ? parseCount(countLine) : null,
      durationSec: durMatch ? parseDuration(durMatch[1]) : null,
      trackUrl: m[2],
    });
    if (tracks.length >= 10) break;
  }
  return { monthlyListeners, tracks };
}

async function fetchRendered(): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(
      `https://r.jina.ai/https://open.spotify.com/artist/${ARTIST_ID()}`,
      {
        signal: ctrl.signal,
        cache: "no-store",
        headers: { "User-Agent": "Mozilla/5.0 (compatible; LiereaSite/1.0)" },
      }
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function setStat(key: string, value: number) {
  await prisma.siteStat.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

// ── Ana yenileme fonksiyonu ──
export async function refreshArtistStats(): Promise<{
  ok: boolean;
  monthlyListeners: number | null;
  followers: number | null;
  updatedTracks: number;
}> {
  if (refreshing) {
    const current = await readStats();
    return { ok: false, ...current, updatedTracks: 0 };
  }
  refreshing = true;
  try {
    let monthlyListeners: number | null = null;
    let updatedTracks = 0;

    const rendered = await fetchRendered();
    if (rendered) {
      const parsed = parseRenderedPage(rendered);
      monthlyListeners = parsed.monthlyListeners;

      if (parsed.monthlyListeners) {
        await setStat("monthlyListeners", parsed.monthlyListeners);
      }
      // Şarkı dinlenmeleri + süreler + track linkleri
      if (parsed.tracks.length) {
        const releases = await prisma.release.findMany();
        for (const track of parsed.tracks) {
          const norm = normalizeTitle(track.title);
          const rel = releases.find((r) => normalizeTitle(r.title) === norm);
          if (!rel) continue;
          await prisma.release.update({
            where: { id: rel.id },
            data: {
              ...(track.plays != null ? { plays: track.plays } : {}),
              ...(track.durationSec ? { durationSec: track.durationSec } : {}),
              ...(track.trackUrl ? { spotifyUrl: track.trackUrl } : {}),
            },
          });
          updatedTracks++;
        }
      }
    }

    // Takipçi: Web API anahtarları varsa (sayfada görünmez)
    let followers: number | null = null;
    if (spotifyConfigured()) {
      const artist = await getArtist();
      if (artist?.followers) {
        followers = artist.followers;
        await setStat("followers", artist.followers);
      }
    }

    if (rendered) await setStat("statsFetchedAt", Math.floor(Date.now() / 1000));
    return { ok: !!rendered, monthlyListeners, followers, updatedTracks };
  } finally {
    refreshing = false;
  }
}

async function readStats() {
  const rows = await prisma.siteStat.findMany({
    where: { key: { in: ["monthlyListeners", "followers", "statsFetchedAt"] } },
  });
  const map = new Map(rows.map((r) => [r.key, r]));
  return {
    monthlyListeners: map.get("monthlyListeners")?.value ?? null,
    followers: map.get("followers")?.value ?? null,
    fetchedAt: map.get("statsFetchedAt")?.value ?? null,
  };
}

export async function getStatsFreshnessMs(): Promise<number | null> {
  const { fetchedAt } = await readStats();
  if (!fetchedAt) return null;
  return Date.now() - fetchedAt * 1000;
}

// Sayfa yüklemesinde çağrılır: veri bayatsa arka planda yeniler (bloklamaz)
export async function refreshIfStale() {
  const age = await getStatsFreshnessMs();
  if (age === null || age > STALE_MS) {
    void refreshArtistStats().catch(() => {});
  }
}
