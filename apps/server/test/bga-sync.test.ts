import { describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { bgaSyncResultSchema, gameDetailSchema, themeListItemSchema } from '@bg-tracker/shared'
import { createApp } from '../src/app.ts'
import { gameMechanisms, games, mechanisms, themes } from '../src/db/schema/index.ts'
import { useTestDb } from './helpers/db.ts'
import { createTestDeps } from './helpers/deps.ts'
import { createTestUser, loginAs } from './helpers/auth.ts'
import { errorCode } from './helpers/http.ts'
import { FakeBga } from './helpers/bga.ts'

const db = useTestDb()

const drafting = { tagId: 229, nameEn: 'Drafting', nameZh: '輪抽' }
const collection = { tagId: 210, nameEn: 'Collection', nameZh: '收集' }
const historical = { tagId: 102, nameEn: 'Historical', nameZh: '歷史' }

function setup() {
  const bga = new FakeBga()
  bga.add({
    slug: 'sevenwonders',
    nameEn: '7 Wonders',
    mechanisms: [drafting, collection],
    themes: [historical],
  })
  bga.mechanisms = [{ tagId: 231, nameEn: 'Campaign', nameZh: '劇情' }]
  bga.themes = [{ tagId: 114, nameEn: 'Animals', nameZh: '動物' }]
  return { bga, app: createApp(createTestDeps({ db, bga })) }
}

async function headersFor(role: 'user' | 'admin') {
  return (await loginAs(db, await createTestUser(db, { systemRole: role }))).headers
}

describe('POST /api/admin/bga/sync', () => {
  it('有代號的遊戲的機制與主題整份換成 BGA 的；全站標籤都補上；英文名稱空的才補', async () => {
    const { app } = setup()
    const headers = await headersFor('admin')
    const [old] = await db.insert(mechanisms).values({ name: '手動加的' }).returning()
    const [wonders, manual, gone] = await db
      .insert(games)
      .values([
        { name: '七大奇蹟', bgaSlug: 'sevenwonders' },
        { name: '沒有代號', nameEn: 'Manual' },
        { name: '下架了', bgaSlug: 'removed' },
      ])
      .returning()
    await db.insert(gameMechanisms).values([
      { gameId: wonders!.id, mechanismId: old!.id },
      { gameId: manual!.id, mechanismId: old!.id },
      { gameId: gone!.id, mechanismId: old!.id },
    ])

    const res = await app.request('/api/admin/bga/sync', { method: 'POST', headers })
    expect(res.status).toBe(200)
    expect(bgaSyncResultSchema.parse(await res.json())).toEqual({
      updated: 1,
      missing: ['removed'],
    })

    const detail = gameDetailSchema.parse(
      await (await app.request(`/api/games/${wonders!.id}`, { headers })).json(),
    )
    expect(detail.mechanisms.map((m) => m.name).sort()).toEqual(['收集', '輪抽'].sort())
    expect(detail.themes.map((t) => t.name)).toEqual(['歷史'])
    const [row] = await db.select().from(games).where(eq(games.id, wonders!.id))
    expect(row?.nameEn).toBe('7 Wonders')

    // 沒有代號、BGA 找不到的遊戲不動
    for (const g of [manual!, gone!]) {
      const links = await db.select().from(gameMechanisms).where(eq(gameMechanisms.gameId, g.id))
      expect(links.map((l) => l.mechanismId)).toEqual([old!.id])
    }

    // 沒有遊戲用到的標籤也補進來
    const names = (await db.select({ name: mechanisms.name }).from(mechanisms)).map((m) => m.name)
    expect(names).toContain('劇情')
    const themeList = themeListItemSchema
      .array()
      .parse(await (await app.request('/api/themes', { headers })).json())
    expect(themeList.map((t) => [t.name, t.gameCount])).toEqual([
      ['歷史', 1],
      ['動物', 0],
    ])
  })

  it('重複同步不重複建立標籤；admin 改過的名稱保留', async () => {
    const { app } = setup()
    const headers = await headersFor('admin')
    await db.insert(games).values({ name: '七大奇蹟', bgaSlug: 'sevenwonders' })
    await app.request('/api/admin/bga/sync', { method: 'POST', headers })
    await db.update(themes).set({ name: '歷史題材' }).where(eq(themes.bgaTagId, 102))
    await app.request('/api/admin/bga/sync', { method: 'POST', headers })
    const rows = await db.select({ name: themes.name }).from(themes)
    expect(rows.map((r) => r.name).sort()).toEqual(['動物', '歷史題材'].sort())
  })

  it('一般成員 403；BGA 連不上 502', async () => {
    const { app, bga } = setup()
    const member = await app.request('/api/admin/bga/sync', {
      method: 'POST',
      headers: await headersFor('user'),
    })
    expect(member.status).toBe(403)
    bga.down = true
    const down = await app.request('/api/admin/bga/sync', {
      method: 'POST',
      headers: await headersFor('admin'),
    })
    expect(await errorCode(down)).toBe('bga_unavailable')
  })
})
