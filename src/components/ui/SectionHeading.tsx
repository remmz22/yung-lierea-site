"use client";

import { motion } from "framer-motion";

export default function SectionHeading({
  tag,
  title,
  subtitle,
  align = "center",
}: {
  tag: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col gap-4 ${alignCls}`}
    >
      <span className="glass rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-neon-cyan">
        {tag}
      </span>
      <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
