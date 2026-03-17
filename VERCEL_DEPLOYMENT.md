# Deploying RepoForge AI to Vercel

RepoForge AI is completely serverless and production-ready. It uses **Groq API** for fast AI-powered documentation generation, **Upstash Redis** for intelligent caching, and deploys seamlessly to Vercel. No GPU servers or complex backend infrastructure required.

Follow these steps to deploy the application to Vercel in minutes.

---

## 1. Prepare Your Environment Variables

Before deploying, ensure you have gathered the necessary credentials:

1. **Groq API Key** (Required):
   - Go to [Groq Console](https://console.groq.com/) and sign up.
   - Generate an API key from the **API Keys** section.
   - Save this as `GROQ_API_KEY`.

2. **Upstash Redis**:
   - Go to [Upstash](https://upstash.com/), create a free Redis database.
   - Retrieve your `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

3. **GitHub Personal Access Token**:
   - Go to [GitHub Developer Settings](https://github.com/settings/tokens).
   - Generate a classic token with `public_repo` (or `repo`) scopes.
   - Copy the `ghp_...` token string. This prevents hitting GitHub's unauthenticated rate limits.

---

## 2. Push Code to GitHub

Ensure your latest local codebase is pushed to your GitHub repository:
```bash
git add .
git commit -m "feat: groq-powered ai generation"
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
| `GROQ_API_KEY` | `gsk_your_groq_api_key` |
| `UPSTASH_REDIS_REST_URL` | `https://your-upstash-url.upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | `your_upstash_secret_token` |
| `GITHUB_TOKEN` | `ghp_your_personal_access_token` |

*(Optional: If you use GitHub OAuth for the push-to-PR feature, also add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`).*

6. Click **Deploy**.

---

## 4. Architecture on Vercel

Once the deployment completes, click on your live production URL (e.g., `https://repoforge-ai.vercel.app`).

**What happens when a user generates documentation:**

1. **User Input**: User enters a GitHub repository URL.
2. **Cache Check**: Vercel API checks Upstash Redis for cached results.
   - If cached → instant response!
3. **Cache Miss**: If not cached:
   - Vercel fetches repository metadata via GitHub API.
   - Vercel calls **Groq API** for AI documentation generation.
4. **Smart Caching**: Results are cached in Upstash Redis (24-hour TTL).
5. **Instant Future Requests**: Subsequent visitors get instant results!

**Benefits:**
- ✅ **Fast**: Groq's inference is optimized for speed (typically 2-5 seconds per document).
- ✅ **Reliable**: No client-side complexity, all computation on server.
- ✅ **Cost-effective**: Groq's free tier is generous; caching reduces API calls.
- ✅ **Scalable**: Vercel handles all infrastructure scaling automatically.

