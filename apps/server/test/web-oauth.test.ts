import { describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { createApp } from '../src/app.ts'
import { sessions, userIdentities, users } from '../src/db/schema/index.ts'
import { upsertDiscordUser } from '../src/auth/upsert-user.ts'
import { SESSION_COOKIE } from '../src/auth/cookie.ts'
import { useTestDb } from './helpers/db.ts'
import { createTestDeps, testConfig } from './helpers/deps.ts'
import { FakeDiscord } from './helpers/discord.ts'

const db = useTestDb()

function setup(adminDiscordIds: string[] = []) {
  const discord = new FakeDiscord()
  const app = createApp(createTestDeps({ db, discord, config: { ...testConfig, adminDiscordIds } }))
  return { app, discord }
}

/** 從 Set-Cookie 取出某個 cookie 的值 */
function cookieValue(res: Response, name: string) {
  for (const line of res.headers.getSetCookie()) {
    const [pair] = line.split(';')
    const [k, v] = pair!.split('=')
    if (k === name) return decodeURIComponent(v ?? '')
  }
  return undefined
}

/** 走一次 login，回傳 state 與要帶回 callback 的 cookie */
async function startLogin(app: ReturnType<typeof setup>['app'], returnTo?: string) {
  const qs = returnTo === undefined ? '' : `?returnTo=${encodeURIComponent(returnTo)}`
  const res = await app.request(`/auth/discord/login${qs}`)
  expect(res.status).toBe(302)
  const location = new URL(res.headers.get('location')!)
  const raw = res.headers.getSetCookie().find((l) => l.startsWith('__Host-bgt_oauth='))!
  return {
    location,
    state: location.searchParams.get('state')!,
    cookie: raw.split(';')[0]!,
    oauthCookie: JSON.parse(cookieValue(res, '__Host-bgt_oauth')!) as { returnTo: string },
  }
}

describe('網頁登入', () => {
  it('導向 Discord 授權頁（scope identify、redirect_uri 為 APP_URL）', async () => {
    const { app } = setup()
    const { location, oauthCookie } = await startLogin(app, '/games/x')
    expect(location.origin + location.pathname).toBe('https://discord.com/oauth2/authorize')
    expect(location.searchParams.get('scope')).toBe('identify')
    expect(location.searchParams.get('client_id')).toBe('test-client-id')
    expect(location.searchParams.get('redirect_uri')).toBe(
      'http://localhost:5180/auth/discord/callback',
    )
    expect(oauthCookie.returnTo).toBe('/games/x')
  })

  it.each(['https://evil.example', '//evil.example', '/\\evil.example', 'join'])(
    'returnTo=%s 被改成 /',
    async (returnTo) => {
      const { app } = setup()
      expect((await startLogin(app, returnTo)).oauthCookie.returnTo).toBe('/')
    },
  )

  it('正常流程：建立使用者與 web session、設定 cookie、導回 returnTo', async () => {
    const { app, discord } = setup()
    discord.addCode('good', { id: '42', username: 'neko', global_name: '貓' })
    const { state, cookie } = await startLogin(app, '/games/x')
    const res = await app.request(`/auth/discord/callback?code=good&state=${state}`, {
      headers: { cookie },
    })
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('/games/x')
    expect(discord.lastRedirectUri).toBe('http://localhost:5180/auth/discord/callback')

    const token = cookieValue(res, SESSION_COOKIE)!
    const setCookie = res.headers.getSetCookie().find((l) => l.startsWith(SESSION_COOKIE))!
    expect(setCookie).toMatch(/HttpOnly/)
    expect(setCookie).toMatch(/Secure/)
    expect(setCookie).toMatch(/SameSite=Lax/)
    // 暫存 cookie 被清掉
    expect(cookieValue(res, '__Host-bgt_oauth')).toBe('')

    const me = await app.request('/api/me', { headers: { cookie: `${SESSION_COOKIE}=${token}` } })
    expect(await me.json()).toMatchObject({ displayName: '貓', systemRole: 'user' })
    expect(await db.select().from(sessions)).toHaveLength(1)
  })

  it('state 不符、缺少暫存 cookie、使用者取消都不建立 session', async () => {
    const { app, discord } = setup()
    discord.addCode('good', { id: '42' })
    const { state, cookie } = await startLogin(app)

    const wrongState = await app.request(`/auth/discord/callback?code=good&state=nope`, {
      headers: { cookie },
    })
    expect(wrongState.headers.get('location')).toBe('/login?error=expired')

    const noCookie = await app.request(`/auth/discord/callback?code=good&state=${state}`)
    expect(noCookie.headers.get('location')).toBe('/login?error=expired')

    const denied = await app.request(`/auth/discord/callback?error=access_denied&state=${state}`, {
      headers: { cookie },
    })
    expect(denied.headers.get('location')).toBe('/login?error=denied')

    expect(await db.select().from(sessions)).toHaveLength(0)
    expect(await db.select().from(users)).toHaveLength(0)
  })

  it('無效的授權碼、Discord 故障：導回登入頁', async () => {
    const { app, discord } = setup()
    const { state, cookie } = await startLogin(app)
    const bad = await app.request(`/auth/discord/callback?code=bad&state=${state}`, {
      headers: { cookie },
    })
    expect(bad.headers.get('location')).toBe('/login?error=failed')

    discord.addCode('good', { id: '42' })
    discord.down = true
    const down = await app.request(`/auth/discord/callback?code=good&state=${state}`, {
      headers: { cookie },
    })
    expect(down.headers.get('location')).toBe('/login?error=failed')
    expect(await db.select().from(sessions)).toHaveLength(0)
  })

  it('同一個 IP 第 11 次 callback 回 429', async () => {
    const { app } = setup()
    const headers = { 'cf-connecting-ip': '203.0.113.1' }
    for (let i = 0; i < 10; i++) {
      const res = await app.request('/auth/discord/callback?state=x', { headers })
      expect(res.status).toBe(302)
    }
    expect((await app.request('/auth/discord/callback?state=x', { headers })).status).toBe(429)
    const other = await app.request('/auth/discord/callback?state=x', {
      headers: { 'cf-connecting-ip': '203.0.113.2' },
    })
    expect(other.status).toBe(302)
  })
})

describe('upsertDiscordUser', () => {
  const base = { id: '7', username: 'neko', global_name: '貓貓', avatar: 'a1' }

  it('新使用者：名稱優先序 global_name → username', async () => {
    const a = await upsertDiscordUser(db, { ...base, id: '1' }, [])
    const b = await upsertDiscordUser(db, { ...base, id: '2', global_name: null }, [])
    const rows = await db.select().from(users)
    const byId = new Map(rows.map((r) => [r.id, r]))
    expect(byId.get(a.userId)?.displayName).toBe('貓貓')
    expect(byId.get(b.userId)?.displayName).toBe('neko')
  })

  it('名稱超過 50 字截斷', async () => {
    const { userId } = await upsertDiscordUser(db, { ...base, global_name: '名'.repeat(60) }, [])
    const [user] = await db.select().from(users).where(eq(users.id, userId))
    expect(user?.displayName).toBe('名'.repeat(50))
  })

  it('既有使用者：更新頭像與 username，不覆蓋名稱', async () => {
    const { userId } = await upsertDiscordUser(db, base, [])
    await db.update(users).set({ displayName: '自訂名稱' }).where(eq(users.id, userId))
    const again = await upsertDiscordUser(
      db,
      { ...base, username: 'neko2', global_name: '新名字', avatar: 'a2' },
      [],
    )
    expect(again).toEqual({ userId, created: false })
    const [user] = await db.select().from(users).where(eq(users.id, userId))
    expect(user?.displayName).toBe('自訂名稱')
    const [identity] = await db.select().from(userIdentities)
    expect(identity).toMatchObject({ username: 'neko2', globalName: '新名字', avatar: 'a2' })
  })

  it('ADMIN_DISCORD_IDS：登入時升級成 admin，從名單移除也不降級', async () => {
    const { userId } = await upsertDiscordUser(db, base, [])
    await upsertDiscordUser(db, base, ['7'])
    const role = async () =>
      (await db.select().from(users).where(eq(users.id, userId)))[0]?.systemRole
    expect(await role()).toBe('admin')
    await upsertDiscordUser(db, base, [])
    expect(await role()).toBe('admin')
  })
})
