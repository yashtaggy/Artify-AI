"use client";

import { motion } from "framer-motion";

/**
 * ArtifyLogo — premium animated brand mark for login/signup pages.
 * Default export so it can be imported as: import ArtifyLogo from "@/components/ArtifyLogo"
 */
export default function ArtifyLogo() {
  return (
    <div className="relative flex flex-col items-center justify-center mb-6">
      {/* Animated soft radial glows behind the text */}
      <motion.div
        aria-hidden
        className="absolute -inset-12 rounded-full blur-3xl opacity-60 pointer-events-none"
        animate={{
          // animate between a few pleasing radial gradients
          background: [
            "radial-gradient(circle at 20% 20%, rgba(255,105,180,0.25), transparent 40%), radial-gradient(circle at 80% 80%, rgba(138,43,226,0.18), transparent 40%)",
            "radial-gradient(circle at 80% 20%, rgba(255,165,0,0.20), transparent 40%), radial-gradient(circle at 30% 80%, rgba(138,43,226,0.18), transparent 40%)",
            "radial-gradient(circle at 50% 30%, rgba(255,105,180,0.22), transparent 40%), radial-gradient(circle at 60% 70%, rgba(99,102,241,0.16), transparent 40%)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      />

      {/* Main text: gradient + glow + entrance */}
      <motion.h1
        className="relative text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent
                   bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500
                   drop-shadow-[0_10px_30px_rgba(99,102,241,0.12)]"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        ArtifyAI
      </motion.h1>

      {/* Subtle shimmer bar — gives motion across the logo */}
      <motion.div
        aria-hidden
        className="mt-3 h-[3px] w-2/3 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.12) 55%, transparent 100%)",
          opacity: 0.95,
        }}
        initial={{ x: "-60%" }}
        animate={{ x: "60%" }}
        transition={{ duration: 2.4, repeat: Infinity, repeatType: "loop", ease: "linear" }}
      />
    </div>
  );
}
