# syntax=docker/dockerfile:1.7

# 1) Install dependencies in a clean layer
FROM node:20-alpine AS deps
WORKDIR /app
# Install libc compat for some native deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

# 2) Build the Next.js app
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3) Create a minimal runtime image using standalone output
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Add a non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy standalone server and public assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

# Default port used by `next start`
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]

