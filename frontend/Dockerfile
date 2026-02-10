# syntax=docker/dockerfile:1.5

FROM node:18.20-alpine3.19 AS base
ENV COREPACK_INTEGRITY_KEYS=0
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-frontend,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . ./
RUN --mount=type=cache,target=/app/node_modules/.vite \
    --mount=type=cache,target=/root/.cache \
    pnpm run build

FROM nginx:1.27-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
