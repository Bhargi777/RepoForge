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
  includeDiagrams?: boolean;
  generateFullDocs?: boolean;
}

export interface DocumentationSet {
  [key: string]: string;
}

/**
 * Generate comprehensive documentation for a repository using Groq
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
  const readmePrompt = `Generate a professional README.md for this repository. 
Include sections:
1. Title and description
2. Key Features (2-5 bullet points)
3. Tech Stack
4. Installation instructions
5. Quick Start / Usage
6. Project Structure
7. Contributing
8. License

Make it engaging and comprehensive. Use proper Markdown formatting.`;

  docs["README.md"] = await generateWithGroq(
    systemPrompt,
    readmePrompt,
    "README.md"
  );

  // ARCHITECTURE.md
  if (options.includeDiagrams !== false) {
    const archPrompt = `Generate ARCHITECTURE.md explaining:
1. System architecture overview
2. Key components and modules
3. Data flow and interactions
4. Design patterns used
5. Include a Mermaid diagram inside a \`\`\`mermaid code block showing the system architecture

Be concise but comprehensive. Focus on how the system is organized.`;

    docs["ARCHITECTURE.md"] = await generateWithGroq(
      systemPrompt,
      archPrompt,
      "ARCHITECTURE.md"
    );
  }

  // SETUP.md
  if (options.generateFullDocs !== false) {
    const setupPrompt = `Generate SETUP.md with:
1. Prerequisites
2. Environment variables setup (with examples)
3. Installation steps
4. Local development instructions
5. Running tests (if applicable)
6. Build instructions
7. Deployment notes

Be practical and step-by-step. Include commands where appropriate.`;

    docs["SETUP.md"] = await generateWithGroq(
      systemPrompt,
      setupPrompt,
      "SETUP.md"
    );

    // CONTRIBUTING.md
    const contribPrompt = `Generate CONTRIBUTING.md with:
1. Development setup for contributors
2. Branching strategy and naming conventions
3. Commit message conventions
4. Pull request process
5. Code style guidelines
6. Testing requirements
7. How to report issues

Make it welcoming but clear about expectations.`;

    docs["CONTRIBUTING.md"] = await generateWithGroq(
      systemPrompt,
      contribPrompt,
      "CONTRIBUTING.md"
    );

    // API.md (for projects with APIs)
    const apiPrompt = `Generate API.md. If this is an API project or has significant API components:
1. Document all main endpoints/functions
2. Include parameters and return types
3. Provide example usage
4. Document error handling

If this is not primarily an API project, document the main public interfaces and modules instead. Keep examples practical and clear.`;

    docs["API.md"] = await generateWithGroq(
      systemPrompt,
      apiPrompt,
      "API.md"
    );

    // ROADMAP.md
    const roadmapPrompt = `Generate ROADMAP.md suggesting:
1. Planned features (next 3-6 months)
2. Performance improvements
3. Scalability considerations
4. Breaking changes or major refactors
5. Integration opportunities
6. Community requests (speculative)

Be realistic but inspiring. Maintain alignment with the project's purpose.`;

    docs["ROADMAP.md"] = await generateWithGroq(
      systemPrompt,
      roadmapPrompt,
      "ROADMAP.md"
    );
  }

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
  const readmePrompt = `Generate a professional README.md for this repository. 
Include sections:
1. Title and description
2. Key Features (2-5 bullet points)
3. Tech Stack
4. Installation instructions
5. Quick Start / Usage
6. Project Structure
7. Contributing
8. License

Make it engaging and comprehensive. Use proper Markdown formatting.`;

  const readmeContent = await generateWithGroqStream(
    systemPrompt,
    readmePrompt,
    "README.md",
    onProgress
  );
  docs["README.md"] = readmeContent;

  // ARCHITECTURE.md
  if (options.includeDiagrams !== false) {
    const archPrompt = `Generate ARCHITECTURE.md explaining:
1. System architecture overview
2. Key components and modules
3. Data flow and interactions
4. Design patterns used
5. Include a Mermaid diagram inside a \`\`\`mermaid code block showing the system architecture

Be concise but comprehensive. Focus on how the system is organized.`;

    const archContent = await generateWithGroqStream(
      systemPrompt,
      archPrompt,
      "ARCHITECTURE.md",
      onProgress
    );
    docs["ARCHITECTURE.md"] = archContent;
  }

  // SETUP.md
  if (options.generateFullDocs !== false) {
    const setupPrompt = `Generate SETUP.md with:
1. Prerequisites
2. Environment variables setup (with examples)
3. Installation steps
4. Local development instructions
5. Running tests (if applicable)
6. Build instructions
7. Deployment notes

Be practical and step-by-step. Include commands where appropriate.`;

    const setupContent = await generateWithGroqStream(
      systemPrompt,
      setupPrompt,
      "SETUP.md",
      onProgress
    );
    docs["SETUP.md"] = setupContent;

    // CONTRIBUTING.md
    const contribPrompt = `Generate CONTRIBUTING.md with:
1. Development setup for contributors
2. Branching strategy and naming conventions
3. Commit message conventions
4. Pull request process
5. Code style guidelines
6. Testing requirements
7. How to report issues

Make it welcoming but clear about expectations.`;

    const contribContent = await generateWithGroqStream(
      systemPrompt,
      contribPrompt,
      "CONTRIBUTING.md",
      onProgress
    );
    docs["CONTRIBUTING.md"] = contribContent;

    // API.md
    const apiPrompt = `Generate API.md. If this is an API project or has significant API components:
1. Document all main endpoints/functions
2. Include parameters and return types
3. Provide example usage
4. Document error handling

If this is not primarily an API project, document the main public interfaces and modules instead. Keep examples practical and clear.`;

    const apiContent = await generateWithGroqStream(
      systemPrompt,
      apiPrompt,
      "API.md",
      onProgress
    );
    docs["API.md"] = apiContent;

    // ROADMAP.md
    const roadmapPrompt = `Generate ROADMAP.md suggesting:
1. Planned features (next 3-6 months)
2. Performance improvements
3. Scalability considerations
4. Breaking changes or major refactors
5. Integration opportunities
6. Community requests (speculative)

Be realistic but inspiring. Maintain alignment with the project's purpose.`;

    const roadmapContent = await generateWithGroqStream(
      systemPrompt,
      roadmapPrompt,
      "ROADMAP.md",
      onProgress
    );
    docs["ROADMAP.md"] = roadmapContent;
  }

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
