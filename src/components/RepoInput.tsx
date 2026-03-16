"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

export function RepoInput() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    includeEmojis: true,
    includeDiagrams: true,
    generateFullDocs: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) {
      toast.error("Please enter a valid GitHub remote repository URL");
      return;
    }
    
    setIsLoading(true);
    try {
      const url = new URL(repoUrl);
      if (url.hostname !== "github.com") {
        throw new Error();
      }
      const [, owner, repoName] = url.pathname.split("/");
      if (!owner || !repoName) throw new Error();
      
      router.push(`/generate?owner=${owner}&repo=${repoName}&diagrams=${options.includeDiagrams}&docs=${options.generateFullDocs}`);
    } catch {
      toast.error("Invalid GitHub URL structure. Expected https://github.com/owner/repo");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
      className="w-full flex flex-col gap-6"
    >
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        <Search className="absolute left-4 h-5 w-5 text-gray-500" />
        <Input
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/owner/repository"
          className="h-16 w-full rounded-2xl border-white/10 bg-white/5 pl-12 pr-32 text-lg text-white placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-white/20"
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 h-12 rounded-xl bg-white px-6 font-medium text-black hover:bg-gray-200"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Generate"
          )}
        </Button>
      </form>

      <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={options.includeEmojis} onCheckedChange={(checked) => setOptions({ ...options, includeEmojis: checked === true })} />
          <span>Include Emojis</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={options.includeDiagrams} onCheckedChange={(checked) => setOptions({ ...options, includeDiagrams: checked === true })} />
          <span>Include Diagrams</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={options.generateFullDocs} onCheckedChange={(checked) => setOptions({ ...options, generateFullDocs: checked === true })} />
          <span>Full Docs Suite</span>
        </label>
      </div>
    </motion.div>
  );
}
