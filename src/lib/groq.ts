import Groq from "groq-sdk";

// Lazy-load the Groq client to avoid issues during build time
let groq: Groq | null = null;

function getGroqClient(): Groq {
  if (!groq) {
    groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groq;
}

export interface GenerationOptions {
  includeEmojis?: boolean;
  customReadmePrompt?: string;
  customContributingPrompt?: string;
}

export interface DocumentationSet {
  [key: string]: string;
}

/**
 * Generate README.md and CONTRIBUTING.md using Groq
 */
export async function generateDocumentation(
  metadata: any,
  options: GenerationOptions = {}
): Promise<DocumentationSet> {
  const systemPrompt = `You are an expert open-source maintainer and technical writer who creates professional, well-structured GitHub documentation. Your writing follows industry best practices for clarity, completeness, and engagement.

Repository Context:
- Name: ${metadata.name}
- Description: ${metadata.description || "N/A"}
- Languages: ${metadata.languages?.join(", ") || "N/A"}
- GitHub URL: ${metadata.htmlUrl || "N/A"}`;

  const docs: DocumentationSet = {};

  // README.md
  const readmePrompt = options.customReadmePrompt || `Generate a professional README.md for this repository. 
Include sections:
1. Title and description
2. Key Features (2-5 bullet points)
3. Tech Stack
4. Installation instructions
5. Quick Start / Usage
6. Project Structure
7. Contributing
8. License

Make it engaging and comprehensive. Use proper Markdown formatting.${options.includeEmojis ? " Include relevant emojis to make it visually appealing." : ""}`;

  docs["README.md"] = await generateWithGroq(
    systemPrompt,
    readmePrompt,
    "README.md"
  );

  // CONTRIBUTING.md
  const contribPrompt = options.customContributingPrompt || `Generate CONTRIBUTING.md with:
1. Development setup for contributors
2. Branching strategy and naming conventions
3. Commit message conventions
4. Pull request process
5. Code style guidelines
6. Testing requirements
7. How to report issues

Make it welcoming but clear about expectations.${options.includeEmojis ? " Include relevant emojis to enhance readability." : ""}`;

  docs["CONTRIBUTING.md"] = await generateWithGroq(
    systemPrompt,
    contribPrompt,
    "CONTRIBUTING.md"
  );

  return docs;
}

/**
 * Generate a single document section with Groq
 */
async function generateWithGroq(
  systemPrompt: string,
  userPrompt: string,
  fileName: string
): Promise<string> {
  try {
    const groq = getGroqClient();
    const message = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
    });

    const content = message.choices[0]?.message?.content;
    if (!content) {
      throw new Error(`Empty response from Groq for ${fileName}`);
    }

    return content;
  } catch (error) {
    console.error(`Error generating ${fileName} with Groq:`, error);
    throw error;
  }
}

/**
 * Stream documentation generation for real-time feedback
 */
export async function generateDocumentationStream(
  metadata: any,
  options: GenerationOptions = {},
  onProgress?: (fileName: string, content: string) => void
): Promise<DocumentationSet> {
  const systemPrompt = `You are an expert open-source maintainer and technical writer who creates professional, well-structured GitHub documentation. Your writing follows industry best practices for clarity, completeness, and engagement.

Repository Context:
- Name: ${metadata.name}
- Description: ${metadata.description || "N/A"}
- Languages: ${metadata.languages?.join(", ") || "N/A"}
- GitHub URL: ${metadata.htmlUrl || "N/A"}`;

  const docs: DocumentationSet = {};

  // README.md
  const readmePrompt = options.customReadmePrompt || `Generate a professional README.md for this repository. 
Include sections:
1. Title and description
2. Key Features (2-5 bullet points)
3. Tech Stack
4. Installation instructions
5. Quick Start / Usage
6. Project Structure
7. Contributing
8. License

Make it engaging and comprehensive. Use proper Markdown formatting.${options.includeEmojis ? " Include relevant emojis to make it visually appealing." : ""}`;

  const readmeContent = await generateWithGroqStream(
    systemPrompt,
    readmePrompt,
    "README.md",
    onProgress
  );
  docs["README.md"] = readmeContent;

  // CONTRIBUTING.md
  const contribPrompt = options.customContributingPrompt || `Generate CONTRIBUTING.md with:
1. Development setup for contributors
2. Branching strategy and naming conventions
3. Commit message conventions
4. Pull request process
5. Code style guidelines
6. Testing requirements
7. How to report issues

Make it welcoming but clear about expectations.${options.includeEmojis ? " Include relevant emojis to enhance readability." : ""}`;

  const contribContent = await generateWithGroqStream(
    systemPrompt,
    contribPrompt,
    "CONTRIBUTING.md",
    onProgress
  );
  docs["CONTRIBUTING.md"] = contribContent;

  return docs;
}

/**
 * Stream a single generation for progressive rendering
 */
async function generateWithGroqStream(
  systemPrompt: string,
  userPrompt: string,
  fileName: string,
  onProgress?: (fileName: string, content: string) => void
): Promise<string> {
  try {
    let fullContent = "";

    const groq = getGroqClient();
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 1,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullContent += content;
        if (onProgress) {
          onProgress(fileName, fullContent);
        }
      }
    }

    return fullContent;
  } catch (error) {
    console.error(`Error streaming ${fileName} with Groq:`, error);
    throw error;
  }
}
