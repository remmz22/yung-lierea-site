import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";
import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

const KEYS = ["bookingEmail", "instagram", "tiktok", "linkedin", "spotify"] as const;
const URL_KEYS = new Set(["instagram", "tiktok", "linkedin", "spotify"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  return NextResponse.json({ settings: await getSiteSettings() });
}

export async function PUT(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  try {
    const body = (await req.json()) as Record<string, string>;
    for (const key of KEYS) {
      const value = body[key];
      if (typeof value !== "string" || !value.trim()) continue;
      const v = value.trim().slice(0, 300);
      if (URL_KEYS.has(key)) {
        try {
          const u = new URL(v);
          if (u.protocol !== "https:") throw new Error();
        } catch {
          return NextResponse.json(
            { error: `${key} geçerli bir https:// linki olmalı.` },
            { status: 400 }
          );
        }
      } else if (key === "bookingEmail" && !EMAIL_RE.test(v)) {
        return NextResponse.json(
          { error: "Geçerli bir e-posta gir." },
          { status: 400 }
        );
      }
      await prisma.setting.upsert({
        where: { key },
        update: { value: v },
        create: { key, value: v },
      });
    }
    return NextResponse.json({ ok: true, settings: await getSiteSettings() });
  } catch {
    return NextResponse.json({ error: "İstek işlenemedi." }, { status: 400 });
  }
}
