import { NextResponse } from "next/server";
import { getRepoMetadata } from "@/lib/github";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const { owner, repo } = await req.json();

    const cacheKey = `scores:${owner}/${repo}`;
    try {
      if (process.env.UPSTASH_REDIS_REST_URL) {
        const cachedScores = await redis.get(cacheKey);
        if (cachedScores) {
           return NextResponse.json({ success: true, cached: true, scores: cachedScores });
        }
      }
    } catch (e) {
      console.error("Redis fetch failed", e);
    }

    const metadata = await getRepoMetadata(owner, repo);

    return NextResponse.json({ success: true, cached: false, metadata });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Analysis fetch failed" }, { status: 500 });
  }
}
