# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20.18.1

FROM node:${NODE_VERSION}-alpine AS pruner
WORKDIR /repo
RUN apk add --no-cache libc6-compat
COPY . .
RUN npx -y turbo@2.3.3 prune @taskly/web --docker

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /repo
RUN apk add --no-cache libc6-compat
COPY --from=pruner /repo/out/json/ ./
COPY --from=pruner /repo/out/package-lock.json ./package-lock.json
RUN npm ci --no-audit --no-fund

FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /repo
RUN apk add --no-cache libc6-compat
COPY --from=deps /repo/ ./
COPY --from=pruner /repo/out/full/ ./
ARG VITE_API_URL=http://localhost:4000
ARG VITE_WS_URL=http://localhost:4001
ENV VITE_API_URL=${VITE_API_URL} VITE_WS_URL=${VITE_WS_URL}
RUN npx turbo run build --filter=@taskly/web

FROM nginx:1.27-alpine AS runner
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
