# RepoForge AI

RepoForge AI is a developer productivity platform that automatically generates GitHub README, project documentation, architecture diagrams, setup guides, API docs, and contribution guides from a GitHub repository.

RepoForge AI runs completely serverless with an in-browser AI generation system using Transformers.js and caches the generated results using Upstash Redis.

## Features
- **Repository Analyzer** fetches repo data using GitHub API
- **Client-side AI Docs Generator** generates Markdown docs securely and locally in your browser
- **Architecture Visualization** via Mermaid diagrams
- **Repo Health Analyzer** scores code quality, security, architecture, etc.
- **GitHub Push Integration** pushes your generated docs to a PR
- **Redis Caching** instantly restores previously generated docs

## Deployment Instructions

### 1. Upstash Redis Setup
You need a Redis instance to cache generated documents.
1. Sign up at [Upstash](https://upstash.com/).
2. Create a new Redis database.
3. Copy the REST URL and REST Token to your environment.

### 2. Environment Variables
Create a file named `.env.local` in the root directory and add the following:
```env
# Upstash Redis Configuration
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# For generic token strategy (GitHub calls limit):
GITHUB_TOKEN="your_personal_access_token_here"

# For explicit OAuth Setup:
GITHUB_CLIENT_ID="your_oauth_client_id"
GITHUB_CLIENT_SECRET="your_oauth_client_secret"
```

To configure GitHub OAuth via developer settings:
1. Go to your GitHub account settings -> Developer Settings -> OAuth Apps.
2. Click "New OAuth App".
3. Set Authorization callback URL to `http://localhost:3000/api/auth/callback/github`.
4. Generate the secret and paste the IDs above.

### 3. Running the App Locally
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
