import { redis } from "./redis";

export interface RepoIntelligence {
  owner: string;
  repo: string;
  systemPrompt?: string;
  readmePrompt?: string;
  architecturePrompt?: string;
  contributingPrompt?: string;
  apiPrompt?: string;
  roadmapPrompt?: string;
  setupPrompt?: string;
  focusAreas?: string[];
  customInstructions?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Get repository-specific intelligence configuration
 */
export async function getRepoIntelligence(owner: string, repo: string): Promise<RepoIntelligence | null> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      return null;
    }

    const key = `intelligence:${owner}/${repo}`;
    const config = await redis.get(key);
    
    if (config && typeof config === "object") {
      return config as RepoIntelligence;
    }
    return null;
  } catch (error) {
    console.error("Error fetching repo intelligence:", error);
    return null;
  }
}

/**
 * Save repository-specific intelligence configuration
 */
export async function setRepoIntelligence(owner: string, repo: string, intelligence: Partial<RepoIntelligence>): Promise<boolean> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      return false;
    }

    const key = `intelligence:${owner}/${repo}`;
    const now = Date.now();
    
    const config: RepoIntelligence = {
      owner,
      repo,
      createdAt: now,
      updatedAt: now,
      ...intelligence,
    };

    await redis.set(key, config, { ex: 60 * 60 * 24 * 30 }); // 30 days TTL
    return true;
  } catch (error) {
    console.error("Error saving repo intelligence:", error);
    return false;
  }
}

/**
 * Delete repository-specific intelligence configuration
 */
export async function deleteRepoIntelligence(owner: string, repo: string): Promise<boolean> {
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      return false;
    }

    const key = `intelligence:${owner}/${repo}`;
    await redis.del(key);
    return true;
  } catch (error) {
    console.error("Error deleting repo intelligence:", error);
    return false;
  }
}

/**
 * Get default prompts with repo-specific overrides
 */
export async function getRepositoryPrompts(owner: string, repo: string): Promise<{
  system: string;
  readme: string;
  architecture: string;
  contributing: string;
  api: string;
  roadmap: string;
  setup: string;
  focusAreas: string[];
}> {
  const intelligence = await getRepoIntelligence(owner, repo);
  
  // Default prompts
  const defaults = {
    system: `You are an expert open-source maintainer and technical writer who creates professional, well-structured GitHub documentation. Your writing follows industry best practices for clarity, completeness, and engagement.`,
    readme: `Generate a professional README.md for this repository. Follow standard open-source best practices. Include sections: Title, Description, Features, Tech Stack, Installation, Usage, Project Structure, Contributing, License.`,
    architecture: `Generate ARCHITECTURE.md with a system architecture explanation, components, modules and services. Also provide a Mermaid diagram of the system architecture inside a code block formatted as \`\`\`mermaid.`,
    contributing: `Generate CONTRIBUTING.md. Include details on: development setup, branching strategy, commit conventions, and pull request workflow.`,
    api: `Generate API.md if there are APIs detected, otherwise document the high level modules interacting. Support Next.js, Express, FastAPI.`,
    roadmap: `Generate ROADMAP.md suggesting future improvements, performance optimizations, feature ideas and scaling strategies.`,
    setup: `Generate SETUP.md explaining environment variables, local development setup and build instructions.`,
    focusAreas: [],
  };

  // Override with repo-specific intelligence if available
  if (intelligence) {
    return {
      system: intelligence.systemPrompt || defaults.system,
      readme: intelligence.readmePrompt || defaults.readme,
      architecture: intelligence.architecturePrompt || defaults.architecture,
      contributing: intelligence.contributingPrompt || defaults.contributing,
      api: intelligence.apiPrompt || defaults.api,
      roadmap: intelligence.roadmapPrompt || defaults.roadmap,
      setup: intelligence.setupPrompt || defaults.setup,
      focusAreas: intelligence.focusAreas || defaults.focusAreas,
    };
  }

  return defaults;
}
