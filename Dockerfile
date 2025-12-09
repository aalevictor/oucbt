## Multi-stage Dockerfile for Next.js (build + production)
## Base on Debian to ensure Prisma binary compatibility

FROM node:20 AS deps
WORKDIR /app
COPY package.json package-lock.json* .npmrc* ./
RUN npm ci

FROM node:20 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3005
ENV HOSTNAME=0.0.0.0

# Copy only necessary files for standalone runtime
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Persistent uploads will be mounted at /app/uploads
VOLUME ["/app/uploads"]

# The project start script uses port 3005
EXPOSE 3005
CMD ["node", "server.js"]
