# --- Stage 1: Build ---
FROM node:18-alpine AS builder

# تفعيل pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# نسخ ملفات التعريف للاستفادة من الكاش
COPY frontend/package.json frontend/pnpm-lock.yaml ./frontend/
COPY backend/package.json backend/pnpm-lock.yaml ./backend/

# تسطيب المكاتب
RUN cd frontend && pnpm install --frozen-lockfile
RUN cd backend && pnpm install --frozen-lockfile

# نسخ الكود بالكامل
COPY . .

# 1. بناء الفرونت إند (React)
# ده بيطلع الفولدر في /app/frontend/dist
RUN cd frontend && pnpm run build

# 2. بناء الباك إند (NestJS)
# ده بيطلع الفولدر في /app/backend/dist
RUN cd backend && pnpm run build

# تنظيف المكاتب لتقليل الحجم
RUN cd backend && pnpm prune --prod

# --- Stage 2: Production Run ---
FROM node:18-alpine AS runner

WORKDIR /app

# نسخ الباك إند
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json

# نسخ الفرونت إند المبني (عشان Nest يخدمه)
# المتطلب: Copy the Ionic React app output to the NestJs project
COPY --from=builder /app/frontend/dist ./frontend/dist

# المتغيرات الافتراضية للإنتاج
ENV NODE_ENV=production
ENV PORT=3000

# فتح البورت
EXPOSE 3000

# تشغيل التطبيق من فولدر الباك إند
WORKDIR /app/backend
CMD ["node", "dist/main"]