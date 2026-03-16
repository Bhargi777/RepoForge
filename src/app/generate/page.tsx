"use client";

import { useEffect, useState, Suspense, useRef } from "react";
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
  const cacheChecked = useRef(false);

  useEffect(() => {
    if (!owner || !repo) {
      setError("Missing repository URL or parameters.");
      setLoading(false);
      return;
    }
    
    // Prevent strict mode double fetching
    if (cacheChecked.current) return;
    cacheChecked.current = true;

    const runBrowserGeneration = async (metadata: any) => {
      try {
        setDocs({}); // initialize streaming UI
        const { generateClientDocs, generateClientScores } = await import("@/lib/browser-ai");
        
        const clientScores = await generateClientScores(metadata, setLoadingMessage);
        setScores(clientScores);
        await fetch("/api/cache", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, type: "scores", data: clientScores })
        });

        const handleStream = (fileName: string, text: string) => {
           setDocs((prev) => ({ ...prev, [fileName]: text }) as Record<string, string>);
        };

        const clientDocs = await generateClientDocs(
             metadata, 
             { includeDiagrams: diagrams, generateFullDocs: docsFlag }, 
             setLoadingMessage,
             handleStream
        );
        
        await fetch("/api/cache", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, type: "docs", data: clientDocs })
        });
        
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed client generation");
        await fetch("/api/cache", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, type: "failed" })
        });
      }
    };

    const fetchPipeline = async (isPolling = false) => {
       try {
         const analyzeRes = await fetch("/api/analyze", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ owner, repo })
         });
         const analyzeData = await analyzeRes.json();
         if (analyzeData.cached) setScores(analyzeData.scores);

         const docsRes = await fetch("/api/generate", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ owner, repo, isPolling })
         });
         const docsData = await docsRes.json();

         if (!docsData.success) {
            setError(docsData.error);
            setLoading(false);
            return;
         }

         if (docsData.cached) {
            setDocs(docsData.docs);
            setLoadingMessage("Cache hit. Rendering...");
            setTimeout(() => setLoading(false), 500);
         } else if (docsData.locked) {
            setLoadingMessage(`Another user is processing this repository (${docsData.status}). Waiting...`);
            setTimeout(() => fetchPipeline(true), 5000);
         } else if (!docsData.locked) {
            // Unlocked, cache missing, proceed to generation
            runBrowserGeneration(docsData.metadata);
         }
       } catch (err: any) {
         setError(err.message);
         setLoading(false);
       }
    };

    fetchPipeline();

  }, [owner, repo, diagrams, docsFlag]);

  return (
    <div className="flex-1 container mx-auto px-6 py-8">
      {loading && !docs ? (
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="flex flex-col items-center justify-center h-[60vh] gap-4"
        >
          <Loader2 className="w-12 h-12 animate-spin text-gray-500" />
          <p className="text-gray-400 font-medium text-center max-w-sm">{loadingMessage}</p>
        </motion.div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-red-400 font-semibold">{error}</p>
        </div>
      ) : docs ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col w-full"
        >
          <ScoreCard scores={scores} />
          {loading && (
             <div className="mb-4 text-blue-400 animate-pulse text-sm font-medium flex items-center gap-2">
               <Loader2 className="w-4 h-4 animate-spin" /> {loadingMessage}
             </div>
          )}
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
