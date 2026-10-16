"use client";

import { useLang } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/data";
import {
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  SpotifyIcon,
  TikTokIcon,
} from "@/components/ui/Icons";

export default function Footer({ settings }: { settings: SiteSettings }) {
  const { t } = useLang();
  const year = new Date().getFullYear();

  const quickLinks = [
    { href: "#about", label: t.nav.about },
    { href: "#discography", label: t.nav.discography },
    { href: "#stats", label: t.nav.stats },
    { href: "#contact", label: t.nav.contact },
  ];

  const socials = [
    { href: settings.spotify, label: "Spotify", Icon: SpotifyIcon },
    { href: settings.instagram, label: "Instagram", Icon: InstagramIcon },
    { href: settings.tiktok, label: "TikTok", Icon: TikTokIcon },
    { href: settings.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
  ];

  return (
    <footer className="relative mt-8 border-t border-white/10">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon-purple/60 to-transparent"
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="flex flex-col gap-4 sm:col-span-2">
          <a href="#" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-pink font-display text-xs font-black text-ink-950">
              YL
            </span>
            <span className="font-display text-sm font-bold tracking-[0.3em] text-white">
              YUNG LIEREA
            </span>
          </a>
          <p className="max-w-xs text-sm leading-relaxed text-slate-500">{t.footer.tagline}</p>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
            {t.footer.quickLinks}
          </h4>
          <ul className="flex flex-col gap-2.5">
            {quickLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-sm text-slate-500 transition-colors hover:text-neon-cyan">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
            {t.footer.follow}
          </h4>
          <div className="flex gap-2.5">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="glass flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:-translate-y-1 hover:text-white"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          <a
            href={`mailto:${settings.bookingEmail}`}
            className="mt-4 flex items-center gap-2 text-xs text-slate-500 transition-colors hover:text-neon-cyan"
          >
            <MailIcon className="h-3.5 w-3.5" />
            {settings.bookingEmail}
          </a>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-slate-600 sm:flex-row lg:px-8">
          <span>
            © {year} Yung Lierea — {t.footer.rights}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-pink" />
            {t.footer.madeIn}
          </span>
        </div>
      </div>
    </footer>
  );
}
