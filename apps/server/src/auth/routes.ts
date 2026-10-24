import { Hono } from 'hono'
import type { MyGameStat } from '@bg-tracker/shared'
import type { AppEnv } from '../env.ts'
import { AppError } from '../errors.ts'
import { clearSessionCookie } from './cookie.ts'
import { currentUser, requireAuth } from './middleware.ts'
import { deleteSession } from './session.ts'
import { getMe } from './users.ts'
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
  .get('/game-stats', requireAuth, async (c) => {
    const body: MyGameStat[] = await listMyGameStats(c.get('deps').db, currentUser(c).id)
    return c.json(body)
  })
