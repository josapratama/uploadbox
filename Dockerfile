# Stage 1: Build Vue 3 Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Build Fastify Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json* ./
RUN npm install

COPY backend/ ./
RUN npm run build

# Stage 3: Unified Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules ./node_modules
COPY --from=backend-builder /app/backend/package.json ./
COPY --from=frontend-builder /app/frontend/dist ./public

RUN mkdir -p /app/storage

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/index.js"]
