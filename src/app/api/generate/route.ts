import { NextResponse } from "next/server";
import { getRepoMetadata } from "@/lib/github";
import { redis } from "@/lib/redis";
import { checkRateLimit } from "@/lib/rate-limit";
import { createJobLock, checkJobLock, getJobStatus, updateJobStatus } from "@/lib/queue";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateCheck = await checkRateLimit(ip);
    
    if (!rateCheck.success) {
      return NextResponse.json({ success: false, error: rateCheck.message }, { status: 429 });
    }

    const { owner, repo, flags, isPolling } = await req.json();
    
    // 1. Check Redis Cache
    const cacheKey = `repo:${owner}/${repo}`;
    try {
      if (process.env.UPSTASH_REDIS_REST_URL) {
        const cachedDocs = await redis.get(cacheKey);
        if (cachedDocs) {
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

    // 2. Check Job Lock preventing redundant jobs
    const isLocked = await checkJobLock(owner, repo);
    if (isLocked) {
       const status = await getJobStatus(owner, repo);
       return NextResponse.json({ success: true, cached: false, locked: true, status: status || "generating" });
    }

    // If polling and no cache + no lock, either generation failed or hasn't started
    if (isPolling) {
       return NextResponse.json({ success: true, cached: false, locked: false, error: "Generation failed or timed out." });
    }

    // 3. Otherwise fetch metadata from GitHub
    let metadata;
    try {
      metadata = await getRepoMetadata(owner, repo);
    } catch (e) {
       console.error("GitHub API Error", e);
       return NextResponse.json({ success: false, error: "Failed to fetch GitHub repository. Check the URL and limits." }, { status: 400 });
    }
    
    // Acquire Lock for Browser Generation
    const locked = await createJobLock(owner, repo);
    if (locked) {
       await updateJobStatus(owner, repo, "generating");
    }

    return NextResponse.json({
      success: true,
      cached: false,
      locked: false,
      metadata
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "System error processing request." }, { status: 500 });
  }
}
