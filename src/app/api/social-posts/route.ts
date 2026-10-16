import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

// Paylaşım kuyruğu — API anahtarları bağlanınca bir cron/worker
// SCHEDULED kayıtlarını çekip platform API'lerine gönderir.
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  const posts = await prisma.socialPost.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  try {
    const { platform, content, scheduledAt, releaseId } = (await req.json()) as {
      platform?: string;
      content?: string;
      scheduledAt?: string;
      releaseId?: string;
    };
    if (!platform || !content?.trim()) {
      return NextResponse.json({ error: "Platform ve içerik gerekli." }, { status: 400 });
    }
    const post = await prisma.socialPost.create({
      data: {
        platform,
        content: content.slice(0, 3000),
        status: scheduledAt ? "SCHEDULED" : "DRAFT",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        releaseId: releaseId ?? null,
      },
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "İstek işlenemedi." }, { status: 400 });
  }
}
