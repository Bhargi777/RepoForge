import { redis } from "./redis";

export async function checkRateLimit(ip: string): Promise<{ success: boolean; message?: string }> {
  const minuteKey = `rate:min:${ip}`;
  const hourKey = `rate:hour:${ip}`;

  try {
    const minRequests = await redis.incr(minuteKey);
    if (minRequests === 1) await redis.expire(minuteKey, 60);

    const hourRequests = await redis.incr(hourKey);
    if (hourRequests === 1) await redis.expire(hourKey, 3600);

    if (minRequests > 5) {
      return { success: false, message: "Rate limit exceeded. 5 requests per minute allowed." };
    }
    
    if (hourRequests > 50) {
      return { success: false, message: "Rate limit exceeded. 50 requests per hour allowed." };
    }

    return { success: true };
  } catch (error) {
    console.error("Rate limit check failed", error);
    // Fail open if Redis is down
    return { success: true };
  }
}
