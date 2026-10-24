import { randomBytes } from 'node:crypto'
import { Hono } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { AppEnv } from '../env.ts'
import { AppError } from '../errors.ts'
import { clientIp, rateLimit } from '../http/rate-limit.ts'
import { writeSessionCookie } from './cookie.ts'
import { createSession } from './session.ts'
import { upsertDiscordUser } from './upsert-user.ts'

/** 暫存 state 與 returnTo 的短效 cookie */
const OAUTH_COOKIE = '__Host-bgt_oauth'
const OAUTH_COOKIE_MAX_AGE = 10 * 60

/** 只接受站內相對路徑（以 `/` 開頭、不是 `//` 或 `/\`），避免 open redirect */
export function safeReturnTo(value: string | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return '/'
  }
  return value
}

function loginErrorRedirect(reason: 'denied' | 'expired' | 'failed') {
  return `/login?error=${reason}`
}

export const webOAuthRoutes = new Hono<AppEnv>()
  .get('/discord/login', (c) => {
    const { config } = c.get('deps')
    const state = randomBytes(16).toString('base64url')
    const returnTo = safeReturnTo(c.req.query('returnTo'))
    setCookie(c, OAUTH_COOKIE, JSON.stringify({ state, returnTo }), {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      path: '/',
      maxAge: OAUTH_COOKIE_MAX_AGE,
    })
    const url = new URL('https://discord.com/oauth2/authorize')
    url.search = new URLSearchParams({
      client_id: config.discordClientId,
      response_type: 'code',
      redirect_uri: `${config.appUrl}/auth/discord/callback`,
      scope: 'identify',
      state,
      prompt: 'none',
    }).toString()
    return c.redirect(url.toString(), 302)
  })
  .get(
    '/discord/callback',
    rateLimit((l) => l.login, clientIp),
    async (c) => {
      const deps = c.get('deps')
      const stored = parseOAuthCookie(getCookie(c, OAUTH_COOKIE))
      deleteCookie(c, OAUTH_COOKIE, { secure: true, path: '/' })

      if (c.req.query('error')) return c.redirect(loginErrorRedirect('denied'), 302)
      const code = c.req.query('code')
      if (!stored || !code || c.req.query('state') !== stored.state) {
        return c.redirect(loginErrorRedirect('expired'), 302)
      }

      try {
        const accessToken = await deps.discord.exchangeCode(
          code,
          `${deps.config.appUrl}/auth/discord/callback`,
        )
        const profile = await deps.discord.getCurrentUser(accessToken)
        const { userId, created } = await upsertDiscordUser(
          deps.db,
          profile,
          deps.config.adminDiscordIds,
        )
        const now = deps.now()
        const session = await createSession(deps.db, now, userId)
        writeSessionCookie(c, session.token, session.expiresAt, now)
        c.set('userId', userId)
        c.get('log').info({ userId, created }, 'login')
        return c.redirect(stored.returnTo, 302)
      } catch (err) {
        if (!(err instanceof AppError)) throw err
        c.get('log').warn({ code: err.code }, 'web login failed')
        return c.redirect(loginErrorRedirect('failed'), 302)
      }
    },
  )

function parseOAuthCookie(value: string | undefined): { state: string; returnTo: string } | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value) as { state?: unknown; returnTo?: unknown }
    if (typeof parsed.state !== 'string' || typeof parsed.returnTo !== 'string') return null
    return { state: parsed.state, returnTo: safeReturnTo(parsed.returnTo) }
  } catch {
    return null
  }
}
