import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { memberGameInputSchema } from '@bg-tracker/shared'
import type { AppEnv } from '../env.ts'
import { AppError } from '../errors.ts'
import { validate } from '../http/validate.ts'
import { rateLimit } from '../http/rate-limit.ts'
import { currentUser, requireAuth } from '../auth/middleware.ts'
import { games } from '../db/schema/index.ts'

/**
 * `POST /api/games`：登入的成員用 BGA 代號新增遊戲。
 * 名稱、人數、BGG id 由 server 向 BGA 查，不收前端的值；新增的遊戲標記「需要 admin review」。
 * 會打 BGA，和查詢共用每人限流
 */
export const memberGameRoutes = new Hono<AppEnv>().post(
  '/',
  requireAuth,
  rateLimit(
    (l) => l.bgaLookup,
    (c) => currentUser(c).id,
  ),
  validate('json', memberGameInputSchema),
  async (c) => {
    const { db, bga } = c.get('deps')
    const { bgaSlug } = c.req.valid('json')
    const user = currentUser(c)

    // 已經有這款就直接告訴他在哪（不用打 BGA）
    const [existing] = await db
      .select({ id: games.id, name: games.name })
      .from(games)
      .where(eq(games.bgaSlug, bgaSlug))
    if (existing) {
      throw new AppError('bga_slug_taken', 409, `已經有「${existing.name}」了`, { id: existing.id })
    }

    const found = await bga.lookup(bgaSlug)
    if (!found) throw new AppError('bga_not_found', 404, `BGA 找不到「${bgaSlug}」`)

    try {
      const [game] = await db
        .insert(games)
        .values({
          name: found.nameZh ?? found.nameEn,
          bgaSlug: found.slug,
          minPlayers: found.minPlayers,
          maxPlayers: found.maxPlayers,
          bggId: found.bggId,
          needsReview: true,
          createdBy: user.id,
        })
        .returning({ id: games.id })
      c.get('log').info({ gameId: game!.id, bgaSlug }, 'game added by member')
      return c.json({ id: game!.id }, 201)
    } catch (err) {
      // 同名（不同代號）或 BGG id 撞到既有遊戲：請 admin 處理
      const cause = (err as { cause?: { code?: string } }).cause
      if (cause?.code === '23505') {
        throw new AppError('game_conflict', 409, '名稱或 BGG id 和既有的遊戲重複，請找 admin 處理')
      }
      throw err
    }
  },
)
