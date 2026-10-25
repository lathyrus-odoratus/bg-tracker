import { Hono } from 'hono'
import { bgaSlugParamSchema, type BgaLookup } from '@bg-tracker/shared'
import type { AppEnv } from '../env.ts'
import { AppError } from '../errors.ts'
import { validate } from '../http/validate.ts'
import { rateLimit } from '../http/rate-limit.ts'
import { currentUser, requireAuth } from '../auth/middleware.ts'

/**
 * `GET /api/bga/:slug`：從 BGA 取得遊戲資料（只讀，不寫資料庫），登入的人都能用。
 * 每次會讓 server 打 BGA，所以每個使用者限流
 */
export const bgaRoutes = new Hono<AppEnv>().use('*', requireAuth).get(
  '/:slug',
  rateLimit(
    (l) => l.bgaLookup,
    (c) => currentUser(c).id,
  ),
  validate('param', bgaSlugParamSchema),
  async (c) => {
    const { slug } = c.req.valid('param')
    const game = await c.get('deps').bga.lookup(slug)
    if (!game) throw new AppError('bga_not_found', 404, `BGA 找不到「${slug}」`)
    const body: BgaLookup = {
      slug: game.slug,
      nameEn: game.nameEn,
      nameZh: game.nameZh,
      minPlayers: game.minPlayers,
      maxPlayers: game.maxPlayers,
      bggId: game.bggId,
      mechanismTagIds: game.mechanisms.map((t) => t.tagId),
      themeTagIds: game.themes.map((t) => t.tagId),
    }
    return c.json(body)
  },
)
