# Setup Guide for RepoForge AI (Serverless Edition)

Welcome to **RepoForge AI**! This document explains how to set up the platform on your local machine and deploy it to Vercel. This updated architecture runs completely serverless using **Transformers.js** directly in the browser and caches results using **Upstash Redis**.

---

## 1. Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v18 or newer
- **npm** or **pnpm**
- **Git**

---

## 2. Upstash Redis Configuration

A Redis instance is required to cache generated documentation, handle rate-limiting, manage generation queues, and prevent duplicate generation jobs.

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

## 3. GitHub Token Configuration

You need a GitHub Personal Access Token (PAT) so the app avoids strict API rate limits when downloading repository metadata.

1. Go to your [GitHub Developer Settings](https://github.com/settings/tokens).
2. Click **Generate new token (classic)**.
3. Give it a descriptive name (e.g., "RepoForge Local").
4. Under scopes, select `public_repo` (or `repo` if you want it to access private repositories later).
5. Click **Generate token** and copy the string starting with `ghp_...`.

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
# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-upstash-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_secret_token"

# GitHub Setup
GITHUB_TOKEN="ghp_your_personal_access_token"

# (Optional) If you later implement the push-to-GitHub OAuth feature explicitly:
GITHUB_CLIENT_ID="your_oauth_client_id"
GITHUB_CLIENT_SECRET="your_oauth_client_secret"
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
4. You will see WebAssembly boot up in your browser, download the weights from Xenova on HuggingFace, and begin streaming the parsed README documentation back to you natively on the client using Web Workers! 

*(Note: The first time you run this, your browser will download the Transformers.js AI model which is ~500MB, so generation might take a bit longer initially. All subsequent generations will use the local browser cache and speed up significantly).*

---

## 6. Deployment to Vercel

Since this app no longer requires a local GPU server (like Ollama), it is fully ready for a standard Vercel environment:

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import your GitHub repository.
4. Open the **Environment Variables** section and paste the exact keys from your `.env.local` file:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `GITHUB_TOKEN`
5. Click **Deploy**.

Vercel will successfully build and launch your edge-native AI Docs application!
