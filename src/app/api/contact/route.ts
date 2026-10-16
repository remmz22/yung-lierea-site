import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit, sameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TYPES = new Set(["booking", "collab", "question", "press", "other"]);

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }
  // Spam koruması: IP başına saatte en fazla 5 mesaj
  const rl = rateLimit(`contact:${clientIp(req)}`, 5, 60 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Saatlik mesaj limitine ulaştın. Lütfen daha sonra tekrar dene." },
      { status: 429 }
    );
  }
  try {
    const {
      name, email, subject, body,
      type, city, eventDate, budget,
      website, // honeypot — insanlar görmez, botlar doldurur
    } = (await req.json()) as Record<string, string | undefined>;

    // Honeypot doluysa: bot — başarı gibi davran ama hiçbir şey kaydetme
    if (website && website.trim().length > 0) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }


    if (!name?.trim() || !EMAIL_RE.test(email ?? "") || !body?.trim()) {
      return NextResponse.json({ error: "Geçersiz form verisi." }, { status: 400 });
    }
    const emailClean = email!.trim().slice(0, 160);
    if (type && !TYPES.has(type)) {
      return NextResponse.json({ error: "Geçersiz mesaj tipi." }, { status: 400 });
    }
    // Basit rate limit: aynı e-postadan dakikada 3 mesaj
    const recent = await prisma.message.count({
      where: { email: emailClean, createdAt: { gt: new Date(Date.now() - 60_000) } },
    });
    if (recent >= 3) {
      return NextResponse.json({ error: "Çok fazla deneme." }, { status: 429 });
    }
    await prisma.message.create({
      data: {
        name: name.trim().slice(0, 120),
        email: emailClean,
        subject: subject?.trim().slice(0, 200) || null,
        body: body.trim().slice(0, 4000),
        type: type ?? null,
        city: city?.trim().slice(0, 80) || null,
        eventDate: eventDate?.trim().slice(0, 20) || null,
        budget: budget?.trim().slice(0, 60) || null,
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "İstek işlenemedi." }, { status: 400 });
  }
}
