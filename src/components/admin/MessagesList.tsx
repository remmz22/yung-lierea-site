"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn, formatDate } from "@/lib/utils";
import { MailIcon } from "@/components/ui/Icons";

type Msg = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  type: string | null;
  city: string | null;
  eventDate: string | null;
  budget: string | null;
  read: boolean;
  createdAt: string;
};

const TYPE_META: Record<string, { label: string; cls: string }> = {
  booking: { label: "Booking", cls: "bg-neon-pink/15 text-neon-rose" },
  collab: { label: "İş Birliği", cls: "bg-neon-purple/15 text-neon-violet" },
  question: { label: "Soru", cls: "bg-neon-cyan/15 text-neon-aqua" },
  press: { label: "Basın", cls: "bg-amber-500/15 text-amber-300" },
  other: { label: "Diğer", cls: "bg-white/10 text-slate-300" },
};

export default function MessagesList({ messages }: { messages: Msg[] }) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);

  async function toggleRead(m: Msg) {
    await fetch(`/api/messages/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !m.read }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Mesaj silinsin mi?")) return;
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (messages.length === 0) {
    return (
      <div className="glass flex flex-col items-center gap-3 rounded-3xl py-16">
        <MailIcon className="h-8 w-8 text-slate-700" />
        <p className="text-sm text-slate-600">Henüz mesaj yok.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {messages.map((m) => (
        <li
          key={m.id}
          className={cn(
            "glass card-glow rounded-2xl p-5 transition-colors",
            !m.read && "border-l-2 border-l-neon-cyan"
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <button
              onClick={() => setOpen(open === m.id ? null : m.id)}
              className="min-w-0 flex-1 text-left"
            >
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm font-bold text-white">{m.name}</span>
                <span className="text-xs text-slate-500">{m.email}</span>
                {m.type && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      TYPE_META[m.type]?.cls ?? TYPE_META.other.cls
                    )}
                  >
                    {TYPE_META[m.type]?.label ?? m.type}
                  </span>
                )}
                {!m.read && (
                  <span className="rounded-full bg-neon-cyan/15 px-2 py-0.5 text-[10px] font-bold text-neon-cyan">
                    YENİ
                  </span>
                )}
              </div>
              {m.subject && <p className="mt-0.5 text-xs text-slate-400">{m.subject}</p>}
              {open !== m.id && (
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">{m.body}</p>
              )}
              {m.type === "booking" && (m.city || m.eventDate || m.budget) && (
                <p className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-slate-500">
                  {m.eventDate && (
                    <span>
                      📅{" "}
                      {new Date(m.eventDate).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                  {m.city && <span>📍 {m.city}</span>}
                  {m.budget && <span>💰 {m.budget}</span>}
                </p>
              )}
            </button>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[10px] text-slate-600">{formatDate(m.createdAt)}</span>
              <button
                onClick={() => toggleRead(m)}
                className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] text-slate-400 transition-colors hover:text-white"
              >
                {m.read ? "Okunmadı" : "Okundu"}
              </button>
              <a
                href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + (m.subject ?? ""))}`}
                className="rounded-lg bg-neon-purple/15 px-2.5 py-1.5 text-[11px] font-semibold text-neon-violet transition-colors hover:bg-neon-purple/25"
              >
                Yanıtla
              </a>
              <button
                onClick={() => remove(m.id)}
                className="rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-[11px] text-rose-400 transition-colors hover:bg-rose-500/20"
              >
                Sil
              </button>
            </div>
          </div>
          {open === m.id && (
            <div className="mt-4 border-t border-white/5 pt-4">
              <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed text-slate-300">
                {m.body}
              </pre>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
