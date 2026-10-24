import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

/** `__Host-` 前綴：必須 Secure、Path=/、不能設 Domain（localhost 上瀏覽器也接受） */
export const SESSION_COOKIE = '__Host-bgt_session'

export function readSessionCookie(c: Context) {
  return getCookie(c, SESSION_COOKIE)
}

export function writeSessionCookie(c: Context, token: string, expiresAt: Date, now: Date) {
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000)),
  })
}

export function clearSessionCookie(c: Context) {
  deleteCookie(c, SESSION_COOKIE, { secure: true, path: '/' })
}
