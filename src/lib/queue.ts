import { redis } from "./redis";

export async function createJobLock(owner: string, repo: string): Promise<boolean> {
  const lockKey = `lock:repo:${owner}/${repo}`;
  try {
    const res = await redis.set(lockKey, "locked", { nx: true, ex: 120 });
    return res === "OK";
  } catch (e) {
    console.error("Redis lock error:", e);
    return true; // fail open
  }
}

export async function releaseJobLock(owner: string, repo: string): Promise<void> {
  const lockKey = `lock:repo:${owner}/${repo}`;
  try {
    await redis.del(lockKey);
  } catch (e) {
    console.error("Redis release lock error:", e);
  }
}

export async function checkJobLock(owner: string, repo: string): Promise<boolean> {
  const lockKey = `lock:repo:${owner}/${repo}`;
  try {
    const isLocked = await redis.exists(lockKey);
    return isLocked === 1;
  } catch (e) {
    return false;
  }
}

export async function updateJobStatus(owner: string, repo: string, status: "queued" | "generating" | "completed" | "failed"): Promise<void> {
  const statusKey = `status:repo:${owner}/${repo}`;
  try {
    await redis.set(statusKey, status, { ex: 3600 });
  } catch (e) {
    console.error("Redis status update error:", e);
  }
}

export async function getJobStatus(owner: string, repo: string): Promise<string | null> {
  const statusKey = `status:repo:${owner}/${repo}`;
  try {
    return await redis.get(statusKey);
  } catch (e) {
    return null;
  }
}

export async function enqueueFallbackJob(owner: string, repo: string, metadata: any, options: any) {
  const payload = JSON.stringify({ owner, repo, metadata, options, timestamp: Date.now() });
  try {
    await redis.lpush("ai_generation_queue", payload);
    await updateJobStatus(owner, repo, "queued");
  } catch (e) {
    console.error("Redis enqueue error:", e);
  }
}

export async function dequeueFallbackJob() {
  try {
    const result = await redis.rpop("ai_generation_queue");
    return result ? JSON.parse(result as string) : null;
  } catch (e) {
    console.error("Redis dequeue error:", e);
    return null;
  }
}

export async function checkConcurrencyLimit(limit: number): Promise<boolean> {
  try {
    const activeJobs = await redis.get("active_server_jobs") as number || 0;
    return activeJobs < limit;
  } catch (e) {
    return true;
  }
}

export async function incrementServerConcurrency() {
  await redis.incr("active_server_jobs");
}

export async function decrementServerConcurrency() {
  await redis.decr("active_server_jobs");
}
