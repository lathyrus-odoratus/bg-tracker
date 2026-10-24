import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app.ts'
import {
  externalAccounts,
  gameMechanisms,
  games,
  mechanisms,
  playParticipants,
  plays,
  wishes,
} from '../src/db/schema/index.ts'
import { useTestDb } from './helpers/db.ts'
import { createTestDeps } from './helpers/deps.ts'
import { createTestUser, loginAs } from './helpers/auth.ts'
import { errorCode } from './helpers/http.ts'
import {
  gameDetailSchema,
  gameListItemSchema,
  graphSchema,
  mechanismDetailSchema,
  mechanismListItemSchema,
  myGameStatSchema,
  topWishSchema,
} from '@bg-tracker/shared'
import type { z } from 'zod'

const db = useTestDb()
const app = createApp(createTestDeps({ db }))

/** GET 並以 shared 的 schema 解析（同時驗證回應格式） */
async function getJson<S extends z.ZodType>(
  schema: S,
  path: string,
  headers?: Record<string, string>,
) {
  const res = await app.request(path, { headers })
  expect(res.status).toBe(200)
  return schema.parse(await res.json()) as z.infer<S>
}

/** 兩款遊戲、三個機制；農家樂有兩場 BGA 紀錄 */
async function seed() {
  const alice = await createTestUser(db, { displayName: 'Alice' })
  const bob = await createTestUser(db, { displayName: 'Bob' })
  const [agricola, carcassonne] = await db
    .insert(games)
    .values([{ name: '農家樂', minPlayers: 1, maxPlayers: 4 }, { name: '卡卡頌' }])
    .returning()
  const [worker, tile, unused] = await db
    .insert(mechanisms)
    .values([{ name: '工人放置' }, { name: '板塊拼放' }, { name: '沒人用的機制' }])
    .returning()
  await db.insert(gameMechanisms).values([
    { gameId: agricola!.id, mechanismId: worker!.id },
    { gameId: carcassonne!.id, mechanismId: tile!.id },
  ])
  const [p1, p2] = await db
    .insert(plays)
    .values([
      {
        gameId: agricola!.id,
        playedAt: new Date('2026-10-01T12:00:00Z'),
        source: 'bga',
        externalId: '1',
        createdBy: alice.id,
      },
      {
        gameId: agricola!.id,
        playedAt: new Date('2026-10-20T12:00:00Z'),
        source: 'bga',
        externalId: '2',
        createdBy: alice.id,
      },
    ])
    .returning()
  await db.insert(playParticipants).values([
    { playId: p1!.id, externalName: 'alice_bga', rank: 2 },
    { playId: p1!.id, externalName: 'stranger', rank: 1 },
    // 大小寫和綁定的名稱不同，也要對得上
    { playId: p2!.id, externalName: 'Alice_BGA', rank: 1 },
  ])
  await db
    .insert(externalAccounts)
    .values({ provider: 'bga', externalName: 'alice_bga', userId: alice.id, assignedBy: alice.id })
  await db.insert(wishes).values([
    { userId: alice.id, gameId: carcassonne!.id },
    { userId: bob.id, gameId: carcassonne!.id },
    { userId: bob.id, gameId: agricola!.id },
  ])
  return {
    alice,
    bob,
    agricola: agricola!,
    carcassonne: carcassonne!,
    worker: worker!,
    unused: unused!,
  }
}

describe('GET /api/graph', () => {
  it('匿名可讀：所有遊戲、機制與連線', async () => {
    const { agricola, worker } = await seed()
    const body = await getJson(graphSchema, '/api/graph')
    expect(body.games.map((g) => g.name).sort()).toEqual(['卡卡頌', '農家樂'])
    expect(body.mechanisms).toHaveLength(3)
    expect(body.links).toHaveLength(2)
    expect(body.links).toContainEqual({ gameId: agricola.id, mechanismId: worker.id })
  })
})

describe('GET /api/wishes/top', () => {
  it('依想玩人數排序，k 限制筆數', async () => {
    const { carcassonne } = await seed()
    expect(await getJson(topWishSchema.array(), '/api/wishes/top?k=1')).toEqual([
      { gameId: carcassonne.id, name: '卡卡頌', count: 2 },
    ])
  })

  it('k 超出範圍回 400', async () => {
    const res = await app.request('/api/wishes/top?k=0')
    expect(res.status).toBe(400)
  })
})

describe('GET /api/me/game-stats', () => {
  it('從綁定的 BGA 名稱推出玩過次數與上次遊玩（不分大小寫），加上想玩', async () => {
    const { alice, agricola, carcassonne } = await seed()
    const { headers } = await loginAs(db, alice)
    const body = await getJson(myGameStatSchema.array(), '/api/me/game-stats', headers)
    expect(body).toHaveLength(2)
    expect(body).toContainEqual({
      gameId: agricola.id,
      playCount: 2,
      lastPlayedAt: '2026-10-20T12:00:00.000Z',
      wished: false,
    })
    expect(body).toContainEqual({
      gameId: carcassonne.id,
      playCount: 0,
      lastPlayedAt: null,
      wished: true,
    })
  })

  it('沒綁 BGA 帳號的人只有想玩', async () => {
    const { bob } = await seed()
    const { headers } = await loginAs(db, bob)
    const body = await getJson(myGameStatSchema.array(), '/api/me/game-stats', headers)
    expect(body.every((s) => s.playCount === 0)).toBe(true)
  })

  it('未登入回 401', async () => {
    expect((await app.request('/api/me/game-stats')).status).toBe(401)
  })
})

describe('GET /api/games', () => {
  it('列出遊戲與機制數', async () => {
    await seed()
    const body = await getJson(gameListItemSchema.array(), '/api/games')
    expect(body.map((g) => [g.name, g.mechanismCount])).toEqual([
      ['卡卡頌', 1],
      ['農家樂', 1],
    ])
  })
})

describe('GET /api/games/:id', () => {
  it('機制、遊玩紀錄（參與者對應到使用者）、想玩的人、玩過的人', async () => {
    const { agricola, alice, bob } = await seed()
    const body = await getJson(gameDetailSchema, `/api/games/${agricola.id}`)
    expect(body).toMatchObject({ name: '農家樂', minPlayers: 1, maxPlayers: 4 })
    expect(body.mechanisms.map((m) => m.name)).toEqual(['工人放置'])
    expect(body.plays.map((p) => p.externalId)).toEqual(['2', '1'])
    expect(body.plays[1]?.participants).toEqual([
      { externalName: 'stranger', rank: 1, score: null, user: null },
      {
        externalName: 'alice_bga',
        rank: 2,
        score: null,
        user: { id: alice.id, displayName: 'Alice' },
      },
    ])
    expect(body.wishers).toEqual([{ id: bob.id, displayName: 'Bob' }])
    expect(body.players).toEqual([{ id: alice.id, displayName: 'Alice', playCount: 2 }])
  })

  it('不存在回 404，id 格式錯誤回 400', async () => {
    const missing = await app.request('/api/games/00000000-0000-4000-8000-000000000000')
    expect(missing.status).toBe(404)
    expect(await errorCode(missing)).toBe('not_found')
    expect((await app.request('/api/games/nope')).status).toBe(400)
  })
})

describe('GET /api/mechanisms', () => {
  it('依使用的遊戲數排序；詳細頁列出遊戲', async () => {
    const { worker, unused } = await seed()
    const list = await getJson(mechanismListItemSchema.array(), '/api/mechanisms')
    expect(list.at(-1)).toMatchObject({ id: unused.id, gameCount: 0 })
    const detail = await getJson(mechanismDetailSchema, `/api/mechanisms/${worker.id}`)
    expect(detail).toMatchObject({ name: '工人放置', games: [{ name: '農家樂' }] })
  })
})
