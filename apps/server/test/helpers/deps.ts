import type { Config } from '../../src/config.ts'
import type { Db } from '../../src/db/client.ts'
import type { Deps } from '../../src/env.ts'
import { createLogger } from '../../src/logger.ts'
import { createRateLimits } from '../../src/http/rate-limit.ts'
import { FakeDiscord } from './discord.ts'
import { FakeBga } from './bga.ts'

export const testConfig: Config = {
  port: 3000,
  logLevel: 'silent',
  databaseUrl: 'unused',
  appUrl: 'http://localhost:5180',
  discordClientId: 'test-client-id',
  discordClientSecret: 'test-secret',
  adminDiscordIds: [],
  version: '0.0.0-test',
  commit: 'testsha',
}

/** 測試用的依賴；db 不需要時給一個會報錯的替身 */
export function createTestDeps(overrides: Partial<Deps> = {}): Deps {
  return {
    config: testConfig,
    db: new Proxy({} as Db, {
      get() {
        throw new Error('這個測試沒有提供 db')
      },
    }),
    logger: createLogger('silent'),
    now: () => new Date(),
    discord: new FakeDiscord(),
    bga: new FakeBga(),
    rateLimits: createRateLimits(),
    ...overrides,
  }
}
