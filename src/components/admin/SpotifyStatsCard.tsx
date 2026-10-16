"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatNumber } from "@/lib/utils";
import { SpotifyIcon } from "@/components/ui/Icons";

type Stats = {
  monthlyListeners: number;
  followers: number;
  updatedAt: string | null;
};

export default function SpotifyStatsCard({ stats }: { stats: Stats }) {
  const router = useRouter();
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState<"none" | "save" | "refresh">("none");
  const [msg, setMsg] = useState<string | null>(null);

  const minutesAgo = stats.updatedAt
    ? Math.max(0, Math.round((Date.now() - new Date(stats.updatedAt).getTime()) / 60000))
    : null;

  async function saveManual() {
    const v = Number(manual.replace(/[^\d]/g, ""));
    if (!v) return;
    setBusy("save");
    setMsg(null);
    const res = await fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthlyListeners: v }),
    });
    setBusy("none");
    setManual("");
    setMsg(res.ok ? "Kaydedildi ✓" : "Kaydedilemedi.");
    router.refresh();
  }

  async function refreshNow() {
    setBusy("refresh");
    setMsg(null);
    try {
      const res = await fetch("/api/stats/refresh", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setMsg("Spotify'a ulaşılamadı, eski veriler korunuyor.");
      } else {
        setMsg(
          `Güncellendi ✓ ${json.updatedTracks} şarkı dinlenmesi yenilendi`
        );
        router.refresh();
      }
    } catch {
      setMsg("Bağlantı hatası.");
    }
    setBusy("none");
  }

  return (
    <section className="glass rounded-3xl p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold text-white">
          <SpotifyIcon className="h-4 w-4 text-emerald-400" />
          Spotify İstatistikleri
        </h2>
        <span className="text-[11px] text-slate-500">
          {minutesAgo === null ? "henüz çekilmedi" : `${minutesAgo} dk önce güncellendi`}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Aylık</p>
          <p className="mt-1 font-display text-xl font-black text-white">
            {formatNumber(stats.monthlyListeners)}
          </p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">Takipçi</p>
          <p className="mt-1 font-display text-xl font-black text-white">
            {formatNumber(stats.followers)}
          </p>
        </div>
        <div className="glass flex items-center justify-center rounded-xl p-3 text-center">
          <button
            onClick={refreshNow}
            disabled={busy !== "none"}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-neon-cyan px-3 py-2 text-[11px] font-bold text-ink-950 disabled:opacity-60"
          >
            {busy === "refresh" ? "Çekiliyor…" : "Spotify'dan Çek"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1.5 text-[11px] uppercase tracking-wider text-slate-500">
          Aylık dinleyici (elle — Spotify for Artists'ten bak)
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder={String(stats.monthlyListeners)}
            inputMode="numeric"
            className="field !pt-2.5"
          />
        </label>
        <button
          onClick={saveManual}
          disabled={busy !== "none" || !manual}
          className="rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/15 disabled:opacity-50"
        >
          {busy === "save" ? "…" : "Kaydet"}
        </button>
      </div>

      {msg && <p className="mt-3 text-xs text-neon-cyan">{msg}</p>}

      <p className="mt-3 text-[11px] leading-relaxed text-slate-600">
        Site her 30 dakikada bir aylık dinleyici + şarkı dinlenmelerini Spotify'dan otomatik
        çeker. Takipçi sayısı otomatik gelmez — ücretsiz Spotify API anahtarı (.env) veya elle
        güncelleme gerekir.
      </p>
    </section>
  );
}
