# RepoForge AI

RepoForge AI is a developer productivity platform that automatically generates GitHub README, project documentation, architecture diagrams, setup guides, API docs, and contribution guides from a GitHub repository using a self-hosted local AI model (Ollama).

## Features
- **Repository Analyzer** fetches repo data using GitHub API
- **AI Docs Generator** generates Markdown docs tailored to the repo structure
- **Architecture Visualization** via Mermaid diagrams
- **Repo Health Analyzer** scores code quality, security, architecture, etc.
- **GitHub Push Integration** pushes your generated docs to a PR

## Deployment Instructions

### 1. Running Ollama & Pulling the Model
You must have a local instance of Ollama running to generate documentation without exhausting paid APIs.
1. Download and install Ollama from [ollama.com](https://ollama.com).
2. Start the Ollama server:
   ```bash
   ollama serve
   ```
3. Pull the required model (default is llama3):
   ```bash
   ollama pull llama3
   ```
*(You can also use `mistral` or `deepseek-coder` by changing the `OLLAMA_MODEL` environment variable).*

### 2. Configuring GitHub OAuth & Environment Variables
Create a `.env.local` file in the root directory and add the following:
```env
OLLAMA_ENDPOINT="http://localhost:11434"
OLLAMA_MODEL="llama3"

# For generic token strategy:
GITHUB_TOKEN="your_personal_access_token_here"

# For explicit OAuth Setup (NextAuth):
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
3. Configure the environment variables (`OLLAMA_ENDPOINT`, `OLLAMA_MODEL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`).
   *Note: Ensure your `OLLAMA_ENDPOINT` is a public URL (like ngrok) if you are running Ollama locally and accessing it from a Vercel deployment!*
4. Click Deploy.
