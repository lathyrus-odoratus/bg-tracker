import { Hono } from 'hono'
import { count, eq, isNotNull } from 'drizzle-orm'
import {
  gameInputSchema,
  idParamSchema,
  mechanismInputSchema,
  type BgaSyncResult,
  type GameInput,
} from '@bg-tracker/shared'
import type { AppEnv } from '../env.ts'
import { AppError } from '../errors.ts'
import { validate } from '../http/validate.ts'
import { currentUser, requireAuth, requireSystemRole } from '../auth/middleware.ts'
import {
  gameMechanisms,
  gameThemes,
  games,
  mechanisms,
  playedMarks,
  plays,
  weightVotes,
  wishes,
} from '../db/schema/index.ts'
import {
  applyBgaTags,
  setGameMechanisms,
  setGameThemes,
  upsertBgaTags,
} from '../catalog/bga-tags.ts'

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
    if (cause?.code === '23503') throw new AppError('unknown_tag', 400, '有機制或主題不存在')
    throw err
  }
}

function gameFields({ mechanismIds: _m, themeIds: _t, ...fields }: GameInput) {
  return fields
}

/** 遊戲與機制的新增、編輯、刪除，從 BGA 同步；只有 admin */
export const adminCatalogRoutes = new Hono<AppEnv>()
  .use('*', requireAuth, requireSystemRole('admin'))
  .post('/games', validate('json', gameInputSchema), async (c) => {
    const { db } = c.get('deps')
    const input = c.req.valid('json')
    const id = await mapUnique(() =>
      db.transaction(async (tx) => {
        const [game] = await tx
          .insert(games)
          .values({ ...gameFields(input), createdBy: currentUser(c).id })
          .returning({ id: games.id })
        await setGameMechanisms(tx, game!.id, input.mechanismIds)
        await setGameThemes(tx, game!.id, input.themeIds)
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
          await setGameMechanisms(tx, id, input.mechanismIds)
          await setGameThemes(tx, id, input.themeIds)
        }),
      )
      c.get('log').info({ gameId: id }, 'game updated')
      return c.json({ id })
    },
  )
  // admin review：只是確認，清掉「需要 admin review」標記
  .post('/games/:id/review', validate('param', idParamSchema), async (c) => {
    const { db } = c.get('deps')
    const { id } = c.req.valid('param')
    const updated = await db
      .update(games)
      .set({ needsReview: false })
      .where(eq(games.id, id))
      .returning({ id: games.id })
    if (!updated.length) throw new AppError('not_found', 404, 'Game not found')
    c.get('log').info({ gameId: id }, 'game reviewed')
    return c.json({ id })
  })
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
      await tx.delete(gameThemes).where(eq(gameThemes.gameId, id))
      await tx.delete(wishes).where(eq(wishes.gameId, id))
      await tx.delete(playedMarks).where(eq(playedMarks.gameId, id))
      await tx.delete(weightVotes).where(eq(weightVotes.gameId, id))
      const deleted = await tx.delete(games).where(eq(games.id, id)).returning({ id: games.id })
      if (!deleted.length) throw new AppError('not_found', 404, 'Game not found')
    })
    c.get('log').info({ gameId: id }, 'game deleted')
    return c.body(null, 204)
  })
  /**
   * 機制與主題以 BGA 為準：抓一次 BGA 全站目錄，把 BGA 新增的標籤補進來，
   * 有代號的遊戲的機制與主題整份換成 BGA 上的；目錄裡找不到的遊戲不動。
   * 英文名稱還沒填的順便補上
   */
  .post('/bga/sync', async (c) => {
    const { db, bga } = c.get('deps')
    const catalog = await bga.catalog()
    const result = await db.transaction(async (tx) => {
      const ids = await upsertBgaTags(tx, catalog)
      const rows = await tx
        .select({ id: games.id, bgaSlug: games.bgaSlug, nameEn: games.nameEn })
        .from(games)
        .where(isNotNull(games.bgaSlug))
      const body: BgaSyncResult = { updated: 0, missing: [] }
      for (const row of rows) {
        const found = catalog.game(row.bgaSlug!)
        if (!found) {
          body.missing.push(row.bgaSlug!)
          continue
        }
        await applyBgaTags(tx, row.id, found, ids)
        if (!row.nameEn) {
          await tx.update(games).set({ nameEn: found.nameEn }).where(eq(games.id, row.id))
        }
        body.updated++
      }
      return body
    })
    c.get('log').info(result, 'bga tags synced')
    return c.json(result)
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
