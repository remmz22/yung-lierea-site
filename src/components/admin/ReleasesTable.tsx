"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { ReleaseDTO } from "@/lib/data";
import { cn, formatDate, formatNumber } from "@/lib/utils";

export default function ReleasesTable({ releases }: { releases: ReleaseDTO[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "PUBLISHED" | "DRAFT">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "SINGLE" | "EP" | "ALBUM">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return releases.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (
        q &&
        !r.title.toLowerCase().includes(q) &&
        !r.genres.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [releases, search, statusFilter, typeFilter]);

  const allSelected = selected.size === filtered.length && filtered.length > 0;

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulk(action: "publish" | "unpublish" | "delete") {
    if (!selected.size) return;
    if (action === "delete" && !confirm(`${selected.size} kayıt kalıcı olarak silinsin mi?`)) return;
    setBusy(true);
    await fetch("/api/releases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ids: [...selected] }),
    });
    setSelected(new Set());
    setBusy(false);
    router.refresh();
  }

  async function quickToggleStatus(r: ReleaseDTO) {
    await fetch(`/api/releases/${r.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: r.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Arama + filtreler */}
      <div className="glass flex flex-wrap items-center gap-3 rounded-2xl px-5 py-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ara: başlık veya tür…"
          className="field !py-2 flex-1 min-w-40"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="field !py-2 w-auto"
        >
          <option value="all" className="bg-ink-900">Tüm Durumlar</option>
          <option value="PUBLISHED" className="bg-ink-900">Yayında</option>
          <option value="DRAFT" className="bg-ink-900">Taslak</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="field !py-2 w-auto"
        >
          <option value="all" className="bg-ink-900">Tüm Türler</option>
          <option value="SINGLE" className="bg-ink-900">Single</option>
          <option value="EP" className="bg-ink-900">EP</option>
          <option value="ALBUM" className="bg-ink-900">Albüm</option>
        </select>
        <span className="text-xs text-slate-500">
          {filtered.length} / {releases.length}
        </span>
      </div>

      {selected.size > 0 && (
        <div className="glass flex flex-wrap items-center gap-3 rounded-2xl px-5 py-3">
          <span className="text-xs text-slate-400">{selected.size} seçili:</span>
          <button
            onClick={() => bulk("publish")}
            disabled={busy}
            className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25"
          >
            Yayınla
          </button>
          <button
            onClick={() => bulk("unpublish")}
            disabled={busy}
            className="rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/25"
          >
            Taslağa Çevir
          </button>
          <button
            onClick={() => bulk("delete")}
            disabled={busy}
            className="rounded-lg bg-rose-500/15 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/25"
          >
            Sil
          </button>
        </div>
      )}

      <div className="glass overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-500">
                <th className="p-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() =>
                      setSelected(allSelected ? new Set() : new Set(filtered.map((r) => r.id)))
                    }
                    className="h-4 w-4 accent-neon-purple"
                    aria-label="Tümünü seç"
                  />
                </th>
                <th className="p-4">Kapak</th>
                <th className="p-4">Başlık</th>
                <th className="p-4">Tür</th>
                <th className="p-4">Tarih</th>
                <th className="p-4">Dinlenme</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-sm text-slate-600">
                    Eşleşen release yok.
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selected.has(r.id)}
                      onChange={() => toggle(r.id)}
                      className="h-4 w-4 accent-neon-purple"
                      aria-label={`Seç: ${r.title}`}
                    />
                  </td>
                  <td className="p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.coverUrl}
                      alt=""
                      className="h-11 w-11 rounded-lg object-cover"
                      loading="lazy"
                    />
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-white">{r.title}</span>
                    {r.bpm != null && (
                      <span className="ml-2 font-mono text-[11px] text-neon-cyan">{r.bpm} BPM</span>
                    )}
                  </td>
                  <td className="p-4 text-slate-400">{r.type}</td>
                  <td className="p-4 text-slate-400">{formatDate(r.releaseDate)}</td>
                  <td className="p-4 font-mono text-xs text-slate-400">{formatNumber(r.plays)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => quickToggleStatus(r)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-bold transition-transform hover:scale-105",
                        r.status === "PUBLISHED"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-400"
                      )}
                      title="Durumu değiştir"
                    >
                      {r.status === "PUBLISHED" ? "YAYINDA" : "TASLAK"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/releases/${r.id}`}
                      className="text-xs font-semibold text-neon-cyan hover:underline"
                    >
                      Düzenle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
