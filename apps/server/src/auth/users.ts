import { and, eq } from 'drizzle-orm'
import type { Me } from '@bg-tracker/shared'
import type { Db } from '../db/client.ts'
import { userIdentities, users } from '../db/schema/index.ts'
import { discordAvatarUrl } from './avatar.ts'
import { discordDisplayName } from './upsert-user.ts'

/** 回給前端的使用者資料（含組好的頭像網址） */
export async function getMe(db: Db, userId: string): Promise<Me | undefined> {
  const [row] = await db
    .select({
      id: users.id,
      displayName: users.displayName,
      systemRole: users.systemRole,
      discordId: userIdentities.providerUserId,
      username: userIdentities.username,
      globalName: userIdentities.globalName,
      avatar: userIdentities.avatar,
    })
    .from(users)
    .innerJoin(
      userIdentities,
      and(eq(userIdentities.userId, users.id), eq(userIdentities.provider, 'discord')),
    )
    .where(eq(users.id, userId))
  if (!row) return undefined
  const { discordId, username, globalName, avatar, ...rest } = row
  return {
    ...rest,
    discordName: discordDisplayName({ id: discordId, username, global_name: globalName }),
    avatarUrl: discordAvatarUrl(discordId, avatar),
  }
}
