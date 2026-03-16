"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight text-white mb-6">
          Turn any GitHub repo into <br className="hidden sm:block" />
          <span className="text-gray-400">beautiful documentation.</span>
        </h1>
      </motion.div>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        className="text-lg text-gray-400 max-w-2xl"
      >
        Generate perfect READMEs, architecture diagrams, and full project docs instantly.
        No configuration required.
      </motion.p>
    </section>
  );
}
