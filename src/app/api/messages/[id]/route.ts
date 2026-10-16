import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { sameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: Params) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  const body = (await req.json()) as { read?: boolean };
  const message = await prisma.message.update({
    where: { id: params.id },
    data: { read: body.read ?? true },
  });
  return NextResponse.json({ message });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  await prisma.message.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
