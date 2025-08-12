Portfolio AI Frontend – Next.js app ready for Docker deployment.

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

- App will be available at: http://localhost:3000
- Stop the stack:
```bash
docker compose down
```
- View logs:
```bash
docker compose logs -f web
```

### Environment variables

- API_BASE_URL: Server-only URL of your backend chat API (used by the proxy at `app/api/chat`).
  - Changes take effect with `docker compose up -d` (no rebuild required).

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

- Multi-stage `Dockerfile` on `node:20-alpine`
- Uses Next.js `output: "standalone"` for a small runtime image
- Runs as a non-root user, listens on port `3000`

## Project scripts

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run start  # Start production server
npm run lint   # Lint
```

## Notes

- Only environment variables prefixed with `NEXT_PUBLIC_` are available to the browser.
- If your backend requires CORS, ensure it allows requests from the frontend origin (e.g., `http://localhost:3000`).
