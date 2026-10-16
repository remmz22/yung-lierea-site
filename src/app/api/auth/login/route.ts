import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE, verifyPassword } from "@/lib/auth";
import { clientIp, rateLimit, sameOrigin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // CSRF: Origin eşleşmeli
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }
  // Brute-force koruması: IP başına 15 dakikada 5 deneme
  const rl = rateLimit(`login:${clientIp(req)}`, 5, 15 * 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Çok fazla başarısız deneme. ${rl.retryAfterSec} sn sonra tekrar dene.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  try {
    const { username, password } = (await req.json()) as {
      username?: string;
      password?: string;
    };
    if (
      !username ||
      !password ||
      username.length > 60 ||
      password.length > 200
    ) {
      return NextResponse.json(
        { error: "Kullanıcı adı ve şifre gerekli." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Geçersiz kullanıcı adı veya şifre." }, { status: 401 });
    }

    const token = await createSessionToken({
      sub: user.id,
      role: user.role,
      username: user.username,
    });

    const res = NextResponse.json({
      ok: true,
      user: { username: user.username, role: user.role },
    });
    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "İstek işlenemedi." }, { status: 400 });
  }
}
