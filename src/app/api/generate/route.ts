import { NextResponse } from "next/server";
import { getRepoMetadata } from "@/lib/github";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const { owner, repo, flags } = await req.json();
    
    // Check Redis Cache
    const cacheKey = `repo:${owner}/${repo}`;
    try {
      if (process.env.UPSTASH_REDIS_REST_URL) {
        const cachedDocs = await redis.get(cacheKey);
        // If cached, return immediately
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

    // Otherwise fetch metadata
    const metadata = await getRepoMetadata(owner, repo);
    
    return NextResponse.json({
      success: true,
      cached: false,
      metadata
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to fetch repo data" }, { status: 500 });
  }
}
