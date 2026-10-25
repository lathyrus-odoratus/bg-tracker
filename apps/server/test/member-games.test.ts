import { describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { gameDetailSchema, gameListItemSchema } from '@bg-tracker/shared'
import { createApp } from '../src/app.ts'
import { games, mechanisms } from '../src/db/schema/index.ts'
import { useTestDb } from './helpers/db.ts'
import { createTestDeps } from './helpers/deps.ts'
import { createTestUser, loginAs } from './helpers/auth.ts'
import { errorCode, jsonBody } from './helpers/http.ts'
import { FakeBga } from './helpers/bga.ts'

const db = useTestDb()

function setup() {
  const bga = new FakeBga()
  bga.add({
    slug: 'hanabi',
    nameEn: 'Hanabi',
    nameZh: '花火',
    minPlayers: 2,
    maxPlayers: 5,
    bggId: 98778,
    mechanisms: [
      { tagId: 215, nameEn: 'Communication', nameZh: '溝通' },
      { tagId: 211, nameEn: 'Cooperative', nameZh: '合作' },
    ],
    themes: [{ tagId: 113, nameEn: 'Surreal/Silly/Absurd', nameZh: null }],
  })
  bga.add({ slug: 'nozh', nameEn: 'No Chinese Name' })
  return { bga, app: createApp(createTestDeps({ db, bga })) }
}

async function login(role: 'user' | 'admin' = 'user') {
  const user = await createTestUser(db, { systemRole: role })
  return { user, headers: (await loginAs(db, user)).headers }
}

describe('成員用 BGA 代號新增遊戲', () => {
  it('名稱、人數、BGG id 從 BGA 來；標記需要 admin review 與新增者', async () => {
    const { app } = setup()
    const { user, headers } = await login()
    const res = await app.request('/api/games', {
      method: 'POST',
      ...jsonBody({ bgaSlug: 'hanabi', name: '亂填的名稱' }, headers),
    })
    expect(res.status).toBe(201)
    const { id } = (await res.json()) as { id: string }
    const [game] = await db.select().from(games).where(eq(games.id, id))
    expect(game).toMatchObject({
      name: '花火',
      bgaSlug: 'hanabi',
      minPlayers: 2,
      maxPlayers: 5,
      bggId: 98778,
      needsReview: true,
      createdBy: user.id,
    })

    const detail = gameDetailSchema.parse(
      await (await app.request(`/api/games/${id}`, { headers })).json(),
    )
    expect(detail.needsReview).toBe(true)
    const list = gameListItemSchema
      .array()
      .parse(await (await app.request('/api/games', { headers })).json())
    expect(list[0]?.needsReview).toBe(true)
  })

  it('機制與主題從 BGA 來：已經有的標籤沿用（不蓋掉 admin 改的名稱），沒有的補上', async () => {
    const { app } = setup()
    const { headers } = await login()
    const [coop] = await db
      .insert(mechanisms)
      .values({ name: '合作遊戲', bgaTagId: 211, description: '大家一起' })
      .returning()
    const res = await app.request('/api/games', {
      method: 'POST',
      ...jsonBody({ bgaSlug: 'hanabi' }, headers),
    })
    const { id } = (await res.json()) as { id: string }
    const detail = gameDetailSchema.parse(
      await (await app.request(`/api/games/${id}`, { headers })).json(),
    )
    expect(detail.mechanisms.map((m) => m.name).sort()).toEqual(['合作遊戲', '溝通'].sort())
    expect(detail.mechanisms.find((m) => m.name === '合作遊戲')?.id).toBe(coop!.id)
    // 沒有中文名稱的標籤用英文
    expect(detail.themes.map((t) => t.name)).toEqual(['Surreal/Silly/Absurd'])
    const [game] = await db.select().from(games).where(eq(games.id, id))
    expect(game?.nameEn).toBe('Hanabi')
  })

  it('沒有中文名稱就用英文', async () => {
    const { app } = setup()
    const { headers } = await login()
    const res = await app.request('/api/games', {
      method: 'POST',
      ...jsonBody({ bgaSlug: 'nozh' }, headers),
    })
    const { id } = (await res.json()) as { id: string }
    const [game] = await db.select().from(games).where(eq(games.id, id))
    expect(game?.name).toBe('No Chinese Name')
  })

  it('已經有這款 409（附上 id）；BGA 找不到 404；代號格式錯 400；未登入 401', async () => {
    const { app } = setup()
    const { headers } = await login()
    const [existing] = await db
      .insert(games)
      .values({ name: '花火', bgaSlug: 'hanabi' })
      .returning()
    const dup = await app.request('/api/games', {
      method: 'POST',
      ...jsonBody({ bgaSlug: 'hanabi' }, headers),
    })
    expect(dup.status).toBe(409)
    const body = (await dup.json()) as { error: { code: string; details: { id: string } } }
    expect(body.error).toMatchObject({ code: 'bga_slug_taken', details: { id: existing!.id } })

    const missing = await app.request('/api/games', {
      method: 'POST',
      ...jsonBody({ bgaSlug: 'nope' }, headers),
    })
    expect(await errorCode(missing)).toBe('bga_not_found')
    expect(
      (
        await app.request('/api/games', {
          method: 'POST',
          ...jsonBody({ bgaSlug: 'Bad Slug' }, headers),
        })
      ).status,
    ).toBe(400)
    expect(
      (await app.request('/api/games', { method: 'POST', ...jsonBody({ bgaSlug: 'hanabi' }) }))
        .status,
    ).toBe(401)
  })

  it('同名但不同代號 409，請 admin 處理', async () => {
    const { app } = setup()
    const { headers } = await login()
    await db.insert(games).values({ name: '花火' })
    const res = await app.request('/api/games', {
      method: 'POST',
      ...jsonBody({ bgaSlug: 'hanabi' }, headers),
    })
    expect(await errorCode(res)).toBe('game_conflict')
  })
})

describe('admin review', () => {
  it('admin 確認後清掉標記；一般成員 403；admin 用完整表單新增的不需要 review', async () => {
    const { app } = setup()
    const member = await login()
    const admin = await login('admin')
    const created = await app.request('/api/games', {
      method: 'POST',
      ...jsonBody({ bgaSlug: 'hanabi' }, member.headers),
    })
    const { id } = (await created.json()) as { id: string }

    expect(
      (
        await app.request(`/api/admin/games/${id}/review`, {
          method: 'POST',
          headers: member.headers,
        })
      ).status,
    ).toBe(403)
    expect(
      (
        await app.request(`/api/admin/games/${id}/review`, {
          method: 'POST',
          headers: admin.headers,
        })
      ).status,
    ).toBe(200)
    const [game] = await db.select().from(games).where(eq(games.id, id))
    expect(game?.needsReview).toBe(false)

    const byAdmin = await app.request('/api/admin/games', {
      method: 'POST',
      ...jsonBody(
        {
          name: '七大奇蹟',
          nameEn: null,
          minPlayers: null,
          maxPlayers: null,
          playMinutes: null,
          bggId: null,
          bgaSlug: null,
          imageUrl: null,
          mechanismIds: [],
          themeIds: [],
        },
        admin.headers,
      ),
    })
    const adminGame = (await byAdmin.json()) as { id: string }
    const [row] = await db.select().from(games).where(eq(games.id, adminGame.id))
    expect(row?.needsReview).toBe(false)
  })
})
