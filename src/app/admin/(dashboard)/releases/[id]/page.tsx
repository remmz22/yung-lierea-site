import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { serializeRelease } from "@/lib/data";
import ReleaseForm from "@/components/admin/ReleaseForm";

export const dynamic = "force-dynamic";

export default async function EditReleasePage({
  params,
}: {
  params: { id: string };
}) {
  const release = await prisma.release.findUnique({ where: { id: params.id } });
  if (!release) notFound();

  const versions = await prisma.releaseVersion.findMany({
    where: { releaseId: release.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">
          Düzenle: {release.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Her güncelleme otomatik olarak sürüm geçmişine kaydedilir.
        </p>
      </div>
      <ReleaseForm
        initial={serializeRelease(release)}
        versions={versions.map((v) => ({
          id: v.id,
          createdAt: v.createdAt.toISOString(),
          snapshot: v.snapshot,
        }))}
      />
    </div>
  );
}
