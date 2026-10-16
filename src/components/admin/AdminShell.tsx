"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import Equalizer from "@/components/ui/Equalizer";
import { CloseIcon, MenuIcon } from "@/components/ui/Icons";

const NAV = [
  { href: "/admin", label: "Genel Bakış", icon: "◧" },
  { href: "/admin/releases", label: "Release'ler", icon: "◈" },
  { href: "/admin/messages", label: "Mesajlar", icon: "✉" },
  { href: "/admin/analytics", label: "Analitik", icon: "◨" },
  { href: "/admin/settings", label: "Ayarlar", icon: "⚙" },
];

export default function AdminShell({
  children,
  username,
  role,
  unreadCount = 0,
}: {
  children: ReactNode;
  username: string;
  role: string;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-col gap-1.5">
      {NAV.map((item) => {
        const active =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
              active
                ? "bg-gradient-to-r from-neon-purple/25 to-transparent text-white shadow-[inset_0_0_0_1px_rgba(168,85,247,.3)]"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <span className={cn("text-base", active && "text-neon-cyan")}>{item.icon}</span>
            {item.label}
            {item.href === "/admin/messages" && unreadCount > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-neon-pink px-1.5 text-[10px] font-black text-white">
                {unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Masaüstü kenar çubuğu */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-ink-900/60 p-5 backdrop-blur-xl lg:flex">
        <Link href="/admin" className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink font-display text-xs font-black text-ink-950">
            YL
          </span>
          <div>
            <p className="font-display text-xs font-bold tracking-[0.2em] text-white">LIEREA</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Admin</p>
          </div>
        </Link>
        {nav}
        <div className="mt-auto flex flex-col gap-3">
          <Equalizer bars={6} className="h-4 opacity-50" />
          <div className="glass rounded-xl p-3">
            <p className="truncate text-xs font-semibold text-white">{username}</p>
            <p className="text-[10px] uppercase tracking-widest text-neon-cyan">{role}</p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-center text-xs font-semibold text-slate-400 transition-colors hover:text-white"
          >
            Siteyi Görüntüle ↗
          </Link>
          <button
            onClick={logout}
            className="rounded-xl bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/20"
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Mobil üst bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="glass-strong sticky top-0 z-40 flex items-center justify-between p-4 lg:hidden">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink font-display text-[10px] font-black text-ink-950">
              YL
            </span>
            <span className="font-display text-xs font-bold tracking-widest text-white">ADMIN</span>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300"
            >
              Çıkış
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Menü"
              className="glass rounded-lg p-2 text-white"
            >
              {open ? <CloseIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
            </button>
          </div>
        </header>
        {open && <div className="glass-strong border-b border-white/10 p-4 lg:hidden">{nav}</div>}

        <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
