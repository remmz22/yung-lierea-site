import { prisma } from "@/lib/prisma";
import { serializeRelease } from "@/lib/data";
import ReleasesTable from "@/components/admin/ReleasesTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Release'ler" };

export default async function AdminReleasesPage() {
  const releases = await prisma.release.findMany({ orderBy: { releaseDate: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Release'ler</h1>
          <p className="mt-1 text-sm text-slate-500">
            {releases.length} kayıt · toplu işlem ve sürüm geçmişi destekli
          </p>
        </div>
        <a
          href="/admin/releases/new"
          className="rounded-xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink px-5 py-3 text-xs font-bold text-white shadow-glow transition-transform hover:scale-[1.03]"
        >
          + Yeni Release
        </a>
      </div>

      <ReleasesTable releases={releases.map(serializeRelease)} />
    </div>
  );
}
