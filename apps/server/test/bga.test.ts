import { describe, expect, it } from 'vitest'
import { bgaLookupSchema } from '@bg-tracker/shared'
import { createApp } from '../src/app.ts'
import { useTestDb } from './helpers/db.ts'
import { createTestDeps } from './helpers/deps.ts'
import { createTestUser, loginAs } from './helpers/auth.ts'
import { errorCode } from './helpers/http.ts'
import { FakeBga } from './helpers/bga.ts'

const db = useTestDb()

function setup() {
  const bga = new FakeBga()
  bga.add({
    slug: 'azul',
    nameEn: 'Azul',
    nameZh: '花磚物語',
    minPlayers: 2,
    maxPlayers: 4,
    bggId: 230802,
  })
  return { bga, app: createApp(createTestDeps({ db, bga })) }
}

async function memberHeaders() {
  return (await loginAs(db, await createTestUser(db))).headers
}

describe('GET /api/bga/:slug', () => {
  it('登入的成員都能查：名稱、人數、BGG id', async () => {
    const { app } = setup()
    const res = await app.request('/api/bga/azul', { headers: await memberHeaders() })
    expect(bgaLookupSchema.parse(await res.json())).toEqual({
      slug: 'azul',
      nameEn: 'Azul',
      nameZh: '花磚物語',
      minPlayers: 2,
      maxPlayers: 4,
      bggId: 230802,
    })
  })

  it('找不到 404、代號格式錯誤 400、BGA 連不上 502、未登入 401', async () => {
    const { app, bga } = setup()
    const headers = await memberHeaders()
    const missing = await app.request('/api/bga/nope', { headers })
    expect(missing.status).toBe(404)
    expect(await errorCode(missing)).toBe('bga_not_found')
    expect((await app.request('/api/bga/Not-A-Slug', { headers })).status).toBe(400)
    expect((await app.request('/api/bga/azul')).status).toBe(401)
    bga.down = true
    expect((await app.request('/api/bga/azul', { headers })).status).toBe(502)
  })

  it('每個使用者每分鐘 10 次，超過 429；別人不受影響', async () => {
    const { app } = setup()
    const headers = await memberHeaders()
    for (let i = 0; i < 10; i++) {
      expect((await app.request('/api/bga/azul', { headers })).status).toBe(200)
    }
    expect((await app.request('/api/bga/azul', { headers })).status).toBe(429)
    expect((await app.request('/api/bga/azul', { headers: await memberHeaders() })).status).toBe(
      200,
    )
  })
})
