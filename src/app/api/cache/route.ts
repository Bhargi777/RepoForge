import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const { owner, repo, type, data } = await req.json();
    
    if (process.env.UPSTASH_REDIS_REST_URL) {
      if (type === "docs") {
         const cacheKey = `repo:${owner}/${repo}`;
         await redis.set(cacheKey, data, { ex: 60 * 60 * 24 * 7 }); // 1 week cache
      } else if (type === "scores") {
         const cacheKey = `scores:${owner}/${repo}`;
         await redis.set(cacheKey, data, { ex: 60 * 60 * 24 * 7 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to cache data" }, { status: 500 });
  }
}
