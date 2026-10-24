import { randomUUID } from 'node:crypto'
import type { Db } from '../../src/db/client.ts'
import { userIdentities, users } from '../../src/db/schema/index.ts'
import { createSession } from '../../src/auth/session.ts'
import { SESSION_COOKIE } from '../../src/auth/cookie.ts'
import { testConfig } from './deps.ts'

export type TestUser = typeof users.$inferSelect & { discordId: string }

let seq = 0

/** 建立一個使用者與對應的 Discord 身份 */
export async function createTestUser(
  db: Db,
  overrides: Partial<typeof users.$inferInsert> & { discordId?: string; avatar?: string } = {},
): Promise<TestUser> {
  const { discordId = String(100000000000000000n + BigInt(++seq)), avatar, ...rest } = overrides
  const [user] = await db
    .insert(users)
    .values({ displayName: `測試使用者${seq}`, ...rest })
    .returning()
  await db.insert(userIdentities).values({
    provider: 'discord',
    providerUserId: discordId,
    userId: user!.id,
    username: `user${seq}-${randomUUID().slice(0, 4)}`,
    avatar: avatar ?? null,
  })
  return { ...user!, discordId }
}

/** 登入，回傳要帶在請求上的 headers（cookie 與通過 CSRF 檢查的 Origin） */
export async function loginAs(db: Db, user: { id: string }, now = new Date()) {
  const { token } = await createSession(db, now, user.id)
  const headers = { cookie: `${SESSION_COOKIE}=${token}`, origin: testConfig.appUrl }
  return { token, headers }
}
