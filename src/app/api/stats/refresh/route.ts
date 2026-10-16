import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { refreshArtistStats } from "@/lib/spotify-stats";
import { getSiteStats } from "@/lib/data";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Spotify'dan şimdi çek (admin): aylık dinleyici + şarkı dinlenmeleri
// (+ API anahtarı varsa takipçi) yenilenir
export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  const result = await refreshArtistStats();
  const stats = await getSiteStats();
  return NextResponse.json({ ...result, stats });
}
