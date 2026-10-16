import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

// Elle istatistik güncelleme (admin): { monthlyListeners?, followers? }
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  try {
    const body = (await req.json()) as {
      monthlyListeners?: number;
      followers?: number;
    };
    if (
      body.monthlyListeners != null &&
      (!Number.isFinite(body.monthlyListeners) || body.monthlyListeners < 0)
    ) {
      return NextResponse.json({ error: "Geçersiz değer." }, { status: 400 });
    }
    if (body.followers != null && (!Number.isFinite(body.followers) || body.followers < 0)) {
      return NextResponse.json({ error: "Geçersiz değer." }, { status: 400 });
    }
    if (body.monthlyListeners != null) {
      await prisma.siteStat.upsert({
        where: { key: "monthlyListeners" },
        update: { value: Math.round(body.monthlyListeners) },
        create: { key: "monthlyListeners", value: Math.round(body.monthlyListeners) },
      });
    }
    if (body.followers != null) {
      await prisma.siteStat.upsert({
        where: { key: "followers" },
        update: { value: Math.round(body.followers) },
        create: { key: "followers", value: Math.round(body.followers) },
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "İstek işlenemedi." }, { status: 400 });
  }
}
