# syntax=docker/dockerfile:1.5

# -----------------------
# Base
# -----------------------
FROM node:18.20-alpine3.19 AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# -----------------------
# Frontend deps
# -----------------------
FROM base AS frontend-deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-frontend,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# -----------------------
# Frontend builder
# -----------------------
FROM base AS frontend-builder
WORKDIR /app/frontend
COPY --from=frontend-deps /app/frontend/node_modules ./node_modules
COPY frontend/ ./
RUN --mount=type=cache,target=/app/frontend/.vite \
    pnpm run build

# -----------------------
# Backend deps
# -----------------------
FROM base AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-backend,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

# -----------------------
# Backend builder
# -----------------------
FROM base AS backend-builder
WORKDIR /app/backend
COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY backend/ ./
RUN pnpm run build && pnpm prune --prod

# -----------------------
# Runner (Production)
# -----------------------
FROM node:18.20-alpine3.19 AS runner

# Security: non-root user
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app
ENV NODE_ENV=production

COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package.json ./backend/package.json
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Healthcheck (NestJS serving API + static)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/tasks || exit 1

USER app
WORKDIR /app/backend
EXPOSE 3000
CMD ["node", "dist/main"]
