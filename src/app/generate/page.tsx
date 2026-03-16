"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { DocsPreview } from "@/components/DocsPreview";
import { ScoreCard } from "@/components/ScoreCard";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function GenerateContent() {
  const searchParams = useSearchParams();
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const diagrams = searchParams.get("diagrams");
  const docsFlag = searchParams.get("docs");

  const [docs, setDocs] = useState<Record<string, string> | null>(null);
  const [scores, setScores] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing repository metadata...");

  useEffect(() => {
    if (!owner || !repo) {
      setError("Missing repository details.");
      setLoading(false);
      return;
    }

    const runBrowserGeneration = async (metadata: any) => {
      try {
        const { generateClientDocs, generateClientScores } = await import("@/lib/browser-ai");
        
        const clientScores = await generateClientScores(metadata, setLoadingMessage);
        setScores(clientScores);
        await fetch("/api/cache", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, type: "scores", data: clientScores })
        });

        const clientDocs = await generateClientDocs(metadata, { includeDiagrams: diagrams, generateFullDocs: docsFlag }, setLoadingMessage);
        setDocs(clientDocs);
        await fetch("/api/cache", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, type: "docs", data: clientDocs })
        });
      } catch (err: any) {
        setError(err.message || "Failed client generation");
      }
    };

    const fetchPipeline = async () => {
       try {
         // 1. Fetch scores (cached or metadata fallback)
         const analyzeRes = await fetch("/api/analyze", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ owner, repo })
         });
         const analyzeData = await analyzeRes.json();
         if (analyzeData.cached) {
            setScores(analyzeData.scores);
         }

         // 2. Fetch docs (cached or metadata fallback)
         const docsRes = await fetch("/api/generate", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ owner, repo })
         });
         const docsData = await docsRes.json();
         
         if (docsData.cached) {
            setDocs(docsData.docs);
         } else {
            // Need to generate using metadata!
            await runBrowserGeneration(docsData.metadata);
         }
       } catch (err: any) {
         setError(err.message);
       } finally {
         setLoading(false);
       }
    };

    fetchPipeline();

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
          <p className="text-gray-400 font-medium">{loadingMessage}</p>
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
          className="flex flex-col w-full"
        >
          <ScoreCard scores={scores} />
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
