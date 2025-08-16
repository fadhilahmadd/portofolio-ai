# Portfolio AI Frontend

A Next.js frontend for an AI-powered portfolio assistant, featuring both text and voice interaction. This application is ready for Docker deployment.

## Features

  - **Conversational AI:** Engage in a text-based chat with an AI assistant.
  - **Voice Interaction:** Record messages using your microphone and listen to the AI's spoken responses.
  - **Streaming Responses:** AI answers are streamed in real-time with a typewriter effect.
  - **Markdown Support:** Responses are beautifully rendered with support for code blocks, lists, and more.
  - **Dockerized:** Comes with a multi-stage `Dockerfile` for a small, efficient production image.

## Prerequisites

  - Docker (Engine 24+ recommended)
  - Docker Compose v2 (comes with modern Docker Desktop)

## Quick start (Docker Compose)

Set your backend API base URL and start the app:

```bash
# Option A: use a .env file (recommended)
echo "API_BASE_URL=http://localhost:8000" > .env
docker compose up -d

# Option B: inline environment variable
API_BASE_URL=http://localhost:8000 docker compose up -d
```

  - The app will be available at: http://localhost:3000
  - To stop the stack, run: `docker compose down`
  - To view logs, run: `docker compose logs -f web`

### Environment variables

  - `API_BASE_URL`: The server-only URL of your backend chat API. This is used by the proxy at `app/api/chat`. Changes to this variable take effect with `docker compose up -d` (no rebuild required).

## Local development

```bash
npm ci
API_BASE_URL=http://localhost:8000 npm run dev
```

Open http://localhost:3000 and edit files under `src/`. The dev server supports hot reload.

## Production build (without Docker)

```bash
API_BASE_URL=https://your-api.example.com npm run build
npm start
```

## Docker image details

  - Built on a `node:20-alpine` base image.
  - Uses Next.js `output: "standalone"` for a minimal runtime image.
  - Runs as a non-root user and listens on port `3000`.

## Project scripts

```bash
npm run dev    # Start the development server
npm run build  # Create a production build
npm run start  # Start the production server
npm run lint   # Run the linter
```

## Notes

  - **Microphone Permissions:** The application requires microphone permissions for the voice input feature to work.
  - **Environment Variables:** Only environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.
  - **CORS:** If your backend requires CORS, ensure it allows requests from the frontend origin (e.g., `http://localhost:3000`).