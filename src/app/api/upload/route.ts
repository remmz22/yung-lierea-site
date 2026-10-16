import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { isAdmin } from "@/lib/auth";
import { clientIp, rateLimit, sameOrigin, sanitizeSvg } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"]);
const MAX_SIZE = 6 * 1024 * 1024; // 6 MB

// Lokal dosya depolama (public/uploads).
// Not: Vercel gibi salt-okunur dosya sistemlerinde Cloudinary/S3 kullanın
// ve bu rotayı o sağlayıcıya yönlendirin.
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }
  const rl = rateLimit(`upload:${clientIp(req)}`, 30, 60 * 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Çok fazla yükleme." }, { status: 429 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Sadece PNG, JPEG, WebP, SVG, GIF yüklenebilir." },
        { status: 415 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Dosya 6MB'dan küçük olmalı." }, { status: 413 });
    }

    let buf: Buffer = Buffer.from(await file.arrayBuffer());
    // SVG'lerde gömülü script/olay temizle (stored XSS önlemi)
    if (file.type === "image/svg+xml") {
      buf = sanitizeSvg(buf);
    }

    const extRaw = file.name.split(".").pop() ?? "png";
    const ext = extRaw.replace(/[^a-z0-9]/gi, "").slice(0, 5) || "png";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), buf);

    return NextResponse.json({ url: `/uploads/${name}` }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Yükleme başarısız." }, { status: 500 });
  }
}
