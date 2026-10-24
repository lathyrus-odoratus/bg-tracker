import { createMiddleware } from 'hono/factory'
import type { SystemRole } from '../db/schema/index.ts'
import type { AppEnv } from '../env.ts'
import { AppError } from '../errors.ts'
import { readSessionCookie, writeSessionCookie } from './cookie.ts'
import { validateSession, type SessionUser } from './session.ts'

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/**
 * 從 cookie 讀取 session（不要求登入）。
 * 寫入請求要檢查 Origin（CSRF）。
 */
export const loadSession = createMiddleware<AppEnv>(async (c, next) => {
  const { db, now, config } = c.get('deps')
  const token = readSessionCookie(c)
  if (token) {
    const session = await validateSession(db, now(), token)
    if (session) {
      if (UNSAFE_METHODS.has(c.req.method) && c.req.header('origin') !== config.appUrl) {
        throw new AppError('bad_origin', 403, 'Origin not allowed')
      }
      c.set('session', session)
      c.set('userId', session.user.id)
      c.set('log', c.get('log').child({ userId: session.user.id }))
      if (session.extended) writeSessionCookie(c, token, session.expiresAt, now())
    }
  }
  await next()
})

export const requireAuth = createMiddleware<
  AppEnv & { Variables: { session: NonNullable<AppEnv['Variables']['session']> } }
>(async (c, next) => {
  if (!c.get('session')) throw new AppError('unauthenticated', 401, 'Login required')
  await next()
})

/** 需要先掛 `requireAuth` */
export function requireSystemRole(...roles: SystemRole[]) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const role = c.get('session')?.user.systemRole
    if (!role || !roles.includes(role)) throw new AppError('forbidden', 403, 'Forbidden')
    await next()
  })
}

/** route 內取得目前使用者（在 `requireAuth` 之後呼叫） */
export function currentUser(c: {
  get(key: 'session'): AppEnv['Variables']['session']
}): SessionUser {
  const session = c.get('session')
  if (!session) throw new AppError('unauthenticated', 401, 'Login required')
  return session.user
}
