# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx drizzle-kit generate || true
RUN npm run build
RUN npm prune --production

# Production stage
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/package.json .
COPY --from=builder /app/drizzle drizzle/
COPY --from=builder /app/drizzle.config.ts .
COPY --from=builder /app/src/lib/server/db/schema.ts src/lib/server/db/schema.ts
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["./entrypoint.sh"]
