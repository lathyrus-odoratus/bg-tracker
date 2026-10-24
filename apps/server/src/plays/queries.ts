import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import type { MyGameStat, Play } from '@bg-tracker/shared'
import type { Db } from '../db/client.ts'
import {
  externalAccounts,
  playedMarks,
  playParticipants,
  plays,
  users,
  wishes,
} from '../db/schema/index.ts'

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
/** 一款遊戲：玩過的人（有遊玩紀錄或自己標了玩過），次數多的在前 */
export async function listGamePlayers(db: Db, gameId: string) {
  const [recorded, marked] = await Promise.all([
    listRecordedPlayers(db, gameId),
    db
      .select({ id: users.id, displayName: users.displayName })
      .from(playedMarks)
      .innerJoin(users, eq(users.id, playedMarks.userId))
      .where(eq(playedMarks.gameId, gameId))
      .orderBy(asc(playedMarks.createdAt)),
  ])
  const seen = new Set(recorded.map((p) => p.id))
  return [
    ...recorded,
    ...marked.filter((m) => !seen.has(m.id)).map((m) => ({ ...m, playCount: 0 })),
  ]
}

async function listRecordedPlayers(db: Db, gameId: string) {
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

/** 目前身分在各遊戲的玩過次數、上次遊玩、玩過、想玩；`gameId` 只取那一款 */
export async function listMyGameStats(
  db: Db,
  userId: string,
  gameId?: string,
): Promise<MyGameStat[]> {
  const played = await db
    .select({
      gameId: plays.gameId,
      playCount: sql<number>`count(DISTINCT ${plays.id})::int`,
      lastPlayedAt: sql<Date>`max(${plays.playedAt})`.mapWith(plays.playedAt),
    })
    .from(plays)
    .innerJoin(playParticipants, eq(playParticipants.playId, plays.id))
    .innerJoin(externalAccounts, boundAccount)
    .where(and(eq(externalAccounts.userId, userId), gameId ? eq(plays.gameId, gameId) : undefined))
    .groupBy(plays.gameId)
  const wished = await db
    .select({ gameId: wishes.gameId })
    .from(wishes)
    .where(and(eq(wishes.userId, userId), gameId ? eq(wishes.gameId, gameId) : undefined))
  const marked = await db
    .select({ gameId: playedMarks.gameId })
    .from(playedMarks)
    .where(and(eq(playedMarks.userId, userId), gameId ? eq(playedMarks.gameId, gameId) : undefined))

  const stats = new Map<string, MyGameStat>()
  const stat = (id: string) => {
    let s = stats.get(id)
    if (!s) {
      s = {
        gameId: id,
        playCount: 0,
        lastPlayedAt: null,
        played: false,
        markedPlayed: false,
        wished: false,
      }
      stats.set(id, s)
    }
    return s
  }
  for (const p of played) {
    Object.assign(stat(p.gameId), {
      playCount: p.playCount,
      lastPlayedAt: p.lastPlayedAt.toISOString(),
      played: true,
    })
  }
  for (const w of wished) stat(w.gameId).wished = true
  for (const m of marked) Object.assign(stat(m.gameId), { markedPlayed: true, played: true })
  return [...stats.values()]
}

/** 沒有任何紀錄或標記時的狀態（toggle 取消後回傳用） */
export function emptyGameStat(gameId: string): MyGameStat {
  return {
    gameId,
    playCount: 0,
    lastPlayedAt: null,
    played: false,
    markedPlayed: false,
    wished: false,
  }
}
