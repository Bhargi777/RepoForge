import { NextResponse } from "next/server";
import { 
  getRepoIntelligence, 
  setRepoIntelligence, 
  deleteRepoIntelligence,
  type RepoIntelligence 
} from "@/lib/repo-config";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

    if (!owner || !repo) {
      return NextResponse.json(
        { success: false, error: "Missing owner or repo parameter" },
        { status: 400 }
      );
    }

    const intelligence = await getRepoIntelligence(owner, repo);
    
    return NextResponse.json({
      success: true,
      data: intelligence || null,
    });
  } catch (error) {
    console.error("Error fetching repo intelligence:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { owner, repo, ...intelligenceData } = body;

    if (!owner || !repo) {
      return NextResponse.json(
        { success: false, error: "Missing owner or repo" },
        { status: 400 }
      );
    }

    const success = await setRepoIntelligence(owner, repo, {
      owner,
      repo,
      ...intelligenceData,
    });

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to save configuration" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Configuration saved successfully",
    });
  } catch (error) {
    console.error("Error saving repo intelligence:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save configuration" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner");
    const repo = searchParams.get("repo");

    if (!owner || !repo) {
      return NextResponse.json(
        { success: false, error: "Missing owner or repo parameter" },
        { status: 400 }
      );
    }

    const success = await deleteRepoIntelligence(owner, repo);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to delete configuration" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Configuration deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting repo intelligence:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete configuration" },
      { status: 500 }
    );
  }
}
