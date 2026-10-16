"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/lib/data";
import {
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  SpotifyIcon,
  TikTokIcon,
} from "@/components/ui/Icons";

type FormState = "idle" | "saving" | "ok" | "error";

export default function SettingsForms({ settings }: { settings: SiteSettings }) {
  const router = useRouter();

  const [email, setEmail] = useState(settings.bookingEmail);
  const [instagram, setInstagram] = useState(settings.instagram);
  const [tiktok, setTiktok] = useState(settings.tiktok);
  const [linkedin, setLinkedin] = useState(settings.linkedin);
  const [spotify, setSpotify] = useState(settings.spotify);
  const [siteState, setSiteState] = useState<FormState>("idle");
  const [siteMsg, setSiteMsg] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [pwState, setPwState] = useState<FormState>("idle");
  const [pwMsg, setPwMsg] = useState<string | null>(null);

  async function saveSite(_e: FormEvent) {
    setSiteState("saving");
    setSiteMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingEmail: email,
          instagram,
          tiktok,
          linkedin,
          spotify,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSiteState("error");
        setSiteMsg(json.error ?? "Kaydedilemedi.");
        return;
      }
      setSiteState("ok");
      setSiteMsg("Kaydedildi ✓ — site anında güncel.");
      router.refresh();
    } catch {
      setSiteState("error");
      setSiteMsg("Bağlantı hatası.");
    }
  }

  async function changePassword(_e: FormEvent) {
    if (newPassword !== newPassword2) {
      setPwState("error");
      setPwMsg("Yeni şifreler eşleşmiyor.");
      return;
    }
    setPwState("saving");
    setPwMsg(null);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setPwState("error");
        setPwMsg(json.error ?? "Değiştirilemedi.");
        return;
      }
      setPwState("ok");
      setPwMsg("Şifre değişti ✓");
      setCurrentPassword("");
      setNewPassword("");
      setNewPassword2("");
    } catch {
      setPwState("error");
      setPwMsg("Bağlantı hatası.");
    }
  }

  const label = "flex flex-col gap-1.5 text-[11px] uppercase tracking-wider text-slate-500";
  const input = "field !pt-2.5";

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {/* İletişim & sosyal */}
      <form onSubmit={saveSite} className="glass flex flex-col gap-5 rounded-3xl p-6">
        <h2 className="font-display text-sm font-bold text-white">İletişim & Sosyal Medya</h2>
        <p className="-mt-3 text-xs text-slate-500">
          Bu bilgiler sitenin iletişim bölümünde, footer'da ve hero'daki ikonlarda görünür.
        </p>

        <label className={label}>
          <span className="flex items-center gap-1.5">
            <MailIcon className="h-3.5 w-3.5 text-neon-cyan" /> Booking E-posta
          </span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
            placeholder="booking@..."
            type="email"
            required
          />
        </label>
        <label className={label}>
          <span className="flex items-center gap-1.5">
            <SpotifyIcon className="h-3.5 w-3.5 text-emerald-400" /> Spotify Profil
          </span>
          <input value={spotify} onChange={(e) => setSpotify(e.target.value)} className={input} placeholder="https://..." />
        </label>
        <label className={label}>
          <span className="flex items-center gap-1.5">
            <InstagramIcon className="h-3.5 w-3.5 text-neon-pink" /> Instagram
          </span>
          <input value={instagram} onChange={(e) => setInstagram(e.target.value)} className={input} placeholder="https://..." />
        </label>
        <label className={label}>
          <span className="flex items-center gap-1.5">
            <TikTokIcon className="h-3.5 w-3.5 text-white" /> TikTok
          </span>
          <input value={tiktok} onChange={(e) => setTiktok(e.target.value)} className={input} placeholder="https://..." />
        </label>
        <label className={label}>
          <span className="flex items-center gap-1.5">
            <LinkedInIcon className="h-3.5 w-3.5 text-sky-400" /> LinkedIn
          </span>
          <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className={input} placeholder="https://..." />
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={siteState === "saving"}
            className="rounded-xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink px-6 py-2.5 text-xs font-bold text-white shadow-glow disabled:opacity-60"
          >
            {siteState === "saving" ? "Kaydediliyor…" : "Kaydet"}
          </button>
          {siteMsg && (
            <span className={`text-xs ${siteState === "ok" ? "text-emerald-400" : "text-rose-400"}`}>
              {siteMsg}
            </span>
          )}
        </div>
      </form>

      {/* Şifre değiştir */}
      <form onSubmit={changePassword} className="glass flex flex-col gap-5 rounded-3xl p-6">
        <h2 className="font-display text-sm font-bold text-white">Şifre Değiştir</h2>
        <p className="-mt-3 text-xs text-slate-500">
          Değişiklikten sonra mevcut girişin geçerli kalır; sonraki girişlerde yeni şifre kullanılır.
        </p>
        <label className={label}>
          Mevcut Şifre
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={input}
            required
            autoComplete="current-password"
          />
        </label>
        <label className={label}>
          Yeni Şifre (en az 8 karakter)
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={input}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <label className={label}>
          Yeni Şifre (tekrar)
          <input
            type="password"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
            className={input}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pwState === "saving"}
            className="rounded-xl bg-white/10 px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/15 disabled:opacity-60"
          >
            {pwState === "saving" ? "Değiştiriliyor…" : "Şifreyi Değiştir"}
          </button>
          {pwMsg && (
            <span className={`text-xs ${pwState === "ok" ? "text-emerald-400" : "text-rose-400"}`}>
              {pwMsg}
            </span>
          )}
        </div>

        <div className="mt-auto rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-[11px] leading-relaxed text-amber-200/70">
          <strong className="text-amber-300">Güvenlik notu:</strong> Giriş 15 dakikada 5 denemeyle
          sınırlıdır (kaba kuvvet koruması). Şifreni kimseyle paylaşma; editor hesabı sınırlı
          içerik yönetimi içindir.
        </div>
      </form>
    </div>
  );
}
