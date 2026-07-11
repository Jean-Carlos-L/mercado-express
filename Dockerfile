# ---------- Build stage ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

RUN npm prune --omit=dev

# ---------- Production stage ----------
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl

RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

RUN chown -R nestjs:nodejs /app

USER nestjs

ENV NODE_ENV=production

EXPOSE 3000

ENTRYPOINT ["entrypoint.sh"]