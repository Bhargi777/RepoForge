import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { releaseJobLock, updateJobStatus } from "@/lib/queue";

export async function POST(req: Request) {
  try {
    const { owner, repo, type, data } = await req.json();
    
    if (process.env.UPSTASH_REDIS_REST_URL) {
      if (type === "docs") {
         const cacheKey = `repo:${owner}/${repo}`;
         await redis.set(cacheKey, data, { ex: 60 * 60 * 24 }); // 24 hours cache TTL
         await updateJobStatus(owner, repo, "completed");
         await releaseJobLock(owner, repo);
      } else if (type === "scores") {
         const cacheKey = `scores:${owner}/${repo}`;
         await redis.set(cacheKey, data, { ex: 60 * 60 * 24 }); // 24 hours cache TTL
      } else if (type === "failed") {
         await updateJobStatus(owner, repo, "failed");
         await releaseJobLock(owner, repo);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cache routing error:", error);
    return NextResponse.json({ success: false, error: "Failed to cache data" }, { status: 500 });
  }
}
