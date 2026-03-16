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
          <Button variant="ghost" size="sm" className="hidden sm:flex text-gray-400 hover:text-white" asChild>
            <Link href="https://github.com/Bhargi777/README-Generator" target="_blank">
              Documentation
            </Link>
          </Button>
          <Button size="sm" className="bg-white text-black hover:bg-gray-200" asChild>
            <Link href="/login">
              <Github className="mr-2 h-4 w-4" />
              Sign In
            </Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
