# Deploying RepoForge AI to Vercel

RepoForge AI is completely serverless. It runs AI inference directly within the user's browser (using Transformers.js) and caches the generated results using Upstash Redis. Because there are no long-running GPU servers or custom backends required, deploying to Vercel is incredibly straightforward.

Follow these steps to deploy the application to Vercel in minutes.

---

## 1. Prepare Your Environment Variables

Before deploying, ensure you have gathered the necessary credentials:

1. **Upstash Redis**:
   - Go to [Upstash](https://upstash.com/), create a free Redis database.
   - Retrieve your `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

2. **GitHub Personal Access Token**:
   - Go to [GitHub Developer Settings](https://github.com/settings/tokens).
   - Generate a classic token with `public_repo` (or `repo`) scopes.
   - Copy the `ghp_...` token string. This is required so the Vercel API routes don't hit GitHub's unauthenticated API rate limits.

---

## 2. Push Code to GitHub

Ensure your latest local codebase is pushed to your GitHub repository:
```bash
git add .
git commit -m "chore: ready for vercel deployment"
git push origin main
```

*(Note: Vercel automatically detects Next.js repositories and handles the build command `next build` internally).*

---

## 3. Deploy via Vercel Dashboard

1. Sign in to **[Vercel.com](https://vercel.com/dashboard)** with your GitHub account.
2. Click the **Add New...** button and select **Project**.
3. Locate your repository (e.g., `Bhargi777/README-Generator` or `RepoForge`) and click **Import**.
4. In the **Configure Project** step, open the **Environment Variables** section.
5. Add the following keys and paste your values:

| Name | Value Example |
| :--- | :--- |
| `UPSTASH_REDIS_REST_URL` | `https://your-upstash-url.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | `your_upstash_secret_token` |
| `GITHUB_TOKEN` | `ghp_your_personal_access_token` |

*(Optional: If you maintained the GitHub OAuth push logic, also add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`).*

6. Click **Deploy**.

---

## 4. First Generation and WebAssembly

Once the deployment completes, click on your live production URL (e.g., `https://repoforge-ai.vercel.app`).

**What to expect on Vercel:**
- When a user enters a GitHub URL and clicks Generate, the Vercel API rapidly fetches the repository structure and checks the Upstash Redis cache.
- If the docs aren't cached, the Vercel Next.js backend hands the payload back to the frontend.
- **The user's browser** will then automatically download the lightweight WebAssembly AI model (~1GB) from HuggingFace to execute the AI generation securely on their own device.
- After the browser completes the generation, it silently posts the result back to Vercel, which caches it globally in Upstash. Subsequent visitors asking for the same repo will get an instant response!
