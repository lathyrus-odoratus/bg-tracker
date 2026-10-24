import { Hono } from 'hono'
import { count, eq } from 'drizzle-orm'
import {
  gameInputSchema,
  idParamSchema,
  mechanismInputSchema,
  type GameInput,
} from '@bg-tracker/shared'
import type { AppEnv } from '../env.ts'
import type { Tx } from '../db/client.ts'
import { AppError } from '../errors.ts'
import { validate } from '../http/validate.ts'
import { requireAuth, requireSystemRole } from '../auth/middleware.ts'
import { gameMechanisms, games, mechanisms, plays, wishes } from '../db/schema/index.ts'

/** 唯一約束 → 給管理頁看的錯誤 */
const UNIQUE_ERRORS: Record<string, [code: string, message: string]> = {
  games_name_lower: ['name_taken', '已經有同名的遊戲'],
  games_bga_slug: ['bga_slug_taken', '這個 BGA 代號已經用在別的遊戲'],
  games_bgg_id: ['bgg_id_taken', '這個 BGG id 已經用在別的遊戲'],
  mechanisms_name_lower: ['name_taken', '已經有同名的機制'],
}

function pgCause(err: unknown) {
  return (err as { cause?: { code?: string; constraint_name?: string } }).cause
}

/** 撞到唯一約束時轉成 409，其他錯誤原樣丟出 */
async function mapUnique<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } catch (err) {
    const cause = pgCause(err)
    const known =
      cause?.code === '23505' && cause.constraint_name && UNIQUE_ERRORS[cause.constraint_name]
    if (known) throw new AppError(known[0], 409, known[1])
    if (cause?.code === '23503') throw new AppError('unknown_mechanism', 400, '有機制不存在')
    throw err
  }
}

function gameFields({ mechanismIds: _, ...fields }: GameInput) {
  return fields
}

async function setMechanisms(tx: Tx, gameId: string, mechanismIds: string[]) {
  await tx.delete(gameMechanisms).where(eq(gameMechanisms.gameId, gameId))
  const unique = [...new Set(mechanismIds)]
  if (unique.length) {
    await tx.insert(gameMechanisms).values(unique.map((mechanismId) => ({ gameId, mechanismId })))
  }
}

/** 遊戲與機制的新增、編輯、刪除；只有 admin */
export const adminCatalogRoutes = new Hono<AppEnv>()
  .use('*', requireAuth, requireSystemRole('admin'))
  .post('/games', validate('json', gameInputSchema), async (c) => {
    const { db } = c.get('deps')
    const input = c.req.valid('json')
    const id = await mapUnique(() =>
      db.transaction(async (tx) => {
        const [game] = await tx.insert(games).values(gameFields(input)).returning({ id: games.id })
        await setMechanisms(tx, game!.id, input.mechanismIds)
        return game!.id
      }),
    )
    c.get('log').info({ gameId: id }, 'game created')
    return c.json({ id }, 201)
  })
  .put(
    '/games/:id',
    validate('param', idParamSchema),
    validate('json', gameInputSchema),
    async (c) => {
      const { db } = c.get('deps')
      const { id } = c.req.valid('param')
      const input = c.req.valid('json')
      await mapUnique(() =>
        db.transaction(async (tx) => {
          const updated = await tx
            .update(games)
            .set(gameFields(input))
            .where(eq(games.id, id))
            .returning({ id: games.id })
          if (!updated.length) throw new AppError('not_found', 404, 'Game not found')
          await setMechanisms(tx, id, input.mechanismIds)
        }),
      )
      c.get('log').info({ gameId: id }, 'game updated')
      return c.json({ id })
    },
  )
  .delete('/games/:id', validate('param', idParamSchema), async (c) => {
    const { db } = c.get('deps')
    const { id } = c.req.valid('param')
    await db.transaction(async (tx) => {
      // 有遊玩紀錄的遊戲不能刪（紀錄是從 BGA 登錄的，刪了就回不來）
      const [played] = await tx.select({ n: count() }).from(plays).where(eq(plays.gameId, id))
      if (played!.n > 0) {
        throw new AppError('game_has_plays', 409, `這款遊戲有 ${played!.n} 筆遊玩紀錄，不能刪除`)
      }
      await tx.delete(gameMechanisms).where(eq(gameMechanisms.gameId, id))
      await tx.delete(wishes).where(eq(wishes.gameId, id))
      const deleted = await tx.delete(games).where(eq(games.id, id)).returning({ id: games.id })
      if (!deleted.length) throw new AppError('not_found', 404, 'Game not found')
    })
    c.get('log').info({ gameId: id }, 'game deleted')
    return c.body(null, 204)
  })
  .post('/mechanisms', validate('json', mechanismInputSchema), async (c) => {
    const { db } = c.get('deps')
    const [mechanism] = await mapUnique(() =>
      db.insert(mechanisms).values(c.req.valid('json')).returning({ id: mechanisms.id }),
    )
    return c.json({ id: mechanism!.id }, 201)
  })
  .put(
    '/mechanisms/:id',
    validate('param', idParamSchema),
    validate('json', mechanismInputSchema),
    async (c) => {
      const { db } = c.get('deps')
      const { id } = c.req.valid('param')
      const updated = await mapUnique(() =>
        db
          .update(mechanisms)
          .set(c.req.valid('json'))
          .where(eq(mechanisms.id, id))
          .returning({ id: mechanisms.id }),
      )
      if (!updated.length) throw new AppError('not_found', 404, 'Mechanism not found')
      return c.json({ id })
    },
  )
  .delete('/mechanisms/:id', validate('param', idParamSchema), async (c) => {
    const { db } = c.get('deps')
    const { id } = c.req.valid('param')
    await db.transaction(async (tx) => {
      const [used] = await tx
        .select({ n: count() })
        .from(gameMechanisms)
        .where(eq(gameMechanisms.mechanismId, id))
      if (used!.n > 0) {
        throw new AppError(
          'mechanism_in_use',
          409,
          `還有 ${used!.n} 款遊戲使用這個機制，先從遊戲移除`,
        )
      }
      const deleted = await tx
        .delete(mechanisms)
        .where(eq(mechanisms.id, id))
        .returning({ id: mechanisms.id })
      if (!deleted.length) throw new AppError('not_found', 404, 'Mechanism not found')
    })
    return c.body(null, 204)
  })
