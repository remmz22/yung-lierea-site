"use client";

import { motion, useScroll, useSpring } from "framer-motion";

// Sayfanın en üstünde kayan neon ilerleme çubuğu
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink"
      aria-hidden
    />
  );
}
