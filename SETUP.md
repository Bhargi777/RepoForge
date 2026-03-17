# Setup Guide for RepoForge AI (Groq-Powered)

Welcome to **RepoForge AI**! This document explains how to set up the platform on your local machine and deploy it to Vercel. This architecture uses **Groq API** for AI-powered documentation generation and **Upstash Redis** for caching and rate limiting.

---

## 1. Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v18 or newer
- **npm** or **pnpm**
- **Git**

---

## 2. Groq API Configuration

Groq provides fast, efficient LLM inference. We use it for generating professional documentation.

### Step 1: Get Groq API Key
1. Go to [Groq Console](https://console.groq.com) and sign up for a free account.
2. Navigate to the **API Keys** section.
3. Click **Create API Key** and copy your API key.

### Step 2: Configure in .env.local
You'll add this to `.env.local` in step 4.

---

## 3. Upstash Redis Configuration

Redis is required to cache generated documentation, handle rate-limiting, manage generation queues, and prevent duplicate generation jobs.

### Step 1: Create a Database
1. Go to [Upstash](https://upstash.com/) and create a free account.
2. Click **Create Database** in the Redis section.
3. Name your database (e.g., `repoforge-cache`), select your region, and choose the Free tier.
4. Click **Create**.

### Step 2: Get Credentials
Once the database is created, scroll down to the **REST API** section. You need these two specific values:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

---

## 4. GitHub Token Configuration

You need a GitHub Personal Access Token (PAT) so the app avoids strict API rate limits when downloading repository metadata.

1. Go to your [GitHub Developer Settings](https://github.com/settings/tokens).
2. Click **Generate new token (classic)**.
3. Give it a descriptive name (e.g., "RepoForge Local").
4. Under scopes, select `public_repo` (or `repo` if you want it to access private repositories later).
5. Click **Generate token** and copy the string starting with `ghp_...`.

---

## 5. GitHub OAuth Configuration (Optional - for Push Feature)

To enable the "Push to GitHub" feature that allows users to create pull requests directly from the app:

### Step 1: Create an OAuth Application
1. Go to [GitHub Developer Settings](https://github.com/settings/developers).
2. Click **New OAuth App** in the OAuth Apps section.
3. Fill in the form:
   - **Application name**: RepoForge AI (or similar)
   - **Homepage URL**: `http://localhost:3000` (for local) or your domain (for production)
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click **Register application**.

### Step 2: Get Credentials
On your OAuth app page:
- Copy **Client ID**
- Click **Generate a new client secret** and copy the secret

### Step 3: Configure in .env.local
Add to your `.env.local`:
```env
GITHUB_CLIENT_ID="your_client_id"
GITHUB_CLIENT_SECRET="your_client_secret"
NEXTAUTH_SECRET="generate_with_openssl_rand_base64_32"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate a NextAuth Secret:**
```bash
openssl rand -base64 32
```

---

## 6. Local Environment Setup

Now, prepare your project environment.

### Step 1: Install Dependencies
Open your terminal, navigate to the project directory, and run:
```bash
npm install
```

### Step 2: Configure Environment Variables
Create a file named `.env.local` in the root folder of the repository:
```bash
touch .env.local
```

Paste your acquired variables inside:
```env
# Groq API (Required for AI generation)
GROQ_API_KEY="your_groq_api_key"

# Upstash Redis (Required for caching)
UPSTASH_REDIS_REST_URL="https://your-upstash-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_secret_token"

# GitHub Setup (Required for repo metadata)
GITHUB_TOKEN="ghp_your_personal_access_token"

# GitHub OAuth (Optional - for push-to-PR feature)
GITHUB_CLIENT_ID="your_oauth_client_id"
GITHUB_CLIENT_SECRET="your_oauth_client_secret"
NEXTAUTH_SECRET="your_generated_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 7. Running and Testing Locally

With everything configured, you can start the application:

```bash
npm run dev
```

1. Open your browser and go to `http://localhost:3000`.
2. Paste any GitHub URL (e.g., `https://github.com/Bhargi777/README-Generator`).
3. Click "Generate".
4. The app will fetch repository metadata, call Groq API for AI generation, and stream the results to you in real-time!
5. **(Optional)** Click "Sign In" in the top-right and authenticate with GitHub to enable the "Push to GitHub" button.
6. After generation completes, click "Push to GitHub" to create a PR with the generated documentation.

---

## 8. Deployment to Vercel

This app is fully serverless and production-ready for Vercel:

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import your GitHub repository.
4. Open the **Environment Variables** section and add all keys from your `.env.local`:
   - `GROQ_API_KEY` (your Groq API key)
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `GITHUB_TOKEN`
   - `GITHUB_CLIENT_ID` (for push feature)
   - `GITHUB_CLIENT_SECRET` (for push feature)
   - `NEXTAUTH_SECRET` (for session security)
   - `NEXTAUTH_URL` (your production domain)
5. Click **Deploy**.

For the `NEXTAUTH_URL` on Vercel, use your production domain (e.g., `https://your-app.vercel.app`).

Vercel will successfully build and launch your serverless AI Docs application!

---

## 9. Using the Push to GitHub Feature

### Prerequisites
- User is signed in with GitHub
- OAuth app is configured with proper scopes
- User has push access to the target repository

### How It Works
1. Generate documentation for any GitHub repository
2. Click **"Push to GitHub"** button in the Actions panel
3. RepoForge AI will:
   - Create a new branch (`docs/repoforge-YYYY-MM-DD-timestamp`)
   - Commit all generated documentation files
   - Open a pull request for review
4. View the PR link and share it with your team

### Supported Files
The push feature automatically commits:
- README.md
- ARCHITECTURE.md
- SETUP.md
- CONTRIBUTING.md
- API.md
- ROADMAP.md

---

## 10. Troubleshooting

### Issue: "GROQ_API_KEY is missing"
**Solution:** Ensure you've set the `GROQ_API_KEY` environment variable in Vercel's settings or your `.env.local` file.

### Issue: Slow generation times
**Solution:** Groq's API is very fast. If generation is slow, check your network connection or Redis connectivity. Also verify the Groq API is responsive at https://console.groq.com.

### Issue: "Redis connection failed"
**Solution:** Verify your Upstash Redis credentials are correct and that your Upstash database is active. Check the UPSTASH_REDIS_REST_URL format.

### Issue: "GitHub API rate limit exceeded"
**Solution:** Use a valid GitHub Personal Access Token. Free tier has higher limits with a token than without.

### Issue: "Please sign in with GitHub to push documentation"
**Solution:** Click the "Sign In" button in the top-right corner and authenticate with GitHub. Ensure GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are configured.

### Issue: "Failed to create PR" when pushing
**Solution:** 
- Ensure your OAuth token has `repo` scope
- Verify you have push access to the target repository
- Check that the repository has either a `main` or `master` branch



