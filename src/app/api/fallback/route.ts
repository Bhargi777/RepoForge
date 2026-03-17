import { NextResponse } from "next/server";

/**
 * DEPRECATED: This fallback route is no longer used.
 * All AI generation has been migrated to Groq API via /api/generate
 * This route is kept for backward compatibility but returns a deprecation notice.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message:
        "This endpoint is deprecated. All generation now uses Groq API via /api/generate.",
    },
    { status: 410 } // 410 Gone
  );
}

