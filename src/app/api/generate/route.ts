import { NextResponse } from "next/server";
import { getRepoMetadata } from "@/lib/github";
import { generateContent } from "@/lib/ai";
import { README_PROMPT, ARCHITECTURE_PROMPT, CONTRIBUTING_PROMPT, API_PROMPT, SETUP_PROMPT, ROADMAP_PROMPT } from "@/utils/prompts";

export async function POST(req: Request) {
  try {
    const { owner, repo, flags } = await req.json();

    const metadata = await getRepoMetadata(owner, repo);
    
    // Build context
    const systemContext = `Repository Name: ${metadata.name}
Description: ${metadata.description || "N/A"}
Topics: ${metadata.topics.join(", ")}
Languages: ${metadata.languages.join(", ")}
Structure: ${metadata.tree.slice(0, 30).join(", ")}`;

    // Generate concurrently
    const [
      readme,
      architecture,
      contributing,
      apiDocs,
      setupDocs,
      roadmap
    ] = await Promise.all([
      generateContent(`Context: ${systemContext}\nTask: ${README_PROMPT}`, "You are an expert developer documentation writer."),
      flags?.includeDiagrams === "true" ? generateContent(`Context: ${systemContext}\nTask: ${ARCHITECTURE_PROMPT}`, "You are a software architect.") : Promise.resolve(""),
      flags?.generateFullDocs === "true" ? generateContent(`Context: ${systemContext}\nTask: ${CONTRIBUTING_PROMPT}`, "You are an open source maintainer.") : Promise.resolve(""),
      flags?.generateFullDocs === "true" ? generateContent(`Context: ${systemContext}\nTask: ${API_PROMPT}`, "You are an API technical writer.") : Promise.resolve(""),
      flags?.generateFullDocs === "true" ? generateContent(`Context: ${systemContext}\nTask: ${SETUP_PROMPT}`, "You are a technical setup guide writer.") : Promise.resolve(""),
      flags?.generateFullDocs === "true" ? generateContent(`Context: ${systemContext}\nTask: ${ROADMAP_PROMPT}`, "You are a product manager.") : Promise.resolve("")
    ]);

    return NextResponse.json({
      success: true,
      docs: {
        "README.md": readme,
        "ARCHITECTURE.md": architecture,
        "CONTRIBUTING.md": contributing,
        "API.md": apiDocs,
        "SETUP.md": setupDocs,
        "ROADMAP.md": roadmap,
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to generate docs" }, { status: 500 });
  }
}
