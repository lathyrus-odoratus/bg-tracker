import { describe, expect, it } from 'vitest'
import { gameDetailSchema, myGameStatSchema } from '@bg-tracker/shared'
import { createApp } from '../src/app.ts'
import { games } from '../src/db/schema/index.ts'
import { useTestDb } from './helpers/db.ts'
import { createTestDeps } from './helpers/deps.ts'
import { createTestUser, loginAs } from './helpers/auth.ts'

const db = useTestDb()
const app = createApp(createTestDeps({ db }))

async function setup() {
  const user = await createTestUser(db, { displayName: 'Alice' })
  const { headers } = await loginAs(db, user)
  const [game] = await db.insert(games).values({ name: '花磚物語' }).returning()
  const call = async (method: 'PUT' | 'DELETE', kind: 'wishes' | 'played', id = game!.id) => {
    const res = await app.request(`/api/me/${kind}/${id}`, { method, headers })
    return { status: res.status, body: res.ok ? myGameStatSchema.parse(await res.json()) : null }
  }
  return { user, headers, game: game!, call }
}

describe('想玩、玩過標記', () => {
  it('標想玩、取消想玩；重複呼叫結果一樣', async () => {
    const { call } = await setup()
    expect((await call('PUT', 'wishes')).body).toMatchObject({ wished: true, played: false })
    expect((await call('PUT', 'wishes')).body?.wished).toBe(true)
    expect((await call('DELETE', 'wishes')).body).toMatchObject({ wished: false })
    expect((await call('DELETE', 'wishes')).status).toBe(200)
  })

  it('標玩過：算玩過但沒有次數；出現在遊戲頁的「誰玩過」', async () => {
    const { call, game, user, headers } = await setup()
    expect((await call('PUT', 'played')).body).toMatchObject({
      played: true,
      markedPlayed: true,
      playCount: 0,
      lastPlayedAt: null,
    })
    const detail = gameDetailSchema.parse(
      await (await app.request(`/api/games/${game.id}`, { headers })).json(),
    )
    expect(detail.players).toEqual([{ id: user.id, displayName: 'Alice', playCount: 0 }])

    expect((await call('DELETE', 'played')).body).toMatchObject({
      played: false,
      markedPlayed: false,
    })
  })

  it('不存在的遊戲 404、未登入 401', async () => {
    const { call, game } = await setup()
    expect((await call('PUT', 'played', '00000000-0000-4000-8000-000000000000')).status).toBe(404)
    expect((await app.request(`/api/me/wishes/${game.id}`, { method: 'PUT' })).status).toBe(401)
  })
})
