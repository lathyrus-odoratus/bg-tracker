import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { displayNameInputSchema, type MyGameStat } from '@bg-tracker/shared'
import type { AppEnv } from '../env.ts'
import { AppError } from '../errors.ts'
import { clearSessionCookie } from './cookie.ts'
import { currentUser, requireAuth } from './middleware.ts'
import { deleteSession } from './session.ts'
import { getMe } from './users.ts'
import { validate } from '../http/validate.ts'
import { users } from '../db/schema/index.ts'
import { listMyGameStats } from '../plays/queries.ts'

export const authApiRoutes = new Hono<AppEnv>().post('/logout', async (c) => {
  const session = c.get('session')
  if (session) await deleteSession(c.get('deps').db, session.tokenHash)
  clearSessionCookie(c)
  return c.body(null, 204)
})

export const meRoutes = new Hono<AppEnv>()
  .get('/', requireAuth, async (c) => {
    const me = await getMe(c.get('deps').db, currentUser(c).id)
    if (!me) throw new AppError('unauthenticated', 401, 'Login required')
    return c.json(me)
  })
  // 改自己的暱稱；重設為 Discord 名稱時前端送 `discordName`。回傳更新後的 me
  .put('/display-name', requireAuth, validate('json', displayNameInputSchema), async (c) => {
    const { db } = c.get('deps')
    const { id } = currentUser(c)
    await db
      .update(users)
      .set({ displayName: c.req.valid('json').displayName })
      .where(eq(users.id, id))
    const me = await getMe(db, id)
    if (!me) throw new AppError('unauthenticated', 401, 'Login required')
    c.get('log').info({ userId: id }, 'display name changed')
    return c.json(me)
  })
  .get('/game-stats', requireAuth, async (c) => {
    const body: MyGameStat[] = await listMyGameStats(c.get('deps').db, currentUser(c).id)
    return c.json(body)
  })
