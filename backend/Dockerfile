# syntax=docker/dockerfile:1.5

FROM node:18.20-alpine3.19 AS base
ENV COREPACK_INTEGRITY_KEYS=0
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-backend,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . ./
RUN pnpm run build && pnpm prune --prod

FROM node:18.20-alpine3.19 AS runner
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Keep a placeholder for the frontend static root to avoid ServeStatic issues.
RUN mkdir -p /app/frontend/dist

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/tasks || exit 1

USER app
EXPOSE 3000
CMD ["node", "dist/main"]
