import { Hono } from 'hono'
import { and, eq } from 'drizzle-orm'
import { idParamSchema, weightInputSchema, type MyGameStat } from '@bg-tracker/shared'
import type { AppEnv } from '../env.ts'
import type { Db } from '../db/client.ts'
import { AppError } from '../errors.ts'
import { validate } from '../http/validate.ts'
import { currentUser, requireAuth } from '../auth/middleware.ts'
import { games, playedMarks, weightVotes, wishes } from '../db/schema/index.ts'
import { emptyGameStat, listMyGameStats } from './queries.ts'
import { getWeightSummary } from './weights.ts'

async function ensureGame(db: Db, id: string) {
  const [game] = await db.select({ id: games.id }).from(games).where(eq(games.id, id))
  if (!game) throw new AppError('not_found', 404, 'Game not found')
}

async function statOf(db: Db, userId: string, gameId: string): Promise<MyGameStat> {
  return (await listMyGameStats(db, userId, gameId))[0] ?? emptyGameStat(gameId)
}

/**
 * 目前身分的想玩、玩過標記（`/api/me/wishes/:id`、`/api/me/played/:id`）與重度評分（`/api/me/weights/:id`）。
 * PUT 標記／評分、DELETE 取消，都可以重複呼叫；回傳這款遊戲更新後的狀態
 */
export const markRoutes = new Hono<AppEnv>()
  .use('*', requireAuth)
  .put('/wishes/:id', validate('param', idParamSchema), async (c) => {
    const { db } = c.get('deps')
    const { id } = c.req.valid('param')
    const user = currentUser(c)
    await ensureGame(db, id)
    await db.insert(wishes).values({ userId: user.id, gameId: id }).onConflictDoNothing()
    return c.json(await statOf(db, user.id, id))
  })
  .delete('/wishes/:id', validate('param', idParamSchema), async (c) => {
    const { db } = c.get('deps')
    const { id } = c.req.valid('param')
    const user = currentUser(c)
    await ensureGame(db, id)
    await db.delete(wishes).where(and(eq(wishes.userId, user.id), eq(wishes.gameId, id)))
    return c.json(await statOf(db, user.id, id))
  })
  .put('/played/:id', validate('param', idParamSchema), async (c) => {
    const { db } = c.get('deps')
    const { id } = c.req.valid('param')
    const user = currentUser(c)
    await ensureGame(db, id)
    await db.insert(playedMarks).values({ userId: user.id, gameId: id }).onConflictDoNothing()
    return c.json(await statOf(db, user.id, id))
  })
  .delete('/played/:id', validate('param', idParamSchema), async (c) => {
    const { db } = c.get('deps')
    const { id } = c.req.valid('param')
    const user = currentUser(c)
    await ensureGame(db, id)
    await db
      .delete(playedMarks)
      .where(and(eq(playedMarks.userId, user.id), eq(playedMarks.gameId, id)))
    return c.json(await statOf(db, user.id, id))
  })
  .put(
    '/weights/:id',
    validate('param', idParamSchema),
    validate('json', weightInputSchema),
    async (c) => {
      const { db } = c.get('deps')
      const { id } = c.req.valid('param')
      const weightTenths = Math.round(c.req.valid('json').weight * 10)
      const user = currentUser(c)
      await ensureGame(db, id)
      await db
        .insert(weightVotes)
        .values({ userId: user.id, gameId: id, weightTenths })
        .onConflictDoUpdate({
          target: [weightVotes.userId, weightVotes.gameId],
          set: { weightTenths, updatedAt: new Date() },
        })
      return c.json(await getWeightSummary(db, id, user.id))
    },
  )
  .delete('/weights/:id', validate('param', idParamSchema), async (c) => {
    const { db } = c.get('deps')
    const { id } = c.req.valid('param')
    const user = currentUser(c)
    await ensureGame(db, id)
    await db
      .delete(weightVotes)
      .where(and(eq(weightVotes.userId, user.id), eq(weightVotes.gameId, id)))
    return c.json(await getWeightSummary(db, id, user.id))
  })
