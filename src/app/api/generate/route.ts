import { NextResponse } from "next/server";
import { getRepoMetadata } from "@/lib/github";
import { redis } from "@/lib/redis";
import { checkRateLimit } from "@/lib/rate-limit";
import { createJobLock, releaseJobLock, updateJobStatus } from "@/lib/queue";
import { generateDocumentationStream } from "@/lib/groq";

export const maxDuration = 60; // Vercel timeout

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateCheck = await checkRateLimit(ip);
    
    if (!rateCheck.success) {
      return NextResponse.json(
        { success: false, error: rateCheck.message },
        { status: 429 }
      );
    }

    const { owner, repo, flags } = await req.json();
    
    // 1. Check Redis Cache
    const cacheKey = `repo:${owner}/${repo}`;
    try {
      if (process.env.UPSTASH_REDIS_REST_URL) {
        const cachedDocs = await redis.get(cacheKey);
        if (cachedDocs && typeof cachedDocs === "object") {
          return NextResponse.json({
            success: true,
            cached: true,
            docs: cachedDocs
          });
        }
      }
    } catch (e) {
      console.error("Redis fetch failed", e);
    }

    // 2. Acquire Job Lock to prevent duplicate generation
    const locked = await createJobLock(owner, repo);
    if (!locked) {
      return NextResponse.json({
        success: true,
        cached: false,
        locked: true,
        status: "generating"
      });
    }

    // 3. Fetch metadata from GitHub
    let metadata;
    try {
      metadata = await getRepoMetadata(owner, repo);
    } catch (e) {
      console.error("GitHub API Error", e);
      await releaseJobLock(owner, repo);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch GitHub repository. Check the URL and limits."
        },
        { status: 400 }
      );
    }

    // 4. Generate documentation using Groq
    await updateJobStatus(owner, repo, "generating");
    
    try {
      const docs = await generateDocumentationStream(
        metadata,
        {
          includeDiagrams: flags?.includeDiagrams === "true" || flags?.includeDiagrams === true,
          generateFullDocs: flags?.generateFullDocs === "true" || flags?.generateFullDocs === true,
        }
      );

      // 5. Store in Redis cache (24-hour TTL)
      if (process.env.UPSTASH_REDIS_REST_URL) {
        try {
          await redis.set(cacheKey, docs, { ex: 60 * 60 * 24 });
        } catch (cacheError) {
          console.warn("Failed to cache results", cacheError);
        }
      }

      await updateJobStatus(owner, repo, "completed");
      await releaseJobLock(owner, repo);

      return NextResponse.json({
        success: true,
        cached: false,
        docs
      });
    } catch (genError) {
      console.error("Groq generation failed:", genError);
      await updateJobStatus(owner, repo, "failed");
      await releaseJobLock(owner, repo);
      
      const errorMessage = genError instanceof Error ? genError.message : String(genError);
      
      return NextResponse.json(
        {
          success: false,
          error: `Failed to generate documentation: ${errorMessage}`
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Generate route error:", error);
    return NextResponse.json(
      { success: false, error: "System error processing request." },
      { status: 500 }
    );
  }
}

