"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold tracking-tight text-white">RepoForge AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="https://github.com/Bhargi777/README-Generator" target="_blank" className="hidden sm:inline-flex h-9 items-center justify-center px-3 text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Documentation
          </Link>
          <Link href="/login" className="inline-flex h-9 items-center justify-center rounded-md bg-white px-3 text-sm font-medium text-black hover:bg-gray-200 transition-colors">
            <Github className="mr-2 h-4 w-4" />
            Sign In
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
