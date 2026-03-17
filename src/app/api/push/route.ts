import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

interface GitHubCreateRefResponse {
  ref: string;
  url: string;
  object: {
    sha: string;
    type: string;
    url: string;
  };
}

interface GitHubGetBranchResponse {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
}

interface GitHubUpdateContentResponse {
  content: {
    name: string;
    path: string;
    sha: string;
    size: number;
    type: string;
    url: string;
  };
  commit: {
    sha: string;
    url: string;
  };
}

interface GitHubPullResponse {
  id: number;
  html_url: string;
  title: string;
}

async function getMainSHA(owner: string, repo: string, token: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      // Try master if main doesn't exist
      const masterResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/master`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      if (!masterResponse.ok) {
        throw new Error("Could not find main or master branch");
      }
      const data = (await masterResponse.json()) as GitHubGetBranchResponse;
      return data.object.sha;
    }

    const data = (await response.json()) as GitHubGetBranchResponse;
    return data.object.sha;
  } catch (error) {
    console.error("Error getting main SHA:", error);
    throw error;
  }
}

async function createBranch(
  owner: string,
  repo: string,
  branchName: string,
  mainSHA: string,
  token: string
): Promise<void> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: mainSHA,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to create branch: ${errorData.message || response.statusText}`
    );
  }
}

async function updateFileContent(
  owner: string,
  repo: string,
  path: string,
  content: string,
  branchName: string,
  token: string
): Promise<string> {
  // Encode content to base64
  const encodedContent = Buffer.from(content).toString("base64");

  // First, try to get existing file SHA
  let existingSha: string | undefined;
  try {
    const getResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branchName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (getResponse.ok) {
      const fileData = await getResponse.json();
      existingSha = fileData.sha;
    }
  } catch (error) {
    console.warn(`File ${path} does not exist yet, will create new`);
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `docs: update ${path}`,
        content: encodedContent,
        branch: branchName,
        ...(existingSha && { sha: existingSha }),
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Failed to update ${path}: ${errorData.message || response.statusText}`
    );
  }

  const data = (await response.json()) as GitHubUpdateContentResponse;
  return data.content.sha;
}

async function createPullRequest(
  owner: string,
  repo: string,
  branchName: string,
  token: string
): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "docs: add/update documentation with RepoForge AI",
        body: "This PR contains automatically generated documentation created by [RepoForge AI](https://repoforge.ai). Please review and merge if appropriate.",
        head: branchName,
        base: "main",
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    // If PR already exists for this branch, try with master as base
    if (errorData.errors?.[0]?.message?.includes("base")) {
      const masterResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/pulls`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: "docs: add/update documentation with RepoForge AI",
            body: "This PR contains automatically generated documentation created by [RepoForge AI](https://repoforge.ai). Please review and merge if appropriate.",
            head: branchName,
            base: "master",
          }),
        }
      );

      if (!masterResponse.ok) {
        const masterError = await masterResponse.json();
        throw new Error(
          `Failed to create PR: ${masterError.message || masterResponse.statusText}`
        );
      }

      const data = (await masterResponse.json()) as GitHubPullResponse;
      return data.html_url;
    }

    throw new Error(`Failed to create PR: ${errorData.message || response.statusText}`);
  }

  const data = (await response.json()) as GitHubPullResponse;
  return data.html_url;
}

export async function POST(req: Request) {
  try {
    const { docs, owner, repo } = await req.json();

    if (!docs || !owner || !repo) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: docs, owner, repo",
        },
        { status: 400 }
      );
    }

    const session: any = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GitHub authentication required to push documentation. Please sign in.",
        },
        { status: 401 }
      );
    }

    const token = session.accessToken;
    const timestamp = new Date().toISOString().slice(0, 10);
    const branchName = `docs/repoforge-${timestamp}-${Date.now()}`;

    try {
      // Step 1: Get main branch SHA
      const mainSHA = await getMainSHA(owner, repo, token);

      // Step 2: Create new branch
      await createBranch(owner, repo, branchName, mainSHA, token);

      // Step 3: Commit all generated documentation files
      const filesToCommit = [
        { path: "README.md", name: "README.md" },
        { path: "ARCHITECTURE.md", name: "ARCHITECTURE.md" },
        { path: "SETUP.md", name: "SETUP.md" },
        { path: "CONTRIBUTING.md", name: "CONTRIBUTING.md" },
        { path: "API.md", name: "API.md" },
        { path: "ROADMAP.md", name: "ROADMAP.md" },
      ];

      for (const fileConfig of filesToCommit) {
        if (docs[fileConfig.name]) {
          try {
            await updateFileContent(
              owner,
              repo,
              fileConfig.path,
              docs[fileConfig.name],
              branchName,
              token
            );
          } catch (fileError) {
            console.warn(`Skipping ${fileConfig.name}:`, fileError);
            // Continue with other files even if one fails
          }
        }
      }

      // Step 4: Create pull request
      const prUrl = await createPullRequest(owner, repo, branchName, token);

      return NextResponse.json({
        success: true,
        url: prUrl,
        message: "PR created successfully!",
      });
    } catch (error) {
      console.error("GitHub API error:", error);
      return NextResponse.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to push documentation to GitHub",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Push endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Server error processing push request",
      },
      { status: 500 }
    );
  }
}

