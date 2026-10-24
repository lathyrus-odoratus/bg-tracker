# syntax=docker/dockerfile:1.7
# bg-tracker：單一 Node 程序提供 SPA 與 API。
# server 以 Node 24 直接執行 TypeScript（不另外 build），web 在 build stage 產生 dist。
FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /repo

# --- 依賴（只看 lockfile 與各 package.json，改程式碼不會讓這層失效） ---
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json apps/server/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# --- build web ---
FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/server apps/server
COPY apps/web apps/web
RUN pnpm --filter @bg-tracker/web build

# --- server 的正式環境依賴 ---
FROM base AS prod-deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json apps/server/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod --filter @bg-tracker/server...

# --- runtime ---
FROM node:24-alpine AS runtime
ENV NODE_ENV=production PORT=3000
WORKDIR /app
COPY --from=prod-deps --chown=node:node /repo/node_modules node_modules
COPY --from=prod-deps --chown=node:node /repo/apps/server/node_modules apps/server/node_modules
COPY --from=prod-deps --chown=node:node /repo/packages/shared/node_modules packages/shared/node_modules
COPY --chown=node:node package.json ./
COPY --chown=node:node packages/shared/package.json packages/shared/package.json
COPY --chown=node:node packages/shared/src packages/shared/src
COPY --chown=node:node apps/server/package.json apps/server/package.json
COPY --chown=node:node apps/server/src apps/server/src
COPY --chown=node:node apps/server/scripts apps/server/scripts
COPY --chown=node:node apps/server/drizzle apps/server/drizzle
COPY --from=build --chown=node:node /repo/apps/web/dist apps/web/dist

# 版本資訊由 CI 以 build arg 傳入，/api/health 回傳
ARG APP_VERSION=dev
ARG APP_COMMIT=dev
ENV APP_VERSION=$APP_VERSION APP_COMMIT=$APP_COMMIT

USER node
EXPOSE 3000
# Dokploy（Swarm）依這個判斷新版健不健康：不健康就不切流量、自動回滾
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-3000}/api/health" || exit 1
WORKDIR /app/apps/server
CMD ["node", "src/index.ts"]
