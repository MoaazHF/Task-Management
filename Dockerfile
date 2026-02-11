# syntax=docker/dockerfile:1.5

FROM node:18.20-alpine3.19 AS base
ENV COREPACK_INTEGRITY_KEYS=0
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-backend,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

FROM base AS backend-builder
WORKDIR /app/backend
COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY backend ./
RUN pnpm run build && pnpm prune --prod

FROM base AS frontend-deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-frontend,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

FROM base AS frontend-builder
WORKDIR /app/frontend
COPY --from=frontend-deps /app/frontend/node_modules ./node_modules
COPY frontend ./
RUN --mount=type=cache,target=/app/frontend/node_modules/.vite \
    --mount=type=cache,target=/root/.cache \
    pnpm run build

FROM node:18.20-alpine3.19 AS runner
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app
ENV NODE_ENV=production

COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package.json ./package.json
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

USER app
EXPOSE 3000
CMD ["node", "dist/main"]
