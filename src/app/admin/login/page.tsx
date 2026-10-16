"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Equalizer from "@/components/ui/Equalizer";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Giriş başarısız.");
        setLoading(false);
        return;
      }
      const from = new URLSearchParams(window.location.search).get("from");
      router.push(from && from.startsWith("/admin") ? from : "/admin");
      router.refresh();
    } catch {
      setError("Bağlantı hatası.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute -left-[10%] top-[-15%] h-[45vmax] w-[45vmax] animate-aurora rounded-full bg-neon-purple/20 blur-[110px]" />
        <div className="absolute -right-[10%] bottom-[-20%] h-[40vmax] w-[40vmax] animate-aurora-rev rounded-full bg-neon-cyan/15 blur-[110px]" />
        <div className="bg-grid absolute inset-0" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong relative w-full max-w-sm rounded-3xl p-8 shadow-card"
      >
        <div className="mb-7 flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink font-display text-base font-black text-ink-950">
            YL
          </span>
          <div>
            <h1 className="font-display text-lg font-extrabold tracking-widest text-white">
              YUNG LIEREA
            </h1>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">Admin Panel</p>
          </div>
          <Equalizer bars={9} className="h-5 opacity-70" />
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="relative block">
            <input
              required
              name="username"
              autoComplete="username"
              placeholder="admin"
              className="field peer"
            />
            <span className="field-label">Kullanıcı Adı</span>
          </label>
          <label className="relative block">
            <input
              required
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="field peer"
            />
            <span className="field-label">Şifre</span>
          </label>

          {error && (
            <motion.p
              initial={{ x: 0 }}
              animate={{ x: [0, -6, 6, -4, 4, 0] }}
              transition={{ duration: 0.4 }}
              className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="mt-1 rounded-xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink px-4 py-3 text-sm font-bold text-white shadow-glow disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
