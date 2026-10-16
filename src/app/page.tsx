import { getProfileImage, getPublishedReleases, getSiteSettings, getSiteStats } from "@/lib/data";
import Landing from "@/components/landing/Landing";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [releases, profileUrl, stats, settings] = await Promise.all([
    getPublishedReleases(),
    getProfileImage(),
    getSiteStats(),
    getSiteSettings(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: "Yung Lierea",
    genre: ["Trap", "Alternative R&B", "Underground Hip-Hop"],
    description:
      "17 yaşında, Bursa merkezli Türk trap / alternative R&B sanatçısı. Atmosferik ses manzaraları, ağır bas hatları ve melankolik melodiler.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    sameAs: [settings.spotify, settings.instagram, settings.tiktok, settings.linkedin],
    areaServed: "TR",
    birthPlace: { "@type": "Place", name: "Bursa, Türkiye" },
    album: releases.map((r) => ({
      "@type": "MusicRelease",
      name: r.title,
      datePublished: r.releaseDate,
      genre: r.genres.split(",").map((g) => g.trim()),
      url: r.spotifyUrl ?? undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Landing
        releases={releases}
        profileUrl={profileUrl}
        stats={stats}
        settings={settings}
      />
    </>
  );
}
