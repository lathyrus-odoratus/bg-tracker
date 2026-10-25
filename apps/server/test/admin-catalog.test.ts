import { describe, expect, it } from 'vitest'
import { eq } from 'drizzle-orm'
import { createApp } from '../src/app.ts'
import {
  gameMechanisms,
  gameThemes,
  games,
  mechanisms,
  playedMarks,
  plays,
  themes,
  weightVotes,
  wishes,
} from '../src/db/schema/index.ts'
import { useTestDb } from './helpers/db.ts'
import { createTestDeps } from './helpers/deps.ts'
import { createTestUser, loginAs } from './helpers/auth.ts'
import { errorCode, jsonBody } from './helpers/http.ts'

const db = useTestDb()
const app = createApp(createTestDeps({ db }))

async function asAdmin() {
  const admin = await createTestUser(db, { systemRole: 'admin' })
  return { admin, headers: (await loginAs(db, admin)).headers }
}

const baseGame = {
  name: '七大奇蹟',
  nameEn: '7 Wonders',
  minPlayers: 3,
  maxPlayers: 7,
  playMinutes: 30,
  bggId: 68448,
  bgaSlug: 'sevenwonders',
  imageUrl: null,
  mechanismIds: [] as string[],
  themeIds: [] as string[],
}

describe('管理：遊戲', () => {
  it('一般使用者 403、未登入 401', async () => {
    const user = await createTestUser(db)
    const { headers } = await loginAs(db, user)
    expect(
      (await app.request('/api/admin/games', { method: 'POST', ...jsonBody(baseGame, headers) }))
        .status,
    ).toBe(403)
    expect(
      (await app.request('/api/admin/games', { method: 'POST', ...jsonBody(baseGame) })).status,
    ).toBe(401)
  })

  it('新增與編輯（機制、主題整份取代）', async () => {
    const { headers } = await asAdmin()
    const [draft, collect] = await db
      .insert(mechanisms)
      .values([{ name: '輪抽' }, { name: '集合收集' }])
      .returning()
    const [history] = await db.insert(themes).values({ name: '歷史' }).returning()
    const created = await app.request('/api/admin/games', {
      method: 'POST',
      ...jsonBody(
        { ...baseGame, mechanismIds: [draft!.id, collect!.id], themeIds: [history!.id] },
        headers,
      ),
    })
    expect(created.status).toBe(201)
    const { id } = (await created.json()) as { id: string }

    const updated = await app.request(`/api/admin/games/${id}`, {
      method: 'PUT',
      ...jsonBody({ ...baseGame, name: '七大奇蹟（新版）', mechanismIds: [draft!.id] }, headers),
    })
    expect(updated.status).toBe(200)
    const [game] = await db.select().from(games).where(eq(games.id, id))
    expect(game).toMatchObject({
      name: '七大奇蹟（新版）',
      nameEn: '7 Wonders',
      bgaSlug: 'sevenwonders',
    })
    const links = await db.select().from(gameMechanisms).where(eq(gameMechanisms.gameId, id))
    expect(links.map((l) => l.mechanismId)).toEqual([draft!.id])
    expect(await db.select().from(gameThemes).where(eq(gameThemes.gameId, id))).toEqual([])
  })

  it('名稱、BGA 代號重複回 409；人數顛倒、代號格式錯誤回 400', async () => {
    const { headers } = await asAdmin()
    await db.insert(games).values({ name: '七大奇蹟', bgaSlug: 'sevenwonders' })
    const dupName = await app.request('/api/admin/games', {
      method: 'POST',
      ...jsonBody({ ...baseGame, bgaSlug: null, bggId: null }, headers),
    })
    expect(dupName.status).toBe(409)
    expect(await errorCode(dupName)).toBe('name_taken')
    const dupSlug = await app.request('/api/admin/games', {
      method: 'POST',
      ...jsonBody({ ...baseGame, name: '別的', bggId: null }, headers),
    })
    expect(await errorCode(dupSlug)).toBe('bga_slug_taken')
    const badPlayers = await app.request('/api/admin/games', {
      method: 'POST',
      ...jsonBody({ ...baseGame, name: 'x', minPlayers: 5, maxPlayers: 2 }, headers),
    })
    expect(badPlayers.status).toBe(400)
    const badSlug = await app.request('/api/admin/games', {
      method: 'POST',
      ...jsonBody({ ...baseGame, name: 'x', bgaSlug: 'Seven Wonders' }, headers),
    })
    expect(badSlug.status).toBe(400)
  })

  it('刪除：一併刪掉機制對應、想玩與玩過標記；有遊玩紀錄時 409', async () => {
    const { admin, headers } = await asAdmin()
    const [m] = await db.insert(mechanisms).values({ name: '拍賣競標' }).returning()
    const [highSociety, played] = await db
      .insert(games)
      .values([{ name: '上流社會' }, { name: '農家樂' }])
      .returning()
    await db.insert(gameMechanisms).values({ gameId: highSociety!.id, mechanismId: m!.id })
    await db.insert(wishes).values({ userId: admin.id, gameId: highSociety!.id })
    await db.insert(playedMarks).values({ userId: admin.id, gameId: highSociety!.id })
    await db
      .insert(weightVotes)
      .values({ userId: admin.id, gameId: highSociety!.id, weightTenths: 25 })
    await db.insert(plays).values({
      gameId: played!.id,
      playedAt: new Date(),
      source: 'bga',
      externalId: '1',
      createdBy: admin.id,
    })

    const ok = await app.request(`/api/admin/games/${highSociety!.id}`, {
      method: 'DELETE',
      headers,
    })
    expect(ok.status).toBe(204)
    expect(await db.select().from(games).where(eq(games.id, highSociety!.id))).toHaveLength(0)
    expect(await db.select().from(wishes)).toHaveLength(0)
    expect(await db.select().from(playedMarks)).toHaveLength(0)
    expect(await db.select().from(weightVotes)).toHaveLength(0)

    const blocked = await app.request(`/api/admin/games/${played!.id}`, {
      method: 'DELETE',
      headers,
    })
    expect(blocked.status).toBe(409)
    expect(await errorCode(blocked)).toBe('game_has_plays')
  })
})

describe('管理：機制', () => {
  it('改名與說明、名稱重複 409；有遊戲使用時不能刪；不能手動新增', async () => {
    const { headers } = await asAdmin()
    const [worker, other] = await db
      .insert(mechanisms)
      .values([
        { name: '工人放置', bgaTagId: 203 },
        { name: '輪抽', bgaTagId: 229 },
      ])
      .returning()
    const id = worker!.id
    const renamed = await app.request(`/api/admin/mechanisms/${id}`, {
      method: 'PUT',
      ...jsonBody({ name: '工人擺放', nameEn: 'Workers', description: '放工人執行行動' }, headers),
    })
    expect(renamed.status).toBe(200)
    const dup = await app.request(`/api/admin/mechanisms/${other!.id}`, {
      method: 'PUT',
      ...jsonBody({ name: '工人擺放', nameEn: null, description: '' }, headers),
    })
    expect(await errorCode(dup)).toBe('name_taken')
    const create = await app.request('/api/admin/mechanisms', {
      method: 'POST',
      ...jsonBody({ name: '新機制', description: '' }, headers),
    })
    expect(create.status).toBe(404)

    const [game] = await db.insert(games).values({ name: '農家樂' }).returning()
    await db.insert(gameMechanisms).values({ gameId: game!.id, mechanismId: id })
    const blocked = await app.request(`/api/admin/mechanisms/${id}`, { method: 'DELETE', headers })
    expect(await errorCode(blocked)).toBe('mechanism_in_use')
  })
})
