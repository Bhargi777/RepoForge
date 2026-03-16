export async function getRepoMetadata(owner: string, repo: string) {
  const headers = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "RepoForge-AI",
  };
  
  try {
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoResponse.ok) throw new Error("Failed to fetch repo");
    const repoData = await repoResponse.json();

    const langResponse = await fetch(repoData.languages_url, { headers });
    const languages = langResponse.ok ? await langResponse.json() : {};

    const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch}?recursive=1`, { headers });
    const treeData = treeResponse.ok ? await treeResponse.json() : null;
    
    let packageJsonStr = null;
    let fallbackDependencies = "";
    
    if (treeData && treeData.tree) {
      const pkg = treeData.tree.find((file: any) => file.path === "package.json");
      if (pkg) {
        const pkgContent = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${repoData.default_branch}/package.json`);
        if (pkgContent.ok) {
          packageJsonStr = await pkgContent.text();
        }
      }
    }

    const simpleTree = treeData?.tree ? treeData.tree.map((t: any) => t.path).filter((p: string) => !p.startsWith("node_modules") && !p.startsWith(".git")).slice(0, 100) : [];

    return {
      name: repoData.name,
      description: repoData.description,
      topics: repoData.topics || [],
      defaultBranch: repoData.default_branch,
      languages: Object.keys(languages),
      tree: simpleTree,
      packageJson: packageJsonStr
    };
  } catch (error) {
    console.error("GitHub API error:", error);
    throw error;
  }
}
