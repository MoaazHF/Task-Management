FROM node:18-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY frontend/package.json frontend/pnpm-lock.yaml ./frontend/
COPY backend/package.json backend/pnpm-lock.yaml ./backend/

RUN cd frontend && pnpm install --frozen-lockfile
RUN cd backend && pnpm install --frozen-lockfile

COPY . .

RUN cd frontend && pnpm run build

RUN cd backend && pnpm run build

RUN cd backend && pnpm prune --prod

FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json

COPY --from=builder /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

WORKDIR /app/backend
CMD ["node", "dist/main"]