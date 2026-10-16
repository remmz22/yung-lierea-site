// Spotify Web API istemcisi (Client Credentials akışı).
// SPOTIFY_CLIENT_ID / SECRET tanımlıysa canlı veri çeker; değilse çağıran
// taraf DB'deki seed verisine döner. 1 saatlik in-memory token önbelleği var.

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

type TokenCache = { token: string; expiresAt: number };
let cache: TokenCache | null = null;

export function spotifyConfigured() {
  return !!(
    process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET
  );
}

export function artistId() {
  return process.env.SPOTIFY_ARTIST_ID || "4kL8Klr0ytaBD6HOZjmYO0";
}

async function getToken(): Promise<string | null> {
  if (!spotifyConfigured()) return null;
  if (cache && cache.expiresAt > Date.now() + 30_000) return cache.token;

  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) return null;
  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  cache = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return cache.token;
}

export async function spotifyGet<T>(path: string): Promise<T | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type SpotifyArtistSummary = {
  name: string;
  followers: number;
  genres: string[];
  images: { url: string; width: number; height: number }[];
  external_url: string;
  uri: string;
};

export async function getArtist(): Promise<SpotifyArtistSummary | null> {
  const data = await spotifyGet<any>(`/artists/${artistId()}`);
  if (!data) return null;
  return {
    name: data.name,
    followers: data.followers?.total ?? 0,
    genres: data.genres ?? [],
    images: data.images ?? [],
    external_url: data.external_urls?.spotify ?? "",
    uri: data.uri ?? "",
  };
}
