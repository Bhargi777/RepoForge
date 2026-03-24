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

Redis is required to cache generated documentation and handle rate-limiting to prevent system abuse.

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

## 4. Local Environment Setup

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
```

---

## 5. Running and Testing Locally

With everything configured, you can start the application:

```bash
npm run dev
```

1. Open your browser and go to `http://localhost:3000`.
2. Paste any GitHub URL (e.g., `https://github.com/Bhargi777/README-Generator`).
3. Click "Generate".
4. The app will fetch repository metadata, call Groq API for AI generation, and stream the results to you in real-time!
5. After generation completes, you can **Copy** the content to your clipboard or **Download** the markdown file directly.

---

## 6. Deployment to Vercel

This app is fully serverless and production-ready for Vercel:

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import your GitHub repository.
4. Open the **Environment Variables** section and add the following keys:
   - `GROQ_API_KEY` (your Groq API key)
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
5. Click **Deploy**.

Vercel will successfully build and launch your serverless AI Docs application!

---

## 7. Troubleshooting

### Issue: "GROQ_API_KEY is missing"
**Solution:** Ensure you've set the `GROQ_API_KEY` environment variable in Vercel's settings or your `.env.local` file.

### Issue: Slow generation times
**Solution:** Groq's API is very fast. If generation is slow, check your network connection or Redis connectivity. Also verify the Groq API is responsive at https://console.groq.com.

### Issue: "Redis connection failed"
**Solution:** Verify your Upstash Redis credentials are correct and that your Upstash database is active. Check the UPSTASH_REDIS_REST_URL format.

### Issue: "GitHub API rate limit exceeded"
**Solution:** The app uses public fetching for metadata. If you hit limits on very large or frequent requests, consider adding a `GITHUB_TOKEN` to your environment, though it's not strictly required for basic functionality.



