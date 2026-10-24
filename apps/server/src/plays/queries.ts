import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import type { MyGameStat, Play } from '@bg-tracker/shared'
import type { Db } from '../db/client.ts'
import { externalAccounts, playParticipants, plays, users, wishes } from '../db/schema/index.ts'

/** 參與者的 BGA 名稱 → 綁定的帳號（不分大小寫） */
const boundAccount = and(
  eq(externalAccounts.provider, 'bga'),
  sql`lower(${externalAccounts.externalName}) = lower(${playParticipants.externalName})`,
)

/** 一款遊戲的遊玩紀錄（新的在前），參與者依名次排 */
export async function listGamePlays(db: Db, gameId: string): Promise<Play[]> {
  const rows = await db
    .select({
      id: plays.id,
      playedAt: plays.playedAt,
      source: plays.source,
      externalId: plays.externalId,
    })
    .from(plays)
    .where(eq(plays.gameId, gameId))
    .orderBy(desc(plays.playedAt), desc(plays.id))
  if (rows.length === 0) return []

  const participants = await db
    .select({
      playId: playParticipants.playId,
      externalName: playParticipants.externalName,
      rank: playParticipants.rank,
      score: playParticipants.score,
      userId: users.id,
      displayName: users.displayName,
    })
    .from(playParticipants)
    .leftJoin(externalAccounts, boundAccount)
    .leftJoin(users, eq(users.id, externalAccounts.userId))
    .where(
      inArray(
        playParticipants.playId,
        rows.map((r) => r.id),
      ),
    )
    .orderBy(sql`${playParticipants.rank} NULLS LAST`, playParticipants.externalName)

  const byPlay = Map.groupBy(participants, (p) => p.playId)
  return rows.map((r) => ({
    id: r.id,
    playedAt: r.playedAt.toISOString(),
    source: r.source,
    externalId: r.externalId,
    participants: (byPlay.get(r.id) ?? []).map((p) => ({
      externalName: p.externalName,
      rank: p.rank,
      score: p.score,
      user: p.userId && p.displayName ? { id: p.userId, displayName: p.displayName } : null,
    })),
  }))
}

/** 一款遊戲：玩過的使用者與次數（只算綁定了 BGA 帳號的人） */
export async function listGamePlayers(db: Db, gameId: string) {
  return db
    .select({
      id: users.id,
      displayName: users.displayName,
      playCount: sql<number>`count(DISTINCT ${plays.id})::int`,
    })
    .from(plays)
    .innerJoin(playParticipants, eq(playParticipants.playId, plays.id))
    .innerJoin(externalAccounts, boundAccount)
    .innerJoin(users, eq(users.id, externalAccounts.userId))
    .where(eq(plays.gameId, gameId))
    .groupBy(users.id)
    .orderBy(desc(sql`count(DISTINCT ${plays.id})`), users.displayName)
}

/** 目前身分在各遊戲的玩過次數、上次遊玩、想玩 */
export async function listMyGameStats(db: Db, userId: string): Promise<MyGameStat[]> {
  const played = await db
    .select({
      gameId: plays.gameId,
      playCount: sql<number>`count(DISTINCT ${plays.id})::int`,
      lastPlayedAt: sql<Date>`max(${plays.playedAt})`.mapWith(plays.playedAt),
    })
    .from(plays)
    .innerJoin(playParticipants, eq(playParticipants.playId, plays.id))
    .innerJoin(externalAccounts, boundAccount)
    .where(eq(externalAccounts.userId, userId))
    .groupBy(plays.gameId)
  const wished = await db
    .select({ gameId: wishes.gameId })
    .from(wishes)
    .where(eq(wishes.userId, userId))

  const stats = new Map<string, MyGameStat>()
  for (const p of played) {
    stats.set(p.gameId, {
      gameId: p.gameId,
      playCount: p.playCount,
      lastPlayedAt: p.lastPlayedAt.toISOString(),
      wished: false,
    })
  }
  for (const { gameId } of wished) {
    const stat = stats.get(gameId)
    if (stat) stat.wished = true
    else stats.set(gameId, { gameId, playCount: 0, lastPlayedAt: null, wished: true })
  }
  return [...stats.values()]
}
