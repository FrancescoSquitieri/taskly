# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20.18.1

############################
# Stage 1 — prune monorepo
############################
FROM node:${NODE_VERSION}-alpine AS pruner
WORKDIR /repo
RUN apk add --no-cache libc6-compat
COPY . .
RUN npx -y turbo@2.3.3 prune @taskly/api --docker

############################
# Stage 2 — install deps + generate Prisma client
############################
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /repo
RUN apk add --no-cache libc6-compat openssl
COPY --from=pruner /repo/out/json/ ./
COPY --from=pruner /repo/out/package-lock.json ./package-lock.json
COPY --from=pruner /repo/out/full/apps/api/prisma ./apps/api/prisma
RUN npm ci --no-audit --no-fund \
    && npx prisma generate --schema=apps/api/prisma/schema.prisma

############################
# Stage 3 — runner (tsx executes TypeScript directly)
############################
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache tini openssl libc6-compat \
    && addgroup -S nodejs -g 1001 \
    && adduser -S nodejs -u 1001 -G nodejs

COPY --from=deps --chown=nodejs:nodejs /repo/node_modules ./node_modules
COPY --from=deps --chown=nodejs:nodejs /repo/package.json ./package.json
COPY --from=deps --chown=nodejs:nodejs /repo/package-lock.json ./package-lock.json
COPY --from=pruner --chown=nodejs:nodejs /repo/out/full/apps/api ./apps/api
COPY --from=pruner --chown=nodejs:nodejs /repo/out/full/packages ./packages

USER nodejs
WORKDIR /app/apps/api
EXPOSE 4000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/app/node_modules/.bin/tsx", "src/server.ts"]
