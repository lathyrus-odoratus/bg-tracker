import { fileURLToPath } from 'node:url'
import { serve } from '@hono/node-server'
import { createApp } from './app.ts'
import { startSessionCleanup } from './auth/cleanup.ts'
import { ConfigError, loadConfig } from './config.ts'
import { createDb } from './db/client.ts'
import { runMigrations } from './db/migrate.ts'
import { createLogger } from './logger.ts'
import { createDiscordClient } from './discord/client.ts'
import { createBgaClient } from './bga/catalog.ts'
import { createRateLimits } from './http/rate-limit.ts'

async function main() {
  let config
  try {
    config = loadConfig()
  } catch (err) {
    if (err instanceof ConfigError) {
      // logger 的 level 也來自設定，這裡直接輸出一行 JSON
      console.error(JSON.stringify({ level: 'fatal', msg: err.message, keys: err.keys }))
      process.exit(1)
    }
    throw err
  }

  const logger = createLogger(config.logLevel)
  const { db, close: closeDb } = createDb(config.databaseUrl)
  // 先套用 migration 再開始接連線；失敗就結束，讓 Swarm 保留舊版
  await runMigrations(db)
  logger.info('migrations applied')
  const webDistDir = fileURLToPath(new URL('../../web/dist', import.meta.url))
  const deps = {
    config,
    db,
    logger,
    now: () => new Date(),
    discord: createDiscordClient(config.discordClientId, config.discordClientSecret),
    bga: createBgaClient(),
    rateLimits: createRateLimits(),
  }
  const app = createApp(deps, { webDistDir })
  const stopCleanup = startSessionCleanup(deps)

  const server = serve({ fetch: app.fetch, port: config.port }, (info) => {
    logger.info({ port: info.port, version: config.version, commit: config.commit }, 'listening')
  })

  // 部署時 Swarm 送 SIGTERM：停止接新連線 → 關閉 DB 連線池 → 結束。
  // 超過 8 秒還沒關完就強制結束（Dokploy 的停止寬限期是 10 秒）
  let stopping = false
  const shutdown = (signal: string) => {
    if (stopping) return
    stopping = true
    logger.info({ signal }, 'shutting down')
    setTimeout(() => {
      logger.warn('shutdown timed out')
      process.exit(1)
    }, 8000).unref()
    stopCleanup()
    server.close(() => {
      void closeDb().then(() => {
        logger.info('shutdown complete')
        process.exit(0)
      })
    })
    // keep-alive 的閒置連線不會自己結束
    if ('closeIdleConnections' in server) server.closeIdleConnections()
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

await main()
