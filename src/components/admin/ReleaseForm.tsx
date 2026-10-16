"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import type { ReleaseDTO } from "@/lib/data";
import { cn, formatDuration } from "@/lib/utils";
import { CloseIcon } from "@/components/ui/Icons";

type Version = { id: string; createdAt: string; snapshot: string };

function secToMMSS(sec?: number | null) {
  if (!sec) return "";
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
}
function mmssToSec(v: string) {
  const m = v.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}
function isoToDateInput(iso?: string) {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return new Date(iso).toISOString().slice(0, 10);
}

export default function ReleaseForm({
  initial,
  versions = [],
}: {
  initial?: ReleaseDTO;
  versions?: Version[];
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState(initial?.type ?? "SINGLE");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "/covers/zigzag.jpg");
  const [bpm, setBpm] = useState<string>(initial?.bpm != null ? String(initial.bpm) : "");
  const [genres, setGenres] = useState(initial?.genres ?? "");
  const [duration, setDuration] = useState(secToMMSS(initial?.durationSec));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [spotifyUrl, setSpotifyUrl] = useState(initial?.spotifyUrl ?? "");
  const [releaseDate, setReleaseDate] = useState(isoToDateInput(initial?.releaseDate));
  const [lyrics, setLyrics] = useState(initial?.lyrics ?? "");
  const [credits, setCredits] = useState(
    initial?.credits ??
      "Söz & Müzik: Yung Lierea\nProdüksiyon, Vokal, Mix & Mastering: Yung Lierea\n© 2026 Yung Lierea"
  );
  const [plays, setPlays] = useState<string>(initial ? String(initial.plays) : "0");
  const [status, setStatus] = useState(initial?.status ?? "PUBLISHED");

  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVersions, setShowVersions] = useState(false);

  async function uploadFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Yükleme başarısız.");
      setCoverUrl(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError("Başlık zorunlu.");
      return;
    }
    setSaving(true);
    const payload = {
      title,
      type,
      coverUrl,
      bpm: bpm ? Number(bpm) : null,
      genres,
      durationSec: mmssToSec(duration),
      description,
      spotifyUrl,
      releaseDate,
      lyrics,
      credits,
      plays: Number(plays) || 0,
      status,
    };
    try {
      const res = await fetch(isEdit ? `/api/releases/${initial!.id}` : "/api/releases", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Kaydedilemedi.");
      router.push("/admin/releases");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi.");
      setSaving(false);
    }
  }

  async function restore(versionId: string) {
    if (!isEdit || !confirm("Bu sürüm geri yüklensin mi? Mevcut hâli de geçmişe kaydedilir.")) return;
    setSaving(true);
    await fetch(`/api/releases/${initial!.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restoreVersionId: versionId }),
    });
    router.refresh();
    setSaving(false);
  }

  const inputCls =
    "field !pt-2.5";
  const labelCls = "flex flex-col gap-1.5 text-[11px] uppercase tracking-wider text-slate-500";

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-3">
      {/* Sol: form alanları */}
      <div className="flex flex-col gap-5 xl:col-span-2">
        <div className="glass flex flex-col gap-5 rounded-3xl p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelCls}>
              Başlık *
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ZIGZAG"
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              Tür
              <select value={type} onChange={(e) => setType(e.target.value)} className={inputCls}>
                <option className="bg-ink-900">SINGLE</option>
                <option className="bg-ink-900">EP</option>
                <option className="bg-ink-900">ALBUM</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className={labelCls}>
              BPM
              <input
                type="number"
                min={40}
                max={300}
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="140"
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              Süre (mm:ss)
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="2:41"
                className={cn(inputCls, "font-mono")}
              />
            </label>
            <label className={labelCls}>
              Çıkış Tarihi
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className={inputCls}
              />
            </label>
          </div>

          <label className={labelCls}>
            Tür Etiketleri (virgülle)
            <input
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              placeholder="Trap, Drill, Alternative R&B"
              className={inputCls}
            />
          </label>

          <label className={labelCls}>
            Açıklama
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kısa, atmosferik bir tanım…"
              className={cn(inputCls, "resize-none")}
            />
          </label>

          <label className={labelCls}>
            Spotify URL
            <input
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              placeholder="https://open.spotify.com/track/…"
              className={inputCls}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className={labelCls}>
              Dinlenme (Spotify)
              <input
                type="number"
                min={0}
                value={plays}
                onChange={(e) => setPlays(e.target.value)}
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              Durum
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputCls}
              >
                <option className="bg-ink-900">PUBLISHED</option>
                <option className="bg-ink-900">DRAFT</option>
              </select>
            </label>
          </div>
        </div>

        <div className="glass flex flex-col gap-5 rounded-3xl p-6">
          <label className={labelCls}>
            Şarkı Sözleri
            <textarea
              rows={7}
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder={"[Verse 1]\n…"}
              className={cn(inputCls, "resize-none leading-relaxed")}
            />
          </label>
          <label className={labelCls}>
            Prodüksiyon / Künye
            <textarea
              rows={4}
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className={cn(inputCls, "resize-none leading-relaxed")}
            />
          </label>
        </div>
      </div>

      {/* Sağ: kapak + önizleme + sürümler */}
      <div className="flex flex-col gap-5">
        <div className="glass flex flex-col gap-4 rounded-3xl p-6">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Albüm Kapağı</p>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "flex aspect-square cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all",
              dragOver
                ? "border-neon-purple bg-neon-purple/10"
                : "border-white/15 hover:border-neon-purple/50"
            )}
          >
            {coverUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverUrl}
                  alt="Kapak önizleme"
                  className="h-full w-full rounded-xl object-cover p-1"
                />
                <span className="pb-3 text-[11px] text-slate-500">
                  {uploading ? "Yükleniyor…" : "Değiştirmek için tıkla veya sürükle"}
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl">🖼</span>
                <span className="text-xs text-slate-500">
                  {uploading ? "Yükleniyor…" : "Sürükle & bırak veya tıkla"}
                </span>
                <span className="text-[10px] text-slate-600">PNG · JPG · WebP · SVG (max 6MB)</span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
          <input
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="veya görsel URL'i"
            className={cn(inputCls, "font-mono text-xs")}
          />
        </div>

        {/* Canlı kart önizleme */}
        <div className="glass rounded-3xl p-6">
          <p className="mb-3 text-[11px] uppercase tracking-wider text-slate-500">Önizleme</p>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt="" className="h-full w-full object-cover" />
              {bpm && (
                <span className="glass absolute right-3 top-3 rounded-full px-2.5 py-1 font-mono text-[11px] font-bold text-neon-cyan">
                  {bpm} BPM
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="font-display text-sm font-extrabold text-white">
                  {title || "Başlıksız"}
                </span>
                <span className="font-mono text-xs text-slate-500">
                  {duration || "--:--"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {genres
                  .split(",")
                  .map((g) => g.trim())
                  .filter(Boolean)
                  .map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-neon-purple/30 bg-neon-purple/10 px-2 py-0.5 text-[10px] font-semibold text-neon-violet"
                    >
                      {g}
                    </span>
                  ))}
              </div>
              <p className="line-clamp-2 text-xs text-slate-400">
                {description || "Açıklama burada görünecek…"}
              </p>
            </div>
          </div>
        </div>

        {/* Sürüm geçmişi */}
        {isEdit && versions.length > 0 && (
          <div className="glass rounded-3xl p-6">
            <button
              type="button"
              onClick={() => setShowVersions((s) => !s)}
              className="flex w-full items-center justify-between text-[11px] uppercase tracking-wider text-slate-500"
            >
              Sürüm Geçmişi ({versions.length})
              <span>{showVersions ? "−" : "+"}</span>
            </button>
            {showVersions && (
              <ul className="mt-4 flex flex-col divide-y divide-white/5">
                {versions.map((v) => {
                  const snap = JSON.parse(v.snapshot) as { title?: string };
                  return (
                    <li key={v.id} className="flex items-center justify-between gap-2 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs text-white">{snap.title}</p>
                        <p className="text-[10px] text-slate-600">
                          {new Date(v.createdAt).toLocaleString("tr-TR")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => restore(v.id)}
                        className="shrink-0 text-[11px] font-semibold text-neon-cyan hover:underline"
                      >
                        Geri Yükle
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Alt bar */}
      <div className="glass sticky bottom-4 z-30 flex items-center justify-between gap-4 rounded-2xl px-6 py-4 xl:col-span-3">
        {error ? (
          <p className="flex items-center gap-2 text-xs text-rose-400">
            <CloseIcon className="h-3.5 w-3.5" /> {error}
          </p>
        ) : (
          <p className="text-xs text-slate-600">
            {isEdit ? "Değişiklikler sürüm geçmişine kaydedilir." : "Yeni release oluşturuluyor."}
          </p>
        )}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-xs font-semibold text-slate-400 transition-colors hover:text-white"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink px-7 py-2.5 text-xs font-bold text-white shadow-glow disabled:opacity-60"
          >
            {saving ? "Kaydediliyor…" : isEdit ? "Güncelle" : "Yayınla"}
          </button>
        </div>
      </div>
    </form>
  );
}
