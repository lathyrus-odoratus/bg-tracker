import type { Config } from './config.ts'
import type { Db } from './db/client.ts'
import type { Logger } from './logger.ts'
import type { ValidSession } from './auth/session.ts'
import type { DiscordClient } from './discord/client.ts'
import type { BgaClient } from './bga/catalog.ts'
import type { RateLimits } from './http/rate-limit.ts'

/** createApp 需要的外部依賴；測試時換成測試用的版本 */
export interface Deps {
  config: Config
  db: Db
  logger: Logger
  discord: DiscordClient
  bga: BgaClient
  rateLimits: RateLimits
  /** 目前時間；測試可以換成可控的時鐘 */
  now: () => Date
}

export interface AppEnv {
  Variables: {
    deps: Deps
    requestId: string
    log: Logger
    userId?: string
    /** 有登入時才有；`requireAuth` 之後一定有值 */
    session?: ValidSession
  }
}
