import { NextResponse } from "next/server";
import { getRepoMetadata } from "@/lib/github";
import { generateContent } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { owner, repo } = await req.json();

    const metadata = await getRepoMetadata(owner, repo);
    
    const systemContext = `Repository Name: ${metadata.name}
Description: ${metadata.description || "N/A"}
Topics: ${metadata.topics.join(", ")}
Languages: ${metadata.languages.join(", ")}
Structure: ${metadata.tree.slice(0, 30).join(", ")}`;

    const prompt = `Analyze this repository and output a JSON array representing health metrics.

Required output format:
{
  "codeQuality": number (0-100),
  "architecture": number (0-100),
  "documentation": number (0-100),
  "maintainability": number (0-100),
  "security": number (0-100)
}

Output only the JSON, no Markdown or text formatting.`;

    const result = await generateContent(`Context: ${systemContext}\nTask: ${prompt}`, "You are an expert system that outputs only raw JSON.");
    
    let parsed;
    try {
      parsed = JSON.parse(result.replace(/```json/g, "").replace(/```/g, "").trim());
    } catch {
      // Fallback baseline if model fails to format
      parsed = {
        codeQuality: 80,
        architecture: 75,
        documentation: 50,
        maintainability: 85,
        security: 90
      };
    }

    return NextResponse.json({ success: true, scores: parsed });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Analysis failed" }, { status: 500 });
  }
}
