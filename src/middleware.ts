import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/admin/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("lierea_session")?.value;
  let authorized = false;
  if (token) {
    try {
      await jwtVerify(
        token,
        new TextEncoder().encode(
          process.env.AUTH_SECRET || "lierea-local-dev-secret-change-me-in-production"
        )
      );
      authorized = true;
    } catch {
      authorized = false;
    }
  }

  if (!authorized) {
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
