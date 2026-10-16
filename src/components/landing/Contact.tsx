"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/data";
import { cn } from "@/lib/utils";
import SectionHeading from "@/components/ui/SectionHeading";
import {
  ArrowRightIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  MapPinIcon,
  SpotifyIcon,
  TikTokIcon,
} from "@/components/ui/Icons";

type FormState = "idle" | "sending" | "success" | "error";
type InquiryType = "booking" | "collab" | "question" | "press" | "other";

const TYPE_ORDER: InquiryType[] = ["booking", "collab", "question", "press", "other"];

export default function Contact({ settings }: { settings: SiteSettings }) {
  const { t } = useLang();
  const [state, setState] = useState<FormState>("idle");
  const [inquiryType, setInquiryType] = useState<InquiryType>("booking");
  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState<FormState>("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: inquiryType }),
      });
      if (!res.ok) throw new Error();
      setState("success");
      form.reset();
    } catch {
      setState("error");
    }
  }

  async function onSubscribe(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubState("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setSubState("success");
      setEmail("");
    } catch {
      setSubState("error");
    }
  }

  const f = t.contact.form;

  return (
    <section
      id="contact"
      className="relative mx-auto max-w-7xl scroll-mt-[76px] px-5 pt-14 pb-24 lg:px-8 lg:pt-16 lg:pb-32"
    >
      <div
        aria-hidden
        className="absolute left-0 top-1/3 h-96 w-96 rounded-full bg-neon-pink/[0.06] blur-[110px]"
      />
      <SectionHeading tag={t.contact.tag} title={t.contact.title} subtitle={t.contact.subtitle} />

      <div className="mt-14 grid gap-6 lg:grid-cols-5">
        {/* Sol: bilgi kartı + harita */}
        <motion.aside
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-6 lg:col-span-2"
        >
          <div className="glass card-glow flex flex-col gap-5 rounded-3xl p-7">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-base font-bold text-white">{t.contact.bookingTitle}</h3>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-emerald-400" />
                {t.contact.availability}
              </span>
            </div>
            <a
              href={`mailto:${settings.bookingEmail}`}
              className="group flex items-center gap-3.5 text-sm text-slate-300 transition-colors hover:text-neon-cyan"
            >
              <span className="glass flex h-11 w-11 items-center justify-center rounded-xl text-neon-cyan transition-transform group-hover:scale-110">
                <MailIcon className="h-5 w-5" />
              </span>
              {settings.bookingEmail}
            </a>
            <div className="flex items-center gap-3.5 text-sm text-slate-300">
              <span className="glass flex h-11 w-11 items-center justify-center rounded-xl text-neon-pink">
                <MapPinIcon className="h-5 w-5" />
              </span>
              {t.contact.location}
            </div>
            <div className="flex gap-2.5 border-t border-white/5 pt-5">
              {[
                { href: settings.spotify, label: "Spotify", Icon: SpotifyIcon, hover: "hover:text-emerald-400" },
                { href: settings.instagram, label: "Instagram", Icon: InstagramIcon, hover: "hover:text-neon-pink" },
                { href: settings.tiktok, label: "TikTok", Icon: TikTokIcon, hover: "hover:text-white" },
                { href: settings.linkedin, label: "LinkedIn", Icon: LinkedInIcon, hover: "hover:text-sky-400" },
              ].map(({ href, label, Icon, hover }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ y: -3 }}
                  className={`glass flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 ${hover}`}
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Harita (OpenStreetMap — API anahtarı gerektirmez) */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="glass overflow-hidden rounded-3xl"
          >
            <iframe
              title={t.contact.mapTitle}
              src="https://www.openstreetmap.org/export/embed.html?bbox=28.9%2C40.13%2C29.22%2C40.25&layer=mapnik&marker=40.1885%2C29.061"
              className="h-56 w-full border-0 grayscale-[35%] invert-[0.9] hue-rotate-180"
              loading="lazy"
            />
          </motion.div>

          {/* Bülten */}
          <form onSubmit={onSubscribe} className="glass card-glow flex flex-col gap-3 rounded-3xl p-7">
            <h4 className="font-display text-sm font-bold text-white">
              {t.contact.newsletterTitle}
            </h4>
            <div className="flex gap-2">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.contact.newsletterPh}
                className="field flex-1"
              />
              <button
                disabled={subState === "sending"}
                className="flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/15 disabled:opacity-60"
              >
                {subState === "success" ? t.contact.newsletterOk : t.contact.newsletterBtn}
                {subState !== "success" && <ArrowRightIcon className="h-3.5 w-3.5" />}
              </button>
            </div>
          </form>
        </motion.aside>

        {/* Sağ: form + FAQ */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col gap-6 lg:col-span-3"
        >
          <form onSubmit={onSubmit} className="glass card-glow flex flex-col gap-5 rounded-3xl p-7">
            {/* Teklif tipi seçici */}
            <div role="tablist" aria-label={t.contact.tag} className="flex flex-wrap gap-2">
              {TYPE_ORDER.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={inquiryType === key}
                  onClick={() => setInquiryType(key)}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-bold transition-all duration-300",
                    inquiryType === key
                      ? "bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink text-white shadow-glow"
                      : "glass text-slate-400 hover:text-white"
                  )}
                >
                  {t.contact.types[key]}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="relative block">
                <input required name="name" placeholder={f.namePh} className="field peer" />
                <span className="field-label">{f.name}</span>
              </label>
              <label className="relative block">
                <input
                  required
                  type="email"
                  name="email"
                  placeholder={f.emailPh}
                  className="field peer"
                />
                <span className="field-label">{f.email}</span>
              </label>
            </div>

            {/* Booking seçiliyeyse ek alanlar */}
            <AnimatePresence initial={false}>
              {inquiryType === "booking" && (
                <motion.div
                  key="booking-fields"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="relative block">
                      <input
                        type="date"
                        name="eventDate"
                        className="field peer !pt-6"
                      />
                      <span className="field-label !top-1.5 !text-[10px]">
                        {t.contact.bookingFields.eventDate}
                      </span>
                    </label>
                    <label className="relative block">
                      <input
                        name="city"
                        placeholder="İstanbul"
                        className="field peer"
                      />
                      <span className="field-label">{t.contact.bookingFields.city}</span>
                    </label>
                    <label className="relative block">
                      <select name="budget" className="field peer !pt-6" defaultValue="">
                        <option value="" className="bg-ink-900" />
                        {t.contact.bookingFields.budgets.map((b) => (
                          <option key={b} value={b} className="bg-ink-900">
                            {b}
                          </option>
                        ))}
                      </select>
                      <span className="field-label !top-1.5 !text-[10px]">
                        {t.contact.bookingFields.budget}
                      </span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <label className="relative block">
              <input name="subject" placeholder={f.subjectPh} className="field peer" />
              <span className="field-label">{f.subject}</span>
            </label>
            <label className="relative block">
              <textarea
                required
                name="body"
                rows={5}
                placeholder={f.messagePh}
                className="field peer resize-none"
              />
              <span className="field-label">{f.message}</span>
            </label>

            {/* Honeypot: botlar doldurur, insanlar görmez */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={state === "sending"}
                className="rounded-xl bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink px-7 py-3 text-sm font-bold text-white shadow-glow disabled:opacity-60"
              >
                {state === "sending" ? f.sending : f.submit}
              </motion.button>
              <AnimatePresence mode="wait">
                {state === "success" && (
                  <motion.span
                    key="ok"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm font-medium text-emerald-400"
                  >
                    <motion.svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <motion.path
                        d="M20 6 9 17l-5-5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      />
                    </motion.svg>
                    {f.success}
                  </motion.span>
                )}
                {state === "error" && (
                  <motion.span
                    key="err"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium text-rose-400"
                  >
                    {f.error}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass card-glow flex flex-col gap-3 rounded-3xl p-7"
          >
            <h3 className="font-display text-base font-bold text-white">{t.contact.faqTitle}</h3>
            {t.contact.faq.map((item, i) => {
              const open = openFaq === i;
              return (
                <div key={i} className="overflow-hidden rounded-2xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-white transition-colors hover:bg-white/[0.03]"
                  >
                    {item.q}
                    <motion.span
                      animate={{ rotate: open ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon-purple/40 to-neon-cyan/30 text-sm text-white"
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="px-4 pb-4 text-xs leading-relaxed text-slate-400">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
