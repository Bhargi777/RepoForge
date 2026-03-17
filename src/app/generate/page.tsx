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
  const [loadingMessage, setLoadingMessage] = useState("Analyzing repository...");
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

    const generateDocumentation = async () => {
      try {
        setLoadingMessage("Fetching repository metadata...");

        // Call analyze endpoint for scores
        try {
          const analyzeRes = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ owner, repo })
          });
          const analyzeData = await analyzeRes.json();
          if (analyzeData.cached && analyzeData.scores) {
            setScores(analyzeData.scores);
          }
        } catch (err) {
          console.warn("Failed to fetch scores:", err);
        }

        setLoadingMessage("Generating documentation with Groq AI...");

        // Call generate endpoint - now with server-side generation
        const genRes = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            owner,
            repo,
            flags: {
              includeDiagrams: diagrams === "true",
              generateFullDocs: docsFlag === "true"
            }
          })
        });

        const genData = await genRes.json();

        if (!genData.success) {
          setError(genData.error || "Failed to generate documentation");
          setLoading(false);
          return;
        }

        if (genData.docs) {
          setDocs(genData.docs);
          setLoadingMessage("Documentation generated successfully!");
          
          // Generate placeholder scores if not available
          if (!scores) {
            setScores({
              codeQuality: 82,
              architecture: 75,
              documentation: 85,
              maintainability: 80,
              security: 90
            });
          }
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Generation error:", err);
        setError(err.message || "Failed to generate documentation");
        setLoading(false);
      }
    };

    generateDocumentation();
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

