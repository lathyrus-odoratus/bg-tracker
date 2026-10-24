import { and, eq, ne } from 'drizzle-orm'
import type { Db } from '../db/client.ts'
import { userIdentities, users } from '../db/schema/index.ts'
import type { DiscordProfile } from '../discord/client.ts'

const MAX_NAME = 50

/** global_name → username，超過 50 字截斷（以字元計） */
export function initialDisplayName(profile: DiscordProfile) {
  const name = [profile.global_name, profile.username].map((n) => n?.trim()).find((n) => n)
  return [...(name ?? profile.id)].slice(0, MAX_NAME).join('')
}

/**
 * 登入時建立或更新使用者。
 * - 新使用者：建立 users 與 user_identities
 * - 既有使用者：只更新 username、global_name、avatar；不改 display_name
 * - 在 ADMIN_DISCORD_IDS 裡的人升級成 admin（只升不降）
 */
export async function upsertDiscordUser(
  db: Db,
  profile: DiscordProfile,
  adminDiscordIds: string[],
): Promise<{ userId: string; created: boolean }> {
  const isAdmin = adminDiscordIds.includes(profile.id)
  const identityFields = {
    username: profile.username,
    globalName: profile.global_name,
    avatar: profile.avatar,
  }
  const discordIdentity = and(
    eq(userIdentities.provider, 'discord'),
    eq(userIdentities.providerUserId, profile.id),
  )

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ userId: userIdentities.userId })
      .from(userIdentities)
      .where(discordIdentity)
      .for('update')

    if (existing) {
      await tx.update(userIdentities).set(identityFields).where(discordIdentity)
      if (isAdmin) {
        await tx
          .update(users)
          .set({ systemRole: 'admin' })
          .where(and(eq(users.id, existing.userId), ne(users.systemRole, 'admin')))
      }
      return { userId: existing.userId, created: false }
    }

    const [user] = await tx
      .insert(users)
      .values({ displayName: initialDisplayName(profile), systemRole: isAdmin ? 'admin' : 'user' })
      .returning({ id: users.id })
    // 同一個帳號同時第一次登入時，第二個交易會在這裡撞到主鍵而失敗，重新登入即可
    await tx.insert(userIdentities).values({
      provider: 'discord',
      providerUserId: profile.id,
      userId: user!.id,
      ...identityFields,
    })
    return { userId: user!.id, created: true }
  })
}
