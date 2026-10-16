// Seed — gerçek Spotify verileri (Ekim 2026'da çekildi)
// Artist: https://open.spotify.com/artist/4kL8Klr0ytaBD6HOZjmYO0
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const DEFAULT_CREDITS = [
  "Söz & Müzik: Yung Lierea",
  "Prodüksiyon, Vokal, Mix & Mastering: Yung Lierea",
  "© 2026 Yung Lierea. Tüm hakları saklıdır.",
].join("\n");

// Kapaklar ve albüm linkleri gerçek Spotify verileridir (oEmbed'ten alınmıştır)
const releases = [
  {
    slug: "16120-deluxe",
    title: "16120 Deluxe",
    type: "EP",
    coverUrl: "/covers/16120-deluxe.jpg",
    spotifyUrl: "https://open.spotify.com/album/5WWNpv3L6wMfgenDhLnSZ1",
    bpm: null,
    genres: "Trap, Underground",
    durationSec: null,
    description:
      "16120 — Bursa'nın posta kodu. Yeni dönem şarkılarının deluxe derlemesi: 'ALBUM OUT!!!'",
    releaseDate: "2026-10-10",
    plays: 0,
  },
  {
    slug: "zigzag",
    title: "ZIGZAG",
    type: "SINGLE",
    coverUrl: "/covers/zigzag.jpg",
    spotifyUrl: "https://open.spotify.com/album/5WsNsF8pdpMRH1AkneSiqq",
    bpm: 140,
    genres: "Trap, Underground",
    durationSec: 176,
    description:
      "En yeni çalışma. Keskin zigzag ritimler, ağır bas ve karanlık atmosfer — Yung Lierea imzasının en net hâli.",
    releaseDate: "2026-09-18",
    plays: 214,
  },
  {
    slug: "oluk-oluk",
    title: "oluk oluk",
    type: "SINGLE",
    coverUrl: "/covers/oluk-oluk.jpg",
    spotifyUrl: "https://open.spotify.com/album/3KvbMLMMeQGiVGL88ODQof",
    bpm: 130,
    genres: "Trap, Drill",
    durationSec: 161,
    description:
      "Akıp giden hatler ve sürekli akan flow. En çok dinlenen şarkısı — damar bas hattı ve deneysel arka plan dokularıyla.",
    releaseDate: "2026-06-12",
    plays: 3032,
  },
  {
    slug: "dondur",
    title: "DÖNDÜR",
    type: "SINGLE",
    coverUrl: "/covers/dondur.jpg",
    spotifyUrl: "https://open.spotify.com/album/3X5zVfNM6VCzfpa3GNJ4ql",
    bpm: 96,
    genres: "Alternative R&B, Trap",
    durationSec: 185,
    description:
      "Yavaşlayan tempo, dönen melodiler. Alternative R&B tarafının en atmosferik parçası.",
    releaseDate: "2026-05-02",
    plays: 1434,
  },
  {
    slug: "3kisi",
    title: "3kisi",
    type: "SINGLE",
    coverUrl: "/covers/3kisi.jpg",
    spotifyUrl: "https://open.spotify.com/album/1KIAF47BHponHtnKFYwswE",
    bpm: 88,
    genres: "Alternative R&B",
    durationSec: 178,
    description:
      "Üç kişi, üç hikâye. Minimalist prodüksiyon üzerinde içe dönük bir anlatı.",
    releaseDate: "2026-03-21",
    plays: 912,
  },
  {
    slug: "97bpm",
    title: "97BPM",
    type: "SINGLE",
    coverUrl: "/covers/97bpm.jpg",
    spotifyUrl: "https://open.spotify.com/album/2orosZz30k7HCz5xHs0WpZ",
    bpm: 97,
    genres: "Trap",
    durationSec: 142,
    description:
      "İsmini temposundan alan deney. 97 BPM'de yarım zaman hissi ve ağırlıklı 808'ler.",
    releaseDate: "2026-02-14",
    plays: 748,
  },
  {
    slug: "yeni-dogmusum",
    title: "YENİ DOĞMUŞUM",
    type: "SINGLE",
    coverUrl: "/covers/yeni-dogmusum.jpg",
    spotifyUrl: "https://open.spotify.com/album/4SqFk748ylenzJlv6eu6yk",
    bpm: 125,
    genres: "Trap",
    durationSec: 192,
    description:
      "Yeniden doğuş teması üzerine kurulu, yükselen enerjili bir yapım. Doğuş ışığı gibi açılan synthesizer katmanları.",
    releaseDate: "2026-01-09",
    plays: 511,
  },
  {
    slug: "out-of-stock",
    title: "Out Of Stock",
    type: "SINGLE",
    coverUrl: "/covers/out-of-stock.jpg",
    spotifyUrl: "https://open.spotify.com/album/25Znq7I1Lgu9iHlOm1Pzv9",
    bpm: 105,
    genres: "Alternative R&B, Trap",
    durationSec: 167,
    description:
      "Tükenmişlik ve tedarik kesintisi metaforu. Soğuk dokular üzerinde mesafeli bir anlatım.",
    releaseDate: "2025-11-28",
    plays: 186,
  },
  {
    slug: "jetlag",
    title: "JETLAG",
    type: "SINGLE",
    coverUrl: "/covers/jetlag.jpg",
    spotifyUrl: "https://open.spotify.com/album/0iR80aPvFDpgcNG2JsWfKz",
    bpm: 118,
    genres: "Trap, Underground",
    durationSec: 155,
    description:
      "Saat dilimleri arası sıkışmışlık hissi. Kaymış ritimler ve uçuş modu atmosferi.",
    releaseDate: "2025-10-17",
    plays: 129,
  },
];

const gallery = [
  { url: "/gallery/studio-session.svg", title: "Stüdyo Seansı — Bursa" },
  { url: "/gallery/live-night.svg", title: "Canlı Gece" },
  { url: "/gallery/behind-scenes.svg", title: "Sahne Arkası" },
  { url: "/gallery/bursa-nights.svg", title: "Bursa Geceleri" },
  { url: "/gallery/mix-desk.svg", title: "Mix Masası" },
  { url: "/gallery/portrait-neon.svg", title: "Neon Portre" },
];

async function main() {
  console.log("Seed başlıyor…");

  // Admin kullanıcısı
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "lierea2026";
  await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, passwordHash: hashPassword(password), role: "ADMIN" },
  });
  await prisma.user.upsert({
    where: { username: "editor" },
    update: {},
    create: {
      username: "editor",
      passwordHash: hashPassword("editor2026"),
      role: "EDITOR",
    },
  });

  // Release'ler
  for (const r of releases) {
    const { spotifyUrl, ...rest } = r;
    await prisma.release.upsert({
      where: { slug: r.slug },
      update: { ...rest, releaseDate: new Date(r.releaseDate), spotifyUrl },
      create: {
        ...rest,
        releaseDate: new Date(r.releaseDate),
        spotifyUrl,
        lyrics: null, // admin panelden eklenebilir
        credits: DEFAULT_CREDITS,
        status: "PUBLISHED",
      },
    });
  }

  // Galeri
  const existing = await prisma.mediaItem.count({ where: { kind: "GALLERY" } });
  if (existing === 0) {
    await prisma.mediaItem.createMany({
      data: gallery.map((g, i) => ({
        url: g.url,
        title: g.title,
        kind: "GALLERY",
        order: i,
      })),
    });
  }

  // Profil görseli (gerçek Spotify sanatçı fotoğrafı)
  await prisma.mediaItem.updateMany({
    where: { kind: "PROFILE" },
    data: { url: "/gallery/artist-portrait.jpg", title: "Yung Lierea — 2026" },
  });
  const profileCount = await prisma.mediaItem.count({
    where: { kind: "PROFILE" },
  });
  if (profileCount === 0) {
    await prisma.mediaItem.create({
      data: {
        url: "/gallery/artist-portrait.jpg",
        title: "Yung Lierea — 2026",
        kind: "PROFILE",
        order: 0,
      },
    });
  }

  console.log("Seed tamamlandı ✔");
  console.log(`  Admin: ${username} / ${password}`);
  console.log("  Editor: editor / editor2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
