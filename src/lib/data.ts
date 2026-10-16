import { prisma } from "@/lib/prisma";
import { refreshIfStale } from "@/lib/spotify-stats";

export type ReleaseDTO = {
  id: string;
  slug: string;
  title: string;
  type: string;
  coverUrl: string;
  bpm: number | null;
  genres: string;
  durationSec: number | null;
  description: string;
  spotifyUrl: string | null;
  releaseDate: string;
  lyrics: string | null;
  credits: string | null;
  plays: number;
  status: string;
};

export async function getPublishedReleases(): Promise<ReleaseDTO[]> {
  const rows = await prisma.release.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { releaseDate: "desc" },
  });
  return rows.map(serializeRelease);
}

export function serializeRelease(r: {
  id: string;
  slug: string;
  title: string;
  type: string;
  coverUrl: string;
  bpm: number | null;
  genres: string;
  durationSec: number | null;
  description: string;
  spotifyUrl: string | null;
  releaseDate: Date;
  lyrics: string | null;
  credits: string | null;
  plays: number;
  status: string;
}): ReleaseDTO {
  return {
    ...r,
    releaseDate: r.releaseDate.toISOString(),
  };
}

export async function getGallery() {
  return prisma.mediaItem.findMany({
    where: { kind: "GALLERY" },
    orderBy: { order: "asc" },
  });
}

export async function getProfileImage() {
  const item = await prisma.mediaItem.findFirst({
    where: { kind: "PROFILE" },
  });
  return item?.url ?? "/gallery/artist-portrait.jpg";
}

// ── Site ayarları: DB'de varsa oradan, yoksa varsayılanlardan ──
export type SiteSettings = {
  bookingEmail: string;
  instagram: string;
  tiktok: string;
  linkedin: string;
  spotify: string;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await prisma.setting.findMany();
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const fallback = {
    bookingEmail: "booking@yunglierea.com",
    instagram: "https://www.instagram.com/lierea.wav",
    tiktok: "https://www.tiktok.com/@real.lierea",
    linkedin:
      "https://www.linkedin.com/in/ege-%C5%9Firin-bayrak-89b975366",
    spotify: "https://open.spotify.com/artist/4kL8Klr0ytaBD6HOZjmYO0",
  };
  return {
    bookingEmail: map.get("bookingEmail") || fallback.bookingEmail,
    instagram: map.get("instagram") || fallback.instagram,
    tiktok: map.get("tiktok") || fallback.tiktok,
    linkedin: map.get("linkedin") || fallback.linkedin,
    spotify: map.get("spotify") || fallback.spotify,
  };
}

// Site genelinde gösterilen Spotify metrikleri.
// Öncelik: DB'deki son çekilen gerçek veriler → yoksa bilinen başlangıç değerleri.
// Sayfa her yüklendiğinde bayatsa arka planda Spotify'dan yenilenir.
export type SiteStats = {
  monthlyListeners: number;
  followers: number;
  totalStreams: number;
  releaseCount: number;
  updatedAt: string | null; // ISO — son Spotify güncellemesi
};

const FALLBACK = { monthlyListeners: 842, followers: 36 };

export async function getSiteStats(): Promise<SiteStats> {
  void refreshIfStale().catch(() => {});
  const rows = await prisma.siteStat.findMany({
    where: { key: { in: ["monthlyListeners", "followers", "statsFetchedAt"] } },
  });
  const map = new Map(rows.map((r) => [r.key, r]));
  const releases = await prisma.release.findMany({
    where: { status: "PUBLISHED" },
    select: { plays: true },
  });
  const fetchedAtSec = map.get("statsFetchedAt")?.value;
  return {
    monthlyListeners: map.get("monthlyListeners")?.value ?? FALLBACK.monthlyListeners,
    followers: map.get("followers")?.value ?? FALLBACK.followers,
    totalStreams: releases.reduce((sum, r) => sum + r.plays, 0),
    releaseCount: releases.length,
    updatedAt: fetchedAtSec ? new Date(fetchedAtSec * 1000).toISOString() : null,
  };
}
