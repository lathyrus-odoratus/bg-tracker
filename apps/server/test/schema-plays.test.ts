import { describe, expect, it } from 'vitest'
import { externalAccounts, games, playParticipants, plays } from '../src/db/schema/index.ts'
import { useTestDb } from './helpers/db.ts'
import { createTestUser } from './helpers/auth.ts'

const db = useTestDb()

async function setup() {
  const user = await createTestUser(db)
  const [game] = await db.insert(games).values({ name: '農家樂' }).returning()
  return { user, game: game! }
}

/** 取出 Postgres 的錯誤（drizzle 把它包在 cause 裡） */
async function pgError(promise: Promise<unknown>) {
  const err = await promise.then(
    () => undefined,
    (e: unknown) => e,
  )
  const cause = (err as { cause?: { code?: string; constraint_name?: string } } | undefined)?.cause
  return { code: cause?.code, constraint: cause?.constraint_name }
}

describe('schema：遊玩紀錄', () => {
  it('同一張 BGA table 只能登錄一次', async () => {
    const { user, game } = await setup()
    const row = {
      gameId: game.id,
      playedAt: new Date(),
      source: 'bga' as const,
      externalId: '123456',
      createdBy: user.id,
    }
    await db.insert(plays).values(row)
    expect(await pgError(db.insert(plays).values(row))).toEqual({
      code: '23505',
      constraint: 'plays_source_external_id',
    })
  })

  it('BGA 紀錄的 table id 要是數字', async () => {
    const { user, game } = await setup()
    const insert = db.insert(plays).values({
      gameId: game.id,
      playedAt: new Date(),
      source: 'bga',
      externalId: 'abc',
      createdBy: user.id,
    })
    expect((await pgError(insert)).constraint).toBe('plays_external_id')
  })

  it('同一場的參與者不能重複；刪除紀錄時一起刪', async () => {
    const { user, game } = await setup()
    const [play] = await db
      .insert(plays)
      .values({
        gameId: game.id,
        playedAt: new Date(),
        source: 'bga',
        externalId: '1',
        createdBy: user.id,
      })
      .returning()
    await db.insert(playParticipants).values({ playId: play!.id, externalName: 'neko', rank: 1 })
    expect(
      (
        await pgError(
          db.insert(playParticipants).values({ playId: play!.id, externalName: 'neko' }),
        )
      ).code,
    ).toBe('23505')
  })

  it('BGA 帳號不分大小寫只能綁一位使用者', async () => {
    const { user } = await setup()
    const other = await createTestUser(db)
    await db
      .insert(externalAccounts)
      .values({ provider: 'bga', externalName: 'Neko', userId: user.id, assignedBy: user.id })
    const dup = db
      .insert(externalAccounts)
      .values({ provider: 'bga', externalName: 'neko', userId: other.id, assignedBy: user.id })
    expect((await pgError(dup)).constraint).toBe('external_accounts_name_lower')
  })

  it('遊戲名稱不分大小寫唯一', async () => {
    await db.insert(games).values({ name: 'Agricola' })
    expect((await pgError(db.insert(games).values({ name: 'agricola' }))).constraint).toBe(
      'games_name_lower',
    )
  })
})
