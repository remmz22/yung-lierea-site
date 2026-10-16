import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GDPR: yalnızca anonim path + referrer saklanır; cookie/identifier yok
export async function POST(req: NextRequest) {
  try {
    const { path, referrer } = (await req.json()) as {
      path?: string;
      referrer?: string | null;
    };
    if (!path || typeof path !== "string" || path.length > 200) return new NextResponse(null, { status: 204 });
    await prisma.pageView.create({
      data: {
        path: path.slice(0, 200),
        referrer: referrer ? referrer.slice(0, 300) : null,
      },
    });
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
