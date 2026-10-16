import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit, sameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }
  const rl = rateLimit(`subscribe:${clientIp(req)}`, 6, 60 * 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Çok fazla deneme." }, { status: 429 });
  }
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Geçerli e-posta girin." }, { status: 400 });
    }
    await prisma.subscriber.upsert({
      where: { email: email.toLowerCase().trim() },
      update: {},
      create: { email: email.toLowerCase().trim() },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "İstek işlenemedi." }, { status: 400 });
  }
}
