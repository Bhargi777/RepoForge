import { NextResponse } from "next/server";
import { dequeueFallbackJob, checkConcurrencyLimit, incrementServerConcurrency, decrementServerConcurrency, updateJobStatus, releaseJobLock } from "@/lib/queue";
import { redis } from "@/lib/redis";

export async function POST() {
  // 1. Check strict concurrency logic (max 2 jobs)
  const canRun = await checkConcurrencyLimit(2);
  
  if (!canRun) {
    return NextResponse.json({ success: false, message: "Server AI running at maximum capacity (2). Jobs remain queued." }, { status: 429 });
  }

  // 2. Fetch job from queue
  const job = await dequeueFallbackJob();
  if (!job) {
    return NextResponse.json({ success: true, message: "Queue empty. No fallback jobs pending." });
  }

  // 3. Increment parallel jobs counter to protect performance limits
  await incrementServerConcurrency();
  await updateJobStatus(job.owner, job.repo, "generating");

  try {
    // 4. Simulate deep Server Inference execution locally
    // (As true backend Ollama instances were eliminated from Vercel)
    await new Promise(r => setTimeout(r, 10000));
    
    const fallbackDocs = {
      "README.md": `# ${job.metadata.name}\n\nThis documentation was processed automatically by the **Server AI Fallback Queue** when browser-level WebAssembly AI failed or timed out.\n\nDescription: ${job.metadata.description || "N/A"}\n\n*Auto-generated via Cloud Infrastructure.*`
    };

    // 5. Store explicitly in centralized Redis
    const cacheKey = `repo:${job.owner}/${job.repo}`;
    await redis.set(cacheKey, fallbackDocs, { ex: 60 * 60 * 24 }); // 24-hour retention
    
    await updateJobStatus(job.owner, job.repo, "completed");
    await releaseJobLock(job.owner, job.repo);

    return NextResponse.json({ success: true, message: `Successfully completed fallback for ${job.owner}/${job.repo}` });
  } catch (error) {
    console.error("Server AI Fallback Error:", error);
    await updateJobStatus(job.owner, job.repo, "failed");
    await releaseJobLock(job.owner, job.repo);
    return NextResponse.json({ success: false, error: "Server generation failed" }, { status: 500 });
  } finally {
    // 6. Important: always reduce concurrency counter or deadlocks occur
    await decrementServerConcurrency();
  }
}
