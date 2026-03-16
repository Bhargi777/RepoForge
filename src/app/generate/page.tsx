"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { DocsPreview } from "@/components/DocsPreview";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function GenerateContent() {
  const searchParams = useSearchParams();
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const diagrams = searchParams.get("diagrams");
  const docsFlag = searchParams.get("docs");

  const [docs, setDocs] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!owner || !repo) {
      setError("Missing repository details.");
      setLoading(false);
      return;
    }
    
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner,
        repo,
        flags: { includeDiagrams: diagrams, generateFullDocs: docsFlag }
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDocs(data.docs);
        } else {
          setError(data.error);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [owner, repo, diagrams, docsFlag]);

  return (
    <div className="flex-1 container mx-auto px-6 py-8">
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-[60vh] gap-4"
        >
          <Loader2 className="w-12 h-12 animate-spin text-gray-500" />
          <p className="text-gray-400">Forging your documentation... This may take a moment based on your local AI.</p>
        </motion.div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-red-400">{error}</p>
        </div>
      ) : docs ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <DocsPreview docs={docs} owner={owner as string} repo={repo as string} />
        </motion.div>
      ) : null}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <main className="flex-1 flex flex-col min-h-screen">
      <Navbar />
      <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-white"><Loader2 className="animate-spin" /></div>}>
        <GenerateContent />
      </Suspense>
    </main>
  );
}
