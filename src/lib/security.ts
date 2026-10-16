import type { NextRequest } from "next/server";

// ── Basit in-memory rate limiter (tek süreç/local sunucu için) ──
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();

  // Bellek şişmesin: ara sıra temizle
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
  }

  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (b.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((b.reset - now) / 1000) };
  }
  b.count++;
  return { ok: true, retryAfterSec: 0 };
}

export function clientIp(req: NextRequest) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "local";
}

// ── CSRF koruması: durum değiştiren isteklerde Origin host'u eşleşmeli ──
// (Cookie SameSite=Lax + bu kontrol + JSON content-type birlikte katman oluşturur)
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // bazı same-origin gönderimlerinde Origin olmayabilir
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

// ── SVG sanitization (upload edilen SVG'lerde script/olay temizler) ──
export function sanitizeSvg(input: Buffer): Buffer {
  let s = input.toString("utf8");
  s = s.replace(/<script[\s\S]*?<\/script\s*>/gi, "");
  s = s.replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi, "");
  s = s.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "");
  s = s.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "");
  s = s.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "");
  s = s.replace(/javascript:/gi, "");
  s = s.replace(/data:text\/html/gi, "");
  return Buffer.from(s, "utf8");
}
