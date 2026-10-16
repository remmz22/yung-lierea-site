import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteStats } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/utils";
import ShareComposer from "@/components/admin/ShareComposer";
import SpotifyStatsCard from "@/components/admin/SpotifyStatsCard";

export const dynamic = "force-dynamic";

export const metadata = { title: "Genel Bakış" };

export default async function AdminDashboard() {
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const [
    totalReleases,
    published,
    drafts,
    messages,
    unread,
    subscribers,
    views7d,
    recentMessages,
    latestReleases,
    siteStats,
  ] = await Promise.all([
    prisma.release.count(),
    prisma.release.count({ where: { status: "PUBLISHED" } }),
    prisma.release.count({ where: { status: "DRAFT" } }),
    prisma.message.count(),
    prisma.message.count({ where: { read: false } }),
    prisma.subscriber.count(),
    prisma.pageView.count({ where: { createdAt: { gt: since } } }),
    prisma.message.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.release.findMany({ orderBy: { releaseDate: "desc" }, take: 4 }),
    getSiteStats(),
  ]);

  const cards = [
    { label: "Toplam Release", value: totalReleases, hint: `${published} yayında` },
    { label: "Taslak", value: drafts, hint: "yayınlanmadı" },
    { label: "Mesajlar", value: messages, hint: `${unread} okunmadı` },
    { label: "Aboneler", value: subscribers, hint: "bülten" },
    { label: "Görüntüleme (7g)", value: views7d, hint: "cookie izinli" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Genel Bakış</h1>
        <p className="mt-1 text-sm text-slate-500">
          Site durumu, içerikler ve gelen mesajlar — tek ekranda.
        </p>
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="glass card-glow rounded-2xl p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {c.label}
            </p>
            <p className="mt-2 font-display text-3xl font-black text-white">{formatNumber(c.value)}</p>
            <p className="mt-1 text-[11px] text-neon-cyan">{c.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Son mesajlar */}
        <section className="glass rounded-3xl p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-white">Son Mesajlar</h2>
            <Link href="/admin/messages" className="text-xs text-neon-cyan hover:underline">
              Tümü →
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-600">Henüz mesaj yok.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-white/5">
              {recentMessages.map((m) => (
                <li key={m.id} className="flex items-start gap-3 py-3">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      m.read ? "bg-slate-700" : "bg-neon-cyan shadow-glow-cyan"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {m.name} <span className="font-normal text-slate-500">· {m.email}</span>
                      </p>
                      <span className="shrink-0 text-[10px] text-slate-600">
                        {formatDate(m.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{m.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Hızlı işlemler + son release'ler */}
        <section className="flex flex-col gap-6">
          <div className="glass rounded-3xl p-6">
            <h2 className="mb-4 font-display text-sm font-bold text-white">Hızlı İşlemler</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/releases/new"
                className="rounded-xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink px-4 py-3 text-center text-xs font-bold text-white transition-transform hover:scale-[1.03]"
              >
                + Yeni Release
              </Link>
              <Link
                href="/admin/analytics"
                className="glass rounded-xl px-4 py-3 text-center text-xs font-semibold text-slate-200 transition-colors hover:text-white"
              >
                Analitiği Gör
              </Link>
            </div>
            <ul className="mt-4 flex flex-col divide-y divide-white/5">
              {latestReleases.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.coverUrl} alt="" className="h-9 w-9 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1 truncate text-sm text-white">{r.title}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      r.status === "PUBLISHED"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-amber-500/15 text-amber-400"
                    }`}
                  >
                    {r.status === "PUBLISHED" ? "YAYINDA" : "TASLAK"}
                  </span>
                  <Link
                    href={`/admin/releases/${r.id}`}
                    className="text-xs text-neon-cyan hover:underline"
                  >
                    Düzenle
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Spotify istatistikleri */}
      <SpotifyStatsCard
        stats={{
          monthlyListeners: siteStats.monthlyListeners,
          followers: siteStats.followers,
          updatedAt: siteStats.updatedAt,
        }}
      />

      {/* Sosyal medya paylaşım kompozitörü */}
      <ShareComposer
        releases={latestReleases.map((r) => ({ id: r.id, title: r.title }))}
      />
    </div>
  );
}
