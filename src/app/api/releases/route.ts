import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";
import { serializeRelease } from "@/lib/data";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

function guard(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }
  return null;
}

type ReleaseBody = {
  title?: string;
  type?: string;
  coverUrl?: string;
  bpm?: number | null;
  genres?: string;
  durationSec?: number | null;
  description?: string;
  spotifyUrl?: string;
  releaseDate?: string;
  lyrics?: string;
  credits?: string;
  plays?: number;
  status?: string;
};

export async function GET(req: NextRequest) {
  const admin = await isAdmin();
  const type = req.nextUrl.searchParams.get("type");
  const where: Record<string, unknown> = {};
  if (!admin) where.status = "PUBLISHED";
  if (type && type !== "all") where.type = type;

  const releases = await prisma.release.findMany({
    where,
    orderBy: { releaseDate: "desc" },
  });
  return NextResponse.json({ releases: releases.map(serializeRelease) });
}

export async function POST(req: NextRequest) {
  const g = guard(req);
  if (g) return g;
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  try {
    const body = (await req.json()) as ReleaseBody;

    // Toplu işlem: { action, ids }
    if ("action" in (body as object) && (body as { action?: string }).action) {
      const { action, ids } = body as unknown as { action: string; ids?: string[] };
      if (!ids?.length) return NextResponse.json({ error: "ID gerekli." }, { status: 400 });
      if (action === "delete") {
        await prisma.release.deleteMany({ where: { id: { in: ids } } });
      } else if (action === "publish" || action === "unpublish") {
        await prisma.release.updateMany({
          where: { id: { in: ids } },
          data: { status: action === "publish" ? "PUBLISHED" : "DRAFT" },
        });
      }
      return NextResponse.json({ ok: true });
    }

    if (!body.title?.trim()) {
      return NextResponse.json({ error: "Başlık gerekli." }, { status: 400 });
    }

    // Benzersiz slug üret
    let slug = slugify(body.title);
    const exists = await prisma.release.findUnique({ where: { slug } });
    if (exists) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const release = await prisma.release.create({
      data: {
        slug,
        title: body.title.trim(),
        type: ["SINGLE", "EP", "ALBUM"].includes(body.type ?? "") ? body.type! : "SINGLE",
        coverUrl: body.coverUrl?.trim() || "/covers/zigzag.jpg",
        bpm: body.bpm ?? null,
        genres: body.genres ?? "",
        durationSec: body.durationSec ?? null,
        description: body.description ?? "",
        spotifyUrl: body.spotifyUrl?.trim() || null,
        releaseDate: body.releaseDate ? new Date(body.releaseDate) : new Date(),
        lyrics: body.lyrics?.trim() || null,
        credits: body.credits?.trim() || null,
        plays: typeof body.plays === "number" ? body.plays : 0,
        status: body.status === "DRAFT" ? "DRAFT" : "PUBLISHED",
      },
    });
    return NextResponse.json({ release: serializeRelease(release) }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Release oluşturulamadı." }, { status: 500 });
  }
}
