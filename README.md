# RepoForge AI

RepoForge AI is a developer productivity platform that automatically generates GitHub README, project documentation, architecture diagrams, setup guides, API docs, and contribution guides from a GitHub repository.

RepoForge AI runs completely serverless using **Groq API** for fast AI-powered documentation generation and **Upstash Redis** for intelligent caching.

## Features
- **Repository Analyzer** fetches repo data using GitHub API
- **AI Docs Generator** powered by Groq's LLM (llama-3.1-70b)
- **Architecture Visualization** via Mermaid diagrams
- **Repo Health Analyzer** scores code quality, security, architecture, etc.
- **GitHub Authentication** with OAuth for secure access
- **Push to GitHub** creates pull requests directly from the app (authenticated users only)
- **Redis Caching** instantly restores previously generated docs
- **Fast & Reliable** - Production-ready on Vercel with no GPU servers required

## Tech Stack
- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **API:** Groq (AI generation), GitHub API (repo metadata), Upstash Redis (caching)
- **Deployment:** Vercel (serverless)

## Quick Start

### 1. Groq API Setup
You need a Groq API key for AI generation.
1. Sign up at [Groq Console](https://console.groq.com/).
2. Generate an API key.
3. Add it to your `.env.local` as `GROQ_API_KEY`.

### 2. Upstash Redis Setup
You need a Redis instance to cache generated documents.
1. Sign up at [Upstash](https://upstash.com/).
2. Create a new Redis database.
3. Copy the REST URL and REST Token to your environment.

### 3. Environment Variables
Create a file named `.env.local` in the root directory and add the following:
```env
# Groq API (Required for AI generation)
GROQ_API_KEY="your_groq_api_key_here"

# Upstash Redis Configuration (Required for caching)
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# GitHub Configuration (Required for repo metadata)
GITHUB_TOKEN="your_personal_access_token_here"

# For GitHub OAuth (Optional, for push-to-PR feature):
GITHUB_CLIENT_ID="your_oauth_client_id"
GITHUB_CLIENT_SECRET="your_oauth_client_secret"
```

### 4. Running the App Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000`.

### 4. Deploying to Vercel
1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and import your repository.
3. Configure the environment variables.
4. Click Deploy.
