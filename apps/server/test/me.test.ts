import { describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { meSchema } from '@bg-tracker/shared'
import { createApp } from '../src/app.ts'
import { userIdentities, users } from '../src/db/schema/index.ts'
import { useTestDb } from './helpers/db.ts'
import { createTestDeps } from './helpers/deps.ts'
import { createTestUser, loginAs } from './helpers/auth.ts'
import { errorCode, jsonBody } from './helpers/http.ts'

const db = useTestDb()
const app = createApp(createTestDeps({ db }))

async function login() {
  const user = await createTestUser(db, { displayName: '自己取的' })
  await db
    .update(userIdentities)
    .set({ username: 'marsh', globalName: 'Marshmello' })
    .where(eq(userIdentities.userId, user.id))
  return { user, headers: (await loginAs(db, user)).headers }
}

function putName(displayName: string, headers?: Record<string, string>) {
  return app.request('/api/me/display-name', {
    method: 'PUT',
    ...jsonBody({ displayName }, headers),
  })
}

describe('暱稱', () => {
  it('GET /api/me 帶目前的 Discord 名稱（顯示名稱優先，沒有就用帳號名稱）', async () => {
    const { user, headers } = await login()
    const me = meSchema.parse(await (await app.request('/api/me', { headers })).json())
    expect(me).toMatchObject({ displayName: '自己取的', discordName: 'Marshmello' })

    await db
      .update(userIdentities)
      .set({ globalName: null })
      .where(eq(userIdentities.userId, user.id))
    const again = meSchema.parse(await (await app.request('/api/me', { headers })).json())
    expect(again.discordName).toBe('marsh')
  })

  it('改暱稱：去掉前後空白，回傳更新後的 me；不用唯一', async () => {
    const { user, headers } = await login()
    await createTestUser(db, { displayName: '小明' })
    const res = await putName('  小明  ', headers)
    expect(res.status).toBe(200)
    expect(meSchema.parse(await res.json()).displayName).toBe('小明')
    const [row] = await db.select().from(users).where(eq(users.id, user.id))
    expect(row?.displayName).toBe('小明')
  })

  it('空白、超過 50 字（以字元計）回 400；50 個 emoji 可以；未登入 401', async () => {
    const { headers } = await login()
    expect(await errorCode(await putName('   ', headers))).toBe('validation_failed')
    expect(await errorCode(await putName('字'.repeat(51), headers))).toBe('validation_failed')
    expect((await putName('🎲'.repeat(50), headers)).status).toBe(200)
    expect((await putName('沒登入')).status).toBe(401)
  })
})
