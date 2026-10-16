import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analitik" };

const DAY_LABELS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

export default async function AdminAnalyticsPage() {
  const views = await prisma.pageView.findMany({
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  // Son 14 gün, güne göre
  const days: { key: string; label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toISOString().slice(0, 10),
      label: `${d.getDate()} ${DAY_LABELS[d.getDay()]}`,
      count: 0,
    });
  }
  const byDay = new Map(days.map((d) => [d.key, d]));
  for (const v of views) {
    const key = v.createdAt.toISOString().slice(0, 10);
    byDay.get(key)?.count !== undefined && (byDay.get(key)!.count += 1);
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count));

  // Yola göre
  const pathCounts = new Map<string, number>();
  for (const v of views) pathCounts.set(v.path, (pathCounts.get(v.path) ?? 0) + 1);
  const topPaths = [...pathCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Yönlendireniğe göre
  const refCounts = new Map<string, number>();
  for (const v of views) {
    if (!v.referrer) continue;
    try {
      const host = new URL(v.referrer).hostname;
      refCounts.set(host, (refCounts.get(host) ?? 0) + 1);
    } catch {
      /* yoksay */
    }
  }
  const topRefs = [...refCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  const total = views.length;
  const last7 = days.slice(-7).reduce((s, d) => s + d.count, 0);
  const prev7 = days.slice(0, 7).reduce((s, d) => s + d.count, 0);
  const trend = prev7 === 0 ? (last7 > 0 ? 100 : 0) : Math.round(((last7 - prev7) / prev7) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">Analitik</h1>
        <p className="mt-1 text-sm text-slate-500">
          Cookie izni verilen ziyaretçilerden anonim sayfa görüntüleme verileri (GDPR uyumlu).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Toplam Görüntüleme", value: total },
          { label: "Son 7 Gün", value: last7 },
          { label: "Önceki 7 Gün", value: prev7 },
        ].map((c) => (
          <div key={c.label} className="glass card-glow rounded-2xl p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {c.label}
            </p>
            <p className="mt-2 font-display text-3xl font-black text-white">
              {formatNumber(c.value)}
            </p>
          </div>
        ))}
        <div className="glass card-glow rounded-2xl p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Haftalık Trend
          </p>
          <p
            className={`mt-2 font-display text-3xl font-black ${
              trend >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </p>
        </div>
      </div>

      {/* Günlük grafik */}
      <section className="glass rounded-3xl p-6">
        <h2 className="mb-6 font-display text-sm font-bold text-white">Son 14 Gün</h2>
        <div className="flex h-44 items-end gap-1.5 sm:gap-2.5">
          {days.map((d) => (
            <div key={d.key} className="group flex flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">
                {d.count}
              </span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-neon-purple/70 to-neon-cyan/70 transition-all hover:from-neon-purple hover:to-neon-cyan"
                style={{ height: `${Math.max(3, (d.count / maxDay) * 100)}%` }}
                title={`${d.label}: ${d.count}`}
              />
              <span className="truncate text-[9px] text-slate-600">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass rounded-3xl p-6">
          <h2 className="mb-4 font-display text-sm font-bold text-white">Popüler Sayfalar</h2>
          {topPaths.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-600">Veri yok.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-white/5">
              {topPaths.map(([path, count]) => (
                <li key={path} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="truncate font-mono text-xs text-slate-300">{path}</span>
                  <span className="ml-3 shrink-0 font-semibold text-white">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="glass rounded-3xl p-6">
          <h2 className="mb-4 font-display text-sm font-bold text-white">Yönlendirme Kaynakları</h2>
          {topRefs.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-600">Veri yok.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-white/5">
              {topRefs.map(([host, count]) => (
                <li key={host} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="truncate text-xs text-slate-300">{host}</span>
                  <span className="ml-3 shrink-0 font-semibold text-white">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
