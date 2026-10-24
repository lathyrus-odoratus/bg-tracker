import { and, avg, count, eq } from 'drizzle-orm'
import type { WeightSummary } from '@bg-tracker/shared'
import type { Executor } from '../db/client.ts'
import { weightVotes } from '../db/schema/index.ts'

/** 一款遊戲的重度：平均（小數一位）、人數、目前身分的評分 */
export async function getWeightSummary(
  db: Executor,
  gameId: string,
  userId: string,
): Promise<WeightSummary> {
  const [all] = await db
    .select({ average: avg(weightVotes.weightTenths), count: count() })
    .from(weightVotes)
    .where(eq(weightVotes.gameId, gameId))
  const [mine] = await db
    .select({ tenths: weightVotes.weightTenths })
    .from(weightVotes)
    .where(and(eq(weightVotes.gameId, gameId), eq(weightVotes.userId, userId)))
  return {
    // avg 回傳十分位的平均（字串）；換回 1.0–9.9 並四捨五入到小數一位
    average: all?.average == null ? null : Math.round(Number(all.average)) / 10,
    count: all?.count ?? 0,
    mine: mine ? mine.tenths / 10 : null,
  }
}
