import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";
import { serializeRelease } from "@/lib/data";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

// Sürüm geçmişi snapshot alanı — düzenlemeden önce çağrılır
async function snapshotCurrent(id: string) {
  const current = await prisma.release.findUnique({ where: { id } });
  if (!current) return;
  await prisma.releaseVersion.create({
    data: {
      releaseId: id,
      snapshot: JSON.stringify({
        title: current.title,
        type: current.type,
        coverUrl: current.coverUrl,
        bpm: current.bpm,
        genres: current.genres,
        durationSec: current.durationSec,
        description: current.description,
        spotifyUrl: current.spotifyUrl,
        releaseDate: current.releaseDate,
        lyrics: current.lyrics,
        credits: current.credits,
        plays: current.plays,
        status: current.status,
      }),
    },
  });
  // En fazla 20 sürüm sakla
  const versions = await prisma.releaseVersion.findMany({
    where: { releaseId: id },
    orderBy: { createdAt: "desc" },
  });
  if (versions.length > 20) {
    await prisma.releaseVersion.deleteMany({
      where: { id: { in: versions.slice(20).map((v) => v.id) } },
    });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const id = params.id;

    // Sürüm geri yükleme: { restoreVersionId }
    if (typeof body.restoreVersionId === "string") {
      const version = await prisma.releaseVersion.findFirst({
        where: { id: body.restoreVersionId, releaseId: id },
      });
      if (!version) {
        return NextResponse.json({ error: "Sürüm bulunamadı." }, { status: 404 });
      }
      const snap = JSON.parse(version.snapshot) as Record<string, unknown>;
      await snapshotCurrent(id);
      const restored = await prisma.release.update({
        where: { id },
        data: {
          ...snap,
          releaseDate: new Date(snap.releaseDate as string),
        },
      });
      return NextResponse.json({ release: serializeRelease(restored) });
    }

    await snapshotCurrent(id);

    const data: Record<string, unknown> = {};
    const fields = [
      "title", "type", "coverUrl", "genres", "description",
      "spotifyUrl", "lyrics", "credits", "status",
    ];
    for (const f of fields) {
      if (typeof body[f] === "string") data[f] = body[f];
    }
    if ("bpm" in body) data.bpm = body.bpm == null ? null : Number(body.bpm);
    if ("durationSec" in body)
      data.durationSec = body.durationSec == null ? null : Number(body.durationSec);
    if ("plays" in body) data.plays = Number(body.plays) || 0;
    if (typeof body.releaseDate === "string") data.releaseDate = new Date(body.releaseDate);
    if (typeof body.type === "string" && !["SINGLE", "EP", "ALBUM"].includes(body.type)) {
      delete data.type;
    }

    const updated = await prisma.release.update({ where: { id }, data });
    return NextResponse.json({ release: serializeRelease(updated) });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  await prisma.release.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
