import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "crypto";

export const SESSION_COOKIE = "lierea_session";
const FALLBACK_SECRET = "lierea-local-dev-secret-change-me-in-production";

function secretKey() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || FALLBACK_SECRET
  );
}

export type SessionPayload = { sub: string; role: string; username: string };

// ── JWT oturum (middleware edge runtime'da da doğrulanabilir) ──
export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ── Server tarafında (route handler / server component) admin kontrolü ──
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function isAdmin() {
  return (await getSession()) !== null;
}

// ── Şifre hash'leme (scrypt — ek bağımlılık yok) ──
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  );
}
