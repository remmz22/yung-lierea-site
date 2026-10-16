import { NextResponse } from "next/server";
import { getArtist, spotifyConfigured } from "@/lib/spotify";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Spotify API yapılandırılmışsa canlı sanatçı verisi döner;
// değilse DB'deki son çekilen gerçek verilerden özet döner.
export async function GET() {
  if (spotifyConfigured()) {
    const artist = await getArtist();
    if (artist) {
      return NextResponse.json({ source: "spotify", artist });
    }
  }

  const [releases, statRows] = await Promise.all([
    prisma.release.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { releaseDate: "desc" },
    }),
    prisma.siteStat.findMany({
      where: { key: { in: ["monthlyListeners", "followers"] } },
    }),
  ]);
  const stats = new Map(statRows.map((r) => [r.key, r.value]));
  const fallback = {
    name: "Yung Lierea",
    followers: stats.get("followers") ?? 36,
    monthlyListeners: stats.get("monthlyListeners") ?? null,
    genres: ["trap", "alternative r&b", "turkish underground"],
    external_url: "https://open.spotify.com/artist/4kL8Klr0ytaBD6HOZjmYO0",
    latest: releases[0]?.title ?? null,
    releaseCount: releases.length,
  };
  return NextResponse.json({ source: "fallback", artist: fallback });
}
