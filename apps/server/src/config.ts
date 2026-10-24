import { z } from 'zod'

/**
 * 所有環境變數都在這裡讀取與驗證；其他程式碼不直接讀 `process.env`。
 */
const configSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DATABASE_URL: z.string().min(1),
  APP_URL: z.url().transform((u) => u.replace(/\/$/, '')),
  DISCORD_CLIENT_ID: z.string().min(1),
  DISCORD_CLIENT_SECRET: z.string().min(1),
  /** 管理員的 Discord user id，逗號分隔；登入時升級成 admin */
  ADMIN_DISCORD_IDS: z
    .string()
    .default('')
    .transform((s) =>
      s
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().regex(/^\d+$/))),
  /** 映像檔 build 時由 build arg 寫入（Dockerfile），本機為 dev */
  APP_VERSION: z.string().default('dev'),
  APP_COMMIT: z.string().default('dev'),
})

export interface Config {
  port: number
  logLevel: z.infer<typeof configSchema>['LOG_LEVEL']
  databaseUrl: string
  appUrl: string
  discordClientId: string
  discordClientSecret: string
  adminDiscordIds: string[]
  version: string
  commit: string
}

export class ConfigError extends Error {
  readonly keys: string[]
  constructor(keys: string[]) {
    super(`環境變數缺少或格式錯誤：${keys.join(', ')}`)
    this.keys = keys
  }
}

/** 只需要資料庫時（套用 migration、seed）；不要求其他變數 */
export function loadDatabaseUrl(env: Record<string, string | undefined> = process.env): string {
  const url = env.DATABASE_URL
  if (!url) throw new ConfigError(['DATABASE_URL'])
  return url
}

/** 驗證失敗時丟出 ConfigError，只列出 key，不印出值 */
export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  const parsed = configSchema.safeParse(env)
  if (!parsed.success) {
    const keys = [...new Set(parsed.error.issues.map((i) => String(i.path[0])))]
    throw new ConfigError(keys)
  }
  const e = parsed.data
  return {
    port: e.PORT,
    logLevel: e.LOG_LEVEL,
    databaseUrl: e.DATABASE_URL,
    appUrl: e.APP_URL,
    discordClientId: e.DISCORD_CLIENT_ID,
    discordClientSecret: e.DISCORD_CLIENT_SECRET,
    adminDiscordIds: e.ADMIN_DISCORD_IDS,
    version: e.APP_VERSION,
    commit: e.APP_COMMIT,
  }
}
