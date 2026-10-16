import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Oturum açmış kullanıcının şifresini değiştirir (mevcut şifre gerekli)
export async function PUT(req: NextRequest) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  try {
    const { currentPassword, newPassword } = (await req.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Mevcut ve yeni şifre gerekli." },
        { status: 400 }
      );
    }
    if (newPassword.length < 8 || newPassword.length > 100) {
      return NextResponse.json(
        { error: "Yeni şifre en az 8 karakter olmalı." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json({ error: "Mevcut şifre hatalı." }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(newPassword) },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "İstek işlenemedi." }, { status: 400 });
  }
}
